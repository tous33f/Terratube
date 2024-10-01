
// remaining part:
// 1) watch history of user
// 3) update playlists output for owner and videos array
// 4) create playlist public true false function

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()
// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: '16kb'
}))

app.use(express.urlencoded({
    extended: true,
    limit: '16kb'
}))

app.use(express.static("public"))

app.use(cookieParser())

//routes import
import userRoutes from "./routes/user.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
import videoRoutes from "./routes/video.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import likeRoutes from "./routes/like.routes.js"

//routes declaration
app.use("/user",userRoutes)
app.use("/c",subscriptionRoutes)
app.use("/v",videoRoutes)
app.use("/playlist",playlistRoutes)
app.use("/tweet",tweetRoutes)
app.use("/comment",commentRoutes)
app.use("/like",likeRoutes)

export default app
