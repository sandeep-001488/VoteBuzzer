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

router.use(authenticate);

router.get("/", getPollsController);

router.post("/", createPollController);

router.get("/:id", getPollController);

router.put("/:id", updatePollController);

router.delete("/:id", deletePollController);

router.get("/history/all", getPollHistoryController);

export default router;
