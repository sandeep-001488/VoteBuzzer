import { v4 as uuidv4 } from "uuid";
import Poll from "../models/Poll.js";
import History from "../models/History.js";

export const createPoll = async (pollData) => {
  const { title, questions, defaultTimeLimit = 60, teacherId } = pollData;

  const processedQuestions = questions.map((q) => ({
    id: uuidv4(),
    text: q.text,
    options: q.options.map((opt) => ({ id: uuidv4(), text: opt.text })),
    timeLimitSec: q.timeLimitSec || defaultTimeLimit,
  }));

  const poll = new Poll({
    title,
    teacherId,
    questions: processedQuestions,
    defaultTimeLimit,
  });

  return await poll.save();
};

export const getPollById = async (pollId) => Poll.findById(pollId);

export const getPollsByTeacher = async (teacherId) =>
  Poll.find({ teacherId }).sort({ createdAt: -1 });

export const updatePoll = async (pollId, updateData, teacherId) => {
  const poll = await Poll.findOneAndUpdate(
    { _id: pollId, teacherId },
    updateData,
    { new: true }
  );
  return poll;
};

export const deletePoll = async (pollId, teacherId) => {
  const poll = await Poll.findOneAndDelete({ _id: pollId, teacherId });
  return poll;
};

export const getPollHistory = async (teacherId) => {
  const history = await History.find({ teacherId }).sort({ createdAt: -1 });
  return history;
};
