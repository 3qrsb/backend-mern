import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { startOfMonth, endOfMonth } from "date-fns";
import User from "../models/userModel";

// @desc    Get all users
// @route   Get /api/users
// @access  Admin

export const getUsersList = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

// @desc    Get single user
// @route   Get /api/users/:id
// @access  Private

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404);
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

// @desc    Promote user to admin
// @route   POST /api/users/promote/admin/:id
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

// @desc    Promote user to seller
// @route   POST /api/users/promote/seller/:id
// @access  Admin
export const promoteSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Admin already has seller privileges");
      }
      user.isSeller = true;
      await user.save();
      res.status(200).json("User has been promoted to seller");
    } else {
      res.status(400);
      throw new Error("User not found!");
    }
  }
);

// @desc    Demote seller to regular user
// @route   POST /api/users/demote/seller/:id
// @access  Admin
export const demoteSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Admin cannot be demoted from seller");
      }
      user.isSeller = false;
      await user.save();
      res.status(200).json("User has been demoted from seller");
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

// @desc    Get new customers for the current month
// @route   GET /api/users/new-customers
// @access  Admin

export const getNewCustomersThisMonth = asyncHandler(
  async (req: Request, res: Response) => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const newCustomers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({ count: newCustomers });
  }
);
