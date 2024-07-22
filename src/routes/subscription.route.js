import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggle/:channelId").post(verifyJwt,toggleSubscription)
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/subscribed").get(verifyJwt,getSubscribedChannels)



export default router;