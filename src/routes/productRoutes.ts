import express from 'express';
import {
  createProduct,
  createReview,
  deleteProduct,
  getProductById,
  getProductList,
  getProductSearch,
  getTopSellingProducts,
  updateProduct,
} from '../controllers/productControllers';
import { admin, auth, adminOrSeller } from '../middleware/auth';
const router = express.Router();

router.route('/').get(getProductList).post(auth, adminOrSeller, createProduct);
router.route('/:id/reviews').post(auth, createReview);
router.route('/search').get(getProductSearch);
router.route('/top-selling').get(getTopSellingProducts);
router
  .route('/:id')
  .get(getProductById)
  .put(auth, adminOrSeller, updateProduct)
  .delete(auth, adminOrSeller, deleteProduct);

export default router;
