import React from 'react'
import { useChatStore } from '../store/useChatStore'

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="flex gap-1 mx-4 mb-3 p-1 rounded-xl bg-[#141C2E] border border-white/5">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeTab === "chats"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-400 hover:text-white"
          }`}
      >
        Chats
      </button>
      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeTab === "contacts"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-400 hover:text-white"
          }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch