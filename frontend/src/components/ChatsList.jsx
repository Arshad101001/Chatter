import React, { useEffect, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleton from '../components/UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound';
import { useAuthStore } from '../store/useAuthStore';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, getLastMessages, lastMessages } = useChatStore();
  const socket = useAuthStore.getState().socket;
  const { onlineUsers } = useAuthStore();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    getMyChatPartners();
    getLastMessages();
  }, [getMyChatPartners, getLastMessages]);

  const handleChatSelect = (chat) => {
    setSelectedUser(chat);
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
                  {getDateLabel(new Date(lastMessages.find((msg) => (msg.senderId === chat._id || msg.receiverId === chat._id))?.updatedAt))}
                </span>


              </div>

              <div className="flex items-center justify-between">

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {(() => {
                    const msg = lastMessages.find((msg) => (msg.senderId === chat._id || msg.receiverId === chat._id));
                    if (!msg) return "Start Chating...";
                    const isMe = msg.senderId !== chat._id;
                    return isMe ? `you: ${msg.text}` : msg.text;
                  })()}
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