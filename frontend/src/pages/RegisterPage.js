import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, User, Phone, ArrowRight, Languages } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { uiTranslations } from "../utils/translations";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", age: "", gender: "" });
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Welcome to MediMind! 🎉");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      {/* Top Controls */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 10, zIndex: 1000 }}>
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="btn btn-ghost"
            style={{ padding: "8px 12px", fontSize: 12, border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                style={{ 
                  position: "absolute", top: "100%", right: 0, marginTop: 8,
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  minWidth: 140, overflow: "hidden"
                }}
              >
                {languages.map((l) => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: language === l.code ? "rgba(0,229,255,0.08)" : "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 12 }}>
                    <span>{l.name}</span><span>{l.flag}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5ff, #00ff88)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(0,229,255,0.4)",
            }}>
              <Zap size={22} color="#060b14" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>MediMind</span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>{t.joinCopilot}</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Full Name *</label>
              <div style={{ position: "relative" }}>
                <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input className="input" type="text" value={form.name} onChange={set("name")} placeholder="Your full name" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t.email} *</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t.password} *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input className="input" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Phone</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input className="input" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91..." style={{ paddingLeft: 38 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Age</label>
                <input className="input" type="number" value={form.age} onChange={set("age")} placeholder="Your age" min={1} max={120} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Role *</label>
                <select className="input" value={form.role || "user"} onChange={set("role")} required>
                  <option value="user">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Gender</label>
                <select className="input" value={form.gender} onChange={set("gender")}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {form.role === "doctor" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Specialization *</label>
                  <input className="input" type="text" value={form.specialization || ""} onChange={set("specialization")} placeholder="e.g. Cardiologist" required={form.role === "doctor"} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Degree / Type *</label>
                  <input className="input" type="text" value={form.degree || ""} onChange={set("degree")} placeholder="e.g. MD, MBBS" required={form.role === "doctor"} />
                </div>
              </motion.div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "13px", fontSize: 15, marginTop: 4 }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <>{t.signUp} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
            {t.alreadyHaveAccount}{" "}
            <Link to="/login" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{t.signIn}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
