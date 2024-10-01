
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyAuth=asyncHandler(async (req,res,next)=>{
    try{
        const access=req.cookies?.accessToken || req.header("Authorizaion")?.replace("Bearer ","")
        if(!access){
            throw new ApiError(401,"Access token does not exist so cannot login")
        }
        const decodedToken=await jwt.verify(access,process.env.ACCESS_TOKEN_SECRET)
        req.user=decodedToken
        next()
    }
    catch(err){
        throw new ApiError(401,"Error while verifying access token")
    }
})

export {verifyAuth}
