import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import api from "../../utils/api";
import HealthScoreRing from "../UI/HealthScoreRing";
import { formatDate, getSeverityColor } from "../../utils/helpers";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";

const StatCard = ({ label, value, icon: Icon, color, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{ padding: 20 }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color }}>{value}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-md)",
        background: `${color}15`, border: `1px solid ${color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const HealthDashboard = () => {
  const { language } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/users/dashboard");
        setData(res.data);
      } catch {
        // Demo data
        setData({
          healthScore: 78,
          totalConsultations: 12,
          severityCounts: { MILD: 8, MODERATE: 3, EMERGENCY: 1, NORMAL: 0 },
          topSymptoms: [
            { symptom: "fever", count: 4 },
            { symptom: "headache", count: 3 },
            { symptom: "cough", count: 2 },
          ],
          trends: Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
            score: Math.floor(60 + Math.random() * 35),
            severity: ["MILD", "NORMAL", "MODERATE"][Math.floor(Math.random() * 3)],
          })),
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const pieData = Object.entries(data.severityCounts || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: getSeverityColor(name) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Row: Score + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 16, alignItems: "start" }}>
        <div className="glass-card" style={{ padding: 24, display: "flex", justifyContent: "center" }}>
          <HealthScoreRing score={data.healthScore} size={140} />
        </div>
        <StatCard
          label={t.totalConsultations}
          value={data.totalConsultations}
          icon={Calendar}
          color="var(--accent-cyan)"
          subtitle={t.allTime}
        />
        <StatCard
          label={t.emergenciesDetected}
          value={data.severityCounts?.EMERGENCY || 0}
          icon={AlertTriangle}
          color="var(--accent-red)"
          subtitle={t.requiresAttention}
        />
        <StatCard
          label={t.mildCases}
          value={data.severityCounts?.MILD || 0}
          icon={CheckCircle}
          color="var(--accent-green)"
          subtitle={t.recoveredWell}
        />
      </div>

      {/* Health Score Trend */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <TrendingUp size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{t.healthScoreTrend}</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.trends}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              tick={{ fontSize: 10, fill: "#7a9bb8" }} axisLine={false} tickLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#7a9bb8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="score" name={t.healthScore}
              stroke="#00e5ff" strokeWidth={2}
              fill="url(#scoreGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Pie + Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Severity Breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Activity size={18} color="var(--accent-amber)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{t.severityBreakdown}</h3>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <PieChart width={120} height={120}>
                <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pieData.map(({ name, value, color }) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-muted)" }}>{name}</span>
                    <span style={{ color, fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 20 }}>
              No data yet. Start a consultation!
            </div>
          )}
        </div>

        {/* Top Symptoms */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Activity size={18} color="var(--accent-purple)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{t.frequentSymptoms}</h3>
          </div>
          {data.topSymptoms?.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.topSymptoms} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#7a9bb8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="symptom" tick={{ fontSize: 11, fill: "#7a9bb8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Times" fill="var(--accent-purple)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 20 }}>
              No symptoms tracked yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
