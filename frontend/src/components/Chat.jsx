import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";

const socket = io("http://localhost:8000", { autoConnect: false })
function Chat({ email, recieverEmail }) {
    const [message, setMessage] = useState("")
    const [chats, setChats] = useState([])

    const navigateTo = useNavigate();

    const sendMessage = () => {
        // console.log(message);
        // console.log("in if part");
        socket.emit("direct-message", { message, recieverEmail, senderEmail: email });

    };
    useEffect(() => {
        // console.log("Chat rendered");
        
        socket.connect();
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
        socket.emit('register', email);

        const fetchMessages = async () => {
            const message = await axios.get(`http://localhost:8000/api/fetchMessage?sender=${email}&receiver=${recieverEmail}`, { withCredentials: true, headers: { "Content-Type": "application/json", }, });
            // console.log(message.data);
            
            setChats(message.data)
        }
        fetchMessages();

        // socket.on('client-message', (message) => {
        //     console.log(message);
        //     setChats((prev) => [...prev, message]);
        // });

        socket.on('private-message', (message) => {
            console.log(message);
            setChats((prev) => [...prev, message]);
        })
    }, [])

    const logout = async () => {
        try {
            await axios.get("http://localhost:8000/user/logout", { withCredentials: true });
            toast.success("user logged out successfully");
            localStorage.removeItem('jwt');
            navigateTo('/login');
        } catch (error) {
            console.log(error);

            toast.error("Error while logging out")
        }
    }

    return (
        <>
            <div className='flex gap-5'>
                {/* <li>user id</li> */}
                {/* {
                    userIds.map(userId => (
                        <li key={userId}>user id : {userId}</li>
                    ))
                } */}

            </div>
            <div className='border h-screen'>

                <div className="container mx-auto mt-6" id="messages">
                    {/* <input type="text" id="1" aria-label="disabled input"
                        className="mb-6 border border-gray-300 odd:bg-gray-800 even:bg-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-text dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value="This is a message" disabled /> */}

                    {
                        chats.map(chat => (
                            <input key={chat._id} type="text" id={chat._id} aria-label="disabled input"
                                className="mb-6 border border-gray-300 odd:bg-gray-800 even:bg-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-text dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={chat.message} disabled />
                        ))
                    }
                </div>

                <div className="mx-auto fixed w-6/12 top-9/12">

                    <form action="" id="form">
                        <div className="mb-6 flex justify-center gap-4 ">
                            <input
                                type="text"
                                id="message"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />

                            <button
                                type="submit"
                                id="sendBtn"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                onClick={() => sendMessage()}
                            >Send</button>

                            <button type="button" id="connectionBtn" onClick={() => logout()}
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Logout</button>
                        </div>
                    </form>
                </div>
                <script src="/socket.io/socket.io.js"></script>
            </div>
        </>

    )
}

export default Chat