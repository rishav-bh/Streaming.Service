import { error1 } from "../constants.js";
import { ErrorLogger } from "../utils/errorLogger.Utils.js";
import { getKisanReels } from "../service/mediaService.Controller.js";
import { mediaById } from "../service/mediaService.Controller.js";
import { KisanBytesActivities } from "../service/mediaService.Controller.js";
import { getCommentsByMediaId } from "../service/mediaService.Controller.js";



export async function kisanBytes(req, res) {
  const { pageNum = 1, pageSize = 10 } = req.query;
  const userId = req.headers["userId"];

  try {
    ErrorLogger.info(
      "KisanBytes",
      `Fetching kisan bytes for userId: ${userId}, page: ${pageNum}, pageSize: ${pageSize}`
    );
    const kisanBytes = await getKisanReels(pageNum, pageSize, userId);
    ErrorLogger.info(
      "KisanBytes",
      `Successfully retrieved ${kisanBytes.length} kisan bytes`
    );
    res.json(kisanBytes);
  } catch (error) {
    ErrorLogger.error("KisanBytes", "Failed to fetch kisan bytes", error);
    res.status(error1).json({ error: error.message });
  }
};

export async function getMediaById(req, res) {
  const { mediaId } = req.query;
  const userId = req.headers["userId"];

  try {
    ErrorLogger.info(
      "MediaById",
      `Fetching media for mediaId: ${mediaId}, userId: ${userId}`
    );
    const getMediaById = await mediaById(mediaId, userId);
    ErrorLogger.info(
      "MediaById",
      `Successfully retrieved media with ID: ${mediaId}`
    );
    res.json(getMediaById);
  } catch (error) {
    ErrorLogger.error(
      "MediaById",
      `Failed to fetch media with ID: ${mediaId}`,
      error
    );
    res.status(error1).json({ error: error.message });
  }
};

export async function kisanBytesActivities(req, res) {
  const kisanBytesActivities = req.body;

  try {
    ErrorLogger.info("KisanBytesActivities", "Saving new kisan bytes activity");
    const result = await KisanBytesActivities(kisanBytesActivities);
    const status = {
      result: result ? "Success" : "Failed",
      message: result ? "Activity saved successfully" : "Activity save failed",
    };
    ErrorLogger.info(
      "KisanBytesActivities",
      `Activity saved with status: ${status.result}`
    );
    res.json(status);
  } catch (error) {
    ErrorLogger.error(
      "KisanBytesActivities",
      "Failed to save kisan bytes activity",
      error
    );
    res.status(error1).json({ error: error.message });
  }
};

export async function getCommentsbyMediaId(req, res) {
  const {
    mediaId,
    activityType = "COMMENT",
    pageNum = 1,
    pageSize = 10,
  } = req.query;

  try {
    ErrorLogger.info(
      "Comments",
      `Fetching comments for mediaId: ${mediaId}, page: ${pageNum}`
    );
    const comments = await getCommentsByMediaId(
      mediaId,
      activityType,
      pageNum,
      pageSize
    );
    ErrorLogger.info(
      "Comments",
      `Successfully retrieved ${comments.length} comments for mediaId: ${mediaId}`
    );
    res.json(comments);
  } catch (error) {
    ErrorLogger.error(
      "Comments",
      `Failed to fetch comments for mediaId: ${mediaId}`,
      error
    );
    res.status(error1).json({ error: error.message });
  }
};
