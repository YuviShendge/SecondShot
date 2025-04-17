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

// Models
const Video = require("./models/Video");

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

<<<<<<< HEAD
// MongoDB Connection
=======
// MongoDB connection
>>>>>>> origin/main
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
<<<<<<< HEAD
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));
=======
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
>>>>>>> origin/main

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
<<<<<<< HEAD
  console.log("MongoDB connection open ✅ in database: " + conn.name);
=======
>>>>>>> origin/main
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "videos",
  });
  console.log("✅ GridFS initialized");
});

<<<<<<< HEAD
// Feedback Schema
=======
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
>>>>>>> origin/main
const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { collection: "feedback", timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

<<<<<<< HEAD
// Route to Submit Feedback
=======
>>>>>>> origin/main
app.post("/feedback", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
<<<<<<< HEAD
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
=======
      return res.status(400).json({ success: false, error: "Message is required" });
>>>>>>> origin/main
    }
    const newFeedback = new Feedback({ message });
    await newFeedback.save();
<<<<<<< HEAD
    res.status(201).json({ success: true, message: "Feedback submitted!" });
  } catch (err) {
=======

    res.status(201).json({ success: true, message: "Feedback submitted!" });
  } catch (err) {
    console.error("❌ Feedback error:", err);
>>>>>>> origin/main
    res.status(500).json({ success: false, error: err.message });
  }
});

<<<<<<< HEAD
// Set up the GridFS storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: "videos",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

// Route to fetch all interviews
app.get("/interviews", async (req, res) => {
  try {
    const interviews = await Video.find().sort({ uploadDate: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route to upload video
app.post("/upload-video", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file received" });
  }

  const question = req.body.question;
  const contentType = req.file.mimetype;
  const gridFsFileId = req.file.id; // Capture the GridFS file ID

  const videoRecord = {
    filename: req.file.filename,
    question: question,
    uploadDate: new Date(),
    contentType,
    fileId: gridFsFileId, // Store the GridFS file ID
  };

  try {
    const record = await Video.create(videoRecord);
    res.json({ success: true, record: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Fetch videos by name
app.get("/video/:filename", async (req, res) => {
  if (!gfs) {
    console.error("GridFS not initialized");
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  try {
    const filename = req.params.filename;
    // Log the filename being requested for debugging
    console.log(`Attempting to find video with filename: ${filename}`);

    const files = await gfs.find({ filename }).toArray();

    if (!files || files.length === 0) {
      console.error(`Video not found in GridFS for filename: ${filename}`);
      return res.status(404).json({ error: "Video not found in GridFS" });
    }

    console.log(`Video found for filename: ${filename}, streaming...`);
    const readStream = gfs.openDownloadStreamByName(filename);
    res.setHeader("Content-Type", files[0].contentType); // Dynamic content type
    readStream.pipe(res);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// Route to fetch video by id
// app.get("/video/:id", async (req, res) => {
//   if (!gfs) {
//     console.error("GridFS not initialized");
//     return res.status(500).json({ error: "GridFS not initialized" });
//   }

//   try {
//     const videoRecord = await Video.findById(req.params.id);
//     if (!videoRecord) {
//       console.error("Video record not found");
//       return res.status(404).json({ error: "Video record not found" });
//     }

//     const fileId = videoRecord.fileId;
//     const file = await gfs.find({ _id: fileId }).toArray();

//     if (!file || file.length === 0) {
//       console.error("Video not found in GridFS");
//       return res.status(404).json({ error: "Video not found" });
//     }

//     console.log("Video found, streaming...");
//     const readStream = gfs.openDownloadStream(fileId);
//     res.setHeader("Content-Type", file[0].contentType); // Dynamic content type
//     readStream.pipe(res);
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
=======
>>>>>>> origin/main
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
