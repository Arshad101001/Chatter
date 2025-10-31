const {createHmac, randomBytes} = require('crypto'); // for hashing
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {type: String, required: true,},
    email: {type: String, required: true, unique: true, },
    socketId: {type: String, },
});


const User = model('user', userSchema);

module.exports = User;