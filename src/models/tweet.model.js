
import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema(
    {
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"likedBy is required"]
        },
        content: {
            type: String,
            required: [true,"Content for tweet is required"]
        }
    }
)

export const Tweet=mongoose.model("Tweet",tweetSchema)
