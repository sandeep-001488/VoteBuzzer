import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: [
    {
      id: String,
      text: String,
    },
  ],
  timeLimitSec: {
    type: Number,
    default: 60,
  },
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
  defaultTimeLimit: {
    type: Number,
    default: 60,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Poll", pollSchema);
