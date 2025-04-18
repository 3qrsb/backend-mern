import express, { Application } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDb from "./config/db";
import sanitizedConfig from "./config";
import { errorHandler, notFound } from "./middleware/errorMiddleware";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import { verifyEmail } from "./controllers/verifyController";
import {
  forgotPassword,
  resetPassword,
} from "./controllers/resetPasswordController";

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

connectDb();

const app: Application = express();

if (sanitizedConfig.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl.endsWith("/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.post("/api/forgot-password", forgotPassword);
app.post("/api/reset-password", resetPassword);
app.get("/api/verify/verify-email", verifyEmail);
app.use("/api/stripe", stripeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
