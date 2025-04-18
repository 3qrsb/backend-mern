import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import expressJson from "express";
import {
  forgotPassword,
  resetPassword,
} from "./controllers/resetPasswordController";
import { verifyEmail } from "./controllers/verifyController";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import sanitizedConfig from "./config";

const app: Application = express();

if (sanitizedConfig.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl.endsWith("/webhook")) next();
  else expressJson.json()(req, res, next);
});

app.post("/api/forgot-password", forgotPassword);
app.post("/api/reset-password", resetPassword);
app.get("/api/verify/verify-email", verifyEmail);
app.use("/api/stripe", stripeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
