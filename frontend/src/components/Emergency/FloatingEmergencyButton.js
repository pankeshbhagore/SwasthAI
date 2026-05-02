import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Phone, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useGeolocation from "../../hooks/useGeolocation";
import useHealth from "../../hooks/useHealth";
import toast from "react-hot-toast";

const QUICK_NUMBERS = [
  { label: "Ambulance", number: "108", emoji: "🚑" },
  { label: "Emergency", number: "112", emoji: "🆘" },
  { label: "Police", number: "100", emoji: "🚔" },
];

const FloatingEmergencyButton = () => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { location, getLocation } = useGeolocation();
  const { triggerEmergency } = useHealth();

  const handleSOS = async () => {
    if (!user) {
      navigate("/emergency");
      return;
    }

    setSending(true);
    getLocation();
    await triggerEmergency(["Emergency SOS triggered"], location);
    setSending(false);
    toast.error("🚨 Emergency alert sent! Call 108 NOW.", { duration: 8000 });
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 998, backdropFilter: "blur(2px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            style={{
              position: "fixed", bottom: 100, right: 24, zIndex: 999,
              background: "var(--bg-card)", border: "1px solid rgba(255,61,113,0.3)",
              borderRadius: "var(--radius-xl)", padding: 20,
              width: 260, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--accent-red)", marginBottom: 6 }}>
                🚨 EMERGENCY SOS
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 800 }}>
                Tap a number to call now:
              </div>
            </div>

            {/* Quick Dial */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {QUICK_NUMBERS.map(({ label, number, emoji }) => (
                <a key={number} href={`tel:${number}`}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 4px",
                    background: "rgba(255,61,113,0.08)", border: "1px solid rgba(255,61,113,0.2)",
                    borderRadius: "var(--radius-sm)", textDecoration: "none",
                  }}
                >
                   <span style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</span>
                   <span style={{ fontWeight: 900, fontSize: 18, color: "var(--accent-red)" }}>{number}</span>
                   <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }}>{label}</span>
                </a>
              ))}
            </div>

            {/* Alert Contact */}
            {user?.emergencyContact?.phone && (
              <button
                onClick={handleSOS}
                disabled={sending}
                className="btn btn-danger"
                style={{ width: "100%", marginBottom: 8, padding: "10px" }}
              >
                {sending
                  ? <><div className="spinner" style={{ width: 16, height: 16 }} />Alerting...</>
                  : <><AlertCircle size={18} />Alert Emergency Contact</>
                }
              </button>
            )}

            <button
              onClick={() => { navigate("/hospitals"); setOpen(false); }}
              className="btn btn-ghost"
              style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 800 }}
            >
              <MapPin size={16} /> Find Nearest Hospital
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 32, right: 24, zIndex: 999,
          width: 56, height: 56, borderRadius: "50%",
          background: open ? "var(--bg-card)" : "var(--accent-red)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 0 0 0 rgba(255,61,113,0.4), 0 4px 20px rgba(255,61,113,0.5)",
          animation: open ? "none" : "pulse-red 2s infinite",
          transition: "background 0.2s",
        }}
        title="Emergency SOS"
      >
        {open
          ? <X size={22} color="var(--accent-red)" />
          : <AlertCircle size={24} color="white" strokeWidth={2.5} />
        }
      </motion.button>
    </>
  );
};

export default FloatingEmergencyButton;
