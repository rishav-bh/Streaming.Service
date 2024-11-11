import dotenv from "dotenv";
dotenv.config();

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { ErrorLogger } from "../utils/errorLogger.Utils.js"
import { getStartStopWatchForDebug } from "../utils/stopwatch.Utils.js"; // Import stopwatch utility

// Load environment variables
/*global process*/ 
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = process.env.AZURE_CONTAINER_NAME;

// Function to initialize BlobServiceClient
const initializeBlobServiceClient = () => {
  if (!AZURE_STORAGE_CONNECTION_STRING && (!accountName || !accountKey)) {
    throw new Error(
      "Missing AZURE_STORAGE_CONNECTION_STRING or accountName/accountKey for Azure Blob Storage."
    );
  }

  // Initialize BlobServiceClient from connection string or shared key credentials
  if (AZURE_STORAGE_CONNECTION_STRING) {
    return BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
  } else {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    return new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
  }
};

// Initialize the blob service client
const blobServiceClient = initializeBlobServiceClient();

console.log(
  "Blob service client initialized successfully:",
  !!blobServiceClient
);


// Get Container Client
 function getContainerClient(containerName) {
  if (!containerName) {
    throw new Error("Container name is not defined.");
  }
  
  
  return blobServiceClient.getContainerClient(containerName);
}


// Get Blob Client
const getBlobClient = (containerName, fileName) => {
  const containerClient = getContainerClient(containerName);
  return containerClient.getBlobClient(fileName);
};



// Download file from blob storage
const downloadFile = async (fileName, containerName) => {
  const stopWatch = getStartStopWatchForDebug();

  try {
    const blockBlobClient = getBlobClient(containerName, fileName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const buffer = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    );

    if (stopWatch) {
      console.log(`Download completed in ${stopWatch.elapsedTime()} ms`);
    }

    return buffer;
  } catch (error) {
    console.error("Error downloading file:", error.message);
    if (stopWatch) {
      console.log(`Error occurred in ${stopWatch.elapsedTime()} ms`);
    }
    throw error;
  }
};

// Upload file as base64 string
const uploadFile = async (
  fileBase64String,
  fileName,
  fileType,
  containerName
) => {
  const stopWatch = getStartStopWatchForDebug();
  const buffer = Buffer.from(fileBase64String, "base64");
  const fileItem = await uploadFileBuffer(
    buffer,
    fileName,
    fileType,
    containerName
  );

  if (stopWatch) {
    console.log(`Upload completed in ${stopWatch.elapsedTime()} ms`);
  }

  return fileItem;
};

// Upload file buffer
const uploadFileBuffer = async (buffer, fileName, fileType, containerName) => {
  const stopWatch = getStartStopWatchForDebug();

  try {
    const blockBlobClient = getBlobClient(containerName, fileName);

    if (fileType) {
      await blockBlobClient.setHTTPHeaders({ blobContentType: fileType });
    }

    await blockBlobClient.uploadData(buffer);

    if (stopWatch) {
      console.log(`Upload buffer completed in ${stopWatch.elapsedTime()} ms`);
    }

    return buildUploadFileResults(blockBlobClient);
  } catch (error) {
    console.error("Error uploading file:", error.message);
    if (stopWatch) {
      console.log(`Error occurred in ${stopWatch.elapsedTime()} ms`);
    }
    throw error;
  }
};

// Optimized upload file (stream)
async function optimizedUploadFile(buffer, fileName, mimeType, containerName) {
  const stopWatch = getStartStopWatchForDebug();
  try {
    ErrorLogger.info("ImageService", `Uploading file: ${fileName}`);
    const containerClient = getContainerClient(containerName);
    await containerClient.createIfNotExists(); // Ensure the container exists

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    // eslint-disable-next-line no-unused-vars
    const uploadResponse = await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    
    // console.log(`Blob URL: ${blockBlobClient.url}`); // Log the URL
    if (stopWatch) {
      console.log(`File upload completed in ${stopWatch.elapsedTime()} ms`);
    }
    ErrorLogger.info(
      "ImageService",
      `File uploaded successfully: ${blockBlobClient.url}`
    );
    return { Url: blockBlobClient.url }; // Return the URL of the uploaded blob
  } catch (error) {
     ErrorLogger.error("ImageService", "Error uploading file", error);
    if (stopWatch) {
      console.log(`Error occurred in ${stopWatch.elapsedTime()} ms`);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// Delete file from blob storage
const deleteFile = async (fileFullPath, containerName) => {
  const stopWatch = getStartStopWatchForDebug();

  try {
    const blockBlobClient = getBlobClient(containerName, fileFullPath);
    const response = await blockBlobClient.deleteIfExists();

    if (stopWatch) {
      console.log(`File deletion completed in ${stopWatch.elapsedTime()} ms`);
    }

    return response.succeeded;
  } catch (error) {
    console.error("Error deleting file:", error.message);
    if (stopWatch) {
      console.log(`Error occurred in ${stopWatch.elapsedTime()} ms`);
    }
    throw error;
  }
};

// Get base64 from blob
const getBase64FromBlob = async (fileFullPath, containerName) => {
  const stopWatch = getStartStopWatchForDebug();

  try {
    const blockBlobClient = getBlobClient(containerName, fileFullPath);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const buffer = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    );

    if (stopWatch) {
      console.log(
        `Base64 retrieval completed in ${stopWatch.elapsedTime()} ms`
      );
    }

    return buffer.toString("base64");
  } catch (error) {
    console.error("Error getting base64 from blob:", error.message);
    if (stopWatch) {
      console.log(`Error occurred in ${stopWatch.elapsedTime()} ms`);
    }
    throw error;
  }
};

// Helper: Build upload file results
const buildUploadFileResults = async (blockBlobClient) => {
  const properties = await blockBlobClient.getProperties();
  const blobUrl = blockBlobClient.url;
  return {
    ContentType: properties.contentType,
    Name: blockBlobClient.name,
    Url: blobUrl,
    SizeInMB: (properties.contentLength / (1024 * 1024)).toFixed(2),
    BlobUploadCostInSeconds: "N/A", // Stopwatch not implemented
  };
};

// Helper: Convert stream to buffer
const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      /*global Buffer*/ 
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
};

// Exporting all necessary functions
export {
  initializeBlobServiceClient,
  downloadFile,
  uploadFile,
  uploadFileBuffer,
  optimizedUploadFile,
  buildUploadFileResults,
  streamToBuffer,
  deleteFile,
  getBase64FromBlob,
  getContainerClient
};
