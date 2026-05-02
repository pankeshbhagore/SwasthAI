import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RefreshCw } from "lucide-react";

const BreathingExercise = ({ onBack, onTalk }) => {
  const [phase, setPhase] = useState("In"); // In, Hold, Out, Hold
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(60);

  useEffect(() => {
    let timer;
    if (isActive && totalSeconds > 0) {
      timer = setInterval(() => {
        setCount((prev) => {
          if (prev === 1) {
            // Switch phase
            setPhase((p) => {
              if (p === "In") return "Hold (In)";
              if (p === "Hold (In)") return "Out";
              if (p === "Out") return "Hold (Out)";
              return "In";
            });
            return 4;
          }
          return prev - 1;
        });
        setTotalSeconds((prev) => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, totalSeconds]);

  const circleVariants = {
    In: { scale: 1.5, transition: { duration: 4, ease: "linear" } },
    "Hold (In)": { scale: 1.5 },
    Out: { scale: 1, transition: { duration: 4, ease: "linear" } },
    "Hold (Out)": { scale: 1 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24, margin: "0 auto 40px" }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: 40 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>BOX-STYLE BREATH</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginTop: 8 }}>Just follow the <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent-cyan)" }}>circle</span></h2>
      </div>

      <div style={{ position: "relative", height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Glow effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: "absolute", width: 280, height: 280,
            background: "radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)",
            borderRadius: "50%", zIndex: 0,
          }}
        />

        {/* Breathing Circle */}
        <motion.div
          animate={isActive ? circleVariants[phase] : { scale: 1 }}
          style={{
            width: 180, height: 180,
            background: "linear-gradient(135deg, #06b6d4, #6366f1)",
            borderRadius: "50%", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.2)",
            border: "4px solid rgba(255,255,255,0.1)"
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ color: "white" }}
            >
              <div style={{ fontSize: 32, fontWeight: 800 }}>{isActive ? phase : "Ready?"}</div>
              {isActive && <div style={{ fontSize: 48, fontWeight: 900, marginTop: 4 }}>{count}</div>}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div style={{ marginTop: 60 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>{totalSeconds}s remaining in your minute</p>
        
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button 
            className="btn btn-ghost" onClick={() => setIsActive(!isActive)}
            style={{ minWidth: 100, height: 44 }}
          >
            {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {totalSeconds < 60 ? "Resume" : "Start"}</>}
          </button>
          
          <button 
            className="btn btn-primary" onClick={onTalk}
            style={{ minWidth: 160, height: 44, background: "linear-gradient(90deg, #06b6d4, #6366f1)", border: "none" }}
          >
            I'm ready to talk
          </button>
        </div>
      </div>

      <div style={{ marginTop: 48, maxWidth: 400, margin: "48px auto 0" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.6 }}>
          Notice 5 things you can see · 4 you can touch · 3 you can hear · 2 you can smell · 1 you can taste.
        </p>
      </div>
    </motion.div>
  );
};

export default BreathingExercise;
