import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";


export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    lastMessages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
    // count: null,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getLastMessages: async () => {
        try {
            const res = await axiosInstance.get("/messages/last-messages");
            set({ lastMessages: res.data });
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        const chats = get().chats;
        const selectedUser = get().selectedUser;
        set({ isMessagesLoading: true });

        try {
            // Update unread count based on whether the selected user is the chat partner or not
            let updatedChats;
            if (selectedUser && selectedUser._id === userId) {
                // If the selected user is the chat partner, reset unread count
                updatedChats = chats.map(chat => {
                    if (chat._id === userId) {
                        return { ...chat, unreadCount: 0 };
                    }
                    return chat;
                })
            } else {
                // If the selected user is not the chat partner, increment unread count
                updatedChats = chats.map(chat => {
                    if (chat._id === userId) {
                        return { ...chat, unreadCount: (chat.unreadCount || 0) + 1 };
                    }
                    return chat;
                })
            }
            set({ chats: updatedChats });

            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });

        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")

        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        const { authUser } = useAuthStore.getState()

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,  // flag to identify optimistic messages 
        };

        // immediatly update the ui by adding the message
        set({ messages: [...messages, optimisticMessage] })

        // update lastMessages state
        set((state) => {
            const exist = state.lastMessages.some((msg) => (msg.senderId === authUser._id && msg.receiverId === selectedUser._id) || (msg.senderId === selectedUser._id && msg.receiverId === authUser._id));

            if (exist) {
                return {
                    lastMessages: state.lastMessages.map((msg) => {
                        if ((msg.senderId === authUser._id && msg.receiverId === selectedUser._id) || (msg.senderId === selectedUser._id && msg.receiverId === authUser._id)) {
                            return { ...msg, ...optimisticMessage, updatedAt: new Date().toISOString() };
                        }
                        return msg;
                    })
                };
            } else {
                return {
                    lastMessages: [...state.lastMessages, optimisticMessage]
                };
            }
        });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: messages.concat(res.data) });
        } catch (error) {
            // remove optimistic message on failure
            set({ messages: messages })
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        // console.log('subscribe to msg called');

        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {

            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            set({ messages: [...currentMessages, newMessage] });

            if (isSoundEnabled) {
                const notificationSound = new Audio("/sound/notification.mp3");

                notificationSound.currentTime = 0;      // reset to start
                notificationSound.play().catch((e) => console.log("Audio play failed: ", e));
            }
        })

    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    updateChatList: (chatPartner, message) => {
        const chats = get().chats;
        const selectedUser = get().selectedUser;

        const index = chats.findIndex(c => c._id === chatPartner._id);

        let updatedChats;

        if (index !== -1) {
            updatedChats = [
                {
                    ...chats[index],
                    lastMessage: message,
                    updatedAt: message.createdAt,
                },
                ...chats.filter((_, i) => i !== index),
            ];
        } else {
            updatedChats = [
                {
                    ...chatPartner,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                },
                ...chats,
            ];
        }

        // Update unread count based on whether the selected user is the chat partner or not
        if (selectedUser && selectedUser._id === chatPartner._id) {
            // If the selected user is the chat partner, reset unread count
            updatedChats = updatedChats.map(chat => {
                if (chat._id === chatPartner._id) {
                    return { ...chat, unreadCount: 0 };
                }
                return chat;
            })
        } else {
            // If the selected user is not the chat partner, increment unread count
            updatedChats = updatedChats.map(chat => {
                if (chat._id === chatPartner._id) {
                    return { ...chat, unreadCount: (chat.unreadCount || 0) + 1 };
                }
                return chat;
            })
        }

        set({ chats: updatedChats });

        // Update lastMessages state
        set((state) => {
            const exist = state.lastMessages.some((msg) => (msg.senderId === message.senderId && msg.receiverId === message.receiverId) || (msg.senderId === message.receiverId && msg.receiverId === message.senderId));

            if (exist) {
                return {
                    lastMessages: state.lastMessages.map((msg) => {
                        if ((msg.senderId === message.senderId && msg.receiverId === message.receiverId) || (msg.senderId === message.receiverId && msg.receiverId === message.senderId)) {
                            return { ...msg, ...message, updatedAt: new Date().toISOString() };
                        }
                        return msg;
                    })
                };
            } else {
                return {
                    lastMessages: [...state.lastMessages, message]
                };
            }
        });

    },

    appendIncomingMessage: async (message) => {
        set(state => ({
            messages: [...state.messages, message],
        }));

        await axiosInstance.put(`/messages/read/${message.senderId}`);  // Mark messages as read

        // Update lastMessages state
        set((state) => {
            const exist = state.lastMessages.some((msg) => (msg.senderId === message.senderId && msg.receiverId === message.receiverId) || (msg.senderId === message.receiverId && msg.receiverId === message.senderId));

            if (exist) {
                return {
                    lastMessages: state.lastMessages.map((msg) => {
                        if ((msg.senderId === message.senderId && msg.receiverId === message.receiverId) || (msg.senderId === message.receiverId && msg.receiverId === message.senderId)) {
                            return { ...msg, ...message, updatedAt: new Date().toISOString() };
                        }
                        return msg;
                    })
                };
            } else {
                return {
                    lastMessages: [...state.lastMessages, message]
                };
            }
        });

    },
}))