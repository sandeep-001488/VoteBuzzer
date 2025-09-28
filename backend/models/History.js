import mongoose from "mongoose";

const finishedQuestionSchema = new mongoose.Schema({
  questionId: String,
  questionText: String,
  options: [
    {
      id: String,
      text: String,
    },
  ],
  tallies: {
    type: Map,
    of: Number,
  },
  totalVotes: Number,
  endedAt: {
    type: Date,
    default: Date.now,
  },
});

const historySchema = new mongoose.Schema({
  historyId: {
    type: String,
    required: true,
    unique: true,
  },
  pollId: {
    type: String,
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
  },
  title: String,
  finishedQuestions: [finishedQuestionSchema],
  studentLogs: [
    {
      sessionId: String,
      name: String,
      events: [
        {
          event: String,
          timestamp: Date,
          details: String,
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
});

export default mongoose.model("History", historySchema);
