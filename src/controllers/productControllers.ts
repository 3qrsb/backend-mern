import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/productModel";
import { PipelineStage } from "mongoose";

// @desc    Fetch 12 products
// @route   GET /api/products
// @access  Public
export const getProductList = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find({}).sort("-createdAt").limit(12);

    if (products) {
      res.status(200).json(products);
    } else {
      res.status(500);
      throw new Error("products not found!");
    }
  }
);

const ensureString = (param: any): string => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return typeof param === "string" ? param : "";
};

const ensureNumber = (param: any, defaultValue: number): number => {
  const num = Number(param);
  return isNaN(num) ? defaultValue : num;
};

// @desc   Fetch all products with pages for pagination category brand for filter and searchQuery for search
// @route   GET /api/products/search
// @access  Public

export const getProductSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const pageSize = ensureNumber(req.query.pageSize, 9);
    const page = ensureNumber(req.query.page, 1);
    const category = ensureString(req.query.category);
    const brand = ensureString(req.query.brand);
    const searchQuery = ensureString(req.query.query);
    const sortOrder = ensureString(req.query.sortOrder);
    const minPrice = ensureNumber(req.query.minPrice, 0);
    const maxPrice = ensureNumber(req.query.maxPrice, Infinity);

    const queryFilter: Record<string, any> = searchQuery
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};
    const categoryFilter: Record<string, any> = category ? { category } : {};
    const brandFilter: Record<string, any> = brand ? { brand } : {};

    let sortFilter: Record<string, 1 | -1> = {};
    if (sortOrder === "low") {
      sortFilter.price = 1;
    } else if (sortOrder === "high") {
      sortFilter.price = -1;
    } else if (sortOrder === "rating") {
      sortFilter = {};
    } else if (sortOrder === "latest") {
      sortFilter.createdAt = -1;
    } else {
      sortFilter.createdAt = 1;
    }

    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          ...queryFilter,
          ...categoryFilter,
          ...brandFilter,
          price: { $gte: minPrice, $lte: maxPrice },
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: 1,
          images: 1,
          price: 1,
          brand: 1,
          category: 1,
          description: 1,
          qty: 1,
          availableQty: 1,
          reviews: 1,
          totalSales: 1,
          inStock: 1,
          createdAt: 1,
          updatedAt: 1,
          averageRating: 1,
          "user.name": 1,
          "user.isAdmin": 1,
          "user.isSeller": 1,
        },
      },
    ];

    if (sortOrder === "rating") {
      aggregationPipeline.push({ $sort: { averageRating: -1 } });
    } else {
      aggregationPipeline.push({ $sort: sortFilter });
    }

    aggregationPipeline.push(
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize }
    );

    const productDocs = await Product.aggregate(aggregationPipeline);
    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter,
    });

    const categories = await Product.find({}).distinct("category");
    const brands = await Product.find({}).distinct("brand");

    res.status(200).json({
      countProducts,
      productDocs,
      categories,
      brands,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  }
);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(400);
      throw new Error("product not found!");
    }
  }
);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin or Private/Seller

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, images, description, brand, category, price, qty, inStock } =
      req.body;

    try {
      const product = new Product({
        name,
        images,
        description,
        brand,
        category,
        price,
        qty,
        inStock,
        user: (req as any).user._id,
      });

      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Duplicate key error." });
      } else {
        res.status(500).json({ message: "Internal server error." });
      }
    }
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin or Private/Seller (only their own products)

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      const user = (req as any).user;

      if (!product.user || product.user.equals(user._id) || user.isAdmin) {
        Object.assign(product, req.body);
        await product.save();
        res.status(200).json("Product has been updated");
      } else {
        res
          .status(403)
          .json({ message: "Not authorized to update this product" });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin or Private/Seller (only their own products)

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      const user = (req as any).user;

      if (!product.user || product.user.equals(user._id) || user.isAdmin) {
        await product.remove();
        res.status(200).json("Product has been deleted");
      } else {
        res
          .status(403)
          .json({ message: "Not authorized to delete this product" });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
);

// @desc    Fetch top selling products
// @route   GET /api/products/top-selling
// @access  Public
export const getTopSellingProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find().sort({ totalSales: -1 }).limit(5); // Fetch top 5 selling products

    if (products) {
      res.status(200).json(products);
    } else {
      res.status(500);
      throw new Error("products not found!");
    }
  }
);
