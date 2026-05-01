import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Flame, CheckCircle, Circle } from "lucide-react";
import api from "../../utils/api";

const GoalCard = ({ goal }) => {
  const pct = Math.min((goal.progress / goal.target) * 100, 100);
  const color = goal.completed ? "#00ff88" : pct >= 60 ? "#00e5ff" : "#ffb300";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${goal.completed ? "rgba(0,255,136,0.25)" : "var(--border)"}`, borderRadius: "var(--radius-md)", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {goal.completed ? <CheckCircle size={16} color="#00ff88" /> : <Circle size={16} color="var(--text-muted)" />}
          <span style={{ fontSize: 14, fontWeight: 600 }}>{goal.title}</span>
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{goal.progress}/{goal.target} {goal.unit}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{goal.description}</div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
          style={{ height: "100%", borderRadius: 3, background: color }} />
      </div>
    </motion.div>
  );
};

const HealthGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/advanced/goals")
      .then(res => {
        const goalsData = res.data?.data || res.data || [];
        setGoals(Array.isArray(goalsData) ? goalsData : []);
      })
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = goals.filter(g => g.completed).length;

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={18} color="var(--accent-amber)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Health Goals</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#ff8c00" }}>
          <Flame size={15} /> {completed}/{goals.length} completed
        </div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 20 }}><div className="spinner" style={{ width: 20, height: 20, margin: "0 auto" }} /></div>
        : goals.map(g => <GoalCard key={g.id} goal={g} />)}
    </div>
  );
};

export default HealthGoals;
