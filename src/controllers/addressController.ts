import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";

function hasAddressPermission(req: any, userId: string) {
  return req.user._id.toString() === userId || req.user.isAdmin;
}

/**
 * Get all addresses for a user
 * @route GET /api/users/:userId/addresses
 * @access Private (Must be user or admin)
 */
export const getUserAddresses = asyncHandler(
  async (req: any, res: Response) => {
    const { userId } = req.params;

    if (!hasAddressPermission(req, userId)) {
      res.status(403);
      throw new Error("Not authorized to view these addresses.");
    }

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user.addresses || []);
  }
);

/**
 * Add a new address
 * @route POST /api/users/:userId/addresses
 * @access Private (Must be user or admin)
 */
export const addUserAddress = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;

  const { street, apartment, city, state, country, postalCode } = req.body;

  if (!hasAddressPermission(req, userId)) {
    res.status(403);
    throw new Error("Not authorized to add address for this user.");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.addresses.push({
    street,
    apartment,
    city,
    state,
    country,
    postalCode,
  });

  await user.save();
  res.status(201).json(user.addresses);
});

/**
 * Update an existing address
 * @route PUT /api/users/:userId/addresses/:addressId
 * @access Private (Must be user or admin)
 */
export const updateUserAddress = asyncHandler(
  async (req: any, res: Response) => {
    const { userId, addressId } = req.params;

    const { street, apartment, city, state, country, postalCode } = req.body;

    if (!hasAddressPermission(req, userId)) {
      res.status(403);
      throw new Error("Not authorized to update address for this user.");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const subdoc = user.addresses.find(
      (addr: any) => addr._id.toString() === addressId
    );
    if (!subdoc) {
      res.status(404);
      throw new Error("Address not found.");
    }

    if (street !== undefined) subdoc.street = street;
    if (apartment !== undefined) subdoc.apartment = apartment;
    if (city !== undefined) subdoc.city = city;
    if (state !== undefined) subdoc.state = state;
    if (country !== undefined) subdoc.country = country;
    if (postalCode !== undefined) subdoc.postalCode = postalCode;

    await user.save();
    res.json(user.addresses);
  }
);

/**
 * Delete an address
 * @route DELETE /api/users/:userId/addresses/:addressId
 * @access Private (Must be user or admin)
 */
export const deleteUserAddress = asyncHandler(
  async (req: any, res: Response) => {
    const { userId, addressId } = req.params;

    if (!hasAddressPermission(req, userId)) {
      res.status(403);
      throw new Error("Not authorized to delete address for this user.");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    if (user.addresses.length === initialLength) {
      // Means we didn't remove anything, addressId wasn't found
      res.status(404);
      throw new Error("Address not found.");
    }

    await user.save();
    res.json(user.addresses);
  }
);
