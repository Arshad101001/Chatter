import { ChevronRight, XIcon } from 'lucide-react'
import React, { useState } from 'react'
import NewChatPopup from './Newchatpopup';

function PopupOptions({ onClose }) {

    const [showNewChat, setShowNewChat] = useState(false);

    const handleClick = () => {
        setShowNewChat(true);
    }
    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-2xl bg-[#0F141D] border border-white/10 shadow-2xl p-6">
                {/* close button */}
                <div className="flex justify-end items-center mb-2">

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141C2E] text-gray-400 hover:text-white hover:bg-[#1A2440] transition"
                    >
                        <XIcon size={16} />
                    </button>
                </div>
                <div
                    className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#141C2E] border border-white/5 hover:border-blue-500/30 hover:bg-[#1A2440] cursor-pointer transition"
                    onClick={handleClick}
                >

                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Find new user</p>
                    </div>
                    <span className="text-xs text-blue-400 shrink-0"><ChevronRight /></span>


                </div>

                <div
                    className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#141C2E] border border-white/5 hover:border-blue-500/30 hover:bg-[#1A2440] cursor-pointer transition"
                >

                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Create a group</p>
                    </div>
                    <span className="text-xs text-blue-400 shrink-0"><ChevronRight /></span>
                </div>

                {showNewChat && <NewChatPopup onClose={() => setShowNewChat(false)} onParentClose={onClose} />}
            </div>
        </>
    )
}

export default PopupOptions