import mongoose from 'mongoose';


const fileUploadResultSchema = new mongoose.Schema({
  uploadedFile: {
    type: mongoose.Schema.Types.ObjectId,    // Reference the FileItem schema
    ref:  'FileItem',
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "Uploaded",
  },
});

export const FileUploadResult = mongoose.model(
  "FileUploadResult",
  fileUploadResultSchema
);
