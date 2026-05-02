import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle, ArrowRight, Sun, Moon, Coffee } from "lucide-react";

const PlanItem = ({ icon: Icon, title, time, completed }) => (
  <div style={{ 
    display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
    background: completed ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${completed ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
    borderRadius: "var(--radius-lg)",
    transition: "all 0.3s ease"
  }}>
    <div style={{ 
      width: 40, height: 40, borderRadius: 12, 
      background: completed ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <Icon size={20} color={completed ? "var(--accent-green)" : "var(--text-muted)"} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: completed ? "var(--accent-green)" : "var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{time}</div>
    </div>
    {completed ? (
      <CheckCircle size={20} color="var(--accent-green)" />
    ) : (
      <button className="btn btn-ghost" style={{ padding: 8, borderRadius: "50%" }}>
        <ArrowRight size={16} />
      </button>
    )}
  </div>
);

const CalmPlan = ({ onBack }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ 
          width: 60, height: 60, borderRadius: "50%", background: "rgba(99,102,241,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
        }}>
          <Sparkles size={30} color="#6366f1" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Your Calm Plan</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Small steps to keep your nervous system steady today.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PlanItem icon={Sun} title="Morning sunlight (5 min)" time="Before 9:00 AM" completed={true} />
        <PlanItem icon={Coffee} title="Mindful hydration" time="Mid-morning" completed={false} />
        <PlanItem icon={Moon} title="Digital sunset" time="After 9:00 PM" completed={false} />
      </div>

      <div className="glass-card" style={{ marginTop: 40, padding: 24, textAlign: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.1) 100%)" }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Weekly focus</h4>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          "Focus on the space between breaths. That stillness is where your peace lives."
        </p>
      </div>

      <button className="btn btn-ghost" onClick={onBack} style={{ width: "100%", marginTop: 32 }}>
        Back to Dashboard
      </button>
    </motion.div>
  );
};

export default CalmPlan;
