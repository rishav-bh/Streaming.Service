import { FileItem } from "./fileItem.models.js"; // Adjust the path as needed

const MultiPartStream = async (
  contentType,
  name,
  fileName,
  sizeInMB,
  blobUploadCostInSeconds,
  message = "",
  status = ""
) => {
  // Create a new instance of the FileItem model
  const fileItem = new FileItem({
    name: fileName,
    sizeInMB: sizeInMB,
    contentType: contentType,
    url: "", // You can set the URL once the file is uploaded
    blobUploadCostInSeconds: blobUploadCostInSeconds,
    message: message,
    status: status,
  });

  try {
    // Save the file item to the database
    const savedFileItem = await fileItem.save();

    return {
      contentType,
      name,
      fileName,
      fileItem: savedFileItem, // Returning the saved FileItem
    };
  } catch (error) {
    console.error("Error saving file item:", error);
    throw error;
  }
};


export { MultiPartStream };
