import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/messageModel.js";
import LastMessage from "../models/lastMessageModel.js";
import User from "../models/userModel.js";

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        await Message.updateMany(
            {
                senderId: userToChatId,
                receiverId: myId,
                isRead: false
            },
            { $set: { isRead: true } }
        );

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        // console.log(email);

        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check id the user searching themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(404).json({ message: "Cannot search yourself" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getLastMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const lastMessages = await LastMessage.find({
            $or: [
                { senderId: myId },
                { receiverId: myId }
            ]
        });
        res.status(200).json(lastMessages);
    } catch (error) {
        console.log("Error in getLastMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        const senderUser = req.user;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send message to yourself." });
        }

        // const receiverExists = await User.exists({ _id: receiverId });
        const receiverUser = await User.findById(receiverId).select("-password");
        if (!receiverUser) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Update or create the last message
        const lastMessage = await LastMessage.findOneAndUpdate(
            {
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            { senderId, receiverId, text, image: imageUrl },
            { new: true, upsert: true }
        );

        const receiverSocketId = getReceiverSocketId(receiverId);
        const senderSocketId = getReceiverSocketId(senderId);

        if (receiverSocketId) {
            // io.to(receiverSocketId).emit("newMessage", newMessage);
            io.to(receiverSocketId).emit("chatUpdated", { newMessage, chatPartner: senderUser })
        }

        if (senderSocketId) {
            io.to(senderSocketId).emit("chatUpdated", { newMessage, chatPartner: receiverUser, });
        }


        res.status(200).json(newMessage);


    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all messages where the logged-in user is either the sender or receiver, sorted by the most recent
        const message = await LastMessage.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        }).sort({ updatedAt: -1 });

        // Get unread message counts for each chat partner
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    receiverId: loggedInUserId,
                    isRead: false
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);

        const unreadMap = new Map(
            unreadCounts.map(item => [item._id.toString(), item.count])
        );

        const chatPartnerIds = [...new Set(
            message.map((msg) => msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
            )
        )];

        const users = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

        const userMap = new Map(
            users.map(user => [user._id.toString(), user])
        );

        const orderedChatPartners = chatPartnerIds.map(id => {
            const user = userMap.get(id);

            return {
                ...user.toObject(),
                unreadCount: unreadMap.get(id) || 0
            };
        });

        res.status(200).json(orderedChatPartners);


    } catch (error) {
        console.log("Error in getPartners: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateReadStatus = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { senderId } = req.params;

        await Message.updateMany(
            {
                senderId: senderId,
                receiverId: loggedInUserId,
                isRead: false
            },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: "Read status updated successfully" });
    } catch (error) {
        console.log("Error in updateReadStatus: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessageByMessageId = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Message.findByIdAndDelete(messageId);

        // Find the new actual last message between these two users
        const newLastMsg = await Message.findOne({
            $or: [
                { senderId: message.senderId, receiverId: message.receiverId },
                { senderId: message.receiverId, receiverId: message.senderId },
            ]
        }).sort({ createdAt: -1 });

        // Update LastMessage document between these two users
        const lastMessageDoc = await LastMessage.findOne({
            $or: [
                { senderId: message.senderId, receiverId: message.receiverId },
                { senderId: message.receiverId, receiverId: message.senderId },
            ]
        });

        if (lastMessageDoc) {
            if (!newLastMsg) {
                lastMessageDoc.text = "";
                lastMessageDoc.image = null;
                lastMessageDoc.senderId = message.senderId;
                lastMessageDoc.receiverId = message.receiverId;
            } else {
                lastMessageDoc.text = newLastMsg.text;
                lastMessageDoc.image = newLastMsg.image;
                lastMessageDoc.senderId = newLastMsg.senderId;
                lastMessageDoc.receiverId = newLastMsg.receiverId;
                lastMessageDoc.updatedAt = newLastMsg.updatedAt;
            }

            await LastMessage.updateOne(
                { _id: lastMessageDoc._id },
                {
                    $set: {
                        text: newLastMsg.text,
                        image: newLastMsg.image,
                        senderId: newLastMsg.senderId,
                        receiverId: newLastMsg.receiverId,
                        updatedAt: newLastMsg.updatedAt,
                    }
                },
                { timestamps: false }
            );

            // Notify the other user in real time
            const otherUserId = message.senderId.toString() === req.user._id.toString()
                ? message.receiverId.toString()
                : message.senderId.toString();

            const receiverSocketId = getReceiverSocketId(otherUserId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("message:deleted", {
                    deletedMessageId: message._id,
                    newLastMessage: newLastMsg || null,
                    conversationWith: req.user._id,
                });
            }
        }

        res.status(200).json({ message: "Message deleted successfully", newLastMessage: newLastMsg || null, });
    } catch (error) {
        console.log("Error in deleteMessageByMessageId: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}