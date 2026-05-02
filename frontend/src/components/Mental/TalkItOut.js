import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Heart, User, Sparkles } from "lucide-react";
import api from "../../utils/api";

const TalkItOut = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm Serene. I'm here to listen, without judgment. What's on your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/wellness/talk", {
        message: input,
        history: messages.slice(-5)
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having a little trouble connecting. But I'm still here with you." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ padding: 8 }}><ArrowLeft size={18} /></button>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Talk it out</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>With Serene AI</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, overflowY: "auto", padding: "10px 4px", 
          display: "flex", flexDirection: "column", gap: 16,
          scrollbarWidth: "none"
        }}
      >
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                gap: 10
              }}
            >
              {m.role === "assistant" && (
                <div style={{ 
                  width: 32, height: 32, borderRadius: "50%", background: "rgba(0,229,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Heart size={16} color="var(--accent-cyan)" fill="var(--accent-cyan)" />
                </div>
              )}
              <div style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
                color: m.role === "user" ? "black" : "var(--text-primary)",
                fontSize: 14, lineHeight: 1.5, fontWeight: m.role === "user" ? 600 : 400,
                border: m.role === "assistant" ? "1px solid var(--border)" : "none"
              }}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,229,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={16} color="var(--accent-cyan)" fill="var(--accent-cyan)" />
              </div>
              <div className="glass-card" style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px" }}>
                <div className="typing-dots"><span>.</span><span>.</span><span>.</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} style={{ marginTop: 20, position: "relative" }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Share what's on your mind..."
          style={{ paddingRight: 50, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.03)" }}
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            position: "absolute", right: 8, top: 8, width: 34, height: 34,
            borderRadius: "50%", background: "var(--accent-cyan)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}
        >
          <Send size={16} color="black" />
        </button>
      </form>
    </div>
  );
};

export default TalkItOut;
