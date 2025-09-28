import {
  startSession,
  getSessionHistory,
  exportResultsToCSV,
  getUserHistory,
} from "../services/sessionService.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Vote from "../models/Vote.js";
import Poll from "../models/Poll.js";
import mongoose from "mongoose";
import History from "../models/History.js";

export const getUserHistoryController = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log("User ID:", userId);

    const history = await getUserHistory(userId);
    res.json(history);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const startSessionController = async (req, res) => {
  try {
    const result = await startSession({
      ...req.body,
      teacherId: req.user._id.toString(),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSessionHistoryController = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user._id.toString();

    const history = await History.findOne({ historyId })
      .populate("pollId", "title questions defaultTimeLimit")
      .populate("teacherId", "name email");

    if (!history) {
      return res.status(404).json({ error: "History not found" });
    }

    // Check if user has access to this history
    const isTeacher = history.teacherId._id.toString() === userId;
    const isParticipant = history.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (!isTeacher && !isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get poll details for question mapping
    const poll = await Poll.findById(history.pollId);
    const questionMap = {};
    if (poll) {
      poll.questions.forEach((q) => {
        questionMap[q.id] = {
          text: q.text,
          timeLimit: q.timeLimitSec || poll.defaultTimeLimit || 60,
          options: q.options,
        };
      });
    }

    // For participants, show limited data with proper formatting
    if (!isTeacher && isParticipant) {
      const userSession = await Session.findOne({
        historyId,
        userId: new mongoose.Types.ObjectId(userId),
      });

      // Get user's votes
      const userVotes = await Vote.find({
        historyId,
        sessionId: userSession?.sessionId,
      });

      const filteredHistory = {
        historyId: history.historyId,
        title: history.title,
        participantCount: history.participants.length,
        isParticipant: true,
        teacherDetails: history.teacherId,
        teacherName: history.teacherId?.name || "Unknown",
        // Show questions with proper option names and user's answers
        finishedQuestions: history.finishedQuestions.map((q) => {
          const userVote = userVotes.find(
            (vote) => vote.questionId === q.questionId
          );
          const questionInfo = questionMap[q.questionId];
          const userAnswerOption = userVote
            ? questionInfo?.options?.find((opt) => opt.id === userVote.optionId)
            : null;

          return {
            questionId: q.questionId,
            questionText: q.questionText,
            totalResponses: q.totalVotes || 0,
            userAnswer: userAnswerOption?.text || "Not answered",
            userAnswered: !!userVote,
            endedAt: q.endedAt,
            options:
              questionInfo?.options?.map((opt) => ({
                id: opt.id,
                text: opt.text,
              })) || [],
          };
        }),
        // Format user activity properly
        userActivity:
          userSession?.logs?.map((log) => {
            return {
              event: log.event,
              timestamp: log.timestamp,
              details: formatActivityDetails(log.details, questionMap),
            };
          }) || [],
      };

      return res.json(filteredHistory);
    }

    // For teachers, show comprehensive data
    if (isTeacher) {
      // Get all sessions for detailed responses
      const sessions = await Session.find({ historyId }).populate(
        "userId",
        "name email"
      );

      // Get all votes for this history
      const votes = await Vote.find({ historyId });

      // Build detailed responses
      const detailedResponses = {};

      if (poll?.questions) {
        poll.questions.forEach((question) => {
          const questionVotes = votes.filter(
            (v) => v.questionId === question.id
          );

          // Get the finished question for timing data
          const finishedQuestion = history.finishedQuestions.find(
            (fq) => fq.questionId === question.id
          );

          detailedResponses[question.id] = {
            questionText: question.text,
            options: question.options,
            responses: questionVotes.map((vote) => {
              const session = sessions.find(
                (s) => s.sessionId === vote.sessionId
              );
              const option = question.options.find(
                (opt) => opt.id === vote.optionId
              );

              // Calculate response time
              let responseTime = 0;
              if (finishedQuestion?.startedAt && vote.createdAt) {
                responseTime = Math.floor(
                  (new Date(vote.createdAt) -
                    new Date(finishedQuestion.startedAt)) /
                    1000
                );
                responseTime = Math.max(0, responseTime);
              }

              return {
                studentName: session?.name || "Unknown",
                studentEmail: session?.userId?.email || "Unknown",
                optionText: option?.text || "Unknown",
                timestamp: vote.createdAt,
                responseTime: responseTime,
              };
            }),
          };
        });
      }

      // Enhanced participants with user details
      const enhancedParticipants = await Promise.all(
        history.participants.map(async (participant) => {
          const user = await User.findById(participant.userId).select(
            "name email"
          );
          return {
            name: user?.name || participant.name,
            email: user?.email || "Unknown",
            joinedAt: participant.joinedAt,
            sessionId: participant.sessionId,
          };
        })
      );

      // Enhanced student logs with better formatting
      const enhancedStudentLogs = sessions.map((session) => ({
        name: session.name,
        sessionId: session.sessionId,
        userId: session.userId._id,
        email: session.userId?.email || "Unknown",
        events: (session.logs || []).map((event) => ({
          event: event.event,
          timestamp: event.timestamp,
          details: formatActivityDetails(event.details, questionMap),
        })),
        answeredQuestions: Object.keys(session.answeredFor || {}),
      }));

      // Fix vote tallies and percentages for finished questions
      const correctedFinishedQuestions = history.finishedQuestions.map(
        (question) => {
          const questionVotes = votes.filter(
            (v) => v.questionId === question.questionId
          );

          const tallies = {};
          questionVotes.forEach((vote) => {
            tallies[vote.optionId] = (tallies[vote.optionId] || 0) + 1;
          });

          return {
            ...question.toObject(),
            tallies,
            totalVotes: questionVotes.length,
          };
        }
      );

      const enhancedHistory = {
        ...history.toObject(),
        isTeacher: true,
        teacherDetails: history.teacherId,
        detailedResponses,
        participants: enhancedParticipants,
        studentLogs: enhancedStudentLogs,
        finishedQuestions: correctedFinishedQuestions,
        participantCount: sessions.length,
      };

      return res.json(enhancedHistory);
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to format activity details
const formatActivityDetails = (details, questionMap) => {
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

export const exportResultsController = async (req, res) => {
  try {
    const csvData = await exportResultsToCSV(req.params.historyId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="poll-results-${req.params.historyId}.csv"`
    );
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
