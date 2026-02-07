import express from 'express';
import authRoutes from './routes/authRoute.js';
import messageRoutes from './routes/messageRoutes.js';
import path, { dirname } from 'path';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from './lib/socket.js';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = ENV.PORT || 3000;

// req.body middleware
app.use(express.json({ limit: "30mb" }));  // handling json data && adding limit so our backend can handle large file or request
app.use(express.urlencoded({ extended: true, limit: "30mb" })); // handling form data && adding limit so our backend can handle large file or request
app.use(cors({ origin: ENV.CLIENT_URL, methods: "GET, POST, PUT, DELETE", credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// make ready for deployment
if (ENV.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../../frontend/dist");

    app.use(express.static(frontendPath));

    app.get(/^\/(?!api).*/, (_, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}



server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    connectDB();
});