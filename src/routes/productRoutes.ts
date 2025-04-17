import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductList,
  getProductSearch,
  getTopSellingProducts,
  updateProduct,
} from "../controllers/productControllers";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { auth, adminOrSeller } from "../middleware/auth";

const router = express.Router();

router.route("/").get(getProductList).post(auth, adminOrSeller, createProduct);

router.route("/search").get(getProductSearch);
router.route("/top-selling").get(getTopSellingProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(auth, adminOrSeller, updateProduct)
  .delete(auth, adminOrSeller, deleteProduct);

router.route("/:id/reviews").get(getReviews).post(auth, createReview);

router
  .route("/:productId/reviews/:reviewId")
  .put(auth, updateReview)
  .delete(auth, deleteReview);

export default router;
