import React, { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from './ChatHeader';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import OutgoingCallScreen from './OutgoingCallScreen';
import IncomingCallScreen from './IncomingCallScreen';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, isCalling, incomingCall, setIncomingCall } = useChatStore();
  // const socket = useAuthStore.getState().socket;
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
  }, [messages, isCalling]);

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
      {
        isCalling ? (

          <OutgoingCallScreen />
        ) : (

          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <ChatHeader />

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 bg-[#0F1728]">

              <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-size-[24px_24px]" />

              <div className="relative w-full">
                {
                  messages.length > 0 && !isMessagesLoading ? (
                    <div className='w-full space-y-4 sm:space-y-6'>
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
                                  <span className="rounded-full border border-white/10 bg-[#141C2E] px-4 py-1 text-xs text-gray-400">
                                    {getDateLabel(msgDate)}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`flex ${msg.senderId === authUser._id
                                  ? "justify-end"
                                  : "justify-start"
                                  }`}
                              >
                                <div
                                  className={`relative max-w-[75%] rounded-[28px] px-6 py-5 shadow-lg 
                              ${msg.senderId === authUser._id ? "ml-auto bg-blue-600 text-white shadow-lg shadow-blue-600/20 rounded-[20px]"
                                      : "bg-[#141C2E] text-white border border-white/5 rounded-[20px]"
                                    }`}
                                >
                                  {msg.image && (
                                    <img
                                      src={msg.image}
                                      alt="Shared"
                                      className="rounded-2xl w-full max-h-72 object-cover"
                                    />
                                  )}

                                  {msg.text && (
                                    <p className="leading-8 text-[16px]">{msg.text}</p>
                                  )}

                                  <p
                                    className={`mt-3 text-xs ${msg.senderId === authUser._id
                                      ? "text-blue-100"
                                      : "text-gray-400"
                                      }`}
                                  >
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
            </div>


            <MessageInput />
          </div>
        )
      }
    </>
  );
}

export default ChatContainer