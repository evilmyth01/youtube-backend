import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDB = async()=>{
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
        console.log("mongodb connected ");
    } catch (error) {
        console.log("error connecting to database",error);
        process.exit(1);
    }
}

export {
    connectDB,
}