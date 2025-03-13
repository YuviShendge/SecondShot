const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("ws");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

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
mongoose.connect("mongodb://localhost:27017/voice-to-text", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up storage for video uploads
// Set up storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

const upload = multer({ storage });
// Function to upload video and get transcript from AssemblyAI
async function transcribeAudio(filePath, fileName) {
  try {
    // Step 1: Upload File to AssemblyAI
    const fileData = fs.readFileSync(filePath);
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fileData,
      {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadResponse.data.upload_url;
    console.log("File uploaded to AssemblyAI:", audioUrl);

    // Step 2: Request Transcription
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      }
    );

    const transcriptId = transcriptResponse.data.id;
    console.log("Transcript request submitted, ID:", transcriptId);

    // Step 3: Poll for Transcript
    let transcript;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 sec before checking

      const transcriptResult = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: ASSEMBLYAI_API_KEY },
        }
      );

      if (transcriptResult.data.status === "completed") {
        transcript = transcriptResult.data.text;
        break;
      } else if (transcriptResult.data.status === "failed") {
        console.error("Transcription failed.");
        return null;
      }
    }

    // Step 4: Save Transcript
    const transcriptPath = path.join(
      transcriptsDir,
      fileName.replace(".webm", ".txt")
    );
    fs.writeFileSync(transcriptPath, transcript, "utf8");
    console.log("Transcript saved to:", transcriptPath);

    return transcriptPath;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
}

app.post("/upload", upload.single("video"), async (req, res) => {
  console.log("Received file:", req.file);
  res.json({ success: true, filePath: req.file.path });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
