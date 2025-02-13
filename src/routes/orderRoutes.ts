import express from "express";
import {
  deleteOrder,
  getOrderById,
  getOrderList,
  getUserOrder,
  payOrder,
} from "../controllers/orderControllers";
import { auth, admin } from "../middleware/auth";

const router = express.Router();

router.route("/").get(auth, admin, getOrderList);
router.route("/orders-user").get(auth, getUserOrder);
router
  .route("/:id")
  .get(auth, getOrderById)
  .delete(auth, deleteOrder)
  .put(auth, payOrder);

export default router;
