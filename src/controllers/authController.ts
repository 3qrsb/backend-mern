import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel";
import { sendVerificationEmail } from "./emailController";
import config from "../config";
import { generateTokenPair } from "../utils/jwt";

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.includes("@") || !password?.trim()) {
    res.status(422).json({ message: "Invalid input." });
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(422).json({ message: "Email already in use." });
    return;
  }

  const user = new User({ name, email, password, isVerified: false });
  const newUser = await user.save();
  await sendVerificationEmail(newUser);

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    isVerified: newUser.isVerified,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email?.includes("@") || !password?.trim()) {
    res.status(422).json({ message: "Invalid input." });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  if (!user.isVerified) {
    res
      .status(401)
      .json({ message: "Email not verified. Please verify first." });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/auth/google-login
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400).json({ message: "Missing Google credential." });
    return;
  }

  const payload: any = jwt.decode(credential);
  if (!payload?.email) {
    res.status(401).json({ message: "Invalid Google token." });
    return;
  }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex");
    user = new User({
      name: payload.name,
      email: payload.email,
      password: randomPassword,
      isVerified: true,
    });
    await user.save();
  }

  const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: tokenValue } = req.body;
    if (!tokenValue) {
      res.status(401).json({ message: "Missing refresh token." });
      return;
    }

    try {
      const decoded = jwt.verify(tokenValue, config.JWT_SECRET) as {
        id: string;
        type: string;
      };
      if (decoded.type !== "refresh") {
        res.status(401).json({ message: "Invalid token type." });
        return;
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const tokens = generateTokenPair(user._id.toString());
      res.json(tokens);
    } catch {
      res.status(401).json({ message: "Refresh token invalid or expired." });
    }
  }
);
