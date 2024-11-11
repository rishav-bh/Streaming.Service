import mongoose from 'mongoose';


const fileItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  sizeInMB: {
    type: Number,
    required: true, 
  },
  contentType: {
    type: String,
    required: true, 
  },
  url: {
    type: String,
    required: true, 
  },
  blobUploadCostInSeconds: {
    type: Number,
    required: true, 
  },
  message: {
    type: String,
    default: "", // Default value
  },
  status: {
    type: String,
    default: "", // Default value
  },
});

export const  FileItem = mongoose.model('FileItem', fileItemSchema);










