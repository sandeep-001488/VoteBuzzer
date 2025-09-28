import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "7d",
  });

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

export const getCurrentUser = async (decodedId) => {
  const user = await User.findById(decodedId).select("-password");
  if (!user) throw new Error("Invalid token");
  return user;
};

export const getProfileById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};
