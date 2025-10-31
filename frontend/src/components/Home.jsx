import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast';
import Chat from './Chat';
import { useLocation } from 'react-router-dom';

function Home() {

    const [users, setUsers] = useState([])
    const [recieverEmail, setRecieverEmail] = useState(null)
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:8000/user/fetch", { withCredentials: true, headers: { "Content-Type": "application/json", }, });
                // console.log(response.data);
                setUsers(response.data);

            } catch (error) {
                console.log("Failed to fetch users");

            }
        }

        fetchUsers();
    }, [])

    return (
        <div className='container mx-auto bg-gray-200 flex gap-4 min-h-screen mt-4'>
            <div className='border w-1/3'>
                <ul>
                    {/* <li className='p-5 m-2 border'>User 1</li> */}
                    {
                        users.map(user => (
                            <li key={user._id} onClick={() => setRecieverEmail(user.email)} className='p-5 m-2 cursor-pointer border' >{user.username}</li>
                        ))
                    }
                </ul>
            </div>

            <div className='border w-2/3'>
                <div className='sticky'>
                    {
                        recieverEmail ? <Chat key={recieverEmail} email={email} recieverEmail={recieverEmail} /> : <></>
                    }
                    
                </div>
            </div>
        </div>
    )
}

export default Home