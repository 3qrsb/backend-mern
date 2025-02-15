import { Schema, model, Types, Document } from "mongoose";

export interface CartItems {
  name: string;
  qty: number;
  image: string;
  price: number;
  _id: Types.ObjectId;
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  cartItems: CartItems[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  isPaid: boolean;
  discountAmount: number;
  status: string;
}

const cartItemSchema = new Schema<CartItems>({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  _id: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
});

const shippingAddressSchema = new Schema<ShippingAddress>({
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    cartItems: [cartItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, default: "pending" },
  },
  { timestamps: true }
);

const Order = model<IOrder>("Order", orderSchema);
export default Order;
