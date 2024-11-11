import mongoose from "mongoose";

/*global Schema*/
// KisanBytes Schema
const KisanBytesSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  thumbnail: {
        default: {
            url: { type: String },
            width: { type: Number },
            height: { type: Number },
        },
        medium: {
            url: { type: String },
            width: { type: Number },
            height: { type: Number },
        },
        high: {
            url: { type: String },
            width: { type: Number },
            height: { type: Number },
        },
    },
  contentType: { type: String },
  createdOn: { type: Date },
  contentProps: {
        owner: { type: String,  required: true },
        source: { type: String },
        contentId: { type: String },
        mediaUrl: { type: String },
        durationInSeconds: { type: Number },
        publishedAtSource: { type: String },
        contentTags: [{ type: Schema.Types.Mixed }],
        locale: {
            region: { type: String },
            country: { type: String },
            language: { type: String },
        },
  },
  isPublic: { type: Boolean },
  activityStats: {
        views: { type: Number },
        likes: { type: Number },
        dislikes: { type: Number },
  },
  sourceStats: {
        rating: { type: Number },
        subscribers: { type: Number },
        likes: { type: Number },
        views: { type: Number },
        tags: [{ type: Schema.Types.Mixed }],
        dislikes: { type: Number },
  },
  validations: {
        userid: { type: String },
        validatedOn: { type: String },
  },
  updatedAt: { type: String },
  isActive: { type: Boolean },
  isDeleted: { type: Boolean },
  isLiked: { type: Boolean },
});

// Export the model
export const KisanBytes = model("KisanBytes", KisanBytesSchema);
