"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const resetUrl = `http://localhost:3000/reset-password/${token}`;
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            html: `
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; font-size: 16px; line-height: 1.5;">
            <h2 style="color: #333; text-align: center;">Password Reset</h2>
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p><a href="${resetUrl}" style="text-decoration: none;">
              <button style="background-color: #007bff; border: none; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">
                Reset Password
              </button>
            </a></p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>Alternatively, you can copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
          </div>
        `,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent' });
    }
    catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await userModel_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            console.error('Invalid or expired token');
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        console.log('Password reset successfully for user:', user.email);
        res.status(200).json({ message: 'Password has been reset' });
    }
    catch (err) {
        console.error('Error in resetPassword:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
