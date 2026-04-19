import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Stethoscope, MapPin,
  FileText, User, LogOut, Menu, X, AlertCircle, Zap,
  Activity, Pill, Brain, Apple, Sparkles, Cpu, History
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getHealthScoreColor, getHealthScoreLabel } from "../../utils/helpers";
import toast from "react-hot-toast";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/chat", icon: MessageSquare, label: "AI Health Chat" },
      { to: "/analyze", icon: Stethoscope, label: "Symptom Analyzer" },
    ],
  },
  {
    label: "Health Tracking",
    items: [
      { to: "/vitals", icon: Activity, label: "Vitals Tracker" },
      { to: "/medications", icon: Pill, label: "Medications" },
      { to: "/nutrition", icon: Apple, label: "Nutrition & Diet" },
      { to: "/mental-health", icon: Brain, label: "Mental Health" },
      { to: "/history", icon: History, label: "Patient History" },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/hospitals", icon: MapPin, label: "Find Hospitals" },
      { to: "/report", icon: FileText, label: "Report Analyzer" },
      { to: "/ml-demo", icon: Cpu, label: "ML Predictor" },
      { to: "/wellness", icon: Sparkles, label: "Wellness Hub" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/profile", icon: User, label: "Profile" },
    ],
  },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const score = user?.healthScore || 75;

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
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17 }}>SwasthAI</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Healthcare Agent</div>
        </div>
      </div>

      {user && (
        <div className="glass-card" style={{ padding: "12px 14px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 5 }}>Health Score</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${getHealthScoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${getHealthScoreColor(score)}12`, flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: getHealthScoreColor(score) }}>{score}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: getHealthScoreColor(score) }}>{getHealthScoreLabel(score)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.name?.split(" ")[0]} 👋</div>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1 }}>
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "4px 10px 5px", marginTop: 8 }}>{label}</div>
            {items.map(({ to, icon: Icon, label: navLabel }) => (
              <NavLink key={to} to={to} onClick={() => mobile && setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: "var(--radius-md)", marginBottom: 2,
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: isActive ? "rgba(0,229,255,0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(0,229,255,0.15)" : "1px solid transparent",
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: "all var(--transition)", textDecoration: "none",
                })}>
                <Icon size={15} />{navLabel}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => { navigate("/emergency"); mobile && setMobileOpen(false); }} className="btn btn-danger" style={{ width: "100%", marginBottom: 8, justifyContent: "center", padding: "9px", fontSize: 13 }}>
          <AlertCircle size={15} /> Emergency SOS
        </button>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: 13 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="app-layout">
      <div className="desktop-sidebar"><Sidebar /></div>
      <div style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "12px 16px", alignItems: "center", justifyContent: "space-between" }} className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 800 }}>
          <Zap size={20} color="var(--accent-cyan)" />SwasthAI
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
      <style>{`@media (max-width: 768px) { .desktop-sidebar { display: none !important; } .mobile-topbar { display: flex !important; } .main-content { margin-left: 0 !important; padding-top: 56px; } }`}</style>
    </div>
  );
};

export default Layout;
