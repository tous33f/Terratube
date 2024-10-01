
// controllers
import { Router } from "express";
import { registerUser,getUserInfo,userPicture,loginUser,logoutUser,getAccessTokenFromRefreshToken } from "../controllers/user.controllers.js";

// middlewares
import { upload } from "../middlewares/multer.middleware.js"
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router=Router()

// user authentication and authorization routes
router.route("/register").post(
    upload.fields([
        {name: "avatar",maxCount: 1},
        {name: "coverImage",maxCount: 1}
    ])
,registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyAuth,logoutUser)

router.route("/get_token").post(getAccessTokenFromRefreshToken)

// dev test routes
router.route("/profile").post(upload.single("picture"),userPicture)
router.route("/get_user").get(verifyAuth,getUserInfo)

export default router
