import React, { useRef, useState } from 'react'
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const mouseClickSound = new Audio("/sound/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      await updateProfile({ profilePic: base64Image });
    }
  }

  return (
  <div className="border-b border-white/5 px-4 py-4 bg-[#0F141D]">

    {/* Top Row */}
    <div className="flex items-center justify-between">

      {/* Left */}
      <div>
        <p className="text-[10px] tracking-[0.35em] uppercase text-blue-400/70 font-medium">
          Chatter
        </p>

        <h1 className="mt-1 text-xl font-bold text-white">
          Conversations
        </h1>
      </div>

      {/* Right Buttons */}
      <div className="flex gap-2">

        {/* Change Profile Picture */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="relative group h-12 w-12 overflow-hidden rounded-full"
        >
          <img
            src={selectedImg || authUser.profilePic || "./avatar.png"}
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 transition group-hover:opacity-100 flex items-center justify-center text-xs text-white">
            Edit
          </div>
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Sound */}
        <button
          onClick={() => {
            mouseClickSound.currentTime = 0;
            mouseClickSound.play().catch(() => {});
            toggleSound();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-300 transition hover:bg-blue-500 hover:text-white"
        >
          {isSoundEnabled ? (
            <Volume2Icon size={20} />
          ) : (
            <VolumeOffIcon size={20} />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-300 transition hover:bg-red-500 hover:text-white"
        >
          <LogOutIcon size={20} />
        </button>

      </div>

    </div>

  </div>
);
}

export default ProfileHeader