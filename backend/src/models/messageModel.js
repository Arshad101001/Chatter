import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },

    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: null,
    },

    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    }],

    text: {
        type: String,
        trim: true,
        maxlength: 2000,
    },

    image: {
        type: String,
    },

    isRead: {
        type: Boolean,
        default: false,
    },

    isEdited: {
        type: Boolean,
        default: false,
    },

    replyTo: {
        _id: { type: mongoose.Schema.Types.ObjectId },
        text: { type: String },
        image: { type: String },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

}, { timestamps: true });

messageSchema.index({ groupId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;


