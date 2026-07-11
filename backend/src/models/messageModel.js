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
        required: true,
    },

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

}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;


