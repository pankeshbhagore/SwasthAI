import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { uiTranslations } from "../utils/translations";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

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

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
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
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>{t.signIntoCopilot}</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t.email}</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  className="input" type="email" value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{t.password}</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  className="input" type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "13px", fontSize: 15 }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <>{t.signIn} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            {t.dontHaveAccount}{" "}
            <Link to="/register" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{t.createOne}</Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
          <Link to="/emergency" style={{ color: "var(--accent-red)", fontWeight: 600 }}>
            🚨 {t.emergencySosShort}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
