import {
  MessageCircleIcon,
  CompassIcon,
  PencilLineIcon,
  BookOpenIcon,
  ZapIcon,
  SendIcon,
} from "lucide-react";

function NoConversationPlaceholder() {
  const suggestions = [
    {
      title: "Explore an idea",
      description:
        "Help me brainstorm names for a calm, focused note-taking app.",
      icon: <CompassIcon size={20} />,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: "Draft a message",
      description:
        "Write a friendly follow-up to a client about a delayed delivery.",
      icon: <PencilLineIcon size={20} />,
      color: "bg-pink-500/20 text-pink-400",
    },
    {
      title: "Learn something",
      description:
        "Explain quantum entanglement like I'm a curious 12-year-old.",
      icon: <BookOpenIcon size={20} />,
      color: "bg-orange-500/20 text-orange-400",
    },
    {
      title: "Get unstuck",
      description:
        "Give me 5 tiny steps to start a project I've been avoiding.",
      icon: <ZapIcon size={20} />,
      color: "bg-emerald-500/20 text-emerald-400",
    },
  ];

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#101828] px-10">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-size-[24px_24px]" />
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500 shadow-lg shadow-blue-500/30">
          <MessageCircleIcon className="h-10 w-10 text-white" />
        </div>

        <p className="mt-5 text-xs uppercase tracking-[0.4em] text-blue-300">
          Chatter
        </p>
      </div>

      {/* Heading */}
      <h1 className="text-center text-5xl font-bold text-white">
        Good to see you again.
      </h1>

      <p className="mt-5 max-w-xl text-center text-lg text-gray-400">
        Pick up a thread, or start somewhere new. Here are a few ways to
        begin.
      </p>

      {/* Cards */}
      <div className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-6">

        {suggestions.map((item) => (
          <button
            key={item.title}
            className="rounded-3xl border border-white/5 bg-[#182233] p-7 text-left transition hover:border-blue-500/30 hover:bg-[#1D2940]"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}
            >
              {item.icon}
            </div>

            <h3 className="text-xl font-semibold text-white">
              {item.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {item.description}
            </p>
          </button>
        ))}

      </div>

      {/* Bottom Input */}
      <div className="mt-12 w-full max-w-4xl">
        <div className="flex h-16 items-center rounded-full border border-white/5 bg-[#182233] px-6">

          <MessageCircleIcon className="text-gray-500" />

          <input
            placeholder="Start a new conversation..."
            className="ml-4 flex-1 bg-transparent text-white outline-none placeholder:text-gray-500"
          />

          <button className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-600">
            <SendIcon size={18} />
            Send
          </button>

        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Or pick a conversation from the left to continue where you left off.
        </p>
      </div>

    </div>
  );
}

export default NoConversationPlaceholder;