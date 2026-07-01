import { useState, useEffect, useRef } from "react";
import { PhoneOffIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, Maximize2Icon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallback } from "react";
import peer from "../services/peer";

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function OutgoingCallScreen() {

    const { callType, setIsCalling, selectedUser, localStream, } = useChatStore();
    const socket = useAuthStore.getState().socket;

    const [callee, setCallee] = useState(selectedUser);

    // ---- Dummy / replaceable data ----
    // status: "calling" (ringing, no remote stream yet) | "connected" (remote stream arrived)
    const [status, setStatus] = useState("calling");
    const otherUser = {
        fullName: "Ankit Gupta",
        profilePic: "/avatar.png",
    };

    // These would come from your WebRTC/simple-peer logic:
    // localStream  -> from navigator.mediaDevices.getUserMedia()
    // remoteStream -> from peer.on("stream", (stream) => setRemoteStream(stream))
    const [remoteStream, setRemoteStream] = useState(null);
    // -----------------------------------

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [dots, setDots] = useState(1);
    const [duration, setDuration] = useState(0);

    const [statusMsg, setStatusMsg] = useState(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleBusyCall = useCallback(async ({ msg }) => {
        setStatusMsg(msg);
    }, [socket])

    const handleCallRejected = useCallback(() => {
        alert("Call Rejected by user");
        setIsCalling(false);
    }, []);

    const handleCallAccepted = useCallback(async ({ from, ans }) => {
        await peer.setRemoteDescription(ans);
        setStatus("connected");
    }, []);

    const handleIceCandidate = useCallback(async ({ candidate }) => {
        await peer.addIceCandidate(candidate);
    }, []);

    const handleCallEnded = useCallback(() => {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        peer.reset();
        setIsCalling(false);
    }, [localStream]);

    useEffect(() => {
        socket.on("call:busy", handleBusyCall);
        socket.on("call:rejected", handleCallRejected);
        socket.on("call:accepted", handleCallAccepted)
        socket.on("ice:candidate", handleIceCandidate);
        socket.on("call:ended", handleCallEnded);

        return () => {
            socket.off("call:busy", handleBusyCall);
            socket.off("call:rejected", handleCallRejected);
            socket.off("call:accepted", handleCallAccepted)
            socket.off("ice:candidate", handleIceCandidate);
            socket.off("call:ended", handleCallEnded);

        }

    }, [handleBusyCall, handleCallRejected, handleCallAccepted, handleIceCandidate, handleCallEnded, socket]);

    useEffect(() => {
        peer.initListeners(socket, selectedUser._id, (remoteStream) => {
            console.log("remote stream received on caller side:", remoteStream);
            setRemoteStream(remoteStream);
            setStatus("connected");
        });
    }, []);

    const handleEndCall = useCallback(() => {
        socket.emit("call:ended", { to: selectedUser._id });
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        peer.reset();
        setIsCalling(false);
    }, [selectedUser, localStream, socket]);

    // Attach local stream to local <video> whenever it changes
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to remote <video> whenever it changes
    useEffect(() => {
        console.log("remoteStream state changed:", remoteStream);
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, status]);

    // The moment remoteStream arrives, the call is "connected"
    useEffect(() => {
        if (remoteStream) setStatus("connected");
    }, [remoteStream]);

    
    // Animated "Calling." dots while ringing
    useEffect(() => {
        if (status !== "calling") return;
        const interval = setInterval(() => setDots((d) => (d % 3) + 1), 500);
        return () => clearInterval(interval);
    }, [status]);

    // Call duration timer once connected
    useEffect(() => {
        if (status !== "connected") return;
        const interval = setInterval(() => setDuration((d) => d + 1), 1000);
        return () => clearInterval(interval);
    }, [status]);

    const statusText = statusMsg ? statusMsg :
        status === "connected"
            ? formatDuration(duration)
            : `${callType === "video" ? "Video calling" : "Calling"}${".".repeat(dots)}`;

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-size-[28px_28px]" />

            {/* Main viewport */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {/* Remote video fills the screen once connected (video calls only) */}
                {callType === "video" && status === "connected" && (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover"
                    />
                )}

                {/* Avatar + name shown while ringing, or for audio calls always */}
                {(status === "calling" || callType === "audio") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0B0F19]">
                        <div className="relative flex items-center justify-center">
                            {status === "calling" && (
                                <>
                                    <span className="absolute h-44 w-44 rounded-full border border-blue-500/20 animate-ping [animation-duration:2s]" />
                                    <span className="absolute h-36 w-36 rounded-full border border-blue-500/30 animate-ping [animation-duration:2s] [animation-delay:0.3s]" />
                                </>
                            )}
                            <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-[#1A2440] shadow-2xl">
                                <img
                                    src={callee.profilePic || "/avatar.png"}
                                    alt={callee.fullName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-white">{callee.fullName}</p>
                            <p className="mt-2 text-sm text-blue-400/80 tracking-wide">{statusText}</p>
                        </div>
                    </div>
                )}

                {/* Top info bar — only over a connected video call */}
                {callType === "video" && status === "connected" && (
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 bg-linear-to-b from-black/60 to-transparent">
                        <div>
                            <p className="text-white font-semibold text-base">{callee.fullName}</p>
                            <p className="text-blue-300/80 text-xs mt-0.5 tracking-wide">{statusText}</p>
                        </div>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                            <Maximize2Icon size={16} />
                        </button>
                    </div>
                )}

                {/* My self-preview */}
                {callType === "video" && (
                    <div
                        className={`absolute right-6 w-28 h-40 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-[#141C2E] transition-all ${status === "connected" ? "bottom-6 sm:w-36 sm:h-48" : "bottom-28"
                            }`}
                    >
                        {isCamOn ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <img
                                    src="/avatar.png"
                                    alt="You"
                                    className="h-12 w-12 rounded-full object-cover opacity-70"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls bar */}
            <div className="relative px-6 py-7 flex items-center justify-center gap-5 bg-[#0C1120] border-t border-white/5">
                <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isMicOn
                        ? "bg-[#1A2440] text-white hover:bg-[#243055]"
                        : "bg-white text-[#0C1120] hover:bg-gray-200"
                        }`}
                >
                    {isMicOn ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
                </button>

                <button
                    onClick={ handleEndCall }
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                >
                    <PhoneOffIcon size={24} />
                </button>

                {callType === "video" && (
                    <button
                        onClick={() => setIsCamOn(!isCamOn)}
                        className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isCamOn
                            ? "bg-[#1A2440] text-white hover:bg-[#243055]"
                            : "bg-white text-[#0C1120] hover:bg-gray-200"
                            }`}
                    >
                        {isCamOn ? <VideoIcon size={20} /> : <VideoOffIcon size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
}

export default OutgoingCallScreen;