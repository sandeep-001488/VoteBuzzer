import {
  startSession,
  getSessionHistory,
  exportResultsToCSV,
  getUserHistory,
} from "../services/sessionService.js";

export const getUserHistoryController = async (req, res) => {
  try {
    const history = await getUserHistory(req.user._id.toString());
    res.json(history);
  } catch (error) {
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

    const history = await getSessionHistory(historyId);
    if (!history) {
      return res.status(404).json({ error: "History not found" });
    }

    // Check if user has access to this history (optional security check)
    if (
      history.teacherId !== userId &&
      !history.participants.some((p) => p.userId === userId)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: error.message });
  }
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
