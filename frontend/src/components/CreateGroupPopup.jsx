import { LoaderIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';

function CreateGroupPopup({ onClose, onParentClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const fileInputRef = useRef(null);

    const { chats, createGroup, setSelectedGroup } = useChatStore();

    const toggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!groupName.trim() || selectedMembers.length < 1) {
            return;
        }

        setIsLoading(true);
        const created = await createGroup({
            name: groupName,
            members: selectedMembers,
            groupImage: selectedImg,
        });
        setIsLoading(false);

        if (created) {
            onClose();
            onParentClose();
            setSelectedGroup(created);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setSelectedImg(reader.result);
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-xl rounded-2xl bg-[#0F141D] border border-white/10 shadow-2xl p-6">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-semibold text-base">Create Group</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141C2E] text-gray-400 hover:text-white hover:bg-[#1A2440] transition"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className='flex w-full justify-center items-center mb-6'>
                        <button
                            type='button'
                            onClick={() => fileInputRef.current.click()}
                            className="relative group h-25 w-25 overflow-hidden rounded-full cursor-pointer"
                        >
                            <img
                                src={selectedImg || "./avatar.png"}
                                alt="group icon"
                                className="h-25 w-25 object-cover"
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

                    <div className="flex gap-2 items-center mb-6">
                        <label htmlFor="name" className='text-lg'>Group Name:</label>
                        <div className="flex-1 flex items-center gap-2 rounded-xl bg-[#141C2E] border border-white/5 px-4 py-3 focus-within:border-blue-500 transition">
                            <input
                                id='name'
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Member selection */}
                    <div className="mb-6 max-h-48 overflow-y-auto">
                        <p className="text-sm text-gray-400 mb-2">Select members:</p>
                        {chats?.map((user) => (
                            <label key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#141C2E] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(user._id)}
                                    onChange={() => toggleMember(user._id)}
                                />
                                <span className="text-white text-sm">{user.fullName}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !groupName.trim() || selectedMembers.length < 1}
                        className="px-4 py-2 w-full rounded-xl bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex justify-center"
                    >
                        {isLoading ? <LoaderIcon className="animate-spin" /> : "Create"}
                    </button>
                </form>
            </div>
        </>
    )
}

export default CreateGroupPopup