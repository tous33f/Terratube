
import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { getChannel, subscribe } from "../controllers/subscription.controllers.js";

const router=Router()

router.use(verifyAuth)

router.route("/:username").get(getChannel).post(subscribe)

export default router
