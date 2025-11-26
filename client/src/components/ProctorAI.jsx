import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ProctorAI({ onLogsUpdate, isActive }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [logs, setLogs] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const faceModelRef = useRef(null);
  const objectModelRef = useRef(null);
  const videoStreamRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const isRunningRef = useRef(false);
  const cleanupFunctionsRef = useRef([]);
  const logFlagsRef = useRef({
    faceDetected: false,
    unauthorizedObjectDetected: false,
    gazeWarningLogged: false,
    multiplePeopleWarningLogged: false,
  });

  // Load TensorFlow.js models
  useEffect(() => {
    if (!isActive) return;

    const loadModels = async () => {
      try {
        setStatus("Loading AI models...");
        
        // Dynamically load TensorFlow.js and models
        if (!window.tf) {
          const tfScript = document.createElement("script");
          tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
          document.head.appendChild(tfScript);
          await new Promise((resolve, reject) => {
            tfScript.onload = resolve;
            tfScript.onerror = () => reject(new Error("Failed to load TensorFlow.js"));
          });
        }

        if (!window.blazeface) {
          const blazefaceScript = document.createElement("script");
          blazefaceScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface";
          document.head.appendChild(blazefaceScript);
          await new Promise((resolve, reject) => {
            blazefaceScript.onload = resolve;
            blazefaceScript.onerror = () => reject(new Error("Failed to load BlazeFace model"));
          });
        }

        if (!window.cocoSsd) {
          const cocoSsdScript = document.createElement("script");
          cocoSsdScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd";
          document.head.appendChild(cocoSsdScript);
          await new Promise((resolve, reject) => {
            cocoSsdScript.onload = resolve;
            cocoSsdScript.onerror = () => reject(new Error("Failed to load COCO-SSD model"));
          });
        }

        // Load models
        const faceModel = await window.blazeface.load();
        const objectModel = await window.cocoSsd.load();
        
        faceModelRef.current = faceModel;
        objectModelRef.current = objectModel;
        
        setStatus("Models loaded. Starting camera...");
        startCamera();
      } catch (error) {
        console.error("Error loading models:", error);
        setStatus("Error loading models. Monitoring disabled.");
        logActivity("Error: Could not initialize ProctorAI monitoring", "high");
      }
    };

    loadModels();

    return () => {
      stopMonitoring();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("Camera active. Monitoring...");
        startMonitoring();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatus("Camera access denied. Monitoring disabled.");
      logActivity("Error: Could not access camera", "high");
    }
  };

  const startMonitoring = () => {
    if (isMonitoring || !faceModelRef.current || !objectModelRef.current) return;
    
    setIsMonitoring(true);
    setStatus("Monitoring active");
    
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      // Wait for video to be ready
      const onLoadedData = () => {
        video.removeEventListener("loadeddata", onLoadedData);
        startMonitoring();
      };
      video.addEventListener("loadeddata", onLoadedData);
      return;
    }

    // Lock browser features
    const cleanupLock = lockBrowser();
    if (cleanupLock) {
      cleanupFunctionsRef.current.push(cleanupLock);
    }

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isRunningRef.current) {
        logActivity("Warning: Tab switched or browser minimized!", "high");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    cleanupFunctionsRef.current.push(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    isRunningRef.current = true;

    // Start detection loop
    const detectLoop = async () => {
      if (!isRunningRef.current || !faceModelRef.current || !objectModelRef.current) {
        return;
      }

      try {
        // Face detection
        const faces = await faceModelRef.current.estimateFaces(video, false);

        // Check for multiple faces
        if (faces.length > 1) {
          if (!logFlagsRef.current.multiplePeopleWarningLogged) {
            logActivity("Warning: Multiple people detected in frame!", "high");
            logFlagsRef.current.multiplePeopleWarningLogged = true;
          }
        } else {
          logFlagsRef.current.multiplePeopleWarningLogged = false;
        }

        // Check if no face detected
        if (faces.length === 0) {
          if (logFlagsRef.current.faceDetected) {
            logActivity("Warning: No face detected. Please stay in front of camera.", "high");
            setFaceDetected(false);
            logFlagsRef.current.faceDetected = false;
          }
        } else {
          if (!logFlagsRef.current.faceDetected) {
            logActivity("Face detected. Monitoring active.", "low");
            setFaceDetected(true);
            logFlagsRef.current.faceDetected = true;
          }

          // Gaze direction check
          const face = faces[0];
          if (face.rightEye && face.leftEye) {
            const eyeCenter = [
              (face.rightEye[0] + face.leftEye[0]) / 2,
              (face.rightEye[1] + face.leftEye[1]) / 2,
            ];

            const gazeThresholdX = video.videoWidth / 5;
            const gazeThresholdY = video.videoHeight / 5;

            if (
              eyeCenter[0] < gazeThresholdX ||
              eyeCenter[0] > video.videoWidth - gazeThresholdX ||
              eyeCenter[1] < gazeThresholdY ||
              eyeCenter[1] > video.videoHeight - gazeThresholdY
            ) {
              if (!logFlagsRef.current.gazeWarningLogged) {
                logActivity("Warning: Looking away from screen!", "medium");
                logFlagsRef.current.gazeWarningLogged = true;
              }
            } else {
              logFlagsRef.current.gazeWarningLogged = false;
            }
          }
        }

        // Object detection (run less frequently to save performance)
        if (Math.random() < 0.3) { // Run 30% of the time
          const predictions = await objectModelRef.current.detect(video);
          let foundUnauthorizedObject = false;

          predictions.forEach((prediction) => {
            const objectName = prediction.class.toLowerCase();
            if (objectName === "cell phone" || objectName === "laptop" || objectName === "mobile phone") {
              foundUnauthorizedObject = true;
              if (!logFlagsRef.current.unauthorizedObjectDetected) {
                logActivity(`Warning: Unauthorized object detected: ${objectName}`, "high");
                logFlagsRef.current.unauthorizedObjectDetected = true;
              }
            }
          });

          if (!foundUnauthorizedObject) {
            logFlagsRef.current.unauthorizedObjectDetected = false;
          }
        }

        // Continue loop
        if (isRunningRef.current) {
          monitoringIntervalRef.current = setTimeout(() => {
            requestAnimationFrame(detectLoop);
          }, 100); // Check every 100ms
        }
      } catch (error) {
        console.error("Detection error:", error);
        if (isRunningRef.current) {
          monitoringIntervalRef.current = setTimeout(() => {
            requestAnimationFrame(detectLoop);
          }, 500);
        }
      }
    };

    // Start the loop
    detectLoop();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    isRunningRef.current = false;
    
    if (monitoringIntervalRef.current) {
      clearTimeout(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    // Run all cleanup functions
    cleanupFunctionsRef.current.forEach((cleanup) => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    cleanupFunctionsRef.current = [];
    
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("Monitoring stopped");
  };

  const lockBrowser = () => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      logActivity("Warning: Right-click disabled during exam", "medium");
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // Disable copy/paste shortcuts
    const handleKeyDown = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")
      ) {
        e.preventDefault();
        logActivity("Warning: Copy/paste shortcut attempted", "medium");
      }
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J"))
      ) {
        e.preventDefault();
        logActivity("Warning: Developer tools access attempted", "high");
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Prevent text selection
    const handleSelectStart = (e) => e.preventDefault();
    document.addEventListener("selectstart", handleSelectStart);

    // Return cleanup function
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  };

  const logActivity = (message, severity = "low") => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      severity,
      id: Date.now() + Math.random(),
    };
    
    setLogs((prev) => {
      const newLogs = [...prev, logEntry];
      // Keep only last 50 logs
      const trimmedLogs = newLogs.slice(-50);
      if (onLogsUpdate) {
        onLogsUpdate(trimmedLogs.map(log => `[${log.timestamp}] ${log.message}`));
      }
      return trimmedLogs;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  if (!isActive) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {faceDetected ? (
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
          ) : (
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          )}
          <span className="text-sm font-medium text-black dark:text-white">
            SARVASVA Monitoring
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Feed */}
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ transform: "scaleX(-1)" }} // Mirror effect
            />
            <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-white bg-black/50 px-2 py-1 rounded">
              {faceDetected ? (
                <>
                  <Eye size={12} />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <EyeOff size={12} />
                  <span>No Face</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-black dark:text-white">
            Activity Log
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3 space-y-1">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                No activity logged yet...
              </p>
            ) : (
              logs.slice(-10).reverse().map((log) => (
                <div
                  key={log.id}
                  className={`text-xs ${getSeverityColor(log.severity)}`}
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    [{log.timestamp}]
                  </span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
        <strong>Note:</strong> Your exam session is being monitored for academic integrity. 
        Please ensure you are alone in a quiet environment and keep your face visible to the camera.
      </div>
    </div>
  );
}

