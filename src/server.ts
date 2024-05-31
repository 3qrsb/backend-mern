import express, { Application } from 'express';
import connectDb from './config/db';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import uploadRoutes from './routes/uploadRoutes';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import cors from 'cors';
import path from 'path';
import sanitizedConfig from './config';
import stripeRoutes from './routes/stripeRoutes';
import { verifyEmail } from './controllers/verifyController';

dotenv.config({
  path: path.resolve(__dirname, '/.env'),
});

connectDb();

const app = express();

if (sanitizedConfig.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl.endsWith('/webhook')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get('/api/verify/verify-email', verifyEmail);
app.use('/api/stripe', stripeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), '/uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
