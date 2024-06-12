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
    const dataUri = parser.format(path_1.default.extname(fileName).toString(), fileBuffer);
    if (!dataUri.content) {
        throw new Error('Invalid file format');
    }
    return cloudinary_1.default.uploader.upload(dataUri.content, {
        folder: 'product_images',
    });
};
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }
        const result = await uploadImageToCloudinary(req.file.buffer, req.file.originalname);
        res.send({ url: result.secure_url });
    }
    catch (error) {
        res.status(500).send({ error: 'Image upload failed' });
    }
});
exports.default = router;
