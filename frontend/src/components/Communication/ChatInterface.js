import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Phone, Video, MessageSquare, User } from "lucide-react";
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
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const otherId = otherUser?._id || (typeof otherUser === "string" ? otherUser : null);

  useEffect(() => {
    const otherId = otherUser?._id || (typeof otherUser === "string" ? otherUser : null);
    if (otherId) {
      fetchMessages(otherId);
      setupSocket(otherId);
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
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
      if (msg.sender === otherId) {
        setMessages((prev) => [...prev, msg]);
      }
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !otherId) return;

    const tempMsg = {
      _id: Date.now().toString(),
      sender: user._id,
      receiver: otherId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setText("");

    try {
      await api.post("/chat", { receiverId: otherId, text: tempMsg.text });
    } catch (err) {
      toast.error("Message failed to send");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed", bottom: 20, right: 20, width: 380, height: 500,
        background: "var(--bg-secondary)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden"
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,229,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {otherUser.role === "doctor" ? "Dr. " : ""}{otherUser.name || "User"}
            </div>
            <div style={{ fontSize: 10, color: "var(--accent-green)" }}>Online</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("call")} className={`btn btn-ghost ${mode === "call" ? "active" : ""}`} style={{ padding: 6 }}><Phone size={16} /></button>
          <button onClick={() => setMode("video")} className={`btn btn-ghost ${mode === "video" ? "active" : ""}`} style={{ padding: 6 }}><Video size={16} /></button>
          <button onClick={() => setMode("chat")} className={`btn btn-ghost ${mode === "chat" ? "active" : ""}`} style={{ padding: 6 }}><MessageSquare size={16} /></button>
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
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: m.sender === user._id ? "var(--accent-cyan)" : "var(--bg-card)",
                  color: m.sender === user._id ? "#060b14" : "var(--text-primary)",
                  fontSize: 13,
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  {m.text}
                  <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSend} style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <input 
                className="input" 
                placeholder="Type a message..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, height: 40, fontSize: 13 }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: 40, height: 40, padding: 0 }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(0,229,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              {mode === "call" ? <Phone size={48} color="var(--accent-cyan)" /> : <Video size={48} color="var(--accent-cyan)" />}
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{mode === "call" ? "Voice Call" : "Video Call"}</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
              Initializing secure {mode} connection with {otherUser.role === "doctor" ? "Dr. " : ""}{otherUser.name}...
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setMode("chat")} className="btn btn-ghost" style={{ padding: "10px 20px" }}>Cancel</button>
              <button 
                onClick={() => {
                  if (!otherId) return;
                  socketRef.current.emit("call-user", {
                    to: otherId,
                    from: user._id,
                    fromName: user.name,
                    type: mode
                  });
                  toast.success(`Calling ${otherUser.role === "doctor" ? "Dr. " : ""}${otherUser.name || "Provider"}...`);
                }}
                className="btn btn-primary" 
                style={{ padding: "10px 20px" }}
              >
                Start {mode === "call" ? "Call" : "Video"}
              </button>
            </div>
            <div style={{ marginTop: 32, fontSize: 10, color: "var(--text-muted)" }}>
              Requires permission to access your {mode === "call" ? "microphone" : "camera & microphone"}.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatInterface;
