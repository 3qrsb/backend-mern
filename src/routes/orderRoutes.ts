import express from 'express';
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrderList,
  getUserOrder,
  payOrder,
} from '../controllers/orderControllers';
import {
} from '../controllers/stripeController';
import { admin, auth } from '../middleware/auth';

const router = express.Router();

router.route('/').get(auth, admin, getOrderList).post(auth, createOrder);
router.route('/orders-user').get(auth, getUserOrder);
router
  .route('/:id')
  .get(auth, getOrderById)
  .delete(auth, deleteOrder)
  .put(auth, payOrder);

export default router;