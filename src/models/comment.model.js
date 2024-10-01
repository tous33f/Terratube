
import mongoose from "mongoose";

const commentSchema=new mongoose.Schema(
    {
        commentBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"commentBy is required"]
        },
        doc :{
            type: mongoose.Types.ObjectId,
            required: [true,"Id to which type is of comment is required"],
            refPath: "docType"
        },
        docType: {
            type: String,
            required: [true,"Type of comment is required.Options are tweet,video"],
            enum: ["tweet","video"]
        },
        content: {
            type: String,
            required: [true,"Comment content is required"]
        }
    }
)

export const Comment=mongoose.model("Comment",commentSchema)
