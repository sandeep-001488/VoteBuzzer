import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  startSessionController,
  getSessionHistoryController,
  exportResultsController,
  getUserHistoryController,
  getActiveSessionController,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", authenticate, startSessionController);
router.get("/user-history", authenticate, getUserHistoryController);
router.get("/history/:historyId", authenticate, getSessionHistoryController);

router.get("/export/:historyId", exportResultsController);
router.get("/active", authenticate, getActiveSessionController);

export default router;
