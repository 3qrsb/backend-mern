import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import DataUriParser from 'datauri/parser';
import cloudinary from '../config/cloudinary';

const router = express.Router();
const parser = new DataUriParser();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = async (fileBuffer: Buffer, fileName: string) => {
  const dataUri = parser.format(path.extname(fileName).toString(), fileBuffer);
  if (!dataUri.content) {
    throw new Error('Invalid file format');
  }
  return cloudinary.uploader.upload(dataUri.content, {
    folder: 'product_images',
  });
};

router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const result = await uploadImageToCloudinary(req.file.buffer, req.file.originalname);
    res.send({ url: result.secure_url });
  } catch (error) {
    res.status(500).send({ error: 'Image upload failed' });
  }
});

export default router;