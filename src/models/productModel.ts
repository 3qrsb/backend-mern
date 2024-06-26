import mongoose, { Schema, model, Types, Document } from "mongoose";

type Review = {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
};

interface IReview extends Review, Document {}

interface IProduct extends Document {
  name: string;
  images: string[];
  price: number;
  category: string;
  brand: string;
  description: string;
  qty?: number;
  reviews: Types.DocumentArray<IReview>;
  totalSales: number;
  user: Types.ObjectId;
  inStock: boolean; 
}

const reviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    qty: Number,
    reviews: [reviewSchema],
    totalSales: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", productSchema);

export default Product;