import { Router } from "express";
import { uploadSingleFile } from "../middlewares/imageUploader.js";
import { uploadMultiFile } from "../middlewares/imageUploader.js"
import { uploadSmallFile } from "../controllers/image.Controller.js";
import { uploadImage } from "../controllers/image.Controller.js";
import { uploadHandler } from "../middlewares/imageUploader.js";

const router = Router();
// Route to upload  a small single file
router.route("/upload-small-file").post(uploadSingleFile, uploadSmallFile);
// Route to upload image 
router.route("/upload").post(uploadMultiFile, uploadHandler, uploadImage);

export default router;
