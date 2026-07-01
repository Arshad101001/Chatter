import React, { useCallback, useEffect, useRef, useState } from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { useChatStore } from '../store/useChatStore';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ContactList from '../components/ContactList';
import ChatsList from '../components/ChatsList';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ChatContainer from '../components/ChatContainer';
import { MessageCircleIcon, MessagesSquareIcon, UsersIcon, BellIcon, SettingsIcon, SearchIcon, LogOutIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import IncomingCallScreen from '../components/IncomingCallScreen';
import { Link } from 'react-router';

function ChatPage() {
  const { activeTab, selectedUser, isCalling, incomingCall, setIncomingCall } = useChatStore();
  const { logout, authUser, updateProfile } = useAuthStore();

  const socket = useAuthStore.getState().socket;

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


  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { roomId: useAuthStore.getState().authUser._id });
  }, [socket]);

  useEffect(() => {
    socket.on("incoming:call", handleIncomingCall)

    return () => {
      socket.off("incoming:call", handleIncomingCall)
    }
  }, [handleIncomingCall, socket]);

  return (
    <div className="h-full w-full bg-[#080D15] flex">
      <div className="pointer-events-none fixed top-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-blue-600/5 blur-[100px]" />
      {/* Icon Rail - far left narrow strip */}
      <div className="w-16 bg-[#080D15] border-r border-white/5 flex flex-col items-center py-5 gap-5 shrink-0">

        {/* Brand Icon */}
        <Link to="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600">
            <MessageCircleIcon className="h-5 w-5 text-white" />
          </div>
        </Link>

        {/* Chat icon (active) */}
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1A2440] text-blue-400">
          <MessagesSquareIcon className="h-5 w-5" />  {/* use MessagesSquareIcon from lucide */}
        </button>

        {/* Contacts icon */}
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-500 hover:bg-[#1A2440] hover:text-gray-300 transition">
          <UsersIcon className="h-5 w-5" />
        </button>

        {/* Bell icon */}
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-500 hover:bg-[#1A2440] hover:text-gray-300 transition">
          <BellIcon className="h-5 w-5" />
        </button>



        <div className="mt-auto gap-3 flex flex-col items-center">

          {/* Logout */}
          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141C2E] border border-white/5 text-gray-300 transition hover:bg-red-500 hover:text-white"
          >
            <LogOutIcon className="h-5 w-5" />
          </button>

          {/* Settings at bottom */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-[#1A2440] hover:text-gray-300 transition">
            <SettingsIcon className="h-6 w-6" />
          </button>

          {/* Change Profile Picture */}
          <div className='rounded-full h-12 w-12 flex items-center justify-center'>
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
      </div>

      {/* Sidebar */}
      <div className="w-[350px] bg-[#0C1120] border-r border-white/5 flex flex-col shrink-0">
        <ProfileHeader />
        {/* Search bar */}
        <div className="px-4 pb-3 mt-5">
          <div className="flex items-center gap-2 rounded-xl bg-[#141C2E] border border-white/5 px-4 py-2.5">
            <SearchIcon className="h-4 w-4 text-gray-500 shrink-0" />
            <input
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
        <ActiveTabSwitch />
        <div className="flex-1 overflow-y-auto px-2">
          {activeTab === "chats" ? <ChatsList /> : <ContactList />}
        </div>
      </div>

      {/* Main area */}
      <>
        {
          incomingCall != null ? (
            <IncomingCallScreen />
          ) : (
            <div className="flex-1 flex flex-col bg-[#0F1728] min-w-0 min-h-0 overflow-hidden">
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          )
        }
      </>
    </div>
  );
}

export default ChatPage