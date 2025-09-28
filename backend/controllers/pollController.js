import {
  createPoll,
  getPollById,
  getPollsByTeacher,
  updatePoll,
  deletePoll,
  getPollHistory,
} from "../services/pollService.js";

export const createPollController = async (req, res) => {
  try {
    const pollData = {
      ...req.body,
      teacherId: req.user._id.toString(), 
    };
    const poll = await createPoll(pollData);
    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPollController = async (req, res) => {
  try {
    const poll = await getPollById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if user has access to this poll
    if (
      req.user.role === "teacher" &&
      poll.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPollsController = async (req, res) => {
  try {
    const polls = await getPollsByTeacher(req.user._id.toString());
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePollController = async (req, res) => {
  try {
    const poll = await updatePoll(
      req.params.id,
      req.body,
      req.user._id.toString()
    );
    if (!poll) {
      return res.status(404).json({ error: "Poll not found or access denied" });
    }
    res.json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePollController = async (req, res) => {
  try {
    const poll = await deletePoll(req.params.id, req.user._id.toString());
    if (!poll) {
      return res.status(404).json({ error: "Poll not found or access denied" });
    }
    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPollHistoryController = async (req, res) => {
  try {
    const history = await getPollHistory(req.user._id.toString());
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
