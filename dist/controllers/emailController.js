"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentConfirmationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
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
