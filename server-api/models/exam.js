const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
    },
    exam_name: {
      type: String,
      required: true,
      trim: true,
    },
    exam_provider: {
      type: String,
      required: true,
      trim: true,
    },
    schedule_url: {
      type: String,
      trim: true,
    },
    learn_url: {
      type: String,
      trim: true,
    },
    youtube_playlist: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    topics_covered: {
      type: [String], // Array of topics
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "modified",
    },
  }
);

module.exports = mongoose.model("Exam", examSchema);
