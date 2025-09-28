import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "7d",
  });

// Register user
export const registerUser = async ({ name, email, password, role }) => {
  if (!["teacher", "student", "user"].includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user, token };
};

// Login user
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  return { user, token };
};

// Get current logged-in user
export const getCurrentUser = async (decodedId) => {
  const user = await User.findById(decodedId).select("-password");
  if (!user) throw new Error("Invalid token");
  return user;
};

// Get profile by ID (new)
export const getProfileById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};
