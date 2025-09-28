import express from "express";
import {
  register,
  login,
  getMe,
  getProfileByIdController,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/auth/me", getMe);

router.get("/user/:id", getProfileByIdController);

export default router;
