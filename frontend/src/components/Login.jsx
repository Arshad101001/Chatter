import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("")

    const navigateTo = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        try {

            const user = await axios.post("http://localhost:8000/user/login",
                { email: email },
                { withCredentials: true, headers: { "Content-Type": "application/json", }, });

            // console.log(user.data);
            localStorage.setItem('jwt', user.data.token)
            setEmail("");
            toast.success(user.data.message || "User Logged in successfully") // using toast
            navigateTo('/', {state: {email}});

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
                        <h2 className='text-2xl font-semibold mb-5 text-center'>Login</h2>
                        <form onSubmit={handleRegister}>
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
                            <p className='mt-4 text-center text-gray-600'>Dont't have an account? <Link to="/signup" className='text-blue-600 hover:underline'>Signup</Link> </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login