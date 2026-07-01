import { Server } from "socket.io";
import http from 'http';
import express from 'express';
import { ENV } from "./env.js";
import { SocketAuthMiddleware } from "../middleware/SocketAuthMiddleware.js";

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    },
});

// apply authentication middle ware to all socket connections
io.use(SocketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
};

// this is for storing online users
const userSocketMap = {};  //{userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected " + socket.user.fullName + " with socket ID: " + socket.id);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // listen for joinRoom event from clients
    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`${socket.user.fullName} joined room ${roomId}`);
    });


    socket.on("user:call", ({ to, callType, callerName, callerPic, offer }) => {
        const receiverSocketId = userSocketMap[to];
        if (!receiverSocketId) {
            socket.emit("call:busy", { msg: "User is offline" });
            return;
        }
        io.to(receiverSocketId).emit("incoming:call", {
            from: socket.id,
            fromUserId: userId,
            callType,
            callerName,
            callerPic,
            offer,
        });
    });

    socket.on("ice:candidate", ({ to, candidate }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("ice:candidate", { candidate });
        }
    });

    socket.on("call:busy", ({ msg, to }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call:busy", { msg });
        }
    });

    socket.on("call:rejected", ({ to }) => {
        const receiverSocketId = userSocketMap[to];

        socket.to(receiverSocketId).emit("call:rejected");
    });

    socket.on("call:accepted", ({ to, ans }) => {
        const receiverSocketId = userSocketMap[to];

        socket.to(receiverSocketId).emit("call:accepted", {
            from: socket.id,
            ans,
        });
    });

    socket.on("call:ended", ({ to }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call:ended");
        }
    });


    // with socket.on we listen for events from clients
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})


export { io, server, app };

