/* eslint-disable no-import-assign */
import { ObjectId } from 'mongodb';
import { dbInstance, connect } from '../database/db/dbConnection.js';
import { ErrorLogger } from '../utils/errorLogger.Utils.js';


// Fetch media reels (GetKisanReels)
export async function getKisanReels(pageNum, pageSize, userId) {
  try {
     dbInstance = await connect();
    const pipeline = [
      {
        $match: {
          isActive: true,
          isPublic: true,
          contentType: { $in: ["video", "audio", "image"] },
        },
      },
      {
        $lookup: {
          from: "media_activities",
          let: { mediaId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
            { $sort: { createdOn: -1 } },
            {
              $group: { _id: "$userId", latestDocument: { $first: "$$ROOT" } },
            },
            { $match: { "latestDocument.activityType": "CLAP" } },
            { $group: { _id: null, ids: { $push: "$latestDocument.userId" } } },
          ],
          as: "likedUserList",
        },
      },
      { $unwind: { path: "$likedUserList", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          likedUserList: { $ifNull: ["$likedUserList", []] },
          isLiked: {
            $cond: [
              {
                $in: [
                  new ObjectId(userId),
                  { $ifNull: ["$likedUserList.ids", []] },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
      {
        $addFields: {
          "activityStats.likes": {
            $size: { $ifNull: ["$likedUserList.ids", []] },
          },
        },
      },
      { $skip: (pageNum - 1) * pageSize },
      { $limit: pageSize },
      {
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          thumbnail: 1,
          contentType: 1,
          createdOn: 1,
          contentProps: 1,
          isPublic: 1,
          activityStats: 1,
          sourceStats: 1,
          validations: 1,
          isActive: 1,
          updatedAt: 1,
          totalLikes: 1,
          isDeleted: 1,
          isLiked: 1,
          likes: 1
        },
      },
    ];

    const data = await dbInstance
      .collection("media")
      .aggregate(pipeline)
      .toArray();
    return data;
  } catch (err) {
   ErrorLogger.error(
     "getKisanReels",
     `Failed to fetch kisan reels for userId: ${userId}`,
     err
   );
   throw err;
  }
}

// Insert KisanBytes activity (KisanBytesActivities)
export async function KisanBytesActivities(kisanBytesActivities) {
  try {
    const dbInstance = await connect();
    const newkisanBytesActivities = {
      ...kisanBytesActivities, // Spread the activityData parameter
      createdOn: new Date(),
      updatedOn: new Date(),
      isDeleted: false,
    };
    const result = await dbInstance
      .collection("media_activities")
      .insertOne(newkisanBytesActivities);
    
    return result.insertedId;
  } catch (err) {
    ErrorLogger.error(
      "KisanBytesActivities",
      "Failed to save kisan bytes activity",
      err
    );
    throw err;
  }
}

// Fetch comments by media ID (GetCommentsByMediaId)
export async function getCommentsByMediaId(
  mediaId,
  activityType,
  pageNum,
  pageSize
) {
  try {
    const dbInstance = await connect();

    // Convert mediaId to ObjectId safely
    let objectId;
    try {
      objectId = new ObjectId(mediaId);
    } catch (error) {
      throw new error("Invalid mediaId format");
    }

    const pipeline = [
      {
        $match: {
          mediaId: objectId,
          isDeleted: false,
          activityType,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $project: {
          _id: 1,
          id: "$_id",
          activityType: 1,
          mediaId: 1,
          userId: 1,
          comments: 1,
          createdOn: 1,
          updatedOn: 1,
          publisherName: {
            $concat: ["$userData.firstName", " ", "$userData.lastName"],
          },
          publisherImageUrl: "$userData.profilePic",
        },
      },
      { $skip: (pageNum - 1) * pageSize },
      { $limit: 10 },
    ];

    const comments = await dbInstance
      .collection("media_activities")
      .aggregate(pipeline)
      .toArray();

    return comments;
  } catch (err) {
   ErrorLogger.error(
     "getCommentsByMediaId",
     `Failed to fetch comments for mediaId: ${mediaId}`,
     err
   );
   throw err;
  }
}


// Fetch media by ID (MediabyId)
export async function mediaById(mediaId, userId) {
  try {
    const dbInstance = await connect();
    const pipeline = [
      {
        $match: {
          isActive: true,
          isPublic: true,
          contentType: { $in: ["video", "audio", "image"] },
          _id: new ObjectId(mediaId),
        },
      },
      {
        $lookup: {
          from: "media_activities",
          let: { mediaId: new ObjectId(mediaId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$mediaId", "$$mediaId"] },
                    { $eq: ["$activityType", "CLAP"] },
                    { $eq: ["$userId", new ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      {
        $addFields: {
          isLiked: { $cond: [{ $gt: [{ $size: "$likes" }, 0] }, true, false] },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          thumbnail: 1,
          contentType: 1,
          createdOn: 1,
          contentProps: 1,
          isPublic: 1,
          activityStats: 1,
          sourceStats: 1,
          validations: 1,
          isActive: 1,
          updatedAt: 1,
          likes: 1,
          isDeleted: 1,
          isLiked: 1,
        },
      },
    ];

    const media = await dbInstance
      .collection("media")
      .aggregate(pipeline)
      .toArray();
    return media[0];
  } catch (err) {
   ErrorLogger.error(
     "mediaById",
     `Failed to fetch media with ID: ${mediaId}`,
     err
   );
   throw err;
  }
}


