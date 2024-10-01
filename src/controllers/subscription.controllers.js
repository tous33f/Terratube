import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Subscription } from "../models/subcription.model.js"

const subscribe=asyncHandler( async(req,res)=>{
    const {username}=req.params
    const channelSubscribed=await User.findOne({username})
    if(!username){
        throw new ApiError(401,"Searched user does not exist")
    }
    const subscriber=req.user
    if(channelSubscribed._id==subscriber._id){
        throw new ApiError(401,"User cannot subscribe him/her-self")
    }
    const ifSubscribed=await Subscription.findOne({subscriber: subscriber._id,channel: channelSubscribed._id})
    if(ifSubscribed){
        throw new ApiError(401,"Channel is already subscribed by user")
    }
    const subscription=await Subscription.create({
        subscriber: subscriber._id,
        channel: channelSubscribed._id
    })
    if(!subscription){
        throw new ApiError(405,"Error creating subscription in database")
    }
    res.status(201).json(
        new ApiResponse(201,"Subscription created successfully",subscription)
    )
} )

const getChannel=asyncHandler( async (req,res)=>{
    try{
        const {username}=req.params
        const user=await User.findOne({username})
        if(!user){
            throw new ApiError(401,"Searched user does not exist")
        }
        const channelInfo=await User.aggregate([
            {
                $match: {
                    username: username
                }
            },
            {
                $lookup:{
                    "from": "subscriptions",
                    "localField": "_id",
                    "foreignField": "channel",
                    "as": "totalSubscribers"
                }
            },
            {
                $lookup:{
                    "from": "subscriptions",
                    "localField": "_id",
                    "foreignField": "subscriber",
                    "as": "subscribedChannels"
                }
            },
            {
                $project:{
                    username: 1,
                    email: 1,
                    fullname: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribers:{
                        $size: "$totalSubscribers"
                    },
                    subscribed:{
                        $size: "$subscribedChannels"
                    }
                }
            }
        ])
        const isSubscribed=await Subscription.findOne({subscriber: req.user._id,channel: user._id})
        if(isSubscribed){
            channelInfo[0].isSubscribed=true
        }
        else{
            channelInfo[0].isSubscribed=false
        }
        res.status(201).json(
            new ApiResponse(201,"User found!",channelInfo[0])
        )
    }
    catch(err){
        throw new ApiError(401,`Error while getting channel information: ${err}`)
    }
} )

export {subscribe,getChannel}
