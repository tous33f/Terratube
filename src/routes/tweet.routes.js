
import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getTweet, updateTweet, getUserTweets } from "../controllers/tweet.controller.js";

const router=Router()

router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").get(getTweet)

router.use(verifyAuth)

router.route("/").post(createTweet)
router.route("/:tweetId")
.delete(deleteTweet)
.patch(updateTweet)

export default router
