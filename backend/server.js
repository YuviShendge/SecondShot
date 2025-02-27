const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("ws");
const fs = require("fs");
const vosk = require("vosk");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/voice-to-text", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transcriptionSchema = new mongoose.Schema({
  text: String,
});

const Transcription = mongoose.model("Transcription", transcriptionSchema);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
