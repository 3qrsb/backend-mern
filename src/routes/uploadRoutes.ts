import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import DataUriParser from "datauri/parser";
import cloudinary from "../config/cloudinary";

const router = express.Router();
const parser = new DataUriParser();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
) => {
  const extName = path.extname(fileName).toString();
  const dataUri = parser.format(extName, fileBuffer);
  if (!dataUri.content) {
    throw new Error("Invalid file format");
  }
  return cloudinary.uploader.upload(dataUri.content, {
    folder: "product_images",
    resource_type: "image",
  });
};

router.post(
  "/image",
  upload.array("images", 4),
  async (req: Request, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send({ error: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file) =>
        uploadImageToCloudinary(file.buffer, file.originalname)
      );
      const results = await Promise.all(uploadPromises);

      const urls = results.map((result) => result.secure_url);
      res.send({ urls });
    } catch (error: any) {
      console.error("Image upload failed:", error); // Log the error for debugging
      res
        .status(500)
        .send({ error: "Image upload failed", message: error.message });
    }
  }
);

export default router;
