import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { MessageCircleIcon, LockIcon, MailIcon, LoaderIcon } from "lucide-react";
import { Link } from 'react-router';

function LoginPage() {
  const [formData, setformData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(formData);
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 w-full">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#171B24]/90 backdrop-blur-xl p-10 shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/40">
            <MessageCircleIcon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Welcome back
          </h1>

          <p className="mt-3 text-gray-400">
            Sign in to continue your conversations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email
            </label>

            <div className="flex items-center rounded-2xl border border-white/10 bg-[#242B35] px-4 h-14 focus-within:border-blue-500">

              <MailIcon className="h-5 w-5 text-gray-400" />

              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setformData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <div className="flex items-center rounded-2xl border border-white/10 bg-[#242B35] px-4 h-14 focus-within:border-blue-500">

              <LockIcon className="h-5 w-5 text-gray-400" />

              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setformData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-4 w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition shadow-[0_0_30px_rgba(59,130,246,0.45)] flex items-center justify-center"
          >
            {isLoggingIn ? (
              <LoaderIcon className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage