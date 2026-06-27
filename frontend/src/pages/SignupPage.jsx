import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from 'react-router';

function SignupPage() {
  const [formData, setformData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    signup(formData);
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 w-full">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-700/40 bg-[#161B24] shadow-2xl p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/40">
            <MessageCircleIcon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Create account
          </h1>

          <p className="text-gray-400 mt-3">
            Join Chatter and start the conversation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-slate-400 mb-2">
              Full name
            </label>

            <div className="relative">
              <UserIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setformData({
                    ...formData,
                    fullName: e.target.value,
                  })
                }
                placeholder="Jane Doe"
                className="w-full h-14 rounded-xl bg-[#252B35] border border-slate-700 text-white placeholder:text-slate-500 pl-12 pr-4 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-400 mb-2">
              Email
            </label>

            <div className="relative">
              <MailIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setformData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                className="w-full h-14 rounded-xl bg-[#252B35] border border-slate-700 text-white placeholder:text-slate-500 pl-12 pr-4 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-400 mb-2">
              Password
            </label>

            <div className="relative">
              <LockIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setformData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                placeholder="At least 8 characters"
                className="w-full h-14 rounded-xl bg-[#252B35] border border-slate-700 text-white placeholder:text-slate-500 pl-12 pr-4 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSigningUp}
            className="mt-4 w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition shadow-[0_0_30px_rgba(59,130,246,0.45)] flex items-center justify-center"
          >
            {isSigningUp ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              "Create account →"
            )}
          </button>
        </form>

        {/* Login */}
        <div className="mt-10 text-center text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage