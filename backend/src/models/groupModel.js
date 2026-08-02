import mongoose from "mongoose";

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },

    groupImage: {
        type: String,
        default: "",
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],

    admin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    lastMessage: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        text: { type: String },
        image: { type: String },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date },
    },
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);

export default Group;