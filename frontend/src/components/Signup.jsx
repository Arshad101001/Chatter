import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // importing to use toast
import axios from 'axios' // importing to hit https request(get, post etc)

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("")

    const navigateTo = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        try {

            const user = await axios.post("http://localhost:8000/user/signup",
                { username: username, email: email },
                { withCredentials: true, headers: { "Content-Type": "application/json", }, });




            setUsername("");
            setEmail("");
            navigateTo('/login');

            console.log(user.data);
            toast.success(user.data.message || "User registered successfully") // using toast

        } catch (error) {
            // console.log(error.response.data);
            toast.error(error.response.data.message || error.response.data.errors[0] || "Error while registering user") // using toast
        }
    }
    return (
        <div>
            <div>
                <div className='flex h-screen items-center justify-center bg-gray-100'>
                    <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
                        <h2 className='text-2xl font-semibold mb-5 text-center'>Signup</h2>
                        <form onSubmit={handleRegister}>
                            {/* username */}
                            <div className='mb-4'>
                                <label className='block mb-2 font-semibold' htmlFor="">Username</label>
                                <input
                                    className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500'
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder='Enter Username'
                                />
                            </div>

                            {/* email */}
                            <div className='mb-4'>
                                <label className='block mb-2 font-semibold' htmlFor="">Email</label>
                                <input
                                    className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500'
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter Email'
                                />
                            </div>

                            <button type='submit' className='w-full bg-blue-600 text-white hover:bg-blue-900 duration-300 rounded-xl font-semibold p-3'>Signup</button>
                            <p className='mt-4 text-center text-gray-600'>Already have an account? <Link to="/login" className='text-blue-600 hover:underline'>Login</Link> </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup