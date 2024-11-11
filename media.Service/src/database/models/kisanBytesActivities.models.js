import mongoose from "mongoose";

// KisanBytesActivities Schema
const KisanBytesActivitiesSchema = new mongoose.Schema({
    activityType: { type: String, required: true },
    mediaId: { type: String, required: true }, //Media ID as String or ObjectID
    userId: { type: String, requeired: true, unique: true }, //User ID as String or ObejctId
    comments: { type: String },
    createdOn: { type: Date, default: Date.now },
    updateOn: { type: Date, default: Date.now },
    isDeleted: {
        type: Boolean, default: false
    },
    publisherName: { type: String, required: true },
    publisherImageUrl: { type: String },
}, { timestamps: true });

export const KisanBytesActivities = model("KisanBytesActivities", KisanBytesActivitiesSchema);