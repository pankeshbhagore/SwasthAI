import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Stethoscope, Brain, MapPin, Shield, Globe, ArrowRight, Mic } from "lucide-react";

const FEATURES = [
  { icon: Brain, label: "Multi-Agent AI", desc: "Triage, Recommendation, History & Translation agents work together", color: "#00e5ff" },
  { icon: Stethoscope, label: "Smart Triage", desc: "Hybrid rule engine + LLM detects emergency vs mild instantly", color: "#00ff88" },
  { icon: MapPin, label: "Hospital Locator", desc: "Find nearest hospitals ranked by distance and emergency capability", color: "#a78bfa" },
  { icon: Globe, label: "Multilingual", desc: "Full support for Hindi, Tamil, Telugu, Marathi & more Indian languages", color: "#ffb300" },
  { icon: Mic, label: "Voice Input", desc: "Speak your symptoms in your language — MediMind understands", color: "#ff3d71" },
  { icon: Shield, label: "Offline Triage", desc: "Rule-based engine works without internet — always available", color: "#00e5ff" },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", borderBottom: "1px solid var(--border)",
        background: "rgba(6,11,20,0.8)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
          <Zap size={22} color="var(--accent-cyan)" />
          MediMind
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/login")} className="btn btn-ghost">Sign In</button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "100px 48px 80px", textAlign: "center", position: "relative" }}>
        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: "100px",
            background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
            fontSize: 12, color: "var(--accent-cyan)", marginBottom: 28, letterSpacing: "0.08em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-cyan)", display: "inline-block" }} />
            MULTI-AGENT AI SYSTEM ACTIVE
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 800, lineHeight: 1.05, marginBottom: 24,
            background: "linear-gradient(135deg, #e8f4fd 0%, #00e5ff 50%, #00ff88 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Intelligent Health<br />Copilot for Bharat
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text-secondary)",
            maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            MediMind uses a multi-agent AI system to analyze symptoms, predict risks, detect emergencies, and guide you to the right care — in your language.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0,229,255,0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: 16 }}
            >
              Start Free Consultation
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/emergency")}
              className="btn btn-danger"
              style={{ padding: "14px 28px", fontSize: 16 }}
            >
              🚨 Emergency SOS
            </motion.button>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
            Call <a href="tel:108" style={{ color: "var(--accent-red)", fontWeight: 700 }}>108</a> for medical emergency · Free service · No registration required for emergency
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 48px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[
            { label: "AI Agents", value: "5+" },
            { label: "Languages Supported", value: "10+" },
            { label: "Symptoms Mapped", value: "50+" },
            { label: "Emergency Detection", value: "99%" },
          ].map(({ label, value }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--accent-cyan)" }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 48px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Built to Win
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            Every feature designed for real healthcare impact in India
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card"
              style={{ padding: 24 }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: `${color}15`, border: `1px solid ${color}25`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 8 }}>{label}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "60px 48px", textAlign: "center",
        borderTop: "1px solid var(--border)",
        background: "rgba(0,229,255,0.02)",
      }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          Ready to experience AI healthcare?
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          Join thousands getting smarter health guidance with Kaaya
        </p>
        <button onClick={() => navigate("/register")} className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
          Get Started — It's Free <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 48px", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
        <p>Kaaya — Intelligent Public Health Copilot </p>
        <p style={{ marginTop: 6 }}>
          ⚠️ Kaaya provides health information only. Always consult a qualified doctor for medical diagnosis and treatment.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
