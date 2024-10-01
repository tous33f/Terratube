
import { Video } from "../models/video.model.js";
import {Tweet} from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const commentOn=asyncHandler(async (req,res)=>{
    const {content}=req.body
    const {type,typeId}=req.params
    const userId=req.user._id
    if(!type || !typeId || !userId || !content){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        if(type=="video"){
            document=await Video.findById(typeId)
        }
        else{
            document=await Tweet.findById(typeId)
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    let comment
    try{
        comment=await Comment.create({
            commentBy: userId,
            docType: type,
            doc: typeId,
            content
        })
    }
    catch(err){
        throw new ApiError(401,`Error while submitting comment to ${type}`)
    }
    res.status(201).json(
        new ApiResponse(201,`Comment submitted on ${type},successfully`,comment)
    )
} )

const uncomment=asyncHandler(async (req,res)=>{
    const {type,typeId,commentId}=req.params
    const userId=req.user._id
    if(!type || !typeId || !userId || !commentId){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        document=await Comment.findById(commentId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} comment from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    if(document.commentBy!=userId){
        throw new ApiError(401,`User is not authorized to delete comment from ${type}`)
    }
    try{
        await Comment.deleteOne({_id: commentId})
    }
    catch(err){
        throw new ApiError(401,`Error while deleting comment from ${type}`)
    }
    res.status(201).json(
        new ApiResponse(201,`Comment from ${type} deleted successfully`,{})
    )
} )

const editComment=asyncHandler(async (req,res)=>{
    const {type,typeId,commentId}=req.params
    const userId=req.user._id
    const {content}=req.body
    if(!type || !typeId || !userId || !commentId || !content){
        throw new ApiError(401,"Unknown route!")
    }
    let document
    if(!(["tweet","video"].includes(type))){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        document=await Comment.findById(commentId)
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} comment from database.${err}`)
    }
    if(!document){
        throw new ApiError(401,"Unknown route!")
    }
    if(document.commentBy!=userId){
        throw new ApiError(401,`User is not authorized to delete comment from ${type}`)
    }
    try{
        document=await Comment.updateOne({_id: commentId},{content})
    }
    catch(err){
        throw new ApiError(401,`Error while deleting comment from ${type}`)
    }
    res.status(201).json(
        new ApiResponse(201,`Comment from ${type} deleted successfully`,document)
    )
} )

const getTotalComments=asyncHandler( async (req,res)=>{
    const {type,typeId}=req.params
    if(!type || !typeId || !(mongoose.Types.ObjectId.isValid(typeId))){
        throw new ApiError(402,"Unknown route!")
    }
    if( !(["video","tweet"].includes(type)) ){
        throw new ApiError(402,"Unknown route!")
    }
    let document
    try{
        if(type=="video"){
            document=await Video.findById(typeId)
        }
        else{
            document=await Tweet.findById(typeId)
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    if(!document){
        throw new ApiError(402,"Unknown route!")
    }
    try{
        document=await Comment.find({docType: type, doc: typeId})
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    let totalCount,maxCount=5
    if( !Array.isArray(document) ){
        totalCount=0
    }
    else{
        totalCount=document.length
    }
    let totalPages=Math.ceil( totalCount/maxCount )
    let pageCount=Number(req.query.page)
    if(!pageCount || pageCount<=0 || pageCount>totalPages){
        pageCount=1
    }
    try{
        document=await Comment.aggregate([
            {
                $match: {
                    docType: type,
                    doc: mongoose.Types.ObjectId.createFromHexString(typeId)
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $skip: (pageCount-1)*maxCount
            },
            {
                $lookup: {
                  from: "likes",
                  localField: "_id",
                  foreignField: "doc",
                  as: "likes"
                }
            },
            {
                $addFields: {
                  likes: {
                    $size: "$likes"
                  }
                }
            },
            {
                $lookup: {
                  from: "users",
                  localField: "commentBy",
                  foreignField: "_id",
                  as: "commentBy"
                },
            },
            {
                $addFields: {
                  commentBy: {
                    $first: "$commentBy"
                  }
                }
            },
            {
                $project: {
                  "commentBy.fullName": 1,
                  "commentBy.avatar": 1,
                  "commentBy.coverImage": 1,
                  "content": 1,
                  "likes": 1
                }
            }
        ])
    }
    catch(err){
        throw new ApiError(401,`Error while fetching ${type} from database.${err}`)
    }
    res.status(201).json(
        new ApiResponse(201,`Comments for batch ${pageCount} fetched successfully`,{comments: document})
    )
} )

export {
    commentOn,
    uncomment,
    editComment,
    getTotalComments
}
