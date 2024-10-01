
import mongoose from "mongoose";

const likeSchema=new mongoose.Schema(
    {
        likedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"likedBy is required"]
        },
        doc :{
            type: mongoose.Types.ObjectId,
            required: [true,"Id to which type is liked is required"],
            refPath: "docType"
        },
        docType: {
            type: String,
            required: [true,"Type of like is required.Options are comment,tweet,video"],
            enum: ["comment","tweet","video"]
        }
    }
)

likeSchema.index({ likedBy: 1,doc: 1 ,docType: 1},{unique: true})

export const Like=mongoose.model("Like",likeSchema)
