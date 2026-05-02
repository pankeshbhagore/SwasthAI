import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Phone, Video, MessageSquare, User, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const ChatInterface = ({ otherUser, onClose, type = "chat" }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(type); // chat, call, video
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  
  const otherId = otherUser?._id || (typeof otherUser === "string" ? otherUser : null);

  useEffect(() => {
    if (otherId) {
      fetchMessages(otherId);
      setupSocket(otherId);
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [otherUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const setupSocket = (otherId) => {
    const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join-room", user._id);
    
    socket.on("new-message", (msg) => {
      if (msg.sender === otherId) setMessages((prev) => [...prev, msg]);
    });

    socket.on("incoming-call", (data) => {
      setReceivingCall(true);
      toast(`Incoming ${data.type} call from ${data.fromName}...`, { icon: "📞" });
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on("call-ended", () => {
      setCallEnded(true);
      window.location.reload(); // Quick reset
    });
  };

  const fetchMessages = async (otherId) => {
    try {
      const res = await api.get(`/chat/${otherId}`);
      setMessages(res.data.data);
    } catch (err) {
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const startCall = async (callType) => {
    setMode(callType);
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true
      });
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real app, send ICE candidates via socket
        }
      };

      peer.ontrack = (event) => {
        if (userVideo.current) userVideo.current.srcObject = event.streams[0];
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: otherId,
        from: user._id,
        fromName: user.name,
        type: callType,
        signalData: offer
      });

      connectionRef.current = peer;
    } catch (err) {
      toast.error("Could not access camera/microphone");
      setMode("chat");
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    socketRef.current.emit("end-call", { to: otherId });
    if (connectionRef.current) connectionRef.current.close();
    window.location.reload();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !otherId) return;
    const tempMsg = { _id: Date.now().toString(), sender: user._id, receiver: otherId, text: text.trim(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setText("");
    try { await api.post("/chat", { receiverId: otherId, text: tempMsg.text }); } catch (err) { toast.error("Message failed to send"); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed", bottom: 20, right: 20, width: mode === "chat" ? 380 : 500, height: mode === "chat" ? 500 : 600,
        background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden"
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,229,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900 }}>
              {otherUser.role === "doctor" ? "Dr. " : ""}{otherUser.name}
            </div>
            <div style={{ fontSize: 10, color: otherUser.isOnline ? "var(--accent-green)" : "var(--text-muted)", fontWeight: 800 }}>
              {otherUser.isOnline ? "Online" : otherUser.lastSeen ? `Last seen: ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => startCall("call")} className="btn btn-ghost" style={{ padding: 6 }}><Phone size={16} /></button>
          <button onClick={() => startCall("video")} className="btn btn-ghost" style={{ padding: 6 }}><Video size={16} /></button>
          <button onClick={() => setMode("chat")} className="btn btn-ghost" style={{ padding: 6 }}><MessageSquare size={16} /></button>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6 }}><X size={16} /></button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {mode === "chat" ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m) => (
                <div key={m._id} style={{
                  alignSelf: m.sender === user._id ? "flex-end" : "flex-start",
                  maxWidth: "80%", padding: "10px 14px", borderRadius: "var(--radius-md)", fontWeight: 700,
                  background: m.sender === user._id ? "var(--accent-cyan)" : "var(--bg-card)",
                  color: m.sender === user._id ? "#000" : "var(--text-primary)", fontSize: 14
                }}>{m.text}</div>
              ))}
            </div>
            <form onSubmit={handleSend} style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <input className="input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, fontWeight: 700 }} />
              <button type="submit" className="btn btn-primary" style={{ padding: "0 16px" }}><Send size={18} /></button>
            </form>
          </div>
        ) : (
          <div style={{ height: "100%", position: "relative", background: "#000" }}>
            {/* User Video */}
            {mode === "video" && (
              <video playsInline ref={userVideo} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {/* My Video */}
            {mode === "video" && stream && (
              <video playsInline muted ref={myVideo} autoPlay style={{ position: "absolute", top: 20, right: 20, width: 120, borderRadius: 12, border: "2px solid var(--accent-cyan)" }} />
            )}
            
            {/* Call Overlay */}
            <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
              <button className="btn" style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none" }}><MicOff color="white" /></button>
              <button onClick={leaveCall} className="btn" style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--accent-red)", border: "none" }}><PhoneOff color="white" /></button>
              {mode === "video" && <button className="btn" style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none" }}><VideoOff color="white" /></button>}
            </div>

            {!callAccepted && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  {mode === "call" ? <Phone size={48} color="var(--accent-cyan)" className="pulse-emergency" /> : <Video size={48} color="var(--accent-cyan)" className="pulse-emergency" />}
                </div>
                <h3 style={{ color: "white", fontSize: 20, fontWeight: 900 }}>Calling Dr. {otherUser.name}...</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 10 }}>Initializing secure connection</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatInterface;
