import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { addComment, updateComment, deleteComment, getVideoComments } from "../controllers/comment.controller.js";

const router = Router();

router.route("/:videoId").post(verifyJwt,addComment);
router.route("/:commentId").put(verifyJwt,updateComment).delete(verifyJwt,deleteComment);
router.route("/video/:videoId").get(getVideoComments);

export default router;