"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productModel_1 = __importDefault(require("../models/productModel"));
const updateProducts = async () => {
    try {
        await mongoose_1.default.connect('mongodb://localhost:27017/mern');
        const adminUserId = new mongoose_1.default.Types.ObjectId('664b7ec8a62696a540024f7e');
        const result = await productModel_1.default.updateMany({ user: { $exists: false } }, { user: adminUserId });
        console.log(`Products updated successfully: ${result.modifiedCount} documents modified.`);
    }
    catch (error) {
        console.error('Error updating products:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
updateProducts();
