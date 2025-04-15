const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("ws");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directories
app.use(
  "/recordings",
  express.static(path.join(__dirname, "frontend/public/recordings"))
);
app.use(
  "/transcripts",
  express.static(path.join(__dirname, "frontend/public/transcripts"))
);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize GridFS
const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  console.log("MongoDB connection open ✅");
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "videos",
  });
});


// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
}, { collection: "feedback", timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

// 📌 Route to Submit Feedback
app.post("/feedback", async (req, res) => {
  try {
    console.log("Received feedback request with body:", req.body);

    const { message } = req.body;
    if (!message) {
      console.log("❌ Error: No message provided");
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const newFeedback = new Feedback({ message });
    await newFeedback.save();

    console.log("✅ Feedback saved successfully:", newFeedback);
    res.status(201).json({ success: true, message: "Feedback submitted!" });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Set up the GridFS storage
// GridFS Storage for Video Uploads
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: "videos", // Specify the bucket name for videos
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

// Route to Upload Video
app.post("/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) {
    console.error("❌ No file received!");
    return res.status(400).json({ success: false, error: "No file received" });
  }

  console.log("✅ Video uploaded successfully:", req.file);
  res.json({
    success: true,
    fileId: req.file.id, // Return the file ID after upload
    filename: req.file.filename, // Return the filename for later use
  });
});


// 📌 Route to Upload Videos
app.post("/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) {
    console.error("❌ No file received!");
    return res.status(400).json({ success: false, error: "No file received" });
  }

  console.log("✅ Video uploaded successfully:", req.file);
  res.json({
    success: true,
    fileId: req.file.id,
    filename: req.file.filename,
  });
});

// Route to Fetch Video by ID
// Route to Fetch Video by ID
app.get("/video/:id", async (req, res) => {
  if (!gfs) {
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  try {
    // Make sure to use the correct ObjectId
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const file = await gfs.files.findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ error: "Video not found" });
    }

    const readStream = gfs.createReadStream(file._id);

    // Set the content type for video (use the correct MIME type for your video)
    res.setHeader("Content-Type", file.contentType);
    readStream.pipe(res); // Pipe the video stream to the response
  } catch (err) {
    console.error("❌ Error fetching video:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/video/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
