import express from "express";
import {
  register,
  login,
  googleLogin,
  refreshToken,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/refresh-token", refreshToken);

export default router;
