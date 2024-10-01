
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getVideo, uploadVideo, publishVideo,unpublishVideo,getUserVideos,getUserLikedVideos} from "../controllers/video.controllers.js";

const router=Router()

router.use(verifyAuth)
router.route("/upload").post(
    upload.fields([
        {name: "videoFile",maxCount: 1},
        {name: "thumbnail",maxCount: 1}
    ]),
    uploadVideo
)

router.route("/:videoId").get(getVideo)
router.route("/user/:userId").get(getUserVideos)
router.route("/:videoId/publish").post(publishVideo)
router.route("/:videoId/unpublish").post(unpublishVideo)
router.route("/liked/user").get(getUserLikedVideos)

export default router
