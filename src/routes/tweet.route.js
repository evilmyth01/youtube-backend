import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createTweet, updateTweet, getUserTweets, deleteTweet } from "../controllers/tweet.controller.js";


const router= Router();

router.route("/").post(verifyJwt,createTweet);
router.route("/:userId").get(getUserTweets);
router.route("/:tweetId").put(updateTweet);
router.route("/:tweetId").delete(deleteTweet);



export default router; 