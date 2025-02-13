import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel";

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrderList = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find({}).sort("-createdAt");
    if (orders) {
      res.status(200).json(orders);
    } else {
      res.status(400);
      throw new Error("Orders not found!");
    }
  }
);

// @desc    Get user orders (Private)
// @route   GET /api/orders/orders-user
// @access  Private
export const getUserOrder = asyncHandler(async (req: any, res: Response) => {
  const orders = await Order.find({ user: req.user._id });
  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(400);
    throw new Error("Orders not found!");
  }
});

// @desc    Pay order manually (Private)
// @route   PUT /api/orders/:id
// @access  Private
export const payOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.status = "paid";
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(400);
    throw new Error("Order not found!");
  }
});

// @desc    Get order by ID (Private)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(400);
      throw new Error("Order not found!");
    }
  }
);

// @desc    Delete user order (Private)
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    await order.remove();
    res.status(200).json("Order has been deleted");
  } else {
    res.status(400);
    throw new Error("Order not found!");
  }
});
