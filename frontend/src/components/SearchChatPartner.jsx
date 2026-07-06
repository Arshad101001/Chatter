import React, { useEffect, useRef, useState } from 'react'
import { SearchIcon, UserIcon } from 'lucide-react'
import { useChatStore } from '../store/useChatStore';

function SearchChatPartner() {
    const [userName, setUserName] = useState("");
    const [users, setUsers] = useState(null);
    const { chats, setSelectedUser } = useChatStore();
    const searchRef = useRef(null);

    useEffect(() => {
        if (!userName.trim()) return;
        const users = chats.filter((chat) => { return chat.fullName.toLowerCase().includes(userName.toLowerCase()) })
        setUsers(users);
    }, [userName])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setUsers(null);
                setUserName("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])


    return (
        <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2 rounded-xl bg-[#141C2E] border border-white/5 px-4 py-2.5">
                <SearchIcon className="h-4 w-4 text-gray-500 shrink-0" />
                <input
                    placeholder="Search conversations..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
            </div>

            <div className="absolute left-0 right-0 top-full mt-1 bg-[#0C1120] border border-white/5 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
                {users && users.length > 0 && users.map((user) => (
                    <div
                        key={user._id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1A2440] cursor-pointer transition"
                        onClick={() => {
                            setSelectedUser(user);
                            setUsers(null);
                            setUserName("");
                        }}
                    >
                        <div className="relative h-10 w-10 shrink-0">
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.fullName}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-blue-600/20 flex items-center justify-center">
                                    <UserIcon size={18} className="text-blue-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.fullName}</p>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                        <span className="text-xs text-blue-400 shrink-0">Open chat →</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SearchChatPartner