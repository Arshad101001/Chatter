import express from 'express';
import authRoutes from './routes/authRoute.js';
import messageRoutes from './routes/messageRoutes.js';
import path, { dirname } from 'path';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from "cookie-parser";


const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// req.body middleware
app.use(express.json());  // handling json data
app.use(express.urlencoded({ extended: false })); // handling form data
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// make ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // app.use("*", (req, res) => {
    app.get((_, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}


app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    connectDB();
});