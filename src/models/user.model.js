import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema=new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true,"Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true,"Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: [true,"Full name is required"],
            trim: true,
        },
        avatar: {
            type: String,
            required: [true,"Avatar is required"],
        },
        coverImage: {
            type: String
        },
        watchHistory: {
            type: [mongoose.Types.ObjectId],
            ref: "Video"
        },
        password: {
            type: String,
            required: [true,"Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {timestamps: true}
)

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,12)
    }
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            algorithm: "HS256"
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)
