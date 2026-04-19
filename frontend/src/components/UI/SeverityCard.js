import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { getSeverityColor, getSeverityBadgeClass } from "../../utils/helpers";

const icons = {
  EMERGENCY: AlertCircle,
  MODERATE: AlertTriangle,
  MILD: CheckCircle,
  NORMAL: Info,
};

const SeverityCard = ({ result, compact = false }) => {
  if (!result) return null;

  const severity = result.severity || "NORMAL";
  const color = getSeverityColor(severity);
  const Icon = icons[severity] || Info;
  const badgeClass = getSeverityBadgeClass(severity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-card ${severity === "EMERGENCY" ? "pulse-emergency" : ""}`}
      style={{
        padding: compact ? "16px" : "24px",
        border: `1px solid ${color}30`,
        boxShadow: `0 0 24px ${color}15`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `${color}15`,
            border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Assessment</div>
            <span className={`severity-badge ${badgeClass}`}>{severity}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Risk Level</div>
          <div style={{ fontSize: 14, fontWeight: 700, color, textTransform: "uppercase" }}>
            {result.risk || "LOW"}
          </div>
        </div>
      </div>

      {/* Advice */}
      {result.advice && (
        <div style={{
          background: `${color}08`,
          border: `1px solid ${color}20`,
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          {result.advice}
        </div>
      )}

      {!compact && (
        <>
          {/* Possible Conditions */}
          {result.possible_conditions?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Possible Conditions
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.possible_conditions.map((c, i) => (
                  <span key={i} style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    borderRadius: "var(--radius-sm)",
                    padding: "3px 10px",
                    fontSize: 12,
                    color: "var(--accent-purple)",
                  }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {result.next_steps?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Next Steps
              </div>
              <ol style={{ paddingLeft: 18 }}>
                {result.next_steps.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4, lineHeight: 1.5 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}

      {/* Emergency Call Banner */}
      {result.emergency && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            marginTop: 16,
            background: "rgba(255,61,113,0.1)",
            border: "1px solid rgba(255,61,113,0.3)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--accent-red)", fontWeight: 600 }}>
            🚨 Call Emergency Services NOW
          </span>
          <a
            href="tel:108"
            style={{
              background: "var(--accent-red)",
              color: "white",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Call 108
          </a>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SeverityCard;
