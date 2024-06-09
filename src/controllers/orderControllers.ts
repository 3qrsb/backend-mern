import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/orderModel";
import Product from "../models/productModel";

// @desc    get all orders
// @route   Get /api/orders
// @access  Admin

export const getOrderList = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find({}).sort("-createdAt");

    if (orders) {
      res.status(200).json(orders);
    } else {
      res.status(400);
      throw new Error("orders not found!");
    }
  }
);

// @desc    get user orders
// @route   Get /api/orders/orders-user
// @access  Private

export const getUserOrder = asyncHandler(async (req: any, res: Response) => {
  const orders = await Order.find({ user: req.user._id });

  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(400);
    throw new Error("orders not found!");
  }
});

// @desc    Pay order
// @route   Put /api/orders/:id
// @access  Private

export const payOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(400);
    throw new Error("orders not found!");
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      res.status(200).json(order);
    } else {
      res.status(400);
      throw new Error("order not found!");
    }
  }
);

// @desc    delete user order
// @route   Delete /api/orders/:id
// @access  Private

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.remove();
    res.status(200).json("order has been deleted");
  } else {
    res.status(400);
    throw new Error("orders not found!");
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private

export const createOrder = asyncHandler(async (req: any, res: Response) => {
  const { cartItems, shippingAddress, totalPrice, discountAmount } = req.body;

  const order = new Order({
    cartItems,
    shippingAddress,
    totalPrice,
    discountAmount,
    user: req.user._id,
  });

  if (cartItems.length === 0) {
    res.status(400).json({ message: "No order items" });
    return;
  }

  if (order) {
    const newOrder = await order.save();

    // Log the cart items for debugging
    console.log("Cart Items: ", cartItems);

    // Update total sales for each product in the order
    await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await Product.findById(item._id); // Access the correct field for product ID
        if (product) {
          console.log(`Updating totalSales for product: ${product.name}`);
          product.totalSales += item.qty;
          await product.save().then(savedProduct => {
            console.log(`Product saved: ${savedProduct.name} with new totalSales: ${savedProduct.totalSales}`);
          }).catch(error => {
            console.error('Error saving product:', error);
          });
        } else {
          console.log(`Product not found: ${item._id}`);
        }
      })
    );

    res.status(201).json(newOrder);
  } else {
    res.status(400).json({ message: "Order not found!" });
  }
});