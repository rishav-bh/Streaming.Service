import { Router } from "express";
import { kisanBytes } from "../controllers/media.Controller.js";
import { getMediaById } from "../controllers/media.Controller.js";
import { kisanBytesActivities } from "../controllers/media.Controller.js";
import { getCommentsbyMediaId } from "../controllers/media.Controller.js";


const router = Router();

// Route to get kisan bytes
router.route("/kisan/bytes").get(kisanBytes);
// Route to get media by ID
router.route("/kisan/bytes/mediaid").get(getMediaById);
// Route to save Kisan bytes activities
router.route("/kisan/bytes/activities").post(kisanBytesActivities);
// Route to get comments by media ID
router.route("/comments/by/mediaid").get(getCommentsbyMediaId);

export default router;
