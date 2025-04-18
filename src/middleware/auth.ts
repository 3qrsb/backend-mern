import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { NextFunction, Response, Request } from "express";
import User from "../models/userModel";
import {
  DataStoredInToken,
  RequestWithUser,
} from "../utils/interfaces/user.interface";
import config from "../config";

export const auth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as DataStoredInToken;

      if (decoded.type !== "access") {
        res.status(401);
        throw new Error("Not authorized, invalid token type");
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      (req as RequestWithUser).user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
);

export const admin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (user?.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized, admin only");
    }
  }
);

export const adminOrSeller = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    if (user?.isAdmin || user?.isSeller) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized, admin or seller only");
    }
  }
);
