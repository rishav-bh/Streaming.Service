import multer from "multer";
import path from "path";
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import { StorageSettings } from "../utils/storageSettings.js"; // Assuming this exists for container settings

dotenv.config();
/*global process*/ 
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error(
    "Azure Storage Connection String is not defined in environment variables."
  );
}

// Initialize BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

// Multer setup for handling small file uploads
const storage = multer.memoryStorage(); // Store files in memory before upload to Azure

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png"  || ext === ".gif"  || ext === ".WebP" ) {


    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// Configure multer for file upload handling
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // Limit files to 15MB
});

// Upload multipart stream to Azure Blob Storage
const uploadMultiPartStreamToStorage = async (req, StorageSettings) => {
  if (!req.files || req.files.length === 0) {
    throw new Error("No files uploaded.");
  }

  const containerName =
    StorageSettings?.bannerContainer || "default-container";

  const uploadPromises = req.files.map(async (file) => {
    const containerClient =
      blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists(); // Ensure container exists

    const blockBlobClient = containerClient.getBlockBlobClient(
      file.originalname
    );

    try {
      await blockBlobClient.uploadData(file.buffer); // Uploading buffer directly
      return {
        name: file.originalname,
        url: blockBlobClient.url, // Returning the URL of the uploaded file
      };
    } catch (uploadError) {
      throw new Error(
        `Failed to upload ${file.originalname}: ${uploadError.message}`
      );
    }
  });

  const uploadedFiles = await Promise.all(uploadPromises); // Wait for all files to upload

  // Constructing the response object
  return {
    message: "Image(s) Uploaded Successfully",
    status: "Uploaded",
    uploadedFiles, // Include array of uploaded files with their URLs
  };
};


// Route handler
const uploadHandler = async (req, res) => {
  try {
    const uploadedFiles = await uploadMultiPartStreamToStorage(
      req,
      StorageSettings
    );
    res.json({ files: uploadedFiles }); // Return uploaded file info
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message); // Send error response
  }
};

// Export the upload middleware and the upload function
export const uploadSingleFile = upload.single("formFile");
export const uploadMultiFile = upload.array("formFile"); // For multi-part uploads
export { uploadMultiPartStreamToStorage, uploadHandler };
