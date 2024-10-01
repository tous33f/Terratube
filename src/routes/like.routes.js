
import { Router } from "express";
import { getTotalLikes, like, unlike } from "../controllers/like.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
const router=Router()

router.route("/:type/:typeId")
.get(getTotalLikes)

router.use(verifyAuth)

router.route("/:type/:typeId")
.post(like)
.delete(unlike)

export default router
