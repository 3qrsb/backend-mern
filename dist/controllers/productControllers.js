"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopSellingProducts = exports.createReview = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProductSearch = exports.getProductList = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const productModel_1 = __importDefault(require("../models/productModel"));
// @desc    Fetch 12 products
// @route   GET /api/products
// @access  Public
exports.getProductList = (0, express_async_handler_1.default)(async (req, res) => {
    const products = await productModel_1.default.find({}).sort("-createdAt").limit(12);
    if (products) {
        res.status(200).json(products);
    }
    else {
        res.status(500);
        throw new Error("products not found!");
    }
});
// Utility function to ensure a query parameter is a string
const ensureString = (param) => {
    if (Array.isArray(param)) {
        return param[0];
    }
    return typeof param === 'string' ? param : '';
};
// Utility function to ensure query parameter is a number
const ensureNumber = (param, defaultValue) => {
    const num = Number(param);
    return isNaN(num) ? defaultValue : num;
};
// @desc   Fetch all products with pages for pagination category brand for filter and searchQuery for search
// @route   GET /api/products/search
// @access  Public
exports.getProductSearch = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = ensureNumber(req.query.pageSize, 9);
    const page = ensureNumber(req.query.page, 1);
    const category = ensureString(req.query.category);
    const brand = ensureString(req.query.brand);
    const searchQuery = ensureString(req.query.query);
    const sortOrder = ensureString(req.query.sortOrder);
    const minPrice = ensureNumber(req.query.minPrice, 0);
    const maxPrice = ensureNumber(req.query.maxPrice, Infinity);
    const queryFilter = searchQuery
        ? {
            name: {
                $regex: searchQuery,
                $options: "i",
            },
        }
        : {};
    const categoryFilter = category ? { category } : {};
    const brandFilter = brand ? { brand } : {};
    let sortFilter = {};
    if (sortOrder === "low") {
        sortFilter.price = 1;
    }
    else if (sortOrder === "high") {
        sortFilter.price = -1;
    }
    else if (sortOrder === "rating") {
        sortFilter = {}; // Will be replaced by the averageRating sort stage
    }
    else if (sortOrder === "latest") {
        sortFilter.createdAt = -1; // Sort by creation date, newest first
    }
    else {
        sortFilter.createdAt = 1; // Default sort by creation date, oldest first
    }
    const aggregationPipeline = [
        {
            $match: {
                ...queryFilter,
                ...categoryFilter,
                ...brandFilter,
                price: { $gte: minPrice, $lte: maxPrice }
            },
        },
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" },
            },
        },
    ];
    if (sortOrder === "rating") {
        aggregationPipeline.push({ $sort: { averageRating: -1 } });
    }
    else {
        aggregationPipeline.push({ $sort: sortFilter });
    }
    aggregationPipeline.push({ $skip: pageSize * (page - 1) }, { $limit: pageSize });
    const productDocs = await productModel_1.default.aggregate(aggregationPipeline);
    const countProducts = await productModel_1.default.countDocuments({
        ...queryFilter,
        ...categoryFilter,
        ...brandFilter,
    });
    const categories = await productModel_1.default.find({}).distinct("category");
    const brands = await productModel_1.default.find({}).distinct("brand");
    res.status(200).json({
        countProducts,
        productDocs,
        categories,
        brands,
        page,
        pages: Math.ceil(countProducts / pageSize),
    });
});
// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = (0, express_async_handler_1.default)(async (req, res) => {
    const product = await productModel_1.default.findById(req.params.id);
    if (product) {
        res.status(200).json(product);
    }
    else {
        res.status(400);
        throw new Error("product not found!");
    }
});
// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin or Private/Seller
exports.createProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, images, description, brand, category, price, qty } = req.body;
    try {
        const product = new productModel_1.default({
            name,
            images,
            description,
            brand,
            category,
            price,
            qty,
            user: req.user._id,
        });
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    }
    catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            res.status(400).json({ message: "Duplicate key error." });
        }
        else {
            res.status(500).json({ message: "Internal server error." });
        }
    }
});
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin or Private/Seller (only their own products)
exports.updateProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const product = await productModel_1.default.findById(req.params.id);
    if (product) {
        const user = req.user;
        // Check if the user is the owner or admin
        if (!product.user || product.user.equals(user._id) || user.isAdmin) {
            Object.assign(product, req.body);
            await product.save();
            res.status(200).json("Product has been updated");
        }
        else {
            res.status(403).json({ message: "Not authorized to update this product" });
        }
    }
    else {
        res.status(404).json({ message: "Product not found" });
    }
});
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin or Private/Seller (only their own products)
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const product = await productModel_1.default.findById(req.params.id);
    if (product) {
        const user = req.user;
        // Check if the user is the owner or admin
        if (!product.user || product.user.equals(user._id) || user.isAdmin) {
            await product.remove();
            res.status(200).json("Product has been deleted");
        }
        else {
            res.status(403).json({ message: "Not authorized to delete this product" });
        }
    }
    else {
        res.status(404).json({ message: "Product not found" });
    }
});
// @desc    Create review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { comment, rating } = req.body;
    const product = await productModel_1.default.findById(req.params.id);
    if (product) {
        const exist = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (exist) {
            res.status(400).json({ message: "You already reviewed on this product" });
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
        res.status(404);
        throw new Error("Product not found");
    }
});
// @desc    Fetch top selling products
// @route   GET /api/products/top-selling
// @access  Public
exports.getTopSellingProducts = (0, express_async_handler_1.default)(async (req, res) => {
    const products = await productModel_1.default.find().sort({ totalSales: -1 }).limit(5); // Fetch top 5 selling products
    if (products) {
        res.status(200).json(products);
    }
    else {
        res.status(500);
        throw new Error("products not found!");
    }
});
