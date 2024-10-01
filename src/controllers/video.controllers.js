
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from "../models/video.model.js"
import { fileUploader } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {getVideoDurationInSeconds} from "get-video-duration"
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";

const uploadVideo=asyncHandler(async (req,res)=>{

    let duration,videoFile=req.files?.videoFile,thumbnail=req.files?.thumbnail
    const {title,description}=req.body
    if(title?.trim()==="" || description?.trim()===""){
        throw new ApiError(401,"All fields are required")
    }
    if(videoFile && Array.isArray(videoFile) && videoFile.length>0
    && thumbnail && Array.isArray(thumbnail) && thumbnail.length>0){
        duration=await getVideoDurationInSeconds(videoFile[0].path)
        videoFile=await fileUploader(videoFile[0].path)
        thumbnail=await fileUploader(thumbnail[0].path)
    }
    else{
        throw new ApiError(401,"Video file and thumbnail is required")
    }
    const video=await Video.create({
        videoFile:videoFile.url,thumbnail:thumbnail.url,owner:req.user._id,title,description,duration,isPublished: 0
    })
    if(!video){
        throw new ApiError(401,"Error uploading video in database")
    }
    res.status(201).json(
        new ApiResponse(201,'Video uploaded successfully',video)
    )

} )

const publishVideo=asyncHandler( async (req,res)=>{
    const {videoId}=req.params
    if(!videoId || !(mongoose.Types.ObjectId.isValid(videoId)) ){
        throw new ApiError(401,"Unknown route!")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(401,"Unknown route!")
    }
    if(video.owner.toString()!=req.user._id){
        throw new ApiError(402,"User is not authorized to publish video")
    }
    if(video.isPublished){
        res.status(202).json(
            new ApiResponse(202,"Video is already published.Cannot publish again",{})
        )
    }
    else{
        try{
            await Video.findByIdAndUpdate(videoId,{isPublished: true})
        }
        catch(err){
            throw new ApiError(401,"Error while publishing video")
        }
        res.status(201).json(
            new ApiResponse(201,"Video published successfully",{})
        )
    }
} )

const unpublishVideo=asyncHandler( async (req,res)=>{
    const {videoId}=req.params
    if(!videoId || !(mongoose.Types.ObjectId.isValid(videoId))){
        throw new ApiError(401,"Unknown route!")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(401,"Unknown route!")
    }
    if(video.owner.toString()!=req.user._id){
        throw new ApiError(402,"User is not authorized to unpublish video")
    }
    if(!video.isPublished){
        res.status(202).json(
            new ApiResponse(202,"Video is already unpublished.Cannot unpublish again",{})
        )
    }
    else{
        try{
            await Video.findByIdAndUpdate(videoId,{isPublished: false})
        }
        catch(err){
            throw new ApiError(401,"Error while unpublishing video")
        }
        res.status(201).json(
            new ApiResponse(201,"Video unpublished successfully",{})
        )
    }
} )

const getVideo=asyncHandler( async(req,res)=>{
    const {videoId}=req.params
    let video
    if(!videoId){
        throw new ApiError(402,"Unknown route!")
    }
    try{
        video=await Video.aggregate([
            {
            $match: {
                _id: mongoose.Types.ObjectId.createFromHexString(videoId)
            }
            },
            {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
            },
            {
            $addFields: {
                "owner":{
                $first: "$owner"
                }
            }
            },
            {
            $project: {
                "owner.email":0,
                "owner.password":0,
                "owner.username":0,
                "owner.watchHistory":0,
                "owner.createdAt":0,
                "owner.updatedAt":0
            }
            }
        ])
    }
    catch(err){
        throw new ApiError(401,`Error while fetching video from database.${err}`)
    }
    if( !Array.isArray(video) || video.length<1 || (video[0].isPublished==0 && video[0].owner._id!=req.user._id) ){
        throw new ApiError(402,"Unknown route!")
    }
    if(req.user?._id && video[0].owner._id!=req.user._id){
        delete video[0].owner._id
        delete video[0].isPublished
    }
    res.status(201).json(
        new ApiResponse(201,"Video fetched successfully",video[0])
    )
} )

const getUserVideos=asyncHandler( async (req,res)=>{
    const {userId}=req.params
    if(!userId){
        throw new ApiError(402,"Unknown route!")
    }
    if( !(mongoose.Types.ObjectId.isValid(userId)) ){
        throw new ApiError(402,"Unknown route!")
    }
    let user
    try{
        user=await User.findById(userId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching user from database.${err}`)
    }
    if(!user || !(mongoose.Types.ObjectId.isValid(userId)) ){
        throw new ApiError(402,"Unknown route!")
    }
    let videos,flag
    try{
        if(req.user?._id && userId==req.user._id){
            flag=false
        }
        else{
            flag=true
        }
        videos=await Video.aggregate([
            {
              $match: {
                owner: mongoose.Types.ObjectId.createFromHexString(userId),
              }
            },
            {
                $match: {
                    $or: [
                        {isPublished: true},
                        {isPublished: flag},
                    ]
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
                isPublished: 0,
                updatedAt: 0
              }
            }
          ])
    }
    catch(err){
        throw new ApiError(401,`Error while fetching videos from database.${err}`)
    }
    if(Array.isArray(videos) && videos.length==0){
        videos=[]
    }
    if(!Array.isArray(videos) && !videos){
        videos=[]
    }
    res.status(201).json(
        new ApiResponse(201,"Videos of user fetched successfully",{videos})
    )

} )

const getUserLikedVideos=asyncHandler( async (req,res)=>{
    let videos
    try{
        videos=await Like.aggregate([
            {
            $match: {
                likedBy: mongoose.Types.ObjectId.createFromHexString(req.user._id),
                docType: "video"
            }
            },
            {
            $lookup: {
                from: "videos",
                localField: "doc",
                foreignField: "_id",
                as: "video"
            },
            },
            {
            $addFields: {
                video: {
                $first: "$video"
                }
            }
            },
            {
            $replaceRoot: {
                newRoot: "$video"
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
                isPublished: 0,
                updatedAt: 0
            }
            }
          ])
    }
    catch(err){
        throw new ApiError(401,"Error while fecthing liked videos from database")
    }
    if(!Array.isArray(videos) || !videos){
        videos=[]
    }
    res.status(201).json(
        new ApiResponse(201,"Liked videos for user fecthed successfully",{videos})
    )
} )

export {uploadVideo,publishVideo,getVideo,unpublishVideo,getUserVideos,getUserLikedVideos}
