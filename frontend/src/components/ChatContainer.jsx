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

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <ChatHeader />

      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-2 sm:px-6 py-4 sm:py-8">
        {
          messages.length > 0 && !isMessagesLoading ? (
            <div className='w-full max-w-3xl mx-auto space-y-4 sm:space-y-6'>
              {
                messages.map((msg, index) => {
                  const msgDate = new Date(msg.createdAt);
                  const prevMsg = messages[index - 1];
                  const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

                  const showDateSeparator = !prevDate || !isSameDay(msgDate, prevDate);

                  return (
                    <React.Fragment key={msg._id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-slate-700/60 text-slate-200">
                            {getDateLabel(msgDate)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"
                          }`}
                      >
                        <div
                          className={`chat-bubble relative max-w-[78%] sm:max-w-[70%] wrap-break-word ${msg.senderId === authUser._id
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-800 text-slate-200"
                            }`}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Shared"
                              className="rounded-lg w-full max-h-60 object-cover"
                            />
                          )}

                          {msg.text && (
                            <p className="mt-2 text-sm sm:text-base">{msg.text}</p>
                          )}

                          <p className="text-xs mt-1 opacity-75">
                            {msgDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })

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