import { v4 as uuidv4 } from "uuid";
import Session from "../models/Session.js";
import History from "../models/History.js";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import User from "../models/User.js";

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
      answeredFor: {},
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
    session.answeredFor[questionId] = optionId;

    if (!session.logs) {
      session.logs = [];
    }

    // Get question text for better logging
    const poll = await Poll.findById(pollId);
    const question = poll.questions.find((q) => q.id === questionId);
    const questionText = question ? question.text : questionId;

    session.logs.push({
      event: "answered",
      timestamp: new Date(),
      details: `Answered: ${questionText}`,
    });
    await session.save();
  }

  return vote;
};

export const getSessionHistory = async (historyId) => {
  try {
    const history = await History.findOne({ historyId })
      .populate("pollId", "title questions defaultTimeLimit")
      .populate("teacherId", "name email");

    if (!history) return null;

    // Get all sessions for this history
    const sessions = await Session.find({ historyId }).populate(
      "userId",
      "name email"
    );
    const votes = await Vote.find({ historyId });

    // Convert to plain object and fix Map serialization
    const historyObj = history.toObject();

    // Fix tallies Map serialization
    if (historyObj.finishedQuestions) {
      historyObj.finishedQuestions = historyObj.finishedQuestions.map(
        (question) => ({
          ...question,
          tallies:
            question.tallies instanceof Map
              ? Object.fromEntries(question.tallies)
              : question.tallies,
        })
      );
    }

    // Create question mapping for easy lookup
    const questionMap = {};
    if (history.pollId && history.pollId.questions) {
      history.pollId.questions.forEach((q) => {
        questionMap[q.id] = {
          text: q.text,
          timeLimit: q.timeLimitSec || history.pollId.defaultTimeLimit || 60,
          options: q.options,
        };
      });
    }

    // Enhanced history data
    const enhancedHistory = {
      ...historyObj,
      studentLogs: sessions.map((session) => ({
        sessionId: session.sessionId,
        name: session.name,
        userId: session.userId,
        email: session.userId?.email || "Unknown",
        events: (session.logs || []).map((log) => ({
          ...log,
          details: formatLogDetails(log.details, questionMap),
        })),
        answeredQuestions: session.answeredFor || {},
      })),
      detailedResponses: {},
      participantCount: sessions.length,
    };

    // Group votes by question for detailed analysis
    if (history.pollId && history.pollId.questions) {
      history.pollId.questions.forEach((question) => {
        const questionVotes = votes.filter((v) => v.questionId === question.id);

        enhancedHistory.detailedResponses[question.id] = {
          questionText: question.text,
          options: question.options,
          responses: questionVotes.map((vote) => {
            const session = sessions.find(
              (s) => s.sessionId === vote.sessionId
            );
            const selectedOption = question.options.find(
              (opt) => opt.id === vote.optionId
            );

            // Calculate response time
            const finishedQuestion = history.finishedQuestions.find(
              (fq) => fq.questionId === question.id
            );
            let responseTime = 0;
            if (
              finishedQuestion &&
              finishedQuestion.startedAt &&
              vote.createdAt
            ) {
              responseTime = Math.floor(
                (new Date(vote.createdAt) -
                  new Date(finishedQuestion.startedAt)) /
                  1000
              );
              responseTime = Math.max(0, responseTime);
            }

            return {
              sessionId: vote.sessionId,
              studentName: session ? session.name : "Unknown",
              studentEmail: session?.userId?.email || "Unknown",
              optionId: vote.optionId,
              optionText: selectedOption
                ? selectedOption.text
                : "Unknown Option",
              timestamp: vote.createdAt,
              responseTime: responseTime,
            };
          }),
        };
      });
    }

    return enhancedHistory;
  } catch (error) {
    console.error("Error in getSessionHistory:", error);
    throw new Error(`Failed to get session history: ${error.message}`);
  }
};

// Helper function to format log details
const formatLogDetails = (details, questionMap) => {
  if (!details) return details;

  // Look for question IDs in the format: "Answered: questionId" or similar
  const questionIdMatch = details.match(
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/
  );

  if (questionIdMatch) {
    const questionId = questionIdMatch[1];
    const questionInfo = questionMap[questionId];

    if (questionInfo) {
      const shortText =
        questionInfo.text.length > 30
          ? questionInfo.text.substring(0, 30) + "..."
          : questionInfo.text;

      return details.replace(questionIdMatch[1], `"${shortText}"`);
    }
  }

  return details;
};

export const getUserHistory = async (userId) => {
  try {
    console.log("getUserHistory called with userId:", userId);

    // Get sessions where user was a teacher
    const teacherHistories = await History.find({ teacherId: userId })
      .populate("pollId", "title")
      .sort({ createdAt: -1 });

    console.log("Found teacher histories:", teacherHistories.length);

    // Get sessions where user participated as student
    const studentHistories = await History.find({
      "participants.userId": userId,
    })
      .populate("pollId", "title")
      .populate("teacherId", "name email")
      .sort({ createdAt: -1 });

    console.log("Found student histories:", studentHistories.length);

    // Add participant counts to teacher histories
    const enhancedTeacherHistories = await Promise.all(
      teacherHistories.map(async (history) => {
        const participantCount = await Session.countDocuments({
          historyId: history.historyId,
        });

        return {
          ...history.toObject(),
          participantCount,
          questionsCompleted: history.finishedQuestions
            ? history.finishedQuestions.length
            : 0,
        };
      })
    );

    // Enhanced student histories
    const enhancedStudentHistories = studentHistories.map((history) => {
      const participation = history.participants.find(
        (p) => p.userId.toString() === userId
      );

      return {
        ...history.toObject(),
        participationDetails: participation,
        questionsCompleted: history.finishedQuestions
          ? history.finishedQuestions.length
          : 0,
      };
    });

    const result = {
      asTeacher: enhancedTeacherHistories,
      asStudent: enhancedStudentHistories,
    };

    console.log("Final result:", {
      teacherCount: result.asTeacher.length,
      studentCount: result.asStudent.length,
    });

    return result;
  } catch (error) {
    console.error("getUserHistory error:", error);
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
    const tallies =
      question.tallies instanceof Map
        ? Object.fromEntries(question.tallies)
        : question.tallies || {};

    question.options.forEach((option) => {
      const votes = tallies[option.id] || 0;
      const percentage =
        question.totalVotes > 0
          ? ((votes / question.totalVotes) * 100).toFixed(1)
          : "0.0";
      csvContent += `"${questionText}","${option.text}",${votes},${percentage}%\n`;
    });
  });

  return csvContent;
};
