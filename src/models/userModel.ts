import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface Address {
  country: string;
  state?: string;
  city: string;
  street: string;
  apartment?: string;
  postalCode: string;
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isVerified: boolean;
  isSeller: boolean;
  addresses: Address[];
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

const addressSchema = new Schema<Address>({
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isVerified: { type: Boolean, default: false },
    isSeller: { type: Boolean, required: true, default: false },
    addresses: [addressSchema],
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>("User", userSchema);
export default User;
