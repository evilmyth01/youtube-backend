import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { registerUser, loginUser,logoutUser,refreshRefreshToken,changePassword,getCurrentUserAndHistory,updateAccountDetails,updateAvatar,updateCoverImage,getUserById } from "../controllers/user.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/register").post(upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt,logoutUser);

router.route("/:id").get(getUserById);

router.route("/refresh-token").post(verifyJwt,refreshRefreshToken);
router.route("/change-password").post(verifyJwt,changePassword);
router.route("/").get(verifyJwt,getCurrentUserAndHistory);

router.route("/update-account").patch(verifyJwt,updateAccountDetails);

router.route("/update-avatar").patch(verifyJwt,upload.single('avatar'),updateAvatar);
router.route("/update-cover-image").patch(verifyJwt,upload.single('coverImage'),updateCoverImage);


export default router;