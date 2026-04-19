import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Phone, MapPin, Mic, MicOff, Send, Zap } from "lucide-react";
import { normalizeSymptoms } from "../utils/helpers";
import { performTriageFrontend } from "../utils/triageFrontend";
import useVoice from "../hooks/useVoice";
import useGeolocation from "../hooks/useGeolocation";

// Standalone offline triage for emergency page (no API needed)
const EMERGENCY_NUMBERS = [
  { label: "Ambulance", number: "108", color: "#ff3d71", emoji: "🚑" },
  { label: "National Emergency", number: "112", color: "#ff3d71", emoji: "🆘" },
  { label: "Police", number: "100", color: "#3b82f6", emoji: "🚔" },
  { label: "Fire", number: "101", color: "#f59e0b", emoji: "🚒" },
  { label: "Disaster", number: "1078", color: "#a78bfa", emoji: "⚠️" },
  { label: "Women Helpline", number: "181", color: "#ec4899", emoji: "👩" },
];

const EmergencyPage = () => {
  const [symptoms, setSymptoms] = useState("");
  const [assessed, setAssessed] = useState(false);
  const [severity, setSeverity] = useState(null);
  const { location, loading: locLoading, getLocation } = useGeolocation();
  const { isListening, toggleListening } = useVoice((text) => setSymptoms((p) => p ? `${p}, ${text}` : text));

  const handleAssess = () => {
    if (!symptoms.trim()) return;
    const parsed = normalizeSymptoms(symptoms);
    // Simple frontend-only triage
    const emergency = parsed.some(s =>
      ["chest pain","breathing","seizure","stroke","unconscious","bleeding","heart attack"].some(k => s.includes(k))
    );
    const moderate = !emergency && parsed.some(s =>
      ["fever","vomiting","pain","dizziness","headache"].some(k => s.includes(k))
    );
    setSeverity(emergency ? "EMERGENCY" : moderate ? "MODERATE" : "MILD");
    setAssessed(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,61,113,0.1)", borderBottom: "1px solid rgba(255,61,113,0.3)",
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={24} color="var(--accent-red)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--accent-red)" }}>
            Emergency SOS
          </span>
        </div>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
          <Zap size={16} color="var(--accent-cyan)" />
          SwasthAI
        </Link>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        {/* Emergency Call Buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
            🚨 Quick Emergency Dial
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
            Tap to call immediately — no login required
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {EMERGENCY_NUMBERS.map(({ label, number, color, emoji }) => (
              <motion.a
                key={number}
                href={`tel:${number}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "16px 8px",
                  background: `${color}10`, border: `1px solid ${color}30`,
                  borderRadius: "var(--radius-md)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color }}>{number}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Symptom Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 24, marginBottom: 24 }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>
            Quick Symptom Check (Offline)
          </h3>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <textarea
              className="input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms quickly... e.g. chest pain, difficulty breathing"
              rows={3}
              style={{ resize: "none", paddingRight: 44 }}
            />
            <button
              onClick={() => toggleListening()}
              style={{
                position: "absolute", right: 10, bottom: 10,
                background: isListening ? "var(--accent-red)" : "rgba(0,229,255,0.1)",
                border: `1px solid ${isListening ? "var(--accent-red)" : "rgba(0,229,255,0.2)"}`,
                borderRadius: "var(--radius-sm)", padding: "6px",
                cursor: "pointer", color: isListening ? "white" : "var(--accent-cyan)",
                display: "flex",
              }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAssess}
              disabled={!symptoms.trim()}
              className="btn btn-danger"
              style={{ flex: 1, padding: "11px" }}
            >
              <Send size={16} /> Quick Assess
            </button>
            <button
              onClick={getLocation}
              disabled={locLoading}
              className="btn btn-ghost"
              style={{ padding: "11px 14px" }}
            >
              {locLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <MapPin size={16} />}
            </button>
          </div>

          {location && (
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent-green)" }}>
              📍 Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </motion.div>

        {/* Result */}
        {assessed && severity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: 20, borderRadius: "var(--radius-lg)", marginBottom: 24,
              ...(severity === "EMERGENCY" ? {
                background: "rgba(255,61,113,0.1)", border: "2px solid rgba(255,61,113,0.4)",
                animation: "pulse-red 1.5s infinite",
              } : severity === "MODERATE" ? {
                background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.3)",
              } : {
                background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)",
              }),
            }}
          >
            {severity === "EMERGENCY" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-red)", marginBottom: 8 }}>
                  🚨 EMERGENCY DETECTED
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,61,113,0.9)", marginBottom: 14 }}>
                  Critical symptoms detected. Call emergency services IMMEDIATELY.
                </p>
                <a href="tel:108" className="btn btn-danger" style={{ display: "inline-flex", fontSize: 16, padding: "12px 24px" }}>
                  📞 Call 108 NOW
                </a>
              </>
            )}
            {severity === "MODERATE" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-amber)", marginBottom: 8 }}>
                  ⚠️ MODERATE CONCERN
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,179,0,0.9)" }}>
                  Symptoms need medical attention. Visit a doctor within 24 hours or call 108 if symptoms worsen.
                </p>
              </>
            )}
            {severity === "MILD" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)", marginBottom: 8 }}>
                  ✅ MILD — MONITOR AT HOME
                </div>
                <p style={{ fontSize: 14, color: "rgba(0,255,136,0.9)" }}>
                  Symptoms appear mild. Rest, stay hydrated, and monitor. See a doctor if symptoms worsen.
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Sign up CTA */}
        <div style={{
          textAlign: "center", padding: "20px",
          background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)",
          borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--text-muted)",
        }}>
          For full AI analysis, history tracking & hospital finder —{" "}
          <Link to="/register" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            Create free account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
