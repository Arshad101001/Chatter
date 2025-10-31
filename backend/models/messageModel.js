const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    senderEmail: { type: String, required: true, },
    receiverEmail: { type: String, required: true, },
    message: { type: String, required: true, },
    timestamp: { type: Date, default: Date.now },
});

const Message = model('message', messageSchema);

module.exports = Message;