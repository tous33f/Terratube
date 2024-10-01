
import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema(
    {
        subscriber:{
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"Subscriber is required"]
        },
        channel:{
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true,"Channel is required"]
        }
    },
    {timestamps: true}
)

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
