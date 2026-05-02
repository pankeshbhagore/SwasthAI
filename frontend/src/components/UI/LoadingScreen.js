import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const LoadingScreen = ({ message = "Loading MediMind..." }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "var(--bg-primary)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 20,
  }}>
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "linear-gradient(135deg, #00e5ff, #00ff88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 40px rgba(0,229,255,0.4)",
      }}
    >
      <Zap size={30} color="#060b14" strokeWidth={2.5} />
    </motion.div>

    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
        MediMind
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{message}</div>
    </div>

    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-cyan)" }}
        />
      ))}
    </div>
  </div>
);

export default LoadingScreen;
