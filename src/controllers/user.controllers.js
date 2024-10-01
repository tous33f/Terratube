import {asyncHandler} from "../utils/AsyncHandler.js"
import { fileUploader } from "../utils/Cloudinary.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

// user authentication and authorization controllers
const registerUser=asyncHandler( async(req,res)=>{

    //check if all fields are given
    const {username,fullName,email,password}=req.body
    if( username?.trim()==="" || fullName?.trim()==="" || email?.trim()==="" || password?.trim()==="" ){
        throw new ApiError(401,"All fields are required")
    }

    //check if user already exists
    const duplicatedUser=await User.findOne({$or:[{email,username}]})
    if(duplicatedUser){
        throw new ApiError(402,"User already exists")
    }

    //check for avatar and coverImage
    let avatar=req.files?.avatar
    let coverImage=req.files?.coverImage
    if(!avatar){
        throw new ApiError(403,"Avatar is required")
    }
    avatar=await fileUploader(avatar[0].path)
    if(coverImage && Array.isArray(coverImage) && coverImage.length>0){
        coverImage=await fileUploader(coverImage[0].path)
    }

    //create user
    const user= await User.create({
        fullName,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password
    })

    //validate if its created and remove password and refreshToken from response
    let createdUser=await User.findById(user._id).select("-password")
    if(!createdUser){
        throw new ApiError(405,"Error creating user in database")
    }

    //return response to user
    res.status(201).json(
        new ApiResponse(201,"User created successfully",createdUser)
    )

} )

const loginUser=asyncHandler( async (req,res)=>{
    
    // check for password,username or email
    const {username,email,password}=req.body
    if( (!(username || email)) && password ){
        throw new ApiError(401,"Username or email and password is required")
    }

    // find user if exists
    const user=await User.findOne({$or:[{email},{username}]})
    if(!user){
        throw new ApiError(402,"User does not exist")
    }
    // check if password is correct or not
    if(!(await user.isPasswordCorrect(password))){
        throw new ApiError(403,"Passwword is incorrect")
    }
    
    // generate access and refresh tokens
    let access,refresh
    try{
        access=user.generateAccessToken()
        refresh=user.generateRefreshToken()
    }
    catch(err){
        throw new ApiError(401,"Error while creating access and refresh token")
    }

    // save refreshToken in database and return the updated reponse to user
    const newUser=await User.findOneAndUpdate(user._id,{refreshToken: refresh},{returnDocument: "after"}).select("-password -refreshToken")
    res.status(201)
    .cookie("accessToken",access,{httpOnly: true,secure: false, maxAge: 1000*60*60*24 })
    .cookie("refreshToken",refresh,{httpOnly: true,secure: false , maxAge: 1000*60*60*24*10 })
    .json(
        new ApiResponse(201,"User logged in successfully",{data: newUser,refreshToken: refresh,accessToken: access})
    )
} )

const logoutUser=asyncHandler(async(req,res)=>{
    try{

        // get user object from request
        const user=req.user

        // update refresh token in database
        await User.findByIdAndUpdate(user._id,{$unset:{refreshToken: 1}})

        // clear acces and refresh token cookies
        res.status(201).clearCookie("accessToken").clearCookie("refreshToken").json(
            new ApiResponse(201,"User logged out successfully",{})
        )
    }
    catch(err){
        throw new ApiError(401,"Error while logging out")
    }
} )

const getAccessTokenFromRefreshToken=asyncHandler(async(req,res)=>{
    try{
        const refresh=req.cookies?.refreshToken || req.body.refreshToken
        if(!refresh){
            throw new ApiError(401,"Refresh token not found for generating new access token")
        }
        const decodedToken=await jwt.verify(refresh,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken._id).select("id")
        if(!user){
            throw new ApiError(401,"User with refresh token not found")
        }
        const access=user.generateAccessToken()
        res.status(201)
        .cookie("accessToken",access,{httpOnly: true,secure: false ,maxAge: 1000*60*60*24(Number(process.env.ACCESS_TOKEN_EXPIRY.replace("d",""))) })
        .json(
            new ApiResponse(201,"Access token created successfully",{accessToken: access})
        )
    }
    catch(err){
        throw new ApiError(201,"Error creating new access token from refresh token")
    }
})

// dev test controllers
const userPicture=async (req,res)=>{
    try{
        console.log(req.file)
        const response=await fileUploader(req.file.path)
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url: response.url
        })
    }
    catch(err){
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

const getUserInfo=async (req,res)=>{
    if(req.user){
        res.status(201).json(new ApiResponse(201,"User info is present",req.user))
    }
    else{
        throw new ApiError(401,"User does not exist")
    }
}

export {registerUser,userPicture,loginUser,logoutUser,getAccessTokenFromRefreshToken,getUserInfo}
