import { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [videoId, setVideoId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage("Please select a video first!");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await axios.post("http://localhost:5000/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoId(res.data.fileId);
      setUploadMessage("✅ Video uploaded successfully!");
    } catch (err) {
      console.error("❌ Error uploading video:", err);
      setUploadMessage("❌ Failed to upload video.");
    }
  };

  return (
    <div>
      <h1>Upload a Video</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{uploadMessage}</p>

      {videoId && (
        <div>
          <h3>Watch Video:</h3>
          <video controls width="600">
            {/* Dynamically fetching video URL using the videoId */}
            <source src={`http://localhost:5000/video/${videoId}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
