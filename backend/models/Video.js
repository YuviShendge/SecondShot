const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  userId: { type: String },
  question: { type: String },
});

const Video = mongoose.model("Video", videoSchema, "videos");
module.exports = Video;
