import React, { useRef, useState } from 'react'
import { LogOutIcon, VolumeOffIcon, Volume2Icon, Plus } from "lucide-react";
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const mouseClickSound = new Audio("/sound/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();

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
          <button className='flex items-center justify-center rounded-full bg-blue-600'>
            <Plus size={45} strokeWidth={1.5} />
          </button>
        </div>

      </div>

    </div>
  );
}

export default ProfileHeader