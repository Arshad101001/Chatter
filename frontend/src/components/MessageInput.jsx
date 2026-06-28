import React, { useRef, useState } from 'react'
import useKeyboardSound from '../hooks/useKeyboardSound'
import { useChatStore } from "../store/useChatStore";
import toast from 'react-hot-toast';
import { ImageIcon, SendIcon, SmileIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    })

    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-t border-white/5 bg-[#0C1120] px-6 py-4">

      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-4 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 rounded-2xl object-cover border border-white/10"
            />

            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1B2434] text-gray-300 hover:bg-red-500 hover:text-white"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-white/8 bg-[#141C2E] px-4 py-2.5 shadow-lg"
      >

        {/* Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2440] text-gray-400 hover:bg-blue-600 hover:text-white transition
          ${imagePreview
              ? "bg-blue-500 text-white"
              : "bg-[#1B2434] text-gray-300 hover:bg-blue-500 hover:text-white"
            }`}
        >
          <ImageIcon size={18} />
        </button>

        {/* Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSendMessage(e);
            }
          }}
          placeholder="Type your message..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          <SendIcon size={18} />
        </button>

        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-white transition">
          <SmileIcon size={18} />
        </button>
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </form>

    </div>
  );
}

export default MessageInput