import { useEffect, useState, useRef } from "react";
import {
  Mic,
  StopCircle,
  Send,
  Menu,
  X,
  MoreVertical,
  Edit,
  Trash2,
  FolderPlus,
  Search,
  Volume2,
  Play,
  Pause,
} from "lucide-react";
import Button from "../components/ui/Button";
import api from "../lib/api";

const AI_API = ""; // Use Node.js backend which proxies to Flask

export default function Ai() {
  const [history, setHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState(null); // Track which message is playing
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const audioInstancesRef = useRef({}); // Track audio instances by message index

  const chatRef = useRef(null);

  // ✅ Auto scroll down
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Auto-create a chat if none exists
  useEffect(() => {
    if (history.length === 0) {
      newChat();
    } else if (!currentChat) {
      const first = history[0];
      setCurrentChat(first.id);
      setMessages(first.messages);
    }
  }, [history]);

  // ✅ Create new chat session
  const newChat = () => {
    const id = crypto.randomUUID();
    const newChatObj = {
      id,
      name: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setHistory((prev) => [newChatObj, ...prev]);
    setCurrentChat(id);
    setMessages([]);
  };

  // ✅ Generate chat name from first message
  const generateChatName = (text) => {
    return text.split(" ").slice(0, 3).join(" ");
  };

  // ✅ Rename chat
  const renameChat = (id, newName) => {
    setHistory((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  // ✅ Delete chat
  const deleteChat = (id) => {
    const updated = history.filter((c) => c.id !== id);
    setHistory(updated);
    if (updated.length > 0) {
      setCurrentChat(updated[0].id);
      setMessages(updated[0].messages);
    } else {
      newChat();
    }
  };

  // ✅ Send Text Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    let chat = history.find((c) => c.id === currentChat);

    // ✅ Auto-create chat if missing
    if (!chat) {
      newChat();
      chat = history[0];
    }

    const userMessage = { from: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // ✅ Set chat name based on first message
    if (updatedMessages.length === 1) {
      renameChat(chat.id, generateChatName(input));
    }

    setInput("");

    try {
      // Backend will auto-detect language from text input
      const res = await api.post("/api/ai/chat", {
        message: input,
        session_id: chat.id,
        // language_code will be auto-detected by backend from the input text
      });

      // Validate response data
      if (!res.data || !res.data.response) {
        throw new Error("Invalid response from server");
      }

      setMessages((prev) => {
        const newMessages = [
          ...prev,
          { 
            from: "bot", 
            text: res.data.response || "No response received",
            audio: res.data.audio_response || null, // Store audio for playback (can be null)
            language: res.data.language_code || "en-IN"
          },
        ];
        
        // Don't auto-play - let user click play button (browser requires user interaction)
        return newMessages;
      });
    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      setMessages((prev) => [
        ...prev,
        { 
          from: "bot", 
          text: `⚠️ Error: ${errorMessage}. Please check if AI service is running and API keys are configured.` 
        },
      ]);
    }
  };

  // ✅ File Upload
  const uploadFile = (file) => {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: `📎 Uploaded: ${file.name}` },
    ]);
  };

  const handleFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = (e) => uploadFile(e.target.files[0]);
    input.click();
  };

  // ✅ Start Voice Recording
  const startRecording = async () => {
    setRecording(true);
    audioChunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    recorder.onstop = sendVoiceMessage;

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  // ✅ Stop recording
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  // ✅ Convert voice → text → AI response
  const sendVoiceMessage = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");
    
    // Get current chat session ID
    let chat = history.find((c) => c.id === currentChat);
    if (!chat) {
      newChat();
      chat = history[0];
    }
    formData.append("session_id", chat.id);

    try {
      const stt = await api.post("/api/ai/speech-to-text", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const text = stt.data.transcription;
      const detectedLanguage = stt.data.detected_language || stt.data.language_code;

      if (text) {
        // Automatically send the transcribed message with detected language
        const userMessage = { 
          from: "user", 
          text: text,
          language: detectedLanguage // Store the language of the input
        };
        let chat = history.find((c) => c.id === currentChat);
        if (!chat) {
          newChat();
          chat = history[0];
        }
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Set chat name based on first message
        if (updatedMessages.length === 1) {
          renameChat(chat.id, generateChatName(text));
        }

        // Send to AI with the detected language to ensure response is in same language
        try {
          const res = await api.post("/api/ai/chat", {
            message: text,
            session_id: chat.id,
            language_code: detectedLanguage, // Pass detected language to ensure response matches
          });

          // Validate response data
          if (!res.data || !res.data.response) {
            throw new Error("Invalid response from server");
          }

          setMessages((prev) => {
            const newMessages = [
              ...prev,
              { 
                from: "bot", 
                text: res.data.response || "No response received",
                audio: res.data.audio_response || null, // Can be null if TTS failed
                language: res.data.language_code || detectedLanguage || "en-IN" // Ensure language is set
              },
            ];
            
            // Don't auto-play - let user click play button (browser requires user interaction)
            return newMessages;
          });
        } catch (err) {
          console.error("AI Chat Error:", err);
          const errorMessage = err.response?.data?.error || err.message || "Unknown error";
          setMessages((prev) => [
            ...prev,
            { 
              from: "bot", 
              text: `⚠️ Error: ${errorMessage}. Please check if AI service is running and API keys are configured.` 
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Voice error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Voice recognition failed";
      setMessages((prev) => [
        ...prev,
        { 
          from: "bot", 
          text: `⚠️ Voice Error: ${errorMessage}. Please try typing instead or check your microphone permissions.` 
        },
      ]);
    }
  };

  // ✅ Stop all playing audio and reset to start
  const stopAllAudio = async () => {
    Object.keys(audioInstancesRef.current).forEach((messageIndex) => {
      const audioData = audioInstancesRef.current[messageIndex];
      if (audioData && audioData.audio && !audioData.audio.paused) {
        try {
          // Only pause if actually playing
          audioData.audio.pause();
          audioData.audio.currentTime = 0;
        } catch (err) {
          // Silently handle errors when stopping audio
          console.debug("Error stopping audio:", err);
        }
      }
    });
    setPlayingMessageIndex(null);
    // Wait a bit to ensure pause operations complete
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  // ✅ Cleanup audio instances on unmount
  useEffect(() => {
    return () => {
      // Cleanup all audio instances when component unmounts
      Object.keys(audioInstancesRef.current).forEach((messageIndex) => {
        const audioData = audioInstancesRef.current[messageIndex];
        if (audioData) {
          try {
            if (audioData.audio) {
              audioData.audio.pause();
              audioData.audio.src = '';
            }
            if (audioData.url) {
              URL.revokeObjectURL(audioData.url);
            }
          } catch (err) {
            console.debug("Error cleaning up audio:", err);
          }
        }
      });
      audioInstancesRef.current = {};
    };
  }, []);

  // ✅ Play audio from base64 string for a specific message
  const playAudio = async (base64Audio, messageIndex) => {
    try {
      // Validate base64 audio string
      if (!base64Audio || typeof base64Audio !== 'string' || base64Audio.trim() === '') {
        console.error("Invalid audio data: empty or null base64 string");
        return;
      }

      // Stop any currently playing audio from other messages and reset them to start
      await stopAllAudio();
      
      // Check if this message already has an audio instance
      let audioData = audioInstancesRef.current[messageIndex];
      
      if (audioData && audioData.audio) {
        // Always reset to start and play from beginning
        audioData.audio.currentTime = 0;
        try {
          await audioData.audio.play();
          setPlayingMessageIndex(messageIndex);
        } catch (playErr) {
          // Silently handle play errors (user interaction required, etc.)
          if (playErr.name !== 'AbortError') {
            console.error("Error playing audio:", playErr);
          }
          setPlayingMessageIndex(null);
        }
        return;
      }
      
      // Create new audio instance for this message
      try {
        // Decode base64 to binary
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Validate decoded data
        if (bytes.length === 0) {
          console.error("Decoded audio data is empty");
          return;
        }
        
        // Create blob and play - try multiple audio formats
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' }); // Changed from webm to mpeg
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Set slower playback speed (0.85 = 85% speed, making it slower)
        audio.playbackRate = 0.85;
        
        // Store audio instance for this message
        audioInstancesRef.current[messageIndex] = {
          audio: audio,
          url: audioUrl
        };
        
        // Reset to start
        audio.currentTime = 0;
        
        // Wait a bit before playing to ensure previous pauses are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          await audio.play();
          setPlayingMessageIndex(messageIndex);
        } catch (playErr) {
          // Silently handle play errors (user interaction required, AbortError, etc.)
          if (playErr.name !== 'AbortError') {
            console.error("Error playing audio:", playErr);
          }
          setPlayingMessageIndex(null);
          // Clean up on play error
          if (audioInstancesRef.current[messageIndex]) {
            URL.revokeObjectURL(audioUrl);
            delete audioInstancesRef.current[messageIndex];
          }
        }
        
        // Clean up URL after playback
        audio.onended = () => {
          if (audioInstancesRef.current[messageIndex]) {
            URL.revokeObjectURL(audioUrl);
            delete audioInstancesRef.current[messageIndex];
          }
          setPlayingMessageIndex(null);
        };
        
        // Handle errors
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          if (audioInstancesRef.current[messageIndex]) {
            URL.revokeObjectURL(audioUrl);
            delete audioInstancesRef.current[messageIndex];
          }
          setPlayingMessageIndex(null);
        };
      } catch (decodeErr) {
        console.error("Error decoding base64 audio:", decodeErr);
        setPlayingMessageIndex(null);
      }
    } catch (err) {
      console.error("Error in playAudio:", err);
      if (audioInstancesRef.current[messageIndex]) {
        const audioData = audioInstancesRef.current[messageIndex];
        if (audioData && audioData.url) {
          URL.revokeObjectURL(audioData.url);
        }
        delete audioInstancesRef.current[messageIndex];
      }
      setPlayingMessageIndex(null);
    }
  };

  // ✅ Pause audio for a specific message
  const pauseAudio = (messageIndex) => {
    const audioData = audioInstancesRef.current[messageIndex];
    if (audioData && audioData.audio && !audioData.audio.paused) {
      audioData.audio.pause();
      setPlayingMessageIndex(null);
    }
  };

  return (
    <div className="flex h-screen pt-16 bg-white dark:bg-black text-black dark:text-white">

      {/* ✅ Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-lg">Chats</h2>
          <Button size="sm" onClick={newChat}>
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 flex items-center gap-2 border-b border-gray-300 dark:border-gray-700">
          <Search size={18} />
          <input
            className="bg-transparent w-full outline-none"
            placeholder="Search chats"
          />
        </div>

        {/* Chat History */}
        <div className="overflow-y-auto h-full">
          {history.map((chat) => (
            <div
              key={chat.id}
              className={`px-4 py-3 border-b border-gray-300 dark:border-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 ${
                currentChat === chat.id ? "bg-gray-300 dark:bg-gray-700" : ""
              }`}
              onClick={() => {
                setCurrentChat(chat.id);
                setMessages(chat.messages);
              }}
            >
              <div className="flex justify-between">
                <span className="truncate">{chat.name}</span>

                {/* 3 dots menu */}
                <div className="relative group">
                  <MoreVertical size={18} />

                  <div className="hidden group-hover:block absolute right-0 mt-2 bg-gray-800 text-white p-2 rounded shadow-lg z-50 w-32">
                    <button
                      className="flex items-center gap-2 w-full text-left p-1 hover:bg-gray-700"
                      onClick={() => {
                        const name = prompt("Rename chat:", chat.name);
                        if (name) renameChat(chat.id, name);
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      className="flex items-center gap-2 w-full text-left p-1 hover:bg-gray-700"
                      onClick={() => deleteChat(chat.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-400/40 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Toggle Button */}
      <button
        className="absolute left-2 top-20 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ✅ Chat Window */}
      <div className="flex-1 flex flex-col">
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xl px-4 py-2 rounded-xl flex items-start gap-2 ${
                msg.from === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              <div className="flex-1">{msg.text}</div>
              {msg.from === "bot" && msg.audio && msg.audio.trim() !== '' && (
                <div className="flex items-center gap-1">
                  {playingMessageIndex === i ? (
                    <button
                      onClick={() => pauseAudio(i)}
                      className="p-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                      title="Pause audio"
                    >
                      <Pause size={18} className="text-blue-600 dark:text-blue-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => playAudio(msg.audio, i)}
                      className="p-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                      title="Play audio response"
                    >
                      <Volume2 size={18} className="text-blue-600 dark:text-blue-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Input Section */}
        <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2">
          {/* File Upload */}
          <button
            onClick={handleFileInput}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
          >
            <FolderPlus size={22} />
          </button>

          {/* Voice */}
          {recording ? (
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <StopCircle size={24} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
            >
              <Mic size={22} />
            </button>
          )}

          <input
            className="flex-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-900 outline-none"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            className="p-3 bg-blue-600 text-white rounded-lg"
            onClick={sendMessage}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
