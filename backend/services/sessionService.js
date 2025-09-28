import { v4 as uuidv4 } from "uuid";
import Session from "../models/Session.js";
import History from "../models/History.js";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";

export const startSession = async ({ pollId, teacherId }) => {
  const historyId = uuidv4();
  const poll = await Poll.findById(pollId);
  if (!poll) throw new Error("Poll not found");

  // Check if teacher already has an active session
  const activeSession = await History.findOne({
    teacherId,
    endedAt: { $exists: false },
  });

  if (activeSession) {
    throw new Error(
      "You already have an active session. Please end it before starting a new one."
    );
  }

  const history = new History({
    historyId,
    pollId,
    teacherId,
    title: poll.title,
    finishedQuestions: [],
    chatMessages: [],
    studentLogs: [],
    participants: [],
  });

  await history.save();
  return { historyId, poll };
};

export const joinSession = async ({
  pollId,
  historyId,
  name,
  sessionId,
  userId,
}) => {
  // Check if user has an active session as teacher
  const activeTeacherSession = await History.findOne({
    teacherId: userId,
    endedAt: { $exists: false },
  });

  if (activeTeacherSession) {
    throw new Error("You cannot join as student while teaching a session");
  }

  let session = await Session.findOne({ sessionId });

  if (session) {
    if (session.kicked) {
      throw new Error("You have been removed from this poll");
    }

    session.connected = true;

    // Ensure logs array exists
    if (!session.logs) {
      session.logs = [];
    }

    session.logs.push({
      event: "reconnected",
      timestamp: new Date(),
      details: "Student reconnected",
    });
  } else {
    session = new Session({
      pollId,
      historyId,
      sessionId,
      name,
      userId,
      connected: true,
      kicked: false,
      answeredFor: {}, // Use empty object instead of new Map()
      logs: [
        {
          event: "joined",
          timestamp: new Date(),
          details: "Student joined session",
        },
      ],
    });

    // Add to history participants
    const history = await History.findOne({ historyId });
    if (history) {
      // Ensure participants array exists
      if (!history.participants) {
        history.participants = [];
      }

      history.participants.push({
        sessionId,
        name,
        userId,
        joinedAt: new Date(),
      });
      await history.save();
    } else {
      throw new Error("Session not found");
    }
  }

  return await session.save();
};

export const submitVote = async ({
  pollId,
  historyId,
  questionId,
  optionId,
  sessionId,
}) => {
  const existingVote = await Vote.findOne({ historyId, questionId, sessionId });
  if (existingVote) throw new Error("Already voted for this question");

  const vote = new Vote({ pollId, historyId, questionId, sessionId, optionId });
  await vote.save();

  const session = await Session.findOne({ sessionId });
  if (session) {
    session.answeredFor[questionId] = optionId; // Fixed this line

    if (!session.logs) {
      session.logs = [];
    }

    session.logs.push({
      event: "answered",
      timestamp: new Date(),
      details: `Answered question ${questionId}`,
    });
    await session.save();
  }

  return vote;
};

export const getSessionHistory = async (historyId) => {
  const history = await History.findOne({ historyId })
    .populate("pollId", "title questions")
    .populate("teacherId", "name email")
    .populate("participants.userId", "name email");

  if (!history) return null;

  const sessions = await Session.find({ historyId });

  history.studentLogs = sessions.map((session) => ({
    sessionId: session.sessionId,
    name: session.name,
    events: session.logs,
  }));

  return history;
};

export const getUserHistory = async (userId) => {
  try {
    // Get sessions where user was a teacher
    const teacherHistories = await History.find({ teacherId: userId })
      .populate("pollId", "title")
      .sort({ createdAt: -1 });

    // Get sessions where user participated as student
    const studentHistories = await History.find({
      "participants.userId": userId,
    })
      .populate("pollId", "title")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    return {
      asTeacher: teacherHistories,
      asStudent: studentHistories.map((history) => {
        const participation = history.participants.find(
          (p) => p.userId.toString() === userId
        );
        return {
          ...history.toObject(),
          participationDetails: participation,
        };
      }),
    };
  } catch (error) {
    throw new Error(`Failed to get user history: ${error.message}`);
  }
};

export const exportResultsToCSV = async (historyId) => {
  const history = await History.findOne({ historyId }).populate(
    "pollId",
    "title questions"
  );

  if (!history) throw new Error("History not found");

  let csvContent = "Question,Option,Votes,Percentage\n";

  history.finishedQuestions.forEach((question, qIndex) => {
    const questionText = question.questionText || `Question ${qIndex + 1}`;

    question.options.forEach((option) => {
      const votes = question.tallies.get(option.id) || 0;
      const percentage =
        question.totalVotes > 0
          ? ((votes / question.totalVotes) * 100).toFixed(1)
          : "0.0";
      csvContent += `"${questionText}","${option.text}",${votes},${percentage}%\n`;
    });
  });

  return csvContent;
};
