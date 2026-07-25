import { getSocketIdByUserId } from "../lib/socket.js";
import Group from "../models/groupModel.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
    try {
        const { name, members, groupImage } = req.body;
        const createdBy = req.user._id;

        if (!name || !members || members.length < 1) {
            return res.status(400).json({ message: "Name and at least 1 member required" });
        }

        let imageUrl = "";
        if (groupImage) {
            const uploadResponse = await cloudinary.uploader.upload(groupImage);
            imageUrl = uploadResponse.secure_url;
        }

        const uniqueMembers = [...new Set([...members, createdBy.toString()])];

        const newGroup = await Group.create({
            name,
            groupImage: imageUrl,
            members: uniqueMembers,
            admin: [createdBy],
            createdBy,
        });

        const populatedGroup = await newGroup.populate("members admin", "username profilePic email");

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.log("Error in createGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate("members", "username profilePic email")
            .populate("admin", "username profilePic email")
            .populate("createdBy", "username profilePic email");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in getGroupById:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate("members", "fullName profilePic")
            .sort({ "lastMessage.createdAt": -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (!group.admin.some(id => id.toString() === requesterId.toString())) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        if (group.members.some(id => id.toString() === userId)) {
            return res.status(400).json({ message: "User already in group" });
        }

        group.members.push(userId);
        await group.save();

        const populatedGroup = await group.populate("members", "username profilePic email");

        const memberSocketId = getSocketIdByUserId(userId);
        if (memberSocketId) {
            const memberSocket = io.sockets.sockets.get(memberSocketId);
            if (memberSocket) {
                memberSocket.join(groupId);
                io.to(memberSocketId).emit("addedToGroup", populatedGroup); // notify their client too
            }
        }

        res.status(200).json(populatedGroup);
    } catch (error) {
        console.log("Error in addMember:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (!group.admin.some(id => id.toString() === requesterId.toString())) {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        group.members = group.members.filter(id => id.toString() !== userId);
        group.admin = group.admin.filter(id => id.toString() !== userId);

        await group.save();

        const memberSocketId = getSocketIdByUserId(userId);
        if (memberSocketId) {
            const memberSocket = io.sockets.sockets.get(memberSocketId);
            if (memberSocket) {
                memberSocket.leave(groupId);
                io.to(memberSocketId).emit("removedFromGroup", { groupId }); // notify their client
            }
        }

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in removeMember:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const renameGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (!group.admin.some(id => id.toString() === requesterId.toString())) {
            return res.status(403).json({ message: "Only admins can rename group" });
        }

        group.name = name;
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in renameGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        group.members = group.members.filter(id => id.toString() !== userId.toString());
        group.admin = group.admin.filter(id => id.toString() !== userId.toString());

        await group.save();

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.log("Error in leaveGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};