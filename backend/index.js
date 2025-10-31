require('dotenv').config()

const express = require('express');
const path = require('path');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const messageRoute = require('./routes/messageRoute')
const User = require('./models/userModel');
const Message = require('./models/messageModel');

mongoose.connect("mongodb://127.0.0.1:27017/chat-app")
    .then(() => console.log("Database connected successfully..."))
    .catch((err) => console.log("Some error occured while connecting to databse..."));

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
    },
});

// socket.io
io.on('connection', (socket) => {
    console.log('a user connected with id', socket.id);
    socket.emit('connected-user', socket.id);

    socket.on('register', async (email) => {
        console.log(`${email} connected with id ${socket.id}`);
        const user = await User.findOneAndUpdate({email}, {socketId: socket.id}, {new: true});
        console.log(`${email} is updated with id ${socket.id}`);
        
    });

    // socket.on('server-message', (message) => {
    //     console.log("on server ", message);
    //     socket.broadcast.emit('client-message', message);

    // });

    socket.on('direct-message', async (data) => {
        console.log("on server ", data);
        const user = await User.findOne({email: data.recieverEmail});
        if (user) {
            io.to(user.socketId).emit('private-message', {message: data.message, senderEmail: data.senderEmail});
            await Message.create({senderEmail: data.senderEmail, receiverEmail: data.recieverEmail, message: data.message});
        } else {
            console.log("User does not exist");
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected ', socket.id);
    });
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-type", "Authorization"]
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', userRoute);
app.use('/api', messageRoute);

server.listen(8000, () => console.log("Server started at port : 8000"));