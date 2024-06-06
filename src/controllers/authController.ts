import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
  
      const resetUrl = `http://localhost:3000/reset-password/${token}`;
  
      const transporter = nodemailer.createTransport({
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
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               ${resetUrl}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
      console.error('Error in forgotPassword:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    try {
      const user = await User.findOne({
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
    } catch (err) {
      console.error('Error in resetPassword:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };