import express from "express";
import {
  createPollController,
  getPollController,
  getPollsController,
  updatePollController,
  deletePollController,
  getPollHistoryController,
} from "../controllers/pollController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all polls for authenticated user
router.get("/", getPollsController);

// Create poll
router.post("/", createPollController);

// Get specific poll
router.get("/:id", getPollController);

// Update poll
router.put("/:id", updatePollController);

// Delete poll
router.delete("/:id", deletePollController);

// Get poll history
router.get("/history/all", getPollHistoryController);

export default router;
