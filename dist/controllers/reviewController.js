"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const productModel_1 = __importDefault(require("../models/productModel"));
// @desc    Create review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { comment, rating } = req.body;
    const product = await productModel_1.default.findById(req.params.id);
    if (product) {
        const exist = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (exist) {
            res.status(400).json({ message: "You already reviewed this product" });
        }
        else {
            const review = {
                name: req.user.name,
                rating,
                comment,
                user: req.user._id,
            };
            product.reviews.push(review);
            await product.save();
            res.status(201).json(product.reviews);
        }
    }
    else {
        res.status(404).json({ message: "Product not found" });
    }
});
// @desc    Update review
// @route   PUT /api/products/:productId/reviews/:reviewId
// @access  Private
exports.updateReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const product = await productModel_1.default.findById(productId);
    if (product) {
        const review = product.reviews.id(reviewId);
        if (!review) {
            res.status(404).json({ message: "Review not found" });
        }
        else if (review.user.toString() !== userId.toString()) {
            res.status(403).json({ message: "User not authorized" });
        }
        else {
            review.rating = rating;
            review.comment = comment;
            await product.save();
            res.status(200).json({ message: "Review updated successfully" });
        }
    }
    else {
        res.status(404).json({ message: "Product not found" });
    }
});
// @desc    Delete review
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
exports.deleteReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;
    const product = await productModel_1.default.findById(productId);
    if (product) {
        const review = product.reviews.id(reviewId);
        if (!review) {
            res.status(404).json({ message: "Review not found" });
        }
        else if (review.user.toString() !== userId.toString()) {
            res.status(403).json({ message: "User not authorized" });
        }
        else {
            review.remove();
            await product.save();
            res.status(200).json({ message: "Review deleted successfully" });
        }
    }
    else {
        res.status(404).json({ message: "Product not found" });
    }
});
