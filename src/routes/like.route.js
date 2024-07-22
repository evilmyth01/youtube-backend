import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { toggleCommentLike, toggleTweetLike,toggleVideoLike,getLikedVideos,getTotalLikes } from "../controllers/like.controller.js";


const router = Router();

router.route("/toggle/v/:videoId").post(verifyJwt,toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJwt,toggleCommentLike); 
router.route("/toggle/t/:tweetId").post(verifyJwt,toggleTweetLike);
router.route("/videos").get(verifyJwt,getLikedVideos);
router.route("/totalLikes/:videoId").get(verifyJwt,getTotalLikes);

export default router;