import mongoose from "mongoose";
import moongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema=new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: [true,"Video file is required"],
        },
        thumbnail: {
            type: String,
            required: [true,"Thumbnail is required"],
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"Owner is required"],
        },
        title: {
            type: String,
            required: [true,"Title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true,"Description is required"],
        },
        duration: {
            type: Number,
            required: [true,"Duration is required"],
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
)

videoSchema.plugin(moongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)
