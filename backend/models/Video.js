const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema from mongoose

<<<<<<< HEAD
const videoSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  question: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Video = mongoose.model("Video", videoSchema);

=======
const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  userId: { type: String },
  question: { type: String },
});

const Video = mongoose.model("Video", videoSchema, "videos");
>>>>>>> origin/main
module.exports = Video;
