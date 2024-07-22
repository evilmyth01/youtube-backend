import { Router } from "express";
import { createPlaylist,getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(verifyJwt,createPlaylist);
router.route("/user-playlist/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/add-video/:playlistId").put(verifyJwt,addVideoToPlaylist);
router.route("/remove-video/:playlistId").put(verifyJwt,removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJwt,deletePlaylist);
router.route("/update-playlist/:playlistId").patch(verifyJwt,updatePlaylist);




export default router;