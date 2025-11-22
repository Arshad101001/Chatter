import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => { 
    try {

        const {MONGO_URI} = ENV;
        if (!MONGO_URI) throw new Error("MONGO_URI is not set");

        const con = await mongoose.connect(ENV.MONGO_URI)
        console.log("Mongo DB connected: ", con.connection.host);
        
    } catch (error) {
        console.error("Error connection to MongoDb: ", error);
        process.exit(1) // 1 status code means fails and 0 means success
    }
 }