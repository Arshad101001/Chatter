import { useState, useEffect, useRef } from "react";
import { XIcon, SearchIcon, LoaderIcon, UserIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios"; // adjust path if different

function NewChatPopup({ onClose }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [foundUser, setFoundUser] = useState(null);

    const { setSelectedUser } = useChatStore();
    const inputRef = useRef(null);

    // Auto focus input when popup opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const handleSearch = async () => {
        if (!email.trim()) return;

        setIsLoading(true);
        setError(null);
        setFoundUser(null);

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError("Invalid Email format");
                return;
            }
            const res = await axiosInstance.get(`/messages/find-by-email/${email.trim()}`);
            setFoundUser(res.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("No user found with this email.");
                
            } else {
                setError("Something went wrong. Try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChat = () => {
        if (!foundUser) return;
        setSelectedUser(foundUser);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-2xl bg-[#0F141D] border border-white/10 shadow-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-white font-semibold text-base">New Conversation</h2>
                        <p className="text-gray-500 text-xs mt-0.5">Find someone by their email</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141C2E] text-gray-400 hover:text-white hover:bg-[#1A2440] transition"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 rounded-xl bg-[#141C2E] border border-white/5 px-4 py-3 focus-within:border-blue-500/50 transition">
                        <SearchIcon className="h-4 w-4 text-gray-500 shrink-0" />
                        <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(null);
                                setFoundUser(null);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter email address..."
                            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !email.trim()}
                        className="px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoaderIcon size={16} className="animate-spin" /> : "Search"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <p className="mt-3 text-xs text-red-400">{error}</p>
                )}

                {/* Found user */}
                {foundUser && (
                    <div
                        onClick={handleOpenChat}
                        className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#141C2E] border border-white/5 hover:border-blue-500/30 hover:bg-[#1A2440] cursor-pointer transition"
                    >
                        <div className="relative h-10 w-10 shrink-0">
                            {foundUser.profilePic ? (
                                <img
                                    src={foundUser.profilePic}
                                    alt={foundUser.fullName}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-blue-600/20 flex items-center justify-center">
                                    <UserIcon size={18} className="text-blue-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{foundUser.fullName}</p>
                            <p className="text-gray-500 text-xs truncate">{foundUser.email}</p>
                        </div>
                        <span className="text-xs text-blue-400 shrink-0">Open chat →</span>
                    </div>
                )}

            </div>
        </>
    );
}

export default NewChatPopup;