import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  pollId: {
    type: String,
    required: true,
  },
  historyId: {
    type: String,
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  optionId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one vote per student per question
voteSchema.index(
  { historyId: 1, questionId: 1, sessionId: 1 },
  { unique: true }
);

export default mongoose.model("Vote", voteSchema);
