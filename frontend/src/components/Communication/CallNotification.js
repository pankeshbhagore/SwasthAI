import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, X, Check } from "lucide-react";

const CallNotification = ({ call, onAccept, onReject }) => {
  if (!call) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
        width: 320, background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--accent-cyan)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        padding: 16, zIndex: 2000, display: "flex", alignItems: "center", gap: 16
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "50%", background: "rgba(0,229,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {call.type === "video" ? <Video color="var(--accent-cyan)" /> : <Phone color="var(--accent-cyan)" />}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Incoming {call.type} Call</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>From Dr. {call.fromName || "Medical Provider"}</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button 
          onClick={onReject}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,61,113,0.1)", border: "none", color: "var(--accent-red)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={18} />
        </button>
        <button 
          onClick={onAccept}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "none", color: "var(--accent-green)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Check size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CallNotification;
