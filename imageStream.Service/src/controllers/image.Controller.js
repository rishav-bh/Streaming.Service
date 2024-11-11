import {
  initializeBlobServiceClient,
  optimizedUploadFile,
} from "../services/imageService.js";
import { ErrorLogger } from "../utils/errorLogger.Utils.js";
import { StorageSettings } from "../utils/storageSettings.js";
import { FileItem } from "../database/models/fileItem.models.js";
import { FileUploadResult } from "../database/models/fileUploadResult.models.js";
import { uploadMultiPartStreamToStorage } from "../middlewares/imageUploader.js";
import { toMB } from "../constants.js";

// Initialize Azure Blob Storage Service client
const storageSettings = StorageSettings;
initializeBlobServiceClient(storageSettings);

// POST: /api/image/upload-small-file
export const uploadSmallFile = async (req, res) => {
  const result = new FileUploadResult();
  result.uploadedFile = new FileItem();

  try {
    
    let formFile = req.file;
    if (formFile) {
      if (!formFile) {
        ErrorLogger.warn("UploadSmallFile", "No file found in request");
        throw new Error("No file found in the request");
      }

      const fileType = formFile.mimetype.split("/").pop();
      const fileName = `${Date.now()}-${fileType}`;

       ErrorLogger.info("UploadSmallFile", `Uploading file: ${fileName}`);

      // Upload file to Azure Blob Storage
      const uploadedFileItem = await optimizedUploadFile(
        formFile.buffer,
        fileName,
        formFile.mimetype,
        storageSettings.bannerContainer
      );

      const imageUrl = uploadedFileItem.Url;
      if (imageUrl) {
        result.uploadedFile.Url = imageUrl;
        result.message = "Image Uploaded Successfully";

        // Create the file item to be saved in MongoDB
        const savedFileItem = new FileItem({
          name: formFile.originalname,
          sizeInMB: (formFile.size / toMB).toFixed(2), // Size in MB
          contentType: formFile.mimetype,
          url: imageUrl,
          blobUploadCostInSeconds: "0", // Adjust as needed
        });

        // Logging the savedFileItem to check its state
        // console.log("File item to be saved:", savedFileItem);

        try {
          // Attempt to save to MongoDB
          const savedData = await savedFileItem.save(); // Save the file item to MongoDB
          result.uploadedFile = savedData;
          ErrorLogger.info(
            "UploadSmallFile",
            `File successfully saved to database: ${savedData._id}`
          );

          // Deinitialize the formFile after processing
          formFile.buffer = null; // Clear the file buffer
          formFile = null; // Optionally clear the entire file object

          return res.status(200).json(result);
        } catch (error) {
          // Handle validation errors
          if (error.name === "ValidationError") {
            ErrorLogger.error(
              "UploadSmallFile",
              "Validation error during save",
              error
            );
            result.message = "Validation error: " + error.message;
            result.message = "Validation error: " + error.message; // Specific validation error message
          } else {
            ErrorLogger.error("UploadSmallFile", "Error during save", error);
            result.message = "Error during save: " + error.message;
          }
          // Deinitialize the formFile if error occurs
          formFile.buffer = null;
          formFile = null;
          return res.status(500).json(result);
        }
      } else {
        ErrorLogger.error("UploadSmallFile", "Failed to upload file");
        result.message = "Failed to upload file";
        // Deinitialize the formFile if the upload fails
        formFile.buffer = null;
        formFile = null;
        return res.status(500).json(result);
      }
    } else {
      throw new Error("No file found in the request");
    }
  } catch (error) {
    ErrorLogger.error("UploadSmallFile", "Error during file upload", error);
    result.message = "Error during file upload: " + error.message;
    return res.status(500).json(result);
  }
};



// POST: /api/image/upload (multipart upload)
export const uploadImage = async (req, res) => {
  const result = new FileUploadResult();

  console.log(req.body); // Log the non-file fields
  console.log(req.files); // Log the uploaded files

  if (!req.files || req.files.length === 0) {
    result.message = "No files uploaded.";
    return res.status(400).json(result);
  }

  try {
    ErrorLogger.info("UploadLargeFile", "Starting large file upload process");
    const multiPartStream = await uploadMultiPartStreamToStorage(
      req,
      storageSettings
    );

    if (!multiPartStream || !multiPartStream.fileItem) {
      result.message = "Upload failed: No file item returned.";
      return res.status(500).json(result);
    }

    result.status = "SUCCESS";
    result.message = "Upload is successful";
    result.uploadedFile = multiPartStream.fileItem;

    return res.status(200).json(result);
  } catch (error) {
    ErrorLogger.error("UploadLargeFile", "Error during file upload", error);
    result.message = "Error during file upload: " + error.message;
    return res.status(500).json(result);
  }
};


