import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore';
import { XIcon, PhoneIcon, VideoIcon, MoreVerticalIcon } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore';

function ChatHeader() {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const isOnline = onlineUsers.includes(selectedUser._id);


    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") setSelectedUser(null)
        }


        window.addEventListener("keydown", handleEscKey)

        // cleanup function
        return () => window.removeEventListener("keydown", handleEscKey);

    }, [setSelectedUser]);


    return (
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0C1120] px-6 py-4">

            {/* Left */}
            <div className="flex items-center gap-4">

                <div className="relative">
                    <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt={selectedUser.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                    />

                    {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0C1120] bg-green-400" />
                    )}
                </div>

                <div>
                    <h2 className="text-base font-semibold text-white">{selectedUser.fullName}</h2>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${isOnline ? "text-green-400" : "text-gray-500"}`}>
                            {isOnline ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

                {/* Voice */}
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-400 transition hover:bg-blue-600 hover:text-white hover:border-blue-600">
                    <PhoneIcon size={18} />
                </button>

                {/* Video */}
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-400 transition hover:bg-blue-600 hover:text-white hover:border-blue-600">
                    <VideoIcon size={18} />
                </button>

                {/* More */}
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-400 transition hover:bg-blue-600 hover:text-white hover:border-blue-600">
                    <MoreVerticalIcon size={18} />
                </button>

                {/* Close (mobile) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="ml-2 rounded-full p-2 text-gray-400 transition hover:bg-[#1B2434] hover:text-white md:hidden"
                >
                    <XIcon size={20} />
                </button>

            </div>

        </div>
    );
}

export default ChatHeader