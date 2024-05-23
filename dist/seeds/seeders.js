"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const productModel_1 = __importDefault(require("../models/productModel"));
const products_1 = __importDefault(require("./products"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, db_1.default)();
const importData = async () => {
    try {
        await productModel_1.default.deleteMany();
        await productModel_1.default.insertMany(products_1.default);
        console.log('Data Imported!'.green.inverse);
        process.exit();
    }
    catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};
importData();
