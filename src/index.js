import dotenv from "dotenv"
import { connectDB } from "./db/index.js"
import app from "./app.js";

dotenv.config({
    path:"./.env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("app connected on port 8000")
    })
})
.catch((err)=>{
    console.log("error connecting app to database",err)
})