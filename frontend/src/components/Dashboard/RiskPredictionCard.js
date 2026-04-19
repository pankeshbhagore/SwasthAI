import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Shield, Loader, ChevronDown } from "lucide-react";
import useHealth from "../../hooks/useHealth";

const RiskMeter = ({ score }) => {
  const color = score >= 60 ? "#ff3d71" : score >= 35 ? "#ffb300" : "#00ff88";
  const label = score >= 60 ? "High Risk" : score >= 35 ? "Medium Risk" : "Low Risk";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Overall Risk Score</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}/100 — {label}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            height: "100%", borderRadius: 4,
            background: `linear-gradient(90deg, #00ff88, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
};

const RiskPredictionCard = () => {
  const { loading, riskResult, predictRisk } = useHealth();
  const [expanded, setExpanded] = useState(false);

  const handlePredict = async () => {
    const result = await predictRisk();
    if (result) setExpanded(true);
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TrendingUp size={18} color="var(--accent-purple)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>AI Risk Prediction</h3>
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="btn btn-ghost"
          style={{ padding: "6px 14px", fontSize: 12 }}
        >
          {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Analyzing...</> : <><Shield size={13} />Run Analysis</>}
        </button>
      </div>

      {!riskResult && !loading && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Click "Run Analysis" to get a personalized future health risk prediction based on your profile and health history.
        </p>
      )}

      {riskResult && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {riskResult.riskPrediction && (
              <RiskMeter score={riskResult.riskPrediction.risk_score || 30} />
            )}

            {riskResult.riskPrediction?.top_risks?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Top Risk Factors
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {riskResult.riskPrediction.top_risks.map((r, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)",
                      borderRadius: "var(--radius-sm)",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.condition}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.description}</div>
                      </div>
                      <span style={{
                        padding: "2px 10px", borderRadius: "100px",
                        background: "rgba(167,139,250,0.15)", fontSize: 12,
                        color: "var(--accent-purple)", fontWeight: 700,
                      }}>
                        {r.probability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: 12, display: "flex",
                alignItems: "center", gap: 5,
              }}
            >
              <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              {expanded ? "Show less" : "Show recommendations"}
            </button>

            <AnimatePresence>
              {expanded && riskResult.riskPrediction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: "hidden", marginTop: 14 }}
                >
                  {riskResult.riskPrediction.preventive_measures?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--accent-green)", marginBottom: 6, fontWeight: 600 }}>✅ Preventive Measures</div>
                      <ul style={{ paddingLeft: 18 }}>
                        {riskResult.riskPrediction.preventive_measures.map((m, i) => (
                          <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {riskResult.riskPrediction.lifestyle_recommendations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--accent-cyan)", marginBottom: 6, fontWeight: 600 }}>💡 Lifestyle Tips</div>
                      <ul style={{ paddingLeft: 18 }}>
                        {riskResult.riskPrediction.lifestyle_recommendations.map((r, i) => (
                          <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default RiskPredictionCard;
