const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema from mongoose

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

module.exports = Video;
