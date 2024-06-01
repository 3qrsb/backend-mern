"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPaymentConfirmationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, {
        expiresIn: '30d',
    });
};
exports.default = generateToken;
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendPaymentConfirmationEmail = async (email, orderId, paymentMethod, amount) => {
    const paymentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Almaty' });
    const formattedPaymentMethod = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Payment Confirmation',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Payment Confirmation</h2>
        <p>Dear Customer,</p>
        <p>Thank you for your payment. Your order has been successfully processed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Payment Date:</strong> ${paymentDate}</p>
        <p><strong>Payment Method:</strong> ${formattedPaymentMethod}</p>
        <p><strong>Total Amount Paid:</strong> $${amount.toFixed(2)}</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,</p>
        <p>Our Team</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="http://localhost:3000/" style="padding: 10px 20px; color: white; background-color: #4CAF50; border-radius: 5px; text-decoration: none;">Visit Our Website</a>
        </div>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent successfully');
    }
    catch (error) {
        console.error('Error sending payment confirmation email:', error);
    }
};
exports.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;
const sendVerificationEmail = async (user) => {
    const token = generateToken({ userId: user._id, email: user.email });
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Email Verification',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="font-size: 16px; color: #555;">
            Hi ${user.name},
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for registering. Please verify your email by clicking the button below:
          </p>
          <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">
            If the button above doesn't work, please copy and paste the following link into your web browser:
          </p>
          <p style="font-size: 16px; color: #007bff; word-break: break-all;">${verificationLink}</p>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">
            If you did not register for this account, please ignore this email.
          </p>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">
            Thanks,
            <br>
            Our Team
          </p>
        </div>
      `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    }
    catch (error) {
        console.error('Error sending verification email:', error);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
