import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Stethoscope, MapPin,
  FileText, User, LogOut, Menu, X, AlertCircle, 
  Zap, Pill, Brain, Apple, Sparkles, Cpu, History,
  Sun, Moon, Languages, Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import { getHealthScoreColor, getHealthScoreLabel } from "../../utils/helpers";
import toast from "react-hot-toast";

const getNavSections = (t) => [
  {
    label: t.core,
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
      { to: "/chat", icon: MessageSquare, label: t.aiChat },
      { to: "/family-doctor", icon: Stethoscope, label: t.familyDoctor },
      { to: "/analyze", icon: Stethoscope, label: t.symptomAnalyzer },
    ],
  },
  {
    label: t.healthTracking,
    items: [
      { to: "/vitals", icon: Zap, label: t.vitalsTracker },
      { to: "/medications", icon: Pill, label: t.medications },
      { to: "/nutrition", icon: Apple, label: t.nutrition },
      { to: "/mental-health", icon: Brain, label: t.mentalHealth },
      { to: "/history", icon: History, label: t.history },
    ],
  },
  {
    label: t.tools,
    items: [
      { to: "/hospitals", icon: MapPin, label: t.findHospitals },
      { to: "/report", icon: FileText, label: t.reportAnalyzer },
      { to: "/ml-demo", icon: Cpu, label: t.mlPredictor },
      { to: "/wellness", icon: Sparkles, label: t.wellnessHub },
    ],
  },
  {
    label: t.account,
    items: [
      { to: "/profile", icon: User, label: t.profile },
    ],
  },
];

import { io } from "socket.io-client";
import CallNotification from "../Communication/CallNotification";
import ChatInterface from "../Communication/ChatInterface";

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, languages } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  
  const socketRef = React.useRef(null);

  React.useEffect(() => {
    if (user) {
      const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");
      socketRef.current = socket;
      socket.emit("join-room", user._id);

      socket.on("incoming-call", (data) => {
        setIncomingCall(data);
      });

      socket.on("call-ended", () => {
        setActiveCall(null);
        setIncomingCall(null);
        toast.error("Call ended");
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const handleAcceptCall = () => {
    setActiveCall({ user: { _id: incomingCall.from, name: "Provider" }, type: incomingCall.type });
    setIncomingCall(null);
    // In real app, we would send signal back
  };
  const score = user?.healthScore || 75;
  const isDoctor = user?.role === "doctor";
  
  const navSections = isDoctor ? [
    {
      label: t.core,
      items: [
        { to: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
        { to: "/chat", icon: MessageSquare, label: t.aiChat },
      ],
    },
    {
      label: t.account,
      items: [
        { to: "/profile", icon: User, label: t.profile },
      ],
    },
  ] : getNavSections(t);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      width: 260, height: "100vh",
      background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "20px 14px",
      position: mobile ? "relative" : "fixed", top: 0, left: 0, zIndex: 100, overflowY: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 6px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #00e5ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(0,229,255,0.4)", flexShrink: 0 }}>
          <Zap size={17} color="#060b14" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22 }}>MediMind</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>Healthcare Agent</div>
        </div>
      </div>

      {user && !isDoctor && (
        <div className="glass-card" style={{ padding: "12px 14px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 5 }}>{t.healthScore}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${getHealthScoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${getHealthScoreColor(score)}12`, flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: getHealthScoreColor(score) }}>{score}</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: getHealthScoreColor(score) }}>{getHealthScoreLabel(score, language)}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 800 }}>{user.name?.split(" ")[0]} 👋</div>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1 }}>
        {navSections.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 900, padding: "4px 10px 8px", marginTop: 12 }}>{label}</div>
            {items.map(({ to, icon: Icon, label: navLabel }) => (
              <NavLink key={to} to={to} onClick={() => mobile && setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--radius-md)", marginBottom: 4,
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: isActive ? "rgba(0,229,255,0.08)" : "transparent",
                  border: isActive ? "2px solid rgba(0,229,255,0.2)" : "2px solid transparent",
                  fontSize: 16, fontWeight: isActive ? 900 : 700,
                  transition: "all var(--transition)", textDecoration: "none",
                })}>
                <Icon size={15} />{navLabel}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 8 }}>
        {!isDoctor && (
          <button onClick={() => { navigate("/emergency"); mobile && setMobileOpen(false); }} className="btn btn-danger" style={{ width: "100%", marginBottom: 8, justifyContent: "center", padding: "9px", fontSize: 13 }}>
            <AlertCircle size={15} /> {t.emergencySos}
          </button>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "9px", fontSize: 13 }}>
            <LogOut size={15} /> {t.logout}
          </button>
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ width: 40, height: 40, padding: 0, borderRadius: "var(--radius-md)", flexShrink: 0 }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={16} color="var(--accent-amber)" /> : <Moon size={16} color="var(--accent-purple)" />}
          </button>
        </div>

        {/* Language Selector */}
        <div style={{ marginTop: 12, position: "relative" }}>
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "space-between", padding: "8px 12px", fontSize: 12, border: "1px solid var(--border)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Languages size={14} />
              <span>{languages.find(l => l.code === language)?.name}</span>
            </div>
            <span>{languages.find(l => l.code === language)?.flag}</span>
          </button>
          
          <AnimatePresence>
            {langOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                style={{ 
                  position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 8,
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  zIndex: 1000, overflow: "hidden"
                }}
              >
                {languages.map((l) => (
                  <button 
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    style={{ 
                      width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: language === l.code ? "rgba(0,229,255,0.08)" : "transparent",
                      border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 12,
                      transition: "background 0.2s"
                    }}
                  >
                    <span>{l.name}</span>
                    <span>{l.flag}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app-layout">
      <div className="desktop-sidebar"><Sidebar /></div>
      <div style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 16px", alignItems: "center", justifyContent: "space-between" }} className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 800 }}>
          <Zap size={20} color="var(--accent-cyan)" />MediMind
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, zIndex: 300 }}>
            <Sidebar mobile />
          </motion.div>
        )}
      </AnimatePresence>
      <main className="main-content"><Outlet /></main>
      
      <AnimatePresence>
        {incomingCall && (
          <CallNotification 
            call={incomingCall} 
            onAccept={handleAcceptCall} 
            onReject={() => setIncomingCall(null)} 
          />
        )}
        {activeCall && (
          <ChatInterface 
            otherUser={activeCall.user} 
            type={activeCall.type} 
            onClose={() => setActiveCall(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 768px) { .desktop-sidebar { display: none !important; } .mobile-topbar { display: flex !important; } .main-content { margin-left: 0 !important; padding-top: 56px; } }`}</style>
    </div>
  );
};

export default Layout;
