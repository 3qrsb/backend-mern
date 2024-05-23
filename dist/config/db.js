"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const connectDb = async () => {
    try {
        const connection = await mongoose_1.default.connect(config_1.default.MONGO_URI);
        console.log(`🟢 Mongo db connected:`, connection.connection.host);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
exports.default = connectDb;
