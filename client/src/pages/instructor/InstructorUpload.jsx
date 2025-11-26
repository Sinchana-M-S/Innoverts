import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function InstructorUpload() {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setVideoFile(null);
    setProgressPct(0);
    setResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
  };

  // Upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Please select a video file.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a video title.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video_file", videoFile);

    setLoading(true);
    setProgressPct(0);

    toast.loading("⚙ Processing video...", { id: "upload" });

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/upload-video",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            if (evt.total) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setProgressPct(pct);
            }
          },
          timeout: 1000 * 60 * 10,
        }
      );

      setResult(data);
      toast.success("🎉 Uploaded successfully!", { id: "upload" });

      // Show modal popup
      setShowModal(true);

    } catch (err) {
      console.log(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Upload failed";
      toast.error("❌ " + msg, { id: "upload" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🎬 Upload & Translate Video</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400">Video Title</label>
            <input
              className="mt-1 w-full bg-gray-900 p-3 rounded border border-gray-700"
              placeholder="Enter video title"
              value={title}
              disabled={loading}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm text-gray-400">Upload Video File</label>
            <input
              type="file"
              accept="video/*"
              disabled={loading}
              className="mt-1 w-full"
              onChange={handleFileChange}
            />
            {videoFile && (
              <div className="text-gray-400 text-sm mt-1">
                Selected: {videoFile.name} (
                {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-3 rounded flex items-center gap-2 ${
                loading ? "bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Uploading…" : "Upload & Translate"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-5 py-3 bg-gray-800 rounded hover:bg-gray-700"
            >
              Reset
            </button>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="w-full bg-gray-800 rounded h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          )}
        </form>
      </div>

      {/* ---------- SUCCESS MODAL ---------- */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-[380px] text-center space-y-4 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400">
              ✅ Upload Successful!
            </h2>

            <p className="text-gray-300 text-sm">
              Your video has been processed in all 4 languages.
            </p>

            <div className="text-left text-gray-300 text-sm space-y-2">
              <p>📁 Output Files:</p>
              <ul className="list-disc ml-5">
                <li>English (EN)</li>
                <li>Hindi (HI)</li>
                <li>Telugu (TE)</li>
                <li>Kannada (KN)</li>
              </ul>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
