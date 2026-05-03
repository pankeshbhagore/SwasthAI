import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, ChevronRight, Info } from "lucide-react";
import api from "../utils/api";
import { getSeverityColor, getSeverityBadgeClass } from "../utils/helpers";
import toast from "react-hot-toast";

const DEMO_SYMPTOMS = [
  { label: "Cold & Flu", symptoms: ["fever", "cough", "body ache", "runny nose"] },
  { label: "Cardiac Concern", symptoms: ["chest pain", "shortness of breath", "sweating"] },
  { label: "Digestive Issue", symptoms: ["vomiting", "diarrhea", "stomach pain", "nausea"] },
  { label: "Dengue-like", symptoms: ["fever", "joint pain", "rash", "eye pain"] },
  { label: "Stress/Anxiety", symptoms: ["headache", "fatigue", "dizziness", "insomnia"] },
];

const ModelInfoCard = ({ info }) => (
  <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <Info size={16} color="#063970" />
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>ML Model Information</h4>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
      {[
        ["Diseases", info?.diseases || "40+", "#063970"],
        ["Training Samples", info?.training_samples || "40+", "#063970"],
        ["Algorithms", "RF + GB + TF-IDF", "#063970"],
        ["Status", info?.trained ? "Trained ✓" : "Rule-based", "#ffb300"],
      ].map(([label, value, color]) => (
        <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: `${color}08`, border: `1px solid ${color}15`, borderRadius: "var(--radius-sm)" }}>
          <div style={{ fontWeight: 800, color, fontSize: 15 }}>{value}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  </div>
);

const MLDemoPage = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    api.get("/advanced/ml/model-info")
      .then(res => setModelInfo(res.data.data))
      .catch(() => {});
  }, []);

  const addSymptom = (s) => {
    if (!symptoms.includes(s.toLowerCase())) setSymptoms(prev => [...prev, s.toLowerCase()]);
  };

  const handlePreset = (preset) => {
    setSymptoms(preset.symptoms);
    setResult(null);
  };

  const handlePredict = async () => {
    if (symptoms.length === 0) { toast.error("Add symptoms first"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/advanced/ml/predict-disease", { symptoms });
      setResult(res.data.data);
    } catch { toast.error("Prediction failed"); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(6, 57, 112, 0.15)", border: "1px solid rgba(6, 57, 112, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={22} color="#063970" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800 }}>ML Disease Predictor</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Random Forest + TF-IDF trained on 40+ diseases · Gradient Boosting vitals risk
            </p>
          </div>
        </div>

        {/* Architecture badge */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {["Random Forest", "TF-IDF Vectorizer", "Gradient Boosting", "scikit-learn", "Python Flask"].map(tech => (
            <span key={tech} style={{ padding: "3px 10px", borderRadius: "100px", background: "rgba(6, 57, 112, 0.1)", border: "1px solid rgba(6, 57, 112, 0.2)", fontSize: 11, color: "#063970", fontWeight: 800 }}>
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Model Info */}
      <ModelInfoCard info={modelInfo} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* Input Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preset scenarios */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, marginBottom: 14 }}>Quick Demo Scenarios</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO_SYMPTOMS.map((preset) => (
                <button key={preset.label} onClick={() => handlePreset(preset)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: symptoms.join() === preset.symptoms.join() ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${symptoms.join() === preset.symptoms.join() ? "rgba(167,139,250,0.35)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left",
                  }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: symptoms.join() === preset.symptoms.join() ? "#063970" : "var(--text-primary)" }}>{preset.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{preset.symptoms.join(", ")}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom input */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, marginBottom: 12 }}>Add Custom Symptoms</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="input" value={customInput} onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && customInput.trim()) { addSymptom(customInput.trim()); setCustomInput(""); } }}
                placeholder="Type symptom + Enter" style={{ padding: "8px 12px" }} />
              <button onClick={() => { if (customInput.trim()) { addSymptom(customInput.trim()); setCustomInput(""); } }} className="btn btn-ghost" style={{ padding: "8px 12px", flexShrink: 0 }}>+</button>
            </div>

            {/* Selected */}
            {symptoms.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Selected symptoms ({symptoms.length}):</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {symptoms.map(s => (
                    <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
                      {s}
                      <button onClick={() => setSymptoms(prev => prev.filter(x => x !== s))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handlePredict} disabled={symptoms.length === 0 || loading} className="btn btn-primary" style={{ padding: "13px", fontSize: 15 }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} />Running ML Model...</> : <><Brain size={18} />Predict Disease</>}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <Zap size={16} color="var(--accent-green)" />
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>ML Predictions</h3>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", background: "rgba(0,255,136,0.08)", padding: "2px 7px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.2)" }}>
                      {result.source === "ml_model" ? "AI Model" : "Rule-based"}
                    </span>
                  </div>

                  {/* Overall severity */}
                  <div style={{ textAlign: "center", padding: "14px", background: `${getSeverityColor(result.overall_severity)}10`, border: `1px solid ${getSeverityColor(result.overall_severity)}25`, borderRadius: "var(--radius-md)", marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Overall Severity</div>
                    <span className={`severity-badge ${getSeverityBadgeClass(result.overall_severity)}`} style={{ fontSize: 14 }}>
                      {result.overall_severity}
                    </span>
                  </div>

                  {/* Predictions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.predictions?.map((pred, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{pred.disease}</div>
                            <span className={`severity-badge ${getSeverityBadgeClass(pred.severity)}`} style={{ fontSize: 10, padding: "2px 7px" }}>{pred.severity}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                             <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: i === 0 ? "#063970" : "var(--text-muted)" }}>{pred.confidence}%</div>
                            <div style={{ fontSize: 9, color: "var(--text-muted)" }}>confidence</div>
                          </div>
                        </div>
                        {/* Confidence bar */}
                        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pred.confidence}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                             style={{ height: "100%", borderRadius: 2, background: i === 0 ? "#063970" : "rgba(6, 57, 112, 0.4)" }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                   <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(6, 57, 112, 0.05)", border: "1px solid rgba(6, 57, 112, 0.12)", borderRadius: "var(--radius-sm)", fontSize: 11, color: "var(--text-muted)" }}>
                    ⚠️ ML predictions are probabilistic, not diagnostic. Always consult a qualified doctor.
                  </div>
                </div>
              </motion.div>
            )}

            {!result && (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <Zap size={32} color="rgba(167,139,250,0.3)" style={{ marginBottom: 12 }} />
                <div>Select a demo scenario or add symptoms,<br />then click Predict.</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MLDemoPage;
