import mongoose from "mongoose";

const MediatypeSchema = new mongoose.Schema({
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, required: true },
});

export const Mediatype = model("Mediatype", MediatypeSchema);
