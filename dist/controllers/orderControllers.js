"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.deleteOrder = exports.getOrderById = exports.payOrder = exports.getUserOrder = exports.getOrderList = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
// @desc    get all orders
// @route   Get /api/orders
// @access  Admin
exports.getOrderList = (0, express_async_handler_1.default)(async (req, res) => {
    const orders = await orderModel_1.default.find({}).sort("-createdAt");
    if (orders) {
        res.status(200).json(orders);
    }
    else {
        res.status(400);
        throw new Error("orders not found!");
    }
});
// @desc    get user orders
// @route   Get /api/orders/orders-user
// @access  Private
exports.getUserOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const orders = await orderModel_1.default.find({ user: req.user._id });
    if (orders) {
        res.status(200).json(orders);
    }
    else {
        res.status(400);
        throw new Error("orders not found!");
    }
});
// @desc    Pay order
// @route   Put /api/orders/:id
// @access  Private
exports.payOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id);
    if (order) {
        order.isPaid = true;
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    }
    else {
        res.status(400);
        throw new Error("orders not found!");
    }
});
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id);
    if (order) {
        res.status(200).json(order);
    }
    else {
        res.status(400);
        throw new Error("order not found!");
    }
});
// @desc    delete user order
// @route   Delete /api/orders/:id
// @access  Private
exports.deleteOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await orderModel_1.default.findById(req.params.id);
    if (order) {
        await order.remove();
        res.status(200).json("order has been deleted");
    }
    else {
        res.status(400);
        throw new Error("orders not found!");
    }
});
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { cartItems, shippingAddress, totalPrice } = req.body;
    const order = new orderModel_1.default({
        cartItems,
        shippingAddress,
        totalPrice,
        user: req.user._id,
    });
    if (cartItems.length === 0) {
        res.status(400);
        throw new Error("No order items");
    }
    if (order) {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    }
    else {
        res.status(400);
        throw new Error("order not found!");
    }
});
