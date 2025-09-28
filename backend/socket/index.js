import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import Vote from "../models/Vote.js";
import History from "../models/History.js";
import Poll from "../models/Poll.js";
import User from "../models/User.js";
import * as sessionService from "../services/sessionService.js";
import * as chatService from "../services/chatService.js";
import * as pollService from "../services/pollService.js";

// Store active polls and timers
const activePolls = new Map();
const questionTimers = new Map();

// Socket authentication middleware
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

export default (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Teacher creates poll
    socket.on("teacher:createPoll", async (data, callback) => {
      try {
        const poll = await pollService.createPoll({
          ...data,
          teacherId: socket.userId,
        });
        callback({ success: true, poll });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Teacher starts session
    socket.on("teacher:startSession", async (data, callback) => {
      try {
        const result = await sessionService.startSession({
          ...data,
          teacherId: socket.userId,
        });

        const roomName = `poll-${data.pollId}-${result.historyId}`;
        socket.join(roomName);

        activePolls.set(result.historyId, {
          pollId: data.pollId,
          teacherId: socket.userId,
          currentQuestion: null,
          students: new Map(),
          askedQuestions: new Set(), // Track asked questions
          roomName: roomName,
        });

        callback({ success: true, historyId: result.historyId });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Teacher asks question
    socket.on("teacher:askQuestion", async (data) => {
      const { pollId, historyId, questionId, timeLimitSec = 60 } = data;
      const roomName = `poll-${pollId}-${historyId}`;

      try {
        const activePoll = activePolls.get(historyId);
        if (!activePoll || activePoll.teacherId !== socket.userId) {
          return socket.emit("error", {
            message: "Unauthorized or session not found",
          });
        }

        // Check if question already asked
        if (activePoll.askedQuestions.has(questionId)) {
          return socket.emit("error", {
            message: "Question already asked in this session",
          });
        }

        // Check if current question is active
        if (activePoll.currentQuestion) {
          return socket.emit("error", {
            message: "Please end current question first",
          });
        }

        const poll = await Poll.findById(pollId);
        const question = poll.questions.find((q) => q.id === questionId);
        if (!question) {
          return socket.emit("error", { message: "Question not found" });
        }

        // Mark question as asked and set as current
        activePoll.currentQuestion = questionId;
        activePoll.askedQuestions.add(questionId);

        const timerKey = `${historyId}-${questionId}`;
        if (questionTimers.has(timerKey)) {
          clearTimeout(questionTimers.get(timerKey));
        }

        // Send question to all participants in the room
        io.to(roomName).emit("server:newQuestion", {
          pollId,
          historyId,
          questionId,
          text: question.text,
          options: question.options,
          timeLeftSec: timeLimitSec,
        });

        // Send confirmation to teacher
        socket.emit("server:questionStarted", {
          questionId,
          timeLeftSec: timeLimitSec,
        });

        const timer = setTimeout(async () => {
          await endQuestion(pollId, historyId, questionId, question);
        }, timeLimitSec * 1000);

        questionTimers.set(timerKey, timer);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Teacher ends question manually
    socket.on("teacher:endQuestion", async (data) => {
      const { pollId, historyId, questionId } = data;

      try {
        const activePoll = activePolls.get(historyId);
        if (!activePoll || activePoll.teacherId !== socket.userId) {
          return socket.emit("error", { message: "Unauthorized" });
        }

        const poll = await Poll.findById(pollId);
        const question = poll.questions.find((q) => q.id === questionId);
        await endQuestion(pollId, historyId, questionId, question);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Teacher kicks student
    socket.on("teacher:kickStudent", async (data) => {
      const { pollId, historyId, sessionId } = data;

      try {
        const activePoll = activePolls.get(historyId);
        if (!activePoll || activePoll.teacherId !== socket.userId) {
          return socket.emit("error", { message: "Unauthorized" });
        }

        const session = await Session.findOne({ sessionId });
        if (session) {
          session.kicked = true;
          session.connected = false;

          if (!session.logs) {
            session.logs = [];
          }

          session.logs.push({
            event: "kicked",
            timestamp: new Date(),
            details: "Kicked by teacher",
          });
          await session.save();

          const studentSocket = [...io.sockets.sockets.values()].find(
            (s) => s.sessionId === sessionId
          );

          if (studentSocket) {
            studentSocket.emit("server:kicked", {
              reason: "Removed by teacher",
            });
            studentSocket.disconnect();
          }

          await updateParticipantsList(pollId, historyId);
        }
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Student joins
    socket.on("student:join", async (data, callback) => {
      const { pollId, historyId, name, sessionId } = data;
      const roomName = `poll-${pollId}-${historyId}`;

      try {
        // Check if session exists
        const activePoll = activePolls.get(historyId);
        if (!activePoll) {
          return callback({
            success: false,
            error: "Session not found or not active",
          });
        }

        const existingSession = await Session.findOne({ sessionId });
        if (existingSession && existingSession.kicked) {
          return callback({
            success: false,
            error: "You have been removed from this poll",
          });
        }

        const session = await sessionService.joinSession({
          pollId,
          historyId,
          name,
          sessionId,
          userId: socket.userId,
        });

        socket.sessionId = sessionId;
        socket.historyId = historyId;
        socket.studentName = name;
        socket.join(roomName);

        if (activePoll) {
          activePoll.students.set(sessionId, {
            name,
            socketId: socket.id,
            answered: false,
          });
        }

        await updateParticipantsList(pollId, historyId);
        callback({ success: true, session });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Student submits answer
    socket.on("student:submitAnswer", async (data) => {
      const { pollId, historyId, questionId, optionId, sessionId } = data;

      try {
        await sessionService.submitVote({
          pollId,
          historyId,
          questionId,
          optionId,
          sessionId,
        });

        const activePoll = activePolls.get(historyId);
        if (activePoll && activePoll.students.has(sessionId)) {
          activePoll.students.get(sessionId).answered = true;
        }

        await updateParticipantsList(pollId, historyId);
        await sendResultsUpdate(pollId, historyId, questionId);

        const totalStudents = activePoll ? activePoll.students.size : 0;
        const answeredStudents = await Vote.countDocuments({
          historyId,
          questionId,
        });

        if (answeredStudents >= totalStudents && totalStudents > 0) {
          const roomName = `poll-${pollId}-${historyId}`;
          io.to(roomName).emit("server:allAnswered", {
            pollId,
            historyId,
            questionId,
          });

          setTimeout(async () => {
            const poll = await Poll.findById(pollId);
            const question = poll.questions.find((q) => q.id === questionId);
            await endQuestion(pollId, historyId, questionId, question);
          }, 2000);
        }
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Student leaves
    socket.on("student:leave", async () => {
      if (socket.sessionId && socket.historyId) {
        await handleStudentDisconnect(socket);
      }
    });

    // Chat messages - Fixed authorization
    socket.on("chat:send", async (data) => {
      const { pollId, historyId, from, text } = data;
      const roomName = `poll-${pollId}-${historyId}`;

      try {
        // Check if session exists and user has access
        const activePoll = activePolls.get(historyId);
        const isTeacher = activePoll && activePoll.teacherId === socket.userId;
        const isStudent = socket.sessionId && socket.historyId === historyId;

        if (!isTeacher && !isStudent) {
          return socket.emit("error", {
            message: "Unauthorized: Not part of this session",
          });
        }

        // Check if student is kicked (only for students)
        if (isStudent && socket.sessionId) {
          const session = await Session.findOne({
            sessionId: socket.sessionId,
          });
          if (session && session.kicked) {
            return socket.emit("error", {
              message: "You cannot send messages after being removed",
            });
          }
        }

        const message = await chatService.saveMessage({
          pollId,
          historyId,
          from: isTeacher ? `${from} (Host)` : from,
          text,
        });

        io.to(roomName).emit("chat:receive", message);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.name}`);

      if (socket.sessionId && socket.historyId) {
        await handleStudentDisconnect(socket);
      }

      // Clean up teacher sessions
      for (const [historyId, poll] of activePolls) {
        if (poll.teacherId === socket.userId) {
          activePolls.delete(historyId);
          for (const [timerKey, timer] of questionTimers) {
            if (timerKey.startsWith(historyId)) {
              clearTimeout(timer);
              questionTimers.delete(timerKey);
            }
          }
          break;
        }
      }
    });
  });

  async function endQuestion(pollId, historyId, questionId, question) {
    const roomName = `poll-${pollId}-${historyId}`;
    const timerKey = `${historyId}-${questionId}`;

    try {
      if (questionTimers.has(timerKey)) {
        clearTimeout(questionTimers.get(timerKey));
        questionTimers.delete(timerKey);
      }

      if (!question) {
        const poll = await Poll.findById(pollId);
        if (!poll) return;
        question = poll.questions.find((q) => q.id === questionId);
        if (!question) return;
      }

      const votes = await Vote.find({ historyId, questionId });
      const tallies = new Map();

      votes.forEach((vote) => {
        tallies.set(vote.optionId, (tallies.get(vote.optionId) || 0) + 1);
      });

      const history = await History.findOne({ historyId });
      if (history) {
        const alreadyFinished = history.finishedQuestions.some(
          (fq) => fq.questionId === questionId
        );

        if (!alreadyFinished) {
          if (!history.finishedQuestions) {
            history.finishedQuestions = [];
          }

          history.finishedQuestions.push({
            questionId,
            questionText: question.text,
            options: question.options,
            tallies: Object.fromEntries(tallies),
            totalVotes: votes.length,
            endedAt: new Date(),
          });
          await history.save();
        }
      }

      const activePoll = activePolls.get(historyId);
      if (activePoll) {
        activePoll.currentQuestion = null;
        // Reset student answered status
        for (const student of activePoll.students.values()) {
          student.answered = false;
        }
      }

      io.to(roomName).emit("server:resultsFinal", {
        pollId,
        historyId,
        questionId,
        tallies: Object.fromEntries(tallies),
        totalVotes: votes.length,
      });

      await updateParticipantsList(pollId, historyId);
      await checkSessionCompletion(historyId);
    } catch (error) {
      console.error("Error ending question:", error);
    }
  }

  async function checkSessionCompletion(historyId) {
    try {
      const history = await History.findOne({ historyId });
      const poll = await Poll.findById(history.pollId);

      if (history.finishedQuestions.length === poll.questions.length) {
        history.endedAt = new Date();
        await history.save();

        activePolls.delete(historyId);

        io.to(`poll-${history.pollId}-${historyId}`).emit(
          "server:sessionCompleted",
          {
            historyId,
            message: "Session completed! Check history for results.",
          }
        );
      }
    } catch (error) {
      console.error("Error checking session completion:", error);
    }
  }

  async function sendResultsUpdate(pollId, historyId, questionId) {
    const roomName = `poll-${pollId}-${historyId}`;

    try {
      const votes = await Vote.find({ historyId, questionId });
      const tallies = new Map();

      votes.forEach((vote) => {
        tallies.set(vote.optionId, (tallies.get(vote.optionId) || 0) + 1);
      });

      io.to(roomName).emit("server:resultsUpdate", {
        pollId,
        historyId,
        questionId,
        tallies: Object.fromEntries(tallies),
        totalVotes: votes.length,
      });
    } catch (error) {
      console.error("Error sending results update:", error);
    }
  }

  async function updateParticipantsList(pollId, historyId) {
    const roomName = `poll-${pollId}-${historyId}`;

    try {
      const sessions = await Session.find({
        historyId,
        connected: true,
        kicked: false,
      });

      const activePoll = activePolls.get(historyId);
      const currentQuestionId = activePoll ? activePoll.currentQuestion : null;

      const students = sessions.map((session) => ({
        sessionId: session.sessionId,
        name: session.name,
        connected: session.connected,
        kicked: session.kicked,
        answered: currentQuestionId
          ? session.answeredFor &&
            session.answeredFor[currentQuestionId] !== undefined
          : false,
      }));

      io.to(roomName).emit("server:studentListUpdate", { students });
    } catch (error) {
      console.error("Error updating participants list:", error);
    }
  }

  async function handleStudentDisconnect(socket) {
    try {
      const session = await Session.findOne({ sessionId: socket.sessionId });
      if (session) {
        session.connected = false;

        if (!session.logs) {
          session.logs = [];
        }

        session.logs.push({
          event: "disconnected",
          timestamp: new Date(),
          details: "Student disconnected",
        });
        await session.save();
      }

      const activePoll = activePolls.get(socket.historyId);
      if (activePoll && activePoll.students.has(socket.sessionId)) {
        activePoll.students.delete(socket.sessionId);
      }

      await updateParticipantsList(null, socket.historyId);
    } catch (error) {
      console.error("Error handling student disconnect:", error);
    }
  }
};
