import mongoose from 'mongoose';
import Product from '../models/productModel';

const updateProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mern');

    const adminUserId = new mongoose.Types.ObjectId('664b7ec8a62696a540024f7e');

    const result = await Product.updateMany(
      { user: { $exists: false } },
      { user: adminUserId }
    );

    console.log(`Products updated successfully: ${result.modifiedCount} documents modified.`);
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateProducts();