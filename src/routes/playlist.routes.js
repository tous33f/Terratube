
import { Router } from "express";
import {verifyAuth} from "../middlewares/auth.middleware.js"
import { createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist } from "../controllers/playlist.controllers.js";

const router=Router()

router.use(verifyAuth)

router.route("/").post(createPlaylist)

router.route("/:playlistId")
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(updatePlaylist)

router.route("/user/:userId")
.get(getUserPlaylist)

router.route("/add/:playlistId/:videoId")
.post(addVideoToPlaylist)

router.route("/remove/:playlistId/:videoId")
.delete(removeVideoFromPlaylist)

export default router
