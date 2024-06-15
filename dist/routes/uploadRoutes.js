"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const parser_1 = __importDefault(require("datauri/parser"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const router = express_1.default.Router();
const parser = new parser_1.default();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const uploadImageToCloudinary = async (fileBuffer, fileName) => {
    const extName = path_1.default.extname(fileName).toString();
    const dataUri = parser.format(extName, fileBuffer);
    if (!dataUri.content) {
        throw new Error('Invalid file format');
    }
    return cloudinary_1.default.uploader.upload(dataUri.content, {
        folder: 'product_images',
        resource_type: 'image',
    });
};
router.post('/image', upload.array('images', 4), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ error: 'No files uploaded' });
        }
        const files = req.files;
        const uploadPromises = files.map(file => uploadImageToCloudinary(file.buffer, file.originalname));
        const results = await Promise.all(uploadPromises);
        const urls = results.map(result => result.secure_url);
        res.send({ urls });
    }
    catch (error) {
        console.error('Image upload failed:', error); // Log the error for debugging
        res.status(500).send({ error: 'Image upload failed', message: error.message });
    }
});
exports.default = router;
