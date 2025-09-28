import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  startSessionController,
  getSessionHistoryController,
  exportResultsController,
  getUserHistoryController,
} from "../controllers/sessionController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post("/start", startSessionController);
router.get("/user-history", getUserHistoryController);
router.get("/history/:historyId", getSessionHistoryController);
router.get("/export/:historyId", exportResultsController);

export default router;
