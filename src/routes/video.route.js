import express from "express";
import { publishAVideo,getAllVideo,getVideoById,deleteVideo,updateVideo,togglePublishStatus,getVideosByUserId, updateViewsAndHistory} from "../controllers/video.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.use(verifyJwt)

router.route("/").get(getAllVideo);

router.route("/publish").post(upload.fields([{name:"videoFile",maxCount:1},{name:"thumbnail",maxCount:1}]),publishAVideo);
router.route("/:videoId").get(getVideoById).delete(deleteVideo).patch(upload.single("thumbnail"),updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus); 
router.route("/user/:userId").get(getVideosByUserId);

router.route("/user/:videoId").post(verifyJwt,updateViewsAndHistory);



export default router;