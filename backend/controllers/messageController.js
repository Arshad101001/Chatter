const Message = require('../models/messageModel');

const fetchMessage = async (req, res) => {
    const {sender, receiver} = req.query;
    const message = await Message.find({
        $or: [
            {senderEmail: sender, receiverEmail: receiver},
            {senderEmail: receiver, receiverEmail: sender}
        ]
    }).sort({timestamp: 1});
    res.json(message);
}

module.exports = {
    fetchMessage,
}