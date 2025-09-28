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
    default: new Map(),
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    required: true,
  },
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  finishedQuestions: [finishedQuestionSchema],
  participants: [
    {
      sessionId: String,
      name: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  studentLogs: [
    {
      sessionId: String,
      name: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      events: [
        {
          event: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
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
