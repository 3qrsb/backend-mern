"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.promoteAdmin = exports.updateUserProfile = exports.getUserBydId = exports.getUsersList = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const emailController_1 = require("./emailController");
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.register = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    if (!email ||
        !email.includes("@") ||
        !name ||
        name.trim() === "" ||
        !password ||
        password.trim() === "") {
        res.status(422).json({ message: "Invalid input." });
        return;
    }
    const exist = await userModel_1.default.findOne({ email });
    if (exist) {
        res.status(422).json({ message: "email already been used!" });
        return;
    }
    const user = new userModel_1.default({
        name,
        email,
        password,
        isVerified: false, // Set to false initially
    });
    if (user) {
        const newUser = await user.save();
        await (0, emailController_1.sendVerificationEmail)(newUser); // Send verification email
        res.status(201).json(newUser);
    }
    else {
        res.status(500);
        throw new Error("User not found!");
    }
});
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.includes("@") || !password || password.trim() === "") {
        res.status(422).json({ message: "Invalid input." });
        return;
    }
    const user = await userModel_1.default.findOne({ email });
    if (user) {
        if (!user.isVerified) {
            res.status(401).json({ message: "Email not verified. Please verify your email." });
            return;
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (match) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    }
    else {
        res.status(404).json({ message: "User not found." });
    }
});
// @desc    Get all users
// @route   Get /api/users
// @access  Admin
exports.getUsersList = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = 10;
    const page = req.query.page || 1;
    const query = req.query.query || "";
    const queryFilter = query && query !== "all"
        ? {
            username: {
                $regex: query,
                $options: "i",
            },
        }
        : {};
    const users = await userModel_1.default.find({
        ...queryFilter,
    })
        .skip(pageSize * (page - 1))
        .sort("-createdAt")
        .limit(pageSize)
        .lean();
    const countUsers = await userModel_1.default.countDocuments({
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
    }
    else {
        res.status(500);
        throw new Error("Users not found!");
    }
});
// @desc    Get single user
// @route   Get /api/users/:id
// @access  Private
exports.getUserBydId = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.params.id);
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.status(400);
        throw new Error("user not found!");
    }
});
// @desc    update user profile
// @route   Put /api/users/:id
// @access  Private
exports.updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await userModel_1.default.findById(req.params.id);
    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (password)
            user.password = password;
        await user.save();
        res.status(200).json("User has been updated!");
    }
    else {
        res.status(400);
        throw new Error("User not found!");
    }
});
// @desc    promote user to admin
// @route   Post /api/users/promote/:id
// @access  Admin
exports.promoteAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.params.id);
    if (user) {
        user.isAdmin = true;
        await user.save();
        res.status(200).json("User has been promoted to admin");
    }
    else {
        res.status(400);
        throw new Error("User not found!");
    }
});
// @desc    delete user
// @route   Delete /api/users/:id
// @access  Admin
exports.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.params.id);
    if (user) {
        await user.remove();
        res.status(200).json("User has been deleted");
    }
    else {
        res.status(400);
        throw new Error("User not found!");
    }
});
