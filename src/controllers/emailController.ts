import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import sanitizedConfig from '../config';

interface TokenPayload {
  [key: string]: any;
}

const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, sanitizedConfig.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  export const sendPaymentConfirmationEmail = async (email: string, orderId: string, paymentMethod: string, amount: number) => {
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
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  };

  export const sendVerificationEmail = async (user: any) => {
    const token = generateToken({ userId: user._id, email: user.email });
  
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };