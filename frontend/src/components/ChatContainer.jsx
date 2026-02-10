import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from './ChatHeader';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore()

  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages()

    // clean up
    return () => unsubscribeFromMessages()
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages])

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])


  return (
    <>
      <ChatHeader />

      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-2 sm:px-6 py-4 sm:py-8">
        {
          messages.length > 0 && !isMessagesLoading ? (
            <div className='w-full max-w-3xl mx-auto space-y-4 sm:space-y-6'>
              {
                messages.map((msg) => (
                  <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                    <div className={`chat-bubble relative max-w-[78%] sm:max-w-[70%] wrap-break-word ${msg.senderId === authUser._id ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                      {
                        msg.image && (<img src={msg.image} alt='Shared' className='rounded-lg w-full max-h-60 object-cover' />)
                      }
                      {
                        msg.text && <p className='mt-2 text-sm sm:text-base'>{msg.text}</p>
                      }
                      <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              }
              {/* Scroll target */}
              <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          )
        }
      </div>

      <MessageInput />
    </>
  )
}

export default ChatContainer