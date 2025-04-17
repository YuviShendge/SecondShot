const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { GridFsStorage } = require("multer-gridfs-storage");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Import Video metadata model
const Video = require("./models/Video");

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(
  "/recordings",
  express.static(path.join(__dirname, "frontend/public/recordings"))
);
app.use(
  "/transcripts",
  express.static(path.join(__dirname, "frontend/public/transcripts"))
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "videos",
  });
  console.log("✅ GridFS initialized");
});

// GridFS storage config
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "videos",
    };
  },
});
const upload = multer({ storage });

/* 📥 Upload Video and Save Metadata */
app.post("/upload-video", upload.single("video"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No file received!");
    return res.status(400).json({ success: false, error: "No file received" });
  }

  const { question, userId } = req.body;

  try {
    const newVideo = new Video({
      filename: req.file.filename,
      uploadDate: req.file.uploadDate || new Date(),
      question,
      userId,
    });

    await newVideo.save();

    console.log("✅ Video metadata saved:", newVideo);

    res.json({
      success: true,
      fileId: req.file.id,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("❌ Error saving metadata:", err);
    res.status(500).json({ success: false, error: "Failed to save video metadata" });
  }
});

/* 📤 Stream Video by Object ID */
app.get("/video/:id", async (req, res) => {
  if (!gfs) return res.status(500).json({ error: "GridFS not initialized" });

  try {
    const fileId = new ObjectId(req.params.id);
    const file = await gfs.find({ _id: fileId }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.setHeader("Content-Type", file[0].contentType || "video/webm");
    gfs.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("❌ Error streaming video:", err);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

/* 📤 Stream Video by Filename */
app.get("/video-filename/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.setHeader("Content-Type", file[0].contentType || "video/webm");
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    console.error("❌ Error streaming by filename:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 📜 Get All Videos by User ID */
app.get("/user-videos/:userId", async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.userId });
    res.json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch user videos" });
  }
});

/* 📝 Feedback Submission */
const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { collection: "feedback", timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.post("/feedback", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const newFeedback = new Feedback({ message });
    await newFeedback.save();

    res.status(201).json({ success: true, message: "Feedback submitted!" });
  } catch (err) {
    console.error("❌ Feedback error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
