
import { Video } from "../models/video.model.js";
import {Tweet} from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const like=asyncHandler(async (req,res)=>{
    const {type,typeId}=req.params
    const userId=req.user._id
    if(!type || !typeId || !userId){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["comment","tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        if(type=="video"){
            document=await Video.findById(typeId)
        }
        else if(type=="tweet"){
            document=await Tweet.findById(typeId)
        }
        else{
            document=await Comment.findById(typeId)
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    let like
    try{
        like=await Like.create({
            likedBy: userId,
            docType: type,
            doc: typeId
        })
    }
    catch(err){
        if(err.code==11000){
            throw new ApiError(402,`Given ${type} is already liked by user`)
        }
        else{
            throw new ApiError(401,`Error while submitting like to ${type}.${err}`)
        }
    }
    res.status(201).json(
        new ApiResponse(201,`Liked ${type},successfully`,like)
    )
} )

const unlike=asyncHandler(async (req,res)=>{
    const {type,typeId}=req.params
    const userId=req.user._id
    if(!type || !typeId || !userId){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["comment","tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        if(type=="video"){
            document=await Video.findById(typeId)
        }
        else if(type=="tweet"){
            document=await Tweet.findById(typeId)
        }
        else{
            document=await Comment.findById(typeId)
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        document=await Like.findOne({docType: type, doc: typeId, likedBy: userId})
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} like from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,`User has not yet liked the ${type} so cannot unlike`)
    }
    try{
        await Like.deleteOne({docType: type, doc: typeId, likedBy: userId})
    }
    catch(err){
        throw new ApiError(401,`Error while deleting like from ${type}`)
    }
    res.status(201).json(
        new ApiResponse(201,`Like from ${type} deleted successfully`,{})
    )
} )

const getTotalLikes=asyncHandler( async (req,res)=>{
    const {type,typeId}=req.params
    if(!type || !typeId){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["comment","tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        if(type=="video"){
            document=await Video.findById(typeId)
        }
        else if(type=="tweet"){
            document=await Tweet.findById(typeId)
        }
        else{
            document=await Comment.findById(typeId)
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    let totalLikes
    try{
        totalLikes=await Like.find({docType: type,doc: typeId})
    }
    catch(err){
        throw new ApiError(401,`Error while fetching tweet likes from database.${err}`)
    }
    if(Array.isArray(totalLikes)){
        totalLikes=totalLikes.length
    }
    else{
        totalLikes=0
    }
    res.status(201).json(
        new ApiResponse(201,`Total likes for ${type} fetched successfully`,{totalLikes})
    )
} )

export {
    like,
    unlike,
    getTotalLikes
}
