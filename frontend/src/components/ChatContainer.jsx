import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from './ChatHeader';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import OutgoingCallScreen from './OutgoingCallScreen';
import IncomingCallScreen from './IncomingCallScreen';
import { Check, CheckCheck, PencilIcon, ReplyIcon, Trash2Icon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, isCalling, incomingCall, setIncomingCall, isTyping, setReplyTo, selectedGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages, markGroupMessagesSeen } = useChatStore();
  const socket = useAuthStore.getState().socket;
  const { authUser } = useAuthStore()

  const messageEndRef = useRef(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      markGroupMessagesSeen(selectedGroup._id);
      subscribeToGroupMessages();
      return () => unsubscribeFromGroupMessages();
    } else if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, selectedGroup, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages, markGroupMessagesSeen]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isCalling, isTyping]);

  const handleReadMessage = useCallback((messagePartnerId) => {
    if (selectedUser?._id === messagePartnerId.messagePartnerId) {
      const updatedMessage = messages.map((msg) => {
        if (msg.senderId === authUser._id) return { ...msg, isRead: true }
        return msg;
      })

      useChatStore.setState({ messages: updatedMessage });
    }
  }, [messages])

  const handleDeleteMessage = async (message) => {
    const updatedMessages = messages.filter(msg => msg._id !== message._id);
    useChatStore.setState({ messages: updatedMessages });

    const isLastMessage = messages.at(-1)?._id === message._id;

    try {
      const res = await axiosInstance.delete(`/messages/delete-message/${message._id}`);

      if (res.status === 200) {
        toast.success("Message deleted successfully!");

        if (isLastMessage) {
          const newLastMsg = res.data.newLastMessage;
          const receiverId = message.senderId === authUser._id
            ? message.receiverId
            : message.senderId;

          const updatedLastMessages = useChatStore.getState().lastMessages.map((msg) => {
            if (msg.receiverId === receiverId || msg.senderId === receiverId) {
              if (!newLastMsg) return { ...msg, text: "", image: null };
              return {
                ...msg,
                text: newLastMsg.text,
                senderId: newLastMsg.senderId,
                receiverId: newLastMsg.receiverId,
                isRead: newLastMsg.isRead,
                image: newLastMsg.image,
                updatedAt: newLastMsg.updatedAt,
              };
            }
            return msg;
          });

          useChatStore.setState({ lastMessages: updatedLastMessages });
        }
      }
    } catch (error) {
      toast.error("Error while deleting the message");
    }
  }

  const handleEditMessage = (message) => {
    setMessage(message);
  }

  useEffect(() => {
    socket.on("read-message", handleReadMessage);

    return () => {
      socket.off("read-message", handleReadMessage);
    }
  }, [handleReadMessage, socket])

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
                          const isMe = msg.senderId._id === authUser._id || msg.senderId === authUser._id;
                          const msgDate = new Date(msg.createdAt);
                          const prevMsg = messages[index - 1];
                          const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

                          const showDateSeparator = !prevDate || !isSameDay(msgDate, prevDate);

                          return (
                            <React.Fragment key={msg._id}>
                              {showDateSeparator && (
                                <div className="flex justify-center my-2">
                                  <span className="rounded-full border border-white/10 bg-[#141C2E] px-4 py-1 text-xs text-gray-400">
                                    {getDateLabel(msgDate)}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`flex my-4 ${isMe ? "justify-end" : "justify-start"}`}
                              >
                                <div className="flex flex-col max-w-[75%]">
                                  {
                                    selectedGroup && !isMe && (
                                      <div className="text-xs text-gray-500 mb-2">
                                        {msg.senderId?.fullName || "Unknown"}
                                      </div>
                                    )
                                  }
                                  <div
                                    className={`relative rounded-2xl px-3 py-2 shadow-lg group
                                        ${isMe
                                        ? "ml-auto bg-blue-600 text-white shadow-lg shadow-blue-600/20 rounded-[20px]"
                                        : "bg-[#141C2E] text-white border border-white/5 rounded-[20px]"}
                                    `}
                                  >
                                    {msg.image && (
                                      <img
                                        src={msg.image}
                                        alt="Shared"
                                        className="rounded-2xl w-full max-h-72 object-cover"
                                      />
                                    )}

                                    {msg.replyTo && (
                                      <div className={`mb-2 px-3 py-2 rounded-xl border-l-2 border-blue-400 text-xs ${isMe
                                        ? "bg-blue-700/40 text-blue-100"
                                        : "bg-[#1A2440] text-gray-400"
                                        }`}>
                                        <p className="font-semibold text-blue-300 mb-0.5">
                                          {msg.replyTo.senderId === authUser._id ? "You" : selectedUser?.fullName}
                                        </p>
                                        {msg.replyTo.image && !msg.replyTo.text && (
                                          <p className="italic">📷 Image</p>
                                        )}
                                        {msg.replyTo.text && (
                                          <p className="truncate max-w-[200px]">{msg.replyTo.text}</p>
                                        )}
                                      </div>
                                    )}

                                    {msg.text && (
                                      <p className="leading-5 text-[16px]">{msg.text}</p>
                                    )}

                                    <p
                                      className={`flex gap-2 mt-1 text-xs ${isMe
                                        ? "text-blue-100 justify-end" : "text-gray-400 justify-start"}`
                                      }
                                    >
                                      {
                                        msg.isEdited && "Edited "
                                      }
                                      {msgDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                      {
                                        isMe && (
                                          msg.isRead ? <CheckCheck className='h-4 w-4' /> : <Check className='h-4 w-4' />
                                        )
                                      }
                                    </p>

                                    {/* Hover actions */}

                                    <div className="absolute -bottom-7 right-0 hidden group-hover:flex items-center gap-1  rounded-xl px-1 py-1 z-10">
                                      {isMe && (
                                        <>
                                          <button
                                            onClick={() => { handleDeleteMessage(msg) }}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-white hover:text-red-400 transition text-xs"
                                          >
                                            <Trash2Icon size={15} />

                                          </button>

                                          <button
                                            onClick={() => { handleEditMessage(msg) }}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-white hover:text-blue-500 transition text-xs"
                                          >
                                            <PencilIcon size={15} />

                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => setReplyTo(msg)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-white hover:text-blue-500 transition text-xs"
                                      >
                                        <ReplyIcon size={15} />

                                      </button>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })

                      }

                      {/* show typing when other user is typing */}
                      {isTyping && (
                        <div className="flex justify-start mb-0">
                          <div className="flex items-center gap-2  px-2 py-3 text-sm">
                            <p className='text-sm text-gray-400'>{selectedUser.fullName} is typing </p>
                            <div className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scroll target */}
                      <div ref={messageEndRef} />
                    </div>
                  ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
                    <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
                  )
                }
              </div>
            </div>


            <MessageInput message={message || ""} isEdit={Boolean(message)} resetEdit={() => { setMessage(null) }} />
          </div>
        )
      }
    </>
  );
}

export default ChatContainer