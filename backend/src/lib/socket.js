import { Server } from "socket.io";
import http from 'http';
import express from 'express';
import { ENV } from "./env.js";
import { SocketAuthMiddleware } from "../middleware/SocketAuthMiddleware.js";
import Message from "../models/messageModel.js";
import Group from "../models/groupModel.js";

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

export function getSocketIdByUserId(userId) {
    return userSocketMap[userId];
}

// this is for storing online users
const userSocketMap = {};  //{userId: socketId}

io.on("connection", async (socket) => {
    console.log("A user connected " + socket.user.fullName + " with socket ID: " + socket.id);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    const userGroups = await Group.find({ members: userId }).select("_id");
    userGroups.forEach(group => {
        socket.join(group._id.toString());
    });

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

    socket.on("profile:updated", ({ updatedUser }) => {
        socket.broadcast.emit("profile:updated", { updatedUser });
    });

    socket.on("read-message", ({ to, messagePartnerId }) => {
        const receiverSocketId = userSocketMap[to];
        socket.to(receiverSocketId).emit("read-message", { messagePartnerId });
    });

    socket.on("typing:start", ({ to }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing:start", { from: userId });
        }
    });

    socket.on("typing:stop", ({ to }) => {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing:stop", { from: userId });
        }
    });

    // JOIN GROUP ROOM
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
    });

    // LEAVE GROUP ROOM (e.g. when user navigates away)
    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
    });

    // SEND GROUP MESSAGE
    socket.on("sendGroupMessage", async ({ groupId, text, image }) => {
        try {
            const senderId = socket.userId;

            if (!text && !image) {
                return socket.emit("error", { message: "Message cannot be empty" });
            }

            const group = await Group.findById(groupId);
            if (!group || !group.members.some(id => id.toString() === senderId)) {
                return socket.emit("error", { message: "You are not a member of this group" });
            }

            const message = await Message.create({ senderId, groupId, text, image });

            const populatedMessage = await message.populate("senderId", "fullName profilePic");

            await Group.findByIdAndUpdate(groupId, {
                lastMessage: {
                    messageId: message._id,
                    text,
                    image,
                    sender: senderId,
                    createdAt: message.createdAt,
                },
            });

            io.to(groupId).emit("newGroupMessage", populatedMessage);
        } catch (error) {
            console.log("Error in sendGroupMessage socket:", error.message);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // EDIT GROUP MESSAGE
    socket.on("editGroupMessage", async ({ messageId, groupId, newText }) => {
        try {
            const senderId = socket.userId;

            const message = await Message.findById(messageId);
            if (!message) {
                return socket.emit("error", { message: "Message not found" });
            }

            if (message.senderId.toString() !== senderId) {
                return socket.emit("error", { message: "You can only edit your own messages" });
            }

            message.text = newText;
            message.isEdited = true;
            await message.save();

            const populatedMessage = await message.populate("senderId", "fullName profilePic");

            // update group's lastMessage only if this was the latest message
            const group = await Group.findById(groupId);
            if (group.lastMessage?.messageId?.toString() === messageId.toString()) {
                group.lastMessage.text = newText;
                await group.save();
            }

            io.to(groupId).emit("groupMessageEdited", populatedMessage);
        } catch (error) {
            console.log("Error in editGroupMessage socket:", error.message);
            socket.emit("error", { message: "Failed to edit message" });
        }
    });

    // DELETE GROUP MESSAGE
    socket.on("deleteGroupMessage", async ({ messageId, groupId }) => {
        try {
            const senderId = socket.userId;

            const message = await Message.findById(messageId);
            if (!message) {
                return socket.emit("error", { message: "Message not found" });
            }

            if (message.senderId.toString() !== senderId) {
                return socket.emit("error", { message: "You can only delete your own messages" });
            }

            await Message.findByIdAndDelete(messageId);

            // update lastMessage since the deleted one might have been the latest
            const latestMessage = await Message.findOne({ groupId }).sort({ createdAt: -1 });

            const newLastMessage = latestMessage
                ? {
                    messageId: latestMessage._id,
                    text: latestMessage.text,
                    image: latestMessage.image,
                    sender: latestMessage.senderId,
                    createdAt: latestMessage.createdAt,
                }
                : null;

            await Group.findByIdAndUpdate(groupId, { lastMessage: newLastMessage });

            io.to(groupId).emit("groupMessageDeleted", { messageId, groupId, newLastMessage });
        } catch (error) {
            console.log("Error in deleteGroupMessage socket:", error.message);
            socket.emit("error", { message: "Failed to delete message" });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})


export { io, server, app };

