
import mongoose from "mongoose";

const playlistSchema=new mongoose.Schema(
    {
        owner:{
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"Onwer information is required"]
        },
        videos: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Video"
            }
        ],
        name: {
            type: String,
            trim: true,
            required: [true,"Name of playlist is required"]
        },
        description:{
            type: String,
            required: [true,"Description of playlist is required"]
        },
        public: {
            type: Boolean,
            default: false
        }
    }
)

export const Playlist=mongoose.model('playlist',playlistSchema)
