import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Radio, Sparkles, Mic, MicOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import useVoice from "../../hooks/useVoice";
import api from "../../utils/api";

const JarvisVoiceAssistant = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [jarvisThinking, setJarvisThinking] = useState(false);

  const { isListening, toggleListening, stopListening } = useVoice((text) => {
    handleJarvisQuery(text);
  });

  // Fetch dashboard data for "Jarvis" awareness
  useEffect(() => {
    if (user) {
      api.get("/users/dashboard").then(res => setDashboardData(res.data)).catch(() => {});
    }
  }, [user, location.pathname]);

  const speak = (text) => {
    if (muted || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice mapping
    if (language === "hi") utterance.lang = "hi-IN";
    else if (language === "mr") utterance.lang = "mr-IN";
    else utterance.lang = "en-US";

    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher for "AI" feel

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); window.speechSynthesis.cancel(); };

    // Safety timeout to reset state if speech fails to fire end event
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) setIsSpeaking(false);
    }, 10000);

    window.speechSynthesis.speak(utterance);
  };

  const handleJarvisQuery = async (query) => {
    if (!query || muted) return;
    setJarvisThinking(true);
    try {
      const score = dashboardData?.healthScore || 25;
      const emergencies = dashboardData?.severityCounts?.EMERGENCY || 0;
      const context = `User Context: Health Score is ${score}. Emergency Alerts: ${emergencies}. Preferred Language: ${language}. Current Path: ${location.pathname}.`;

      const systemPrompt = `You are Jarvis, a highly intelligent and professional healthcare AI assistant.
      
      CAPABILITIES:
      1. NAVIGATION: ALWAYS end response with '[NAVIGATE:/path]' to move pages.
      2. AGENTIC ACTIONS: You can perform tasks for the user.
         - If the user wants to analyze a meal, navigate to '/nutrition' AND end with '[ACTION:ANALYZE_MEAL:meal_description]'.
         Example: "Jarvis, analyze 2 rotis and dal" -> "Certainly. Navigating to Nutrition and starting analysis. [NAVIGATE:/nutrition][ACTION:ANALYZE_MEAL:2 rotis and dal]"
      
      Paths: /dashboard, /chat, /vitals, /medications, /mental-health, /nutrition, /hospitals, /report, /profile, /family-doctor, /history.
      
      RULES:
      - Be concise and professional.
      - Use context: ${context}`;

      const res = await api.post("/ai/chat", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        language,
      });
      
      let answer = res.data.data.message;
      
      // Handle Navigation Command
      const navMatch = answer.match(/\[NAVIGATE:(.*?)\]/);
      if (navMatch) {
        const targetPath = navMatch[1];
        setTimeout(() => navigate(targetPath), 1200); 
        answer = answer.replace(/\[NAVIGATE:.*?\]/, ""); 
      }

      // Handle Agentic Action Command
      const actionMatch = answer.match(/\[ACTION:(.*?):(.*?)\]/);
      if (actionMatch) {
        const [, type, data] = actionMatch;
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("JARVIS_ACTION", { detail: { type, data } }));
        }, 2000); // Wait for navigation to complete if any
        answer = answer.replace(/\[ACTION:.*?:.*?\]/, "");
      }

      speak(answer);
    } catch {
      speak("I'm sorry, I couldn't connect to my knowledge base. Please try again.");
    } finally {
      setJarvisThinking(false);
    }
  };

  const summarizePage = () => {
    if (!user) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let text = "";
    const name = user.name?.split(" ")[0] || "User";

    if (location.pathname === "/dashboard") {
      const score = dashboardData?.healthScore || 25;
      const emergencies = dashboardData?.severityCounts?.EMERGENCY || 0;
      text = `Hello ${name}. I am Jarvis, your healthcare agent. Your current health score is ${score}. `;
      if (emergencies > 0) {
        text += `Warning: I have detected ${emergencies} emergency records in your history. Please review them immediately.`;
      } else {
        text += "Your health trends look stable. Keep up the good work.";
      }
    } else if (location.pathname === "/vitals") {
      text = "We are in the Vitals Tracker. Please log your blood pressure and heart rate so I can analyze your health risks.";
    } else if (location.pathname === "/chat") {
      text = "I am ready to analyze your symptoms. Please speak or type how you are feeling.";
    } else if (location.pathname === "/hospitals") {
      text = "I am searching for the nearest medical facilities. Please ensure your location access is granted.";
    } else if (location.pathname === "/mental-health") {
      text = "Welcome to Serene Wellness. How is your mood today? I am here to listen and help you stay calm.";
    } else {
      text = `Hello ${name}, I am Jarvis. How can I assist your health journey today?`;
    }

    speak(text);
  };

  if (!user) return null;

  return (
    <div className="jarvis-container" style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <AnimatePresence>
        {(isSpeaking || isListening || jarvisThinking) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            style={{
              background: isListening ? "var(--accent-red)" : "#063970",
              color: "white",
              padding: "6px 12px",
              borderRadius: "15px 0 15px 15px",
              fontSize: 12,
              fontWeight: 900,
              boxShadow: isListening ? "0 10px 25px rgba(255,61,113,0.4)" : "0 10px 25px rgba(0,229,255,0.4)",
              marginBottom: 10,
              maxWidth: 180,
              border: "1px solid white"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isListening ? <Mic size={14} className="pulse-emergency" /> : <Radio size={14} className="pulse-emergency" />}
              {isListening ? "LISTENING..." : jarvisThinking ? "THINKING..." : "SPEAKING..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleListening(language === "hi" ? "hi-IN" : "en-IN")}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: isListening ? "var(--accent-red)" : "var(--bg-card)",
              border: "1px solid white",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isListening ? "white" : "#063970",
              boxShadow: isListening ? "0 0 15px rgba(255,61,113,0.4)" : "0 4px 10px rgba(0,0,0,0.15)"
            }}
            title="Ask Jarvis a Question"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setMuted(!muted);
              if (!muted) {
                window.speechSynthesis.cancel();
                stopListening();
              }
            }}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid white",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: muted ? "var(--accent-red)" : "#063970",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
            title={muted ? "Unmute Jarvis" : "Mute Jarvis"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={jarvisThinking ? { boxShadow: ["0 0 20px #063970", "0 0 40px #1e40af", "0 0 20px #063970"] } : {}}
          transition={jarvisThinking ? { repeat: Infinity, duration: 1.5 } : {}}
          onClick={summarizePage}
          style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "linear-gradient(135deg, #063970, #1e40af)",
            border: "3px solid white",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 24px rgba(6, 57, 112, 0.3)",
            position: "relative"
          }}
          title="Jarvis Page Summary"
        >
          <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px dashed #063970", animation: "spin 10s linear infinite" }} />
          {jarvisThinking ? <div className="spinner" style={{ width: 20, height: 20, borderColor: "white", borderTopColor: "transparent" }} /> : <Sparkles size={24} color="white" fill="white" />}
        </motion.button>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .jarvis-container {
            top: 80px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JarvisVoiceAssistant;
