import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleton from '../components/UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound';
import { useAuthStore } from '../store/useAuthStore';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, getLastMessages, lastMessages } = useChatStore();
  const socket = useAuthStore.getState().socket;
  const { onlineUsers } = useAuthStore();

  const formatTime = (isoString) => {
    if (!isoString) return "";

    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true // Set to false if you want 24-hour time (e.g., 14:30)
    });
  };

  useEffect(() => {
    getMyChatPartners();
    getLastMessages();
  }, [getMyChatPartners, getLastMessages]);

  const handleChatSelect = (chat) => {
    setSelectedUser(chat);
    socket.emit("sendSocketId", { receiverRoomId: chat._id });
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;
  return (
    <>
      {chats.map((chat) => (
        <button
          key={chat._id}
          onClick={() => handleChatSelect(chat)}
          className={`w-full px-3 py-3 rounded-xl transition-all duration-200 
              ${selectedUser?._id === chat._id ? "bg-[#1A2845] border border-blue-500/30"
              : "hover:bg-[#141C2E]"}`}
        >
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className="h-12 w-12 rounded-full object-cover"
              />

              {onlineUsers.includes(chat._id) && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0C1120] bg-green-400" />
              )}
            </div>

            {/* Name + Preview */}
            <div className="flex-1 overflow-hidden text-left">

              <div className="flex items-center justify-between">

                <h3 className="truncate text-white font-medium">
                  {chat.fullName}
                </h3>

                <span className="text-[11px] text-gray-500 shrink-0">
                  {formatTime(lastMessages.find((msg) => (msg.senderId === chat._id || msg.receiverId === chat._id))?.updatedAt)}
                </span>


              </div>

              <div className="flex items-center justify-between">

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {lastMessages.find((msg) => (msg.senderId === chat._id || msg.receiverId === chat._id))?.text}
                </p>

                <span className={chat.unreadCount > 0 ? "ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white " : "hidden"}>{chat.unreadCount}</span>
              </div>

            </div>

          </div>
        </button>
      ))}
    </>
  )
}

export default ChatsList