import React from 'react'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { useChatStore } from '../store/useChatStore';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ContactList from '../components/ContactList';
import ChatsList from '../components/ChatsList';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ChatContainer from '../components/ChatContainer';
function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  return (
    <div className="relative w-full max-w-6xl h-[800px] ">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className={`w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'} max-md:w-full`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>


      </BorderAnimatedContainer>
    </div>
  )
}

export default ChatPage