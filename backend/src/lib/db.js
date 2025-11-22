import mongoose from 'mongoose';

export const connectDB = async () => { 
    try {
        const con = await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB connected: ", con.connection.host);
        
    } catch (error) {
        console.error("Error connection to MongoDb: ", error);
        process.exit(1) // 1 status code means fails and 0 means success
    }
 }