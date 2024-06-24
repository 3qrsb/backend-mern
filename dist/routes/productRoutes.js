"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productControllers_1 = require("../controllers/productControllers");
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/').get(productControllers_1.getProductList).post(auth_1.auth, auth_1.adminOrSeller, productControllers_1.createProduct);
router.route('/search').get(productControllers_1.getProductSearch);
router.route('/top-selling').get(productControllers_1.getTopSellingProducts);
router
    .route('/:id')
    .get(productControllers_1.getProductById)
    .put(auth_1.auth, auth_1.adminOrSeller, productControllers_1.updateProduct)
    .delete(auth_1.auth, auth_1.adminOrSeller, productControllers_1.deleteProduct);
router.route('/:id/reviews').post(auth_1.auth, reviewController_1.createReview);
router.route('/:productId/reviews/:reviewId').put(auth_1.auth, reviewController_1.updateReview).delete(auth_1.auth, reviewController_1.deleteReview);
exports.default = router;
