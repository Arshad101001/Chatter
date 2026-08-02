import React, { useEffect, useMemo } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleton from '../components/UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound';
import { useAuthStore } from '../store/useAuthStore';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, getLastMessages, lastMessages, getMyGroups, groups, setSelectedGroup, selectedGroup } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  useEffect(() => {
    getMyChatPartners();
    getLastMessages();
    getMyGroups();
  }, [getMyChatPartners, getLastMessages, getMyGroups]);

  // Build one unified, sorted list
  const combinedList = useMemo(() => {
    const chatItems = chats.map((chat) => {
      const msg = lastMessages.find((m) => m.senderId === chat._id || m.receiverId === chat._id);
      return {
        type: "chat",
        id: chat._id,
        data: chat,
        lastMessageTime: msg?.updatedAt ? new Date(msg.updatedAt) : new Date(0),
        lastMessageText: msg
          ? (msg.sender !== chat._id ? `you: ${msg.text}` : msg.text)
          : "Start Chating...",
      };
    });

    const groupItems = groups.map((group) => {
      const lastSenderId = group.lastMessage?.sender;
      const isMe = lastSenderId === authUser._id;
      const senderName = isMe
        ? "You"
        : group.members?.find((m) => m._id === lastSenderId)?.fullName;


      return {
        type: "group",
        id: group._id,
        data: group,
        lastMessageTime: group.lastMessage?.createdAt ? new Date(group.lastMessage.createdAt) : new Date(0),
        lastMessageText: group.lastMessage
          ? `${senderName}: ${group.lastMessage.text || "📷 Image"}`
          : "No messages yet",
      };
    });

    return [...chatItems, ...groupItems].sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );
  }, [chats, groups, lastMessages, authUser]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (combinedList.length === 0) return <NoChatsFound />;

  return (
    <>
      {combinedList.map((item) => {
        if (item.type === "group") {
          const group = item.data;

          return (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full px-3 py-3 rounded-xl transition-all duration-200 
                  ${selectedGroup?._id === group._id ? "bg-[#1A2845] border border-blue-500/30" : "hover:bg-[#141C2E]"}`}
            >
              <div className="flex items-center gap-4">
                <img src={group.groupImage || "/avatar.png"} alt={group.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1 overflow-hidden text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-white font-medium">{group.name}</h3>
                    {group.lastMessage?.createdAt && (
                      <span className="text-[11px] text-gray-500 shrink-0">
                        {getDateLabel(new Date(group.lastMessage.createdAt))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="mt-0.5 truncate text-xs text-gray-500">{item.lastMessageText}</p>
                    <span className={group.unreadCount > 0 ? "ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white " : "hidden"}>
                      {group.unreadCount}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        }

        const chat = item.data;
        return (
          <button
            key={chat._id}
            onClick={() => setSelectedUser(chat)}
            className={`w-full px-3 py-3 rounded-xl transition-all duration-200 
                ${selectedUser?._id === chat._id ? "bg-[#1A2845] border border-blue-500/30" : "hover:bg-[#141C2E]"}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="h-12 w-12 rounded-full object-cover" />
                {onlineUsers.includes(chat._id) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0C1120] bg-green-400" />
                )}
              </div>

              <div className="flex-1 overflow-hidden text-left">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-white font-medium">{chat.fullName}</h3>
                  <span className="text-[11px] text-gray-500 shrink-0">
                    {item.lastMessageTime.getTime() > 0 ? getDateLabel(item.lastMessageTime) : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="mt-0.5 truncate text-xs text-gray-500">{item.lastMessageText}</p>
                  <span className={chat.unreadCount > 0 ? "ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white " : "hidden"}>
                    {chat.unreadCount}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </>
  )
}

export default ChatsList