import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Award, Clock, Sparkles } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

const EmotionalTimeline = ({ history = [] }) => {
  const [insight, setInsight] = React.useState(null);
  const [loadingInsight, setLoadingInsight] = React.useState(false);
  
  // Mock data if history is empty
  const data = history.length > 0 ? history : [
    { date: "May 2", mood: 1, stress: 3, sleep: 2 },
    { date: "May 2", mood: 2, stress: 2, sleep: 3 },
    { date: "May 2", mood: 5, stress: 1, sleep: 4 },
    { date: "May 2", mood: 3, stress: 3, sleep: 3 },
  ];

  const generateInsight = async () => {
    if (history.length < 2) {
      toast.error("I need at least 2 check-ins to see a pattern.");
      return;
    }
    setLoadingInsight(true);
    try {
      const res = await api.post("/wellness/insights");
      setInsight(res.data.insight);
    } catch (e) {
      toast.error("Failed to generate insight.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800, marginBottom: 12 }}>Your <span className="wellness-header-gradient" style={{ fontStyle: "italic", fontWeight: 400 }}>emotional timeline</span></h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 500 }}>Patterns surface gently when you keep showing up.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <div className="glass-card" style={{ padding: 28, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Check-ins</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{history.length || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 28, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Confidence</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>29%</div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, marginTop: 12 }}>
            <div style={{ width: "29%", height: "100%", background: "var(--wellness-cyan)", borderRadius: 10, boxShadow: "0 0 10px var(--wellness-cyan)" }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 28, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Streak</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>1d</div>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="glass-card" style={{ padding: 32, background: "rgba(255,255,255,0.02)", position: "relative" }}>
        <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Mood Trends</h4>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "80%", height: "60%", background: "var(--wellness-cyan)", filter: "blur(100px)", opacity: 0.05, transform: "translate(-50%, -50%)", pointerEvents: "none" }} />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--wellness-cyan)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--wellness-cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="mood" stroke="var(--wellness-cyan)" strokeWidth={4} fill="url(#moodGrad)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Stress vs Sleep */}
        <div className="glass-card" style={{ padding: 32, background: "rgba(255,255,255,0.02)" }}>
          <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Stress & Sleep correlation</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[1, 5]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="stress" stroke="var(--wellness-rose)" strokeWidth={3} dot={{ r: 4, fill: "var(--wellness-rose)" }} animationDuration={2000} />
              <Line type="monotone" dataKey="sleep" stroke="var(--wellness-emerald)" strokeWidth={3} dot={{ r: 4, fill: "var(--wellness-emerald)" }} animationDuration={2500} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--wellness-rose)" }} /> Stress
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--wellness-emerald)" }} /> Sleep
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(6,182,212,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <h4 style={{ fontSize: 18, fontWeight: 800 }}>Serene Insight</h4>
            <button 
              className="btn btn-ghost" 
              onClick={generateInsight}
              disabled={loadingInsight || history.length < 2}
              style={{ padding: "6px 14px", fontSize: 11, height: 32, borderRadius: 100, background: "rgba(6,182,212,0.1)", color: "var(--wellness-cyan)", border: "1px solid rgba(6,182,212,0.2)" }}
            >
              {loadingInsight ? "Analyzing..." : <><Sparkles size={14} /> Generate</>}
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 500, fontStyle: insight ? "italic" : "normal" }}>
              {insight || "Log a few check-ins, then tap Generate to see what patterns Serene notices across your wellness journey."}
            </p>
          </div>
          <div style={{ marginTop: 24, fontSize: 11, color: "var(--text-muted)", opacity: 0.6, display: "flex", alignItems: "center", gap: 6 }}>
            <Award size={14} /> Reflective only — not a medical interpretation.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmotionalTimeline;
