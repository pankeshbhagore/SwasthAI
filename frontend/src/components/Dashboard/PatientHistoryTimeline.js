import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, TrendingUp, FileText, Download } from "lucide-react";
import api from "../../utils/api";
import { formatDate, formatTime, getSeverityColor, getSeverityBadgeClass, getSeverityEmoji } from "../../utils/helpers";
import toast from "react-hot-toast";

/**
 * PatientHistoryTimeline
 * Displays 90-day patient health history with vitals, consultations, medications
 * Challenge 3 Requirement: Maintains patient history
 */

const TimelineEntry = ({ entry, index }) => {
  const color = getSeverityColor(entry.severity);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ display: "flex", gap: 16, marginBottom: 16 }}
    >
      {/* Timeline line + dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `${color}15`, border: `2px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>
          {getSeverityEmoji(entry.severity)}
        </div>
        <div style={{ width: 2, flex: 1, minHeight: 20, background: "var(--border)", marginTop: 4 }} />
      </div>

      {/* Entry content */}
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: "12px 14px",
            background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20`,
            borderRadius: "var(--radius-md)", cursor: "pointer",
            transition: "border-color var(--transition)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`severity-badge ${getSeverityBadgeClass(entry.severity)}`} style={{ fontSize: 10 }}>
                {entry.severity}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                {entry.conditions?.length > 0 
                  ? entry.conditions.join(", ") 
                  : (entry.symptoms?.length > 0 ? entry.symptoms[0] : "Health Consultation")}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} />
              {formatDate(entry.createdAt)} · {formatTime(entry.createdAt)}
            </div>
          </div>

          {entry.conditions?.length > 0 && entry.symptoms?.length > 0 && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginTop: 2 }}>
              Symptoms: {entry.symptoms.slice(0, 2).join(", ")}
              {entry.symptoms.length > 2 && "..."}
            </div>
          )}

          {/* Expanded detail */}
          {expanded && entry.advice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}
            >
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {entry.advice}
              </div>
              {entry.risk && (
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  Risk Level: <strong style={{ color: entry.risk === "high" ? "var(--accent-red)" : entry.risk === "medium" ? "var(--accent-amber)" : "var(--accent-green)", textTransform: "uppercase" }}>{entry.risk}</strong>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PatientHistoryTimeline = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState("all"); // all | emergency | moderate | mild

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [histRes, dashRes] = await Promise.allSettled([
        api.get("/users/history", { params: { limit: 90 } }),
        api.get("/users/dashboard"),
      ]);
      if (histRes.status === "fulfilled") setHistory(histRes.value.data.history || []);
      if (dashRes.status === "fulfilled") setStats(dashRes.value.data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/advanced/report/pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `medimind_health_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Health report downloaded!");
    } catch {
      toast.error("PDF download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const filtered = history.filter(entry =>
    filter === "all" || entry.severity === filter.toUpperCase()
  );

  const FILTER_BUTTONS = [
    { key: "all", label: "All" },
    { key: "emergency", label: "Emergency", color: "var(--accent-red)" },
    { key: "moderate", label: "Moderate", color: "var(--accent-amber)" },
    { key: "mild", label: "Mild", color: "var(--accent-green)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header + Download */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            90-Day Health Timeline
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {history.length} consultations recorded
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="btn btn-primary"
          style={{ padding: "9px 18px", fontSize: 13 }}
        >
          {downloading
            ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating...</>
            : <><Download size={15} />Download PDF Report</>
          }
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Total", value: stats.totalConsultations, color: "var(--accent-cyan)" },
            { label: "Emergency", value: stats.severityCounts?.EMERGENCY || 0, color: "var(--accent-red)" },
            { label: "Moderate", value: stats.severityCounts?.MODERATE || 0, color: "var(--accent-amber)" },
            { label: "Mild", value: stats.severityCounts?.MILD || 0, color: "var(--accent-green)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card" style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {FILTER_BUTTONS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 14px", fontSize: 12, borderRadius: "100px",
              border: `1px solid ${filter === key ? (color || "rgba(0,229,255,0.4)") : "var(--border)"}`,
              background: filter === key ? `${color || "rgba(0,229,255,0.15)"}20` : "transparent",
              color: filter === key ? (color || "var(--accent-cyan)") : "var(--text-muted)",
              cursor: "pointer", fontWeight: filter === key ? 700 : 400,
            }}
          >
            {label} {key !== "all" && `(${history.filter(e => e.severity === key.toUpperCase()).length})`}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: "0 auto" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          <Calendar size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>No health records yet.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Your consultation history will appear here.</div>
        </div>
      ) : (
        <div>
          {filtered.map((entry, i) => (
            <TimelineEntry key={entry._id || i} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistoryTimeline;
