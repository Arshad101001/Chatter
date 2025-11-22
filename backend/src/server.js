import express from 'express';
import dotenv from "dotenv";
import authRoutes from './routes/authRoute.js';
import messageRoutes from './routes/messageRoutes.js';
import path, { dirname } from 'path';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

// req.body middleware
app.use(express.json());  // handling json data
app.use(express.urlencoded({ extended: false })); // handling form data

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// make ready for deployment
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    // app.use("*", (req, res) => {
    app.get((_, res)=>{
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}


app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    connectDB();
});