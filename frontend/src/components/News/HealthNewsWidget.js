import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Bell, ExternalLink, RefreshCw } from "lucide-react";
import api from "../../utils/api";
import { timeAgo } from "../../utils/helpers";

const AlertCard = ({ alert }) => {
  const colors = { WARNING: "#ffb300", INFO: "#00e5ff", CONDITION: "#a78bfa", SEASONAL: "#00ff88", PREVENTIVE: "#ff8c00" };
  const color = colors[alert.type] || "#00e5ff";
  return (
    <div style={{ padding: "10px 14px", background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 3 }}>{alert.title}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{alert.message}</div>
    </div>
  );
};

const HealthNewsWidget = () => {
  const [news, setNews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("alerts");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [newsRes, alertsRes] = await Promise.allSettled([
        api.get("/advanced/news"),
        api.get("/advanced/news/alerts"),
      ]);
      if (newsRes.status === "fulfilled") setNews(newsRes.value.data.data || []);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Newspaper size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Health Intelligence</h3>
        </div>
        <button onClick={fetchAll} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", padding: 3, marginBottom: 16 }}>
        {[{ key: "alerts", label: `🔔 Alerts${alerts.length ? ` (${alerts.length})` : ""}` }, { key: "news", label: "📰 Health News" }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "7px", fontSize: 12, borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: tab === key ? "var(--bg-card)" : "transparent", color: tab === key ? "var(--accent-cyan)" : "var(--text-muted)", fontWeight: tab === key ? 700 : 400, transition: "all var(--transition)" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}><div className="spinner" style={{ width: 20, height: 20, margin: "0 auto" }} /></div>
      ) : tab === "alerts" ? (
        alerts.length > 0
          ? alerts.map((a, i) => <AlertCard key={i} alert={a} />)
          : <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No active health alerts for your profile.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {news.slice(0, 4).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{item.title}</div>
                {item.url && item.url !== "#" && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 5, lineHeight: 1.4 }}>{item.description?.slice(0, 100)}...</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                <span>{item.source}</span>
                <span>{timeAgo(item.publishedAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthNewsWidget;
