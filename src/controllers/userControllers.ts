import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import { sendVerificationEmail } from "./emailController";
import * as jsonwebtoken from 'jsonwebtoken';


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (
    !email ||
    !email.includes("@") ||
    !name ||
    name.trim() === "" ||
    !password ||
    password.trim() === ""
  ) {
    res.status(422).json({ message: "Invalid input." });
    return;
  }
  const exist = await User.findOne({ email });

  if (exist) {
    res.status(422).json({ message: "Email already have been used!" });
    return;
  }

  const user = new User({
    name,
    email,
    password,
    isVerified: false, // Set to false initially
  });

  if (user) {
    const newUser = await user.save();
    await sendVerificationEmail(newUser); // Send verification email
    res.status(201).json(newUser);
  } else {
    res.status(500);
    throw new Error("User not found!");
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !email.includes("@") || !password || password.trim() === "") {
    res.status(422).json({ message: "Invalid input." });
    return;
  }

  const user = await User.findOne({ email });

  if (user) {
    if (!user.isVerified) {
      res.status(401).json({ message: "Email not verified. Please verify your email." });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } else {
    res.status(404).json({ message: "User not found." });
  }
});


// @desc    Google Login
// @route   POST /api/users/google-login
// @access  Public

export const googleLogin = asyncHandler(async (req: any, res: any) => {
  const { credential: accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: "Missing access token." });
  }

  try {
    // Decode the Google Sign-In token
    const googleUser: any = jsonwebtoken.decode(accessToken);

    // Check if user already exists in your database based on email or Google ID
    const existingUser = await User.findOne({ email: googleUser.email });

    if (existingUser) {
      // User exists, return an error indicating that the email is already in use
      return res.status(422).json({ message: "Email already in use." });
    }

    // New user, create a new user in your database
    const user = new User({
      name: googleUser.name,
      email: googleUser.email,
      password: googleUser.email,
      isAdmin: false,
      isVerified: false,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user);

    // Generate a secure token for the user
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error("Google Login verification failed:", error);
    res.status(401).json({ message: "Invalid access token." });
  }
});


// @desc    Get all users
// @route   Get /api/users
// @access  Admin

export const getUsersList = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = 10;
  const page: any = req.query.page || 1;
  const query: any = req.query.query || "";

  const queryFilter =
    query && query !== "all"
      ? {
        username: {
          $regex: query,
          $options: "i",
        },
      }
      : {};

  const users = await User.find({
    ...queryFilter,
  })
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .limit(pageSize)
    .lean();

  const countUsers = await User.countDocuments({
    ...queryFilter,
  });

  const pages = Math.ceil(countUsers / pageSize);

  if (users) {
    res.status(200).json({
      countUsers,
      users,
      page,
      pages,
    });
  } else {
    res.status(500);
    throw new Error("Users not found!");
  }
});

// @desc    Get single user
// @route   Get /api/users/:id
// @access  Private

export const getUserBydId = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400);
      throw new Error("user not found!");
    }
  }
);

// @desc    update user profile
// @route   Put /api/users/:id
// @access  Private

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) user.password = password;
      await user.save();
      res.status(200).json("User has been updated!");
    } else {
      res.status(400);
      throw new Error("User not found!");
    }
  }
);

// @desc    promote user to admin
// @route   Post /api/users/promote/:id
// @access  Admin

export const promoteAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = true;
      await user.save();
      res.status(200).json("User has been promoted to admin");
    } else {
      res.status(400);
      throw new Error("User not found!");
    }
  }
);

// @desc    delete user
// @route   Delete /api/users/:id
// @access  Admin

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.status(200).json("User has been deleted");
  } else {
    res.status(400);
    throw new Error("User not found!");
  }
});
