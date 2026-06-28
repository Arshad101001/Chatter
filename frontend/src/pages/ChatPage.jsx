import React from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { useChatStore } from '../store/useChatStore';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ContactList from '../components/ContactList';
import ChatsList from '../components/ChatsList';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ChatContainer from '../components/ChatContainer';
import { MessageCircleIcon, MessagesSquareIcon, UsersIcon, BellIcon, SettingsIcon, SearchIcon } from 'lucide-react';

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  return (
    <div className="h-full w-full bg-[#080D15] flex">
      <div className="pointer-events-none fixed top-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-blue-600/5 blur-[100px]" />
      {/* Icon Rail - far left narrow strip */}
      <div className="w-16 bg-[#080D15] border-r border-white/5 flex flex-col items-center py-5 gap-5 shrink-0">
        {/* Brand Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600">
          <MessageCircleIcon className="h-5 w-5 text-white" />
        </div>
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
        {/* Settings at bottom */}
        <div className="mt-auto">
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-500 hover:bg-[#1A2440] hover:text-gray-300 transition">
            <SettingsIcon className="h-5 w-5" />
          </button>
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
      <div className="flex-1 flex flex-col bg-[#0F1728] min-w-0 min-h-0 overflow-hidden">
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </div>
    </div>
  );
}

export default ChatPage