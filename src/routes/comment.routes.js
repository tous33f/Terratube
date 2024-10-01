
import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { commentOn, uncomment, editComment , getTotalComments} from "../controllers/comment.controller.js";
const router=Router()

router.use(verifyAuth)

router.route("/:type/:typeId")
.post(commentOn)
.get(getTotalComments)

router.route("/:type/:typeId/:commentId")
.delete(uncomment)
.patch(editComment)

export default router

