import React, { useCallback, useEffect, useRef, useState } from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { useChatStore } from '../store/useChatStore';
import ProfileHeader from '../components/ProfileHeader';
import ChatsList from '../components/ChatsList';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ChatContainer from '../components/ChatContainer';
import { MessageCircleIcon, MessagesSquareIcon, UsersIcon, BellIcon, SettingsIcon, SearchIcon, LogOutIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import IncomingCallScreen from '../components/IncomingCallScreen';
import { Link } from 'react-router';
import SearchChatPartner from '../components/SearchChatPartner';

function ChatPage() {
  const { activeTab, selectedUser, isCalling, incomingCall, setIncomingCall } = useChatStore();
  const { logout, authUser, updateProfile } = useAuthStore();

  const socket = useAuthStore.getState().socket;

  const [selectedImg, setSelectedImg] = useState(null);
  const [activeIcon, setActiveIcon] = useState("chats");

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

  const handleIncomingCall = useCallback(async ({ from, fromUserId, callType, callerName, callerPic, offer }) => {
    const { isCalling, incomingCall } = useChatStore.getState();

    if (isCalling == true || incomingCall != null) {
      socket.emit("call:busy", { msg: "Busy on other call...", to: fromUserId });
    } else {

      setIncomingCall({
        socketId: from,
        userId: fromUserId,
        callType,
        fullName: callerName,
        profilePic: callerPic,
        offer,
      });
    }
  }, []);

  const handleProfileUpdated = useCallback(async ({ updatedUser }) => {
    useChatStore.getState().updateUserInList(updatedUser);

    const { selectedUser } = useChatStore.getState();
    if (selectedUser?._id === updatedUser._id) {
      useChatStore.getState().setSelectedUser(updatedUser);
    }
  }, []);

  const handleMessageEdited = useCallback(({ updatedMessage, isLastMessage, conversationWith }) => {
    const { messages, selectedUser } = useChatStore.getState();

    // Update message in current chat if open
    if (selectedUser?._id === conversationWith.toString()) {
      const updatedMessages = messages.map((msg) =>
        msg._id === updatedMessage._id ?
          { ...msg, text: updatedMessage.text, image: updatedMessage.image, isEdited: true } : msg
      );
      useChatStore.setState({ messages: updatedMessages });
    }

    // Update lastMessages if it was the last message
    if (isLastMessage) {
      const updatedLastMessages = useChatStore.getState().lastMessages.map((msg) => {
        if (msg.senderId === conversationWith.toString() || msg.receiverId === conversationWith.toString()) {
          return {
            ...msg,
            text: updatedMessage.text,
            image: updatedMessage.image,
            isEdited: true,
            updatedAt: updatedMessage.updatedAt,
          };
        }
        return msg;
      });
      useChatStore.setState({ lastMessages: updatedLastMessages });
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { roomId: useAuthStore.getState().authUser._id });
  }, [socket]);

  useEffect(() => {
    socket.on("incoming:call", handleIncomingCall);
    socket.on("profile:updated", handleProfileUpdated);
    socket.on("message:edited", handleMessageEdited);

    return () => {
      socket.off("incoming:call", handleIncomingCall);
      socket.off("profile:updated", handleProfileUpdated);
      socket.off("message:edited", handleMessageEdited);
    }
  }, [handleIncomingCall, handleProfileUpdated, handleMessageEdited, socket]);

  return (
    <div className="h-full w-full bg-[#080D15] flex">
      <div className="pointer-events-none fixed top-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-blue-600/5 blur-[100px]" />
      {/* Icon Rail - far left narrow strip */}
      <div className="hidden md:flex w-16 bg-[#080D15] border-r border-white/5 flex-col items-center py-5 gap-5 shrink-0">

        {/* Brand Icon */}
        <Link to="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600">
            <MessageCircleIcon className="h-5 w-5 text-white" />
          </div>
        </Link>

        {/* Chat icon */}
        <button
          onClick={() => setActiveIcon("chats")}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${activeIcon === "chats"
            ? "bg-[#1A2440] text-blue-400"
            : "text-gray-500 hover:bg-[#1A2440] hover:text-gray-300"
            }`}
        >
          <MessagesSquareIcon className="h-5 w-5" />
        </button>

        {/* Contacts icon */}
        <button
          onClick={() => setActiveIcon("contacts")}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${activeIcon === "contacts"
            ? "bg-[#1A2440] text-blue-400"
            : "text-gray-500 hover:bg-[#1A2440] hover:text-gray-300"
            }`}
        >
          <UsersIcon className="h-5 w-5" />
        </button>

        {/* Bell icon */}
        <button
          onClick={() => setActiveIcon("notifications")}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${activeIcon === "notifications"
            ? "bg-[#1A2440] text-blue-400"
            : "text-gray-500 hover:bg-[#1A2440] hover:text-gray-300"
            }`}
        >
          <BellIcon className="h-5 w-5" />
        </button>

        <div className="mt-auto gap-3 flex flex-col items-center">
          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-300 transition hover:bg-red-500 hover:text-white"
          >
            <LogOutIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveIcon("settings")}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${activeIcon === "settings"
              ? "bg-[#1A2440] text-blue-400"
              : "text-gray-500 hover:bg-[#1A2440] hover:text-gray-300"
              }`}
          >
            <SettingsIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="relative group h-10 w-10 overflow-hidden rounded-full"
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
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[350px] bg-[#0C1120] border-r border-white/5 flex flex-col shrink-0">
        <ProfileHeader />
        {/* Search bar */}
        <div className="px-4 pb-3 mt-5">
          <SearchChatPartner />
        </div>
        <ChatsList />
      </div>

      {/* Main area */}
      <>
        {incomingCall != null ? (
          <IncomingCallScreen />
        ) : activeIcon === "chats" ? (
          <div className="flex-1 flex flex-col bg-[#0F1728] min-w-0 min-h-0 overflow-hidden">
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0F1728] min-w-0 min-h-0 overflow-hidden gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#141C2E] border border-white/5">
              {activeIcon === "contacts" && <UsersIcon className="h-7 w-7 text-blue-400" />}
              {activeIcon === "notifications" && <BellIcon className="h-7 w-7 text-blue-400" />}
              {activeIcon === "settings" && <SettingsIcon className="h-7 w-7 text-blue-400" />}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg capitalize">
                {activeIcon === "contacts" && "Contacts"}
                {activeIcon === "notifications" && "Notifications"}
                {activeIcon === "settings" && "Settings"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Coming in a future update</p>
            </div>
            <div className="mt-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20">
              <p className="text-blue-400 text-xs font-medium">🚧 Under Construction</p>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

export default ChatPage