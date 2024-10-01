
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createTweet=asyncHandler( async (req,res)=>{
    const {content}=req.body
    const userId=req.user._id
    if(!content){
        throw new ApiError(401,"All fields are required")
    }
    let tweet
    try{
        tweet=await Tweet.create({
            owner: userId,
            content
        })
    }
    catch(err){
        throw new ApiError(401,`Error while saving tweet in database.${err}`)
    }
    res.status(201).json(
        new ApiResponse(201,"Tweet created successfully",tweet)
    )
} )

const deleteTweet=asyncHandler( async (req,res)=>{
    const {tweetId}=req.params
    let tweet
    try{
        tweet=await Tweet.findById(tweetId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching tweet from database.${err}`)
    }
    if(!tweet){
        throw new ApiError(402,"Unknown route!")
    }
    if(tweet.owner!=req.user._id){
        throw new ApiError(401,"User is not authorized to delete tweet")
    }
    try{
        await Tweet.deleteOne({_id: tweetId})
    }
    catch(err){
        throw ApiError(401,"Error while deleting tweet")
    }
    res.status(201).json(
        new ApiResponse(201,"Tweet deleted successfully",{})
    )
} )

const updateTweet=asyncHandler( async (req,res)=>{
    const {content}=req.body
    const {tweetId}=req.params
    if(!content){
        throw new ApiError(401,"All fields are required")
    }
    let tweet
    try{
        tweet=await Tweet.findById(tweetId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching tweet from database.${err}`)
    }
    if(!tweet){
        throw new ApiError(402,"Unknown route!")
    }
    if(tweet.owner!=req.user._id){
        throw new ApiError(401,"User is not authorized to update tweet")
    }
    if(tweet.content==content){
        throw new ApiError(401,"Tweet is already updated")
    }
    try{
        tweet=await Tweet.updateOne({_id: tweetId},{content})
    }
    catch(err){
        throw ApiError(401,"Error while updating tweet")
    }
    res.status(201).json(
        new ApiResponse(201,"Tweet updated successfully",tweet)
    )
} )

const getTweet=asyncHandler( async (req,res)=>{
    const {tweetId}=req.params
    let tweet
    try{
        tweet=await Tweet.findById(tweetId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching tweet from database.${err}`)
    }
    if(!tweet){
        throw new ApiError(402,"Unknown route!")
    }
    res.status(201).json(
        new ApiResponse(201,"Tweet fecthed successfully",tweet)
    )
} )

const getUserTweets=asyncHandler( async (req,res)=>{
    const {userId}=req.params
    if(!userId || !(mongoose.Types.ObjectId.isValid(userId))){
        throw new ApiError(402,"Unknown route!")
    }
    let user
    try{
        user=await User.findById(userId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching user from database.${err.message}`)
    }
    if(!user ){
        throw new ApiError(402,"Unknown route!")
    }
    let tweets
    try{
        tweets=await Tweet.aggregate([
            {
              $match: {
                owner: mongoose.Types.ObjectId.createFromHexString(userId),
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
              }
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner"
                }
              }
            },
            {
              $project: {
                "owner.watchHistory": 0,
                "owner.password": 0,
                "owner.createdAt": 0,
                "owner.updatedAt": 0,
                "owner.email":0,
                "owner.username": 0,
                updatedAt: 0
              }
            }
          ])
    }
    catch(err){
        throw new ApiError(401,`Error while fetching tweets from database.${err}`)
    }
    if(!Array.isArray(tweets) || !tweets){
        tweets=[]
    }
    res.status(201).json(
        new ApiResponse(201,"Tweets of user fetched successfully",{tweets})
    )

} )

export {
    createTweet,
    deleteTweet,
    updateTweet,
    getTweet,
    getUserTweets
}
