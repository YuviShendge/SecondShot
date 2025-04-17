const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { GridFsStorage } = require("multer-gridfs-storage");

// Models
const Video = require("./models/Video");

const app = express();
const PORT = process.env.PORT || 5000;

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

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  console.log("MongoDB connection open ✅ in database: " + conn.name);
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "videos",
  });
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { collection: "feedback", timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Route to Submit Feedback
app.post("/feedback", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }
    const newFeedback = new Feedback({ message });
    await newFeedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
