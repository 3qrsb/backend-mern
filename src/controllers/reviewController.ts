import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/productModel";

// @desc    Create review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { comment, rating } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const exist = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (exist) {
        res.status(400).json({ message: "You already reviewed this product" });
      } else {
        const review = {
          name: req.user.name as string,
          rating,
          comment,
          user: req.user._id,
        };

        product.reviews.push(review);

        await product.save();

        res.status(201).json(product.reviews);
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
);

// @desc    Update review
// @route   PUT /api/products/:productId/reviews/:reviewId
// @access  Private
export const updateReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (product) {
      const review = product.reviews.id(reviewId);

      if (!review) {
        res.status(404).json({ message: "Review not found" });
      } else if (review.user.toString() !== userId.toString()) {
        res.status(403).json({ message: "User not authorized" });
      } else {
        review.rating = rating;
        review.comment = comment;
        await product.save();
        res.status(200).json({ message: "Review updated successfully" });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
);

// @desc    Delete review
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (product) {
      const review = product.reviews.id(reviewId);

      if (!review) {
        res.status(404).json({ message: "Review not found" });
      } else if (review.user.toString() !== userId.toString()) {
        res.status(403).json({ message: "User not authorized" });
      } else {
        review.remove();
        await product.save();
        res.status(200).json({ message: "Review deleted successfully" });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
);
