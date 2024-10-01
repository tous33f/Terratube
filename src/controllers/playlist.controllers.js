
import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { Video } from "../models/video.model.js"

const createPlaylist=asyncHandler( async (req,res)=>{
    const {name,description}=req.body
    if(!name || !description){
        throw new ApiError(401,"All fields are required")
    }
    try{
        const playlist=await Playlist.create({
            owner: req.user._id,
            name,
            description
        })
        res.status(201).json(
            new ApiResponse(201,"Playlist created successfully",playlist)
        )
    }
    catch(err){
        throw new ApiError(401,`Error creating a new playlist,${err}`)
    }
} )

const getUserPlaylist=asyncHandler(async (req,res)=>{
    const {userId}=req.params
    console.log(userId)
    if(!userId){
        throw new ApiError(401,"Unknown route!")
    }
    let playlists
    try{
        if(userId==req.user._id){
            playlists=await Playlist.aggregate([
                {
                    $match: {
                        owner: mongoose.Types.ObjectId.createFromHexString(userId),
                    }
                },
                {
                    $project: {
                        videos: 1,
                        name: 1,
                        description: 1
                    }
                }
            ])
        }
        else{
            playlists=await Playlist.aggregate([
                {
                    $match: {
                        owner: mongoose.Types.ObjectId.createFromHexString(userId),
                        public: true
                    }
                },
                {
                    $project: {
                        videos: 1,
                        name: 1,
                        description: 1
                    }
                }
            ])
        }
    }
    catch(err){
        throw new ApiError(401,"Error while fetching playlists")
    }
    res.status(201).json(
        new ApiResponse(201,"Playlists fetched successfully",playlists)
    )    
})

const getPlaylistById=asyncHandler(async (req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(401,"Unknown route!")
    }
    let playlist
    try{
        playlist=await Playlist.findById(playlistId)
    }
    catch(err){
        throw new ApiError(401,"Error while fetching playlists")
    }
    if( !playlist || (req.user._id!=playlist.owner && !playlist.public) ){
        throw new ApiError(401,"Unknown route!")
    }
    else{
        res.status(201).json(
            new ApiResponse(201,"Playlist fetched successfully",playlist)
        )
    }
})

const addVideoToPlaylist=asyncHandler(async (req,res)=>{
    const {playlistId,videoId}=req.params
    if(!playlistId || !videoId){
        throw new ApiError(401,"All fields are required")
    }
    try{
        const video=await Video.findById(videoId)
        if(!video){
            throw new ApiError(401,"Given video not found")
        }
        const playlist=await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(401,"Given playlist not found")
        }
        if(playlist.owner!=req.user._id){
            throw new ApiError(401,"User is not authorized to add video to playlist")
        }
    }
    catch(err){
        throw new ApiError(401,`Error while processing playlist and video.${err}`)
    }
    try{
        const checkPlaylist=await Playlist.findById(playlistId)
        if( checkPlaylist.videos.includes(videoId) ){
            throw new ApiError(401,"Video is already added to playlist")
        }
        const playlist=await Playlist.updateOne(
            {_id: playlistId},
            {$push: {"videos": videoId}}
        )
        if(!playlist){
            throw new ApiError(401,"Error while updating playlist videos")
        }
        res.status(201).json(
            new ApiResponse(201,"Video added to playlist successfully",playlist)
        )
    }
    catch(err){
        throw new ApiError(401,`Error while adding video to playlist.${err}`)
    }
})

const removeVideoFromPlaylist=asyncHandler(async (req,res)=>{
    const {playlistId,videoId}=req.params
    if(!playlistId || !videoId){
        throw new ApiError(401,"All fields are required")
    }
    try{
        const video=await Video.findById(videoId)
        if(!video){
            throw new ApiError(401,"Given video not found")
        }
        const playlist=await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(401,"Given playlist not found")
        }
        if(playlist.owner!=req.user._id){
            throw new ApiError(401,"User is not authorized to add video to playlist")
        }
    }
    catch(err){
        throw new ApiError(401,`Error while processing playlist and video.${err}`)
    }
    try{
        const playlist=await Playlist.updateOne(
            {_id: playlistId},
            {$pull: {"videos": videoId}}
        )
        if(!playlist){
            throw new ApiError(401,"Error while updating playlist videos")
        }
        if(playlist.modifiedCount==0){
            throw new ApiError(401,"Given video is not present in playlist")
        }
        res.status(201).json(
            new ApiResponse(201,"Video removed from playlist successfully",playlist)
        )
    }
    catch(err){
        throw new ApiError(401,`Error while removing video from playlist.${err}`)
    }
})

const deletePlaylist=asyncHandler(async (req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(401,"Unknown route!")
    }
    try{
        const playlist=await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(401,"Playlist not found!")
        }
        if(playlist.owner!=req.user._id){
            throw new ApiError(401,"User is not authorized to delete playlist")
        }
    }
    catch(err){
        throw new ApiError(401,`Error while fetching playlist.${err}`)
    }
    try{
        await Playlist.deleteOne({_id: playlistId})
        res.status(201).json(
            new ApiResponse(201,"Playlist deleted successfully",{})
        )
    }
    catch(err){
        throw new ApiError(401,`Error while deleteing playlist.${err}`)
    }
})

const updatePlaylist=asyncHandler(async (req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(401,"Unknown route!")
    }
    const {name,description}=req.body
    if(!name && !description){
        throw new ApiError(401,"Name or description is required")
    }
    try{
        const playlist=await Playlist.findById(playlistId)
        if(playlist.owner!=req.user._id){
            throw new ApiError(401,"User is not authorized to update playlist")
        }
        if(!playlist){
            throw new ApiError(401,"Playlist does not exist")
        }
        if(name){
            playlist.name=name
        }
        if(description){
            playlist.description=description
        }
        await playlist.save()
        res.status(201).json(
            new ApiResponse(201,"Playlist updated successfully",playlist)
        )
        
    }
    catch(err){
        throw new ApiError(401,`Error while updating playlist information.${err}`)
    }
})



export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
