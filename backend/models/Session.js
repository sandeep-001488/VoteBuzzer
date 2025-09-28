import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    historyId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    socketId: String,
    connected: {
      type: Boolean,
      default: true,
    },
    kicked: {
      type: Boolean,
      default: false,
    },
    answeredFor: {
      type: Map,
      of: String,
      default: {},
    },
    logs: [
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
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
