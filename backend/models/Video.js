const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  filename: String,
  uploadDate: { type: Date, default: Date.now },
});

const Video = mongoose.model("Video", videoSchema, "videos"); // Explicitly use "videos" collection

module.exports = Video;
