import app from "./app.js"
import connect_db from "./db/connection.js"
import dotenv from "dotenv"

dotenv.config({path: "./env"})

connect_db().then( ()=>{
    app.listen( process.env.PORT ,() => console.log(`App listening on port ${process.env.PORT}`) )
} ).catch( (err) => {
    console.log("MongoDB connection error",err)
    process.exit(1)
} )
