import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Bot, User, AlertCircle, Globe, Volume2 } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { getSeverityColor, timeAgo } from "../../utils/helpers";
import useVoice from "../../hooks/useVoice";
import SeverityCard from "../UI/SeverityCard";
import toast from "react-hot-toast";

const DEMO_SUGGESTIONS = [
  "I have chest pain and difficulty breathing",
  "Fever of 102°F with headache since 2 days",
  "Severe stomach ache and vomiting",
  "I feel dizzy and nauseous",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "hinglish", label: "Hinglish" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
];

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px" }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "rgba(6, 57, 112, 0.1)", border: "1px solid rgba(6, 57, 112, 0.2)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <Bot size={14} color="#063970" />
    </div>
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "0 12px 12px 12px", padding: "10px 14px",
      display: "flex", gap: 4, alignItems: "center"
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </div>
);

const Message = ({ msg, language }) => {
  const isUser = msg.role === "user";
  const color = msg.severity ? getSeverityColor(msg.severity) : null;

  const formatText = (text) => {
    if (!text) return "";
    return text
      .replace(/### (.*?)\n/g, "<h3 style='font-size: 15px; margin: 10px 0 6px; font-weight: 700; font-family: var(--font-display)'>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong style='color: var(--text-primary)'>$1</strong>")
      .replace(/\n\n/g, "<br /><br />")
      .replace(/\n/g, "<br />")
      .replace(/- (.*?)(<br \/>|$)/g, "<li style='margin-left: 16px'>$1</li>");
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting before reading
    const textToRead = msg.content
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/### (.*?)\n/g, "$1. ")
      .replace(/- /g, "")
      .replace(/\n/g, " ");

    const utterance = new SpeechSynthesisUtterance(textToRead);
    // basic language mapping
    if (language === "hi" || language === "hinglish") utterance.lang = "hi-IN";
    else if (language === "ta") utterance.lang = "ta-IN";
    else if (language === "mr") utterance.lang = "mr-IN";
    else if (language === "te") utterance.lang = "te-IN";
    else utterance.lang = "en-US";
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 8,
        padding: "6px 16px",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "rgba(0,255,136,0.1)" : "rgba(6, 57, 112, 0.1)",
        border: `1px solid ${isUser ? "rgba(0,255,136,0.2)" : "rgba(6, 57, 112, 0.2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isUser ? <User size={14} color="var(--accent-green)" /> : <Bot size={14} color="#063970" />}
      </div>

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
        <div 
          dangerouslySetInnerHTML={{ __html: isUser ? msg.content : formatText(msg.content) }}
          style={{
            background: isUser ? "rgba(0,255,136,0.08)" : "var(--bg-card)",
            border: `1px solid ${isUser ? "rgba(0,255,136,0.15)" : "var(--border)"}`,
            borderRadius: isUser ? "12px 0 12px 12px" : "0 12px 12px 12px",
            padding: "12px 18px",
            fontSize: 16,
            fontWeight: 800,
            color: isUser ? "var(--text-primary)" : "var(--text-secondary)",
            lineHeight: 1.6,
            ...(color && { borderColor: `${color}40`, boxShadow: `0 0 16px ${color}15`, border: "2px solid" }),
          }}
        />

        {!isUser && (
          <button 
            onClick={handleSpeak}
            style={{ 
              position: "absolute", right: -30, top: 5, background: "none", border: "none", 
              color: "var(--text-muted)", cursor: "pointer", padding: 4 
            }}
            title="Read aloud"
          >
            <Volume2 size={15} />
          </button>
        )}

        {/* Severity result if available */}
        {msg.triageResult && (
          <SeverityCard result={msg.triageResult} compact />
        )}

        <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: isUser ? "flex-end" : "flex-start" }}>
          {timeAgo(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `नमस्ते! 👋 I'm MediMind, your intelligent health copilot.\n\nDescribe your symptoms and I'll analyze them using our multi-agent AI system. I can detect severity, predict risks, and guide you to the right care.\n\nHow are you feeling today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(user?.preferredLanguage || "en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { isListening, toggleListening } = useVoice((text) => {
    setInput((prev) => prev ? `${prev} ${text}` : text);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { role: "user", content: userText, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build messages history for API
      const history = messages
        .slice(-6) // last 6 for context
        .map(({ role, content }) => ({ role, content }));

      const [chatRes, triageRes] = await Promise.all([
        api.post("/ai/chat", {
          messages: [...history, { role: "user", content: userText }],
          language,
        }),
        api.post("/triage/quick", {
          symptoms: [userText],
          age: user?.age,
        }).catch(() => null),
      ]);

      const aiMessage = {
        role: "assistant",
        content: chatRes.data.data.message,
        timestamp: new Date().toISOString(),
        triageResult: triageRes?.data?.data,
        severity: triageRes?.data?.data?.severity,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Warn if emergency
      if (triageRes?.data?.data?.emergency) {
        toast.error("🚨 Emergency detected! Please call 108 immediately.", { duration: 6000 });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. For medical emergencies, please call 108 immediately. 🏥",
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "calc(100vh - 40px)" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-secondary)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(6, 57, 112, 0.1)", border: "1px solid rgba(6, 57, 112, 0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={18} color="#063970" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>MediMind Assistant</div>
            <div style={{ fontSize: 13, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }} />
              System Active
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="btn btn-ghost"
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            <Globe size={14} />
            {LANGUAGES.find(l => l.code === language)?.label || "EN"}
          </button>
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", overflow: "hidden", zIndex: 50, minWidth: 140,
                }}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "9px 14px", background: language === lang.code ? "rgba(0,229,255,0.08)" : "transparent",
                      border: "none", color: language === lang.code ? "var(--accent-cyan)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 13,
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} language={language} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DEMO_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              style={{
                background: "rgba(6, 57, 112, 0.05)", border: "2px solid rgba(6, 57, 112, 0.15)",
                borderRadius: "var(--radius-md)", padding: "10px 16px",
                fontSize: 14, color: "#063970", cursor: "pointer",
                fontWeight: 800,
                transition: "all var(--transition)",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#063970"; e.target.style.background = "rgba(6, 57, 112, 0.1)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(6, 57, 112, 0.15)"; e.target.style.background = "rgba(6, 57, 112, 0.05)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Emergency Banner */}
      <div style={{
        margin: "0 16px 8px",
        background: "rgba(255,61,113,0.1)",
        border: "2px solid rgba(255,61,113,0.3)",
        borderRadius: "var(--radius-md)",
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 14, color: "var(--accent-red)", fontWeight: 800,
      }}>
        <AlertCircle size={16} />
        For medical emergencies call <a href="tel:108" style={{ fontWeight: 900, color: "var(--accent-red)", textDecoration: "underline" }}>108</a> immediately.
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Describe your symptoms... (Press Enter to send)"
            rows={1}
            style={{
              width: "100%",
              background: "#063970",
              border: `2px solid ${isListening ? "var(--accent-red)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              color: "white",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 800,
              outline: "none",
              resize: "none",
              maxHeight: 150,
              lineHeight: 1.5,
              transition: "all var(--transition)",
            }}
          />
          {isListening && (
            <div style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent-red)", animation: "pulse-red 1s infinite",
            }} />
          )}
        </div>

        <button
          onClick={() => toggleListening(language === "hi" ? "hi-IN" : "en-IN")}
          className={`btn ${isListening ? "btn-danger" : "btn-ghost"}`}
          style={{ padding: "11px 14px", flexShrink: 0 }}
          title={isListening ? "Stop listening" : "Voice input"}
        >
          {isListening ? <MicOff size={17} /> : <Mic size={17} />}
        </button>

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{ padding: "11px 16px", flexShrink: 0 }}
        >
          {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
