import { useState, useEffect, useCallback, useRef } from "react";
import { PhoneIcon, PhoneOffIcon, VideoIcon, MicIcon, MicOffIcon, VideoOffIcon, Maximize2Icon, } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import peer from "../services/peer"

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function IncomingCallScreen() {

  const { incomingCall, setIncomingCall } = useChatStore();
  const { authUser } = useAuthStore();
  const socket = useAuthStore.getState().socket;

  const [status, setStatus] = useState("ringing");
  const callType = incomingCall.callType; // "video" | "audio"
  const caller = {
    fullName: incomingCall.fullName,
    profilePic: incomingCall.profilePic || "/avatar.png",
  };

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, status]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => { });
    }
  }, [remoteStream, status]);

  const handleAcceptCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: incomingCall.callType === "video",
    });

    for (const track of stream.getTracks()) {
      peer.peer.addTrack(track, stream);
    }

    setLocalStream(stream);
    setStatus("connected");

    const ans = await peer.getAnswer(incomingCall.offer);

    socket.emit("call:accepted", {
      to: incomingCall.userId,
      ans,
    });

  }, [incomingCall, socket]);


  const handleRejectCall = useCallback(() => {
    socket.emit("call:rejected", {
      to: incomingCall.userId,
    });

    setIncomingCall(null);
  }, [incomingCall, socket]);

  const handleEndCall = useCallback(() => {
    socket.emit("call:ended", { to: incomingCall.userId });

    // Stop all tracks
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    peer.reset();
    setIncomingCall(null);
  }, [incomingCall, localStream, socket]);

  const handleIceCandidate = useCallback(async ({ candidate }) => {
    await peer.addIceCandidate(candidate);
  }, []);

  const handleCallEnded = useCallback(async () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    peer.reset();
    setIncomingCall(null);
  }, [localStream]);

  useEffect(() => {
    socket.on("ice:candidate", handleIceCandidate);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("ice:candidate", handleIceCandidate);
      socket.off("call:ended", handleCallEnded);

    };
  }, [handleIceCandidate, handleCallEnded, socket]);

  useEffect(() => {
    peer.initListeners(socket, incomingCall.userId, (remoteStream) => {
      setRemoteStream(remoteStream);
      setStatus("connected");
    });
  }, []);


  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
    setIsMicOn(!isMicOn);
  }

  const toggleCam = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => track.enabled = !isCamOn);
    setIsCamOn(!isCamOn);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F1728] min-w-0 min-h-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-size-[28px_28px]" />

      {/* Main viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {status === "connected" && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover ${callType === "audio" ? "hidden" : "block"}`}
          />
        )}

        {(status === "ringing" || callType === "audio") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0B0F19]">
            <div className="relative flex items-center justify-center">
              {status === "ringing" && (
                <>
                  <span className="absolute h-44 w-44 rounded-full border border-blue-500/20 animate-ping [animation-duration:1.6s]" />
                  <span className="absolute h-36 w-36 rounded-full border border-blue-500/30 animate-ping [animation-duration:1.6s] [animation-delay:0.25s]" />
                </>
              )}
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-[#1A2440] shadow-2xl">
                <img
                  src={caller.profilePic}
                  alt={caller.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-white">{caller.fullName}</p>
              <p className="mt-2 text-sm text-blue-400/80 tracking-wide">
                {status === "ringing"
                  ? `Incoming ${callType === "video" ? "video" : ""} call`
                  : formatDuration(duration)}
              </p>
            </div>
          </div>
        )}

        {status === "connected" && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 bg-linear-to-b from-black/60 to-transparent">
            <div>
              <p className="text-white font-semibold text-base">{caller.fullName}</p>
              <p className="text-blue-300/80 text-xs mt-0.5 tracking-wide">
                {formatDuration(duration)}
              </p>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <Maximize2Icon size={16} />
            </button>
          </div>
        )}

        {callType === "video" && status === "connected" && (
          <div className="absolute bottom-6 right-6 w-32 h-44 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-[#141C2E]">
            <>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${isCamOn ? "block" : "hidden"}`}
              />
              {!isCamOn && (
                <div className="h-full w-full flex items-center justify-center">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="You"
                    className="h-14 w-14 rounded-full object-cover opacity-70"
                  />
                </div>
              )}
            </>
          </div>
        )}
      </div>

      {/* Bottom controls — different layout depending on status */}
      {status === "ringing" ? (
        <div className="relative px-6 py-7 flex items-center justify-center gap-10 bg-[#0C1120] border-t border-white/5">

          {/* Decline */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleRejectCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
            >
              <PhoneOffIcon size={24} />
            </button>
            <span className="text-xs text-gray-400">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAcceptCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-lg shadow-green-500/30"
            >
              {callType === "video" ? <VideoIcon size={24} /> : <PhoneIcon size={24} />}
            </button>
            <span className="text-xs text-gray-400">Accept</span>
          </div>
        </div>
      ) : (
        <div className="relative px-6 py-7 flex items-center justify-center gap-5 bg-[#0C1120] border-t border-white/5">
          <button
            onClick={toggleMic}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isMicOn
              ? "bg-[#1A2440] text-white hover:bg-[#243055]"
              : "bg-white text-[#0C1120] hover:bg-gray-200"
              }`}
          >
            {isMicOn ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
          </button>

          <button
            onClick={handleEndCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
          >
            <PhoneOffIcon size={24} />
          </button>

          {callType === "video" && (
            <button
              onClick={toggleCam}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isCamOn
                ? "bg-[#1A2440] text-white hover:bg-[#243055]"
                : "bg-white text-[#0C1120] hover:bg-gray-200"
                }`}
            >
              {isCamOn ? <VideoIcon size={20} /> : <VideoOffIcon size={20} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default IncomingCallScreen;