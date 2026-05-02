import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, TrendingUp, AlertTriangle, Heart, Droplets, Thermometer, Wind } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import toast from "react-hot-toast";

const VITALS_FIELDS = [
  { key: "systolic", label: "Systolic BP", unit: "mmHg", icon: Heart, color: "#ff3d71", min: 70, max: 250, normal: "90-120", placeholder: "120" },
  { key: "diastolic", label: "Diastolic BP", unit: "mmHg", icon: Heart, color: "#ff8c00", min: 40, max: 150, normal: "60-80", placeholder: "80" },
  { key: "heartRate", label: "Heart Rate", unit: "bpm", icon: Zap, color: "#00e5ff", min: 30, max: 220, normal: "60-100", placeholder: "72" },
  { key: "bloodSugar", label: "Blood Sugar", unit: "mg/dL", icon: Droplets, color: "#a78bfa", min: 40, max: 600, normal: "70-100 fasting", placeholder: "90" },
  { key: "temperature", label: "Temperature", unit: "°F", icon: Thermometer, color: "#ffb300", min: 95, max: 110, normal: "98.6", placeholder: "98.6" },
  { key: "oxygenSat", label: "SpO2", unit: "%", icon: Wind, color: "#00ff88", min: 70, max: 100, normal: "95-100", placeholder: "98" },
  { key: "weight", label: "Weight", unit: "kg", icon: Zap, color: "#7dd3fc", min: 1, max: 500, normal: "BMI 18.5-25", placeholder: "65" },
];

const AlertBanner = ({ alerts }) => {
  if (!alerts?.length) return null;
  const critical = alerts.filter(a => a.type === "CRITICAL");
  const warnings = alerts.filter(a => a.type === "WARNING");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
      {critical.map((a, i) => (
        <div key={i} style={{ padding: "10px 14px", background: "rgba(255,61,113,0.1)", border: "1px solid rgba(255,61,113,0.3)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={14} /><strong>CRITICAL:</strong> {a.message}
        </div>
      ))}
      {warnings.map((a, i) => (
        <div key={i} style={{ padding: "10px 14px", background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.25)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={14} />{a.message}
        </div>
      ))}
    </div>
  );
};

const VitalsTracker = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [vitals, setVitals] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [latestRisk, setLatestRisk] = useState(null);
  const [activeChart, setActiveChart] = useState("systolic");

  useEffect(() => { fetchVitals(); }, []);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/advanced/vitals");
      const vitalsData = res.data?.data?.vitals || res.data?.vitals || [];
      setVitals(Array.isArray(vitalsData) ? vitalsData : []);
    } catch {
      setVitals([]);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!Object.keys(form).length) { toast.error("Enter at least one vital"); return; }
    
    // Quick frontend validation
    if (form.oxygenSat && Number(form.oxygenSat) > 100) {
      toast.error("SpO2 cannot exceed 100%");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bloodPressure: form.systolic || form.diastolic ? { systolic: Number(form.systolic), diastolic: Number(form.diastolic) } : undefined,
        heartRate: form.heartRate ? Number(form.heartRate) : undefined,
        bloodSugar: form.bloodSugar ? { value: Number(form.bloodSugar) } : undefined,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        oxygenSaturation: form.oxygenSat ? Number(form.oxygenSat) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        notes: form.notes,
      };
      const res = await api.post("/advanced/vitals", payload);
      const mlRisk = res.data?.data?.mlRisk || res.data?.mlRisk;
      if (mlRisk) setLatestRisk(mlRisk);
      toast.success("Vitals saved!");
      setForm({});
      fetchVitals();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save vitals";
      toast.error(msg);
      console.error("Vitals Error:", err.response?.data);
    } finally { setSaving(false); }
  };

  const chartData = vitals.slice(0, 14).reverse().map((v, i) => ({
    i: i + 1,
    systolic: v.bloodPressure?.systolic,
    diastolic: v.bloodPressure?.diastolic,
    heartRate: v.heartRate,
    bloodSugar: v.bloodSugar?.value,
    temperature: v.temperature,
    oxygenSat: v.oxygenSaturation,
    weight: v.weight,
  }));

  const chartField = VITALS_FIELDS.find(f => f.key === activeChart);

  // Map labels dynamically from translation
  const getFieldLabel = (key) => {
    const labels = {
      systolic: t.systolicBP,
      diastolic: t.diastolicBP,
      heartRate: t.heartRate,
      bloodSugar: t.bloodSugar,
      temperature: t.temperature,
      oxygenSat: t.spo2,
      weight: t.weight
    };
    return labels[key] || key;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Log Form */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Zap size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{t.logVitals}</h3>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent-green)", background: "rgba(0,255,136,0.1)", padding: "2px 8px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.2)" }}>{t.mlRiskAnalysis}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 14 }}>
          {VITALS_FIELDS.map(({ key, unit, placeholder, color, normal }) => (
            <div key={key}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
                {getFieldLabel(key)} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({unit})</span>
              </label>
              <input
                className="input"
                type="number"
                value={form[key] || ""}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ padding: "8px 12px", borderColor: form[key] ? `${color}40` : undefined }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{t.normal}: {normal}</div>
            </div>
          ))}
        </div>
        <input className="input" value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.notes + " (optional)"} style={{ marginBottom: 12 }} />
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: "100%", padding: 12 }}>
          {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Plus size={16} />{t.saveAndAnalyze}</>}
        </button>
        {latestRisk && <AlertBanner alerts={latestRisk.alerts} />}
      </div>

      {/* Trend Chart */}
      {chartData.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{t.vitalsTrend}</h3>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VITALS_FIELDS.map(f => (
                <button key={f.key} onClick={() => setActiveChart(f.key)}
                  style={{ padding: "4px 10px", fontSize: 10, borderRadius: "var(--radius-sm)", border: `1px solid ${activeChart === f.key ? f.color : "var(--border)"}`, background: activeChart === f.key ? `${f.color}15` : "transparent", color: activeChart === f.key ? f.color : "var(--text-muted)", cursor: "pointer" }}>
                  {getFieldLabel(f.key).split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: "#7a9bb8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7a9bb8" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey={activeChart} stroke={chartField?.color || "var(--accent-cyan)"} strokeWidth={2} dot={{ r: 3, fill: chartField?.color }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Entries */}
      {vitals.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, marginBottom: 14 }}>Recent Readings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vitals.slice(0, 5).map((v, i) => (
              <motion.div key={v._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 70 }}>{new Date(v.createdAt).toLocaleDateString("en-IN")}</span>
                {v.bloodPressure?.systolic && <span style={{ fontSize: 12, color: "#ff3d71" }}>BP: {v.bloodPressure.systolic}/{v.bloodPressure.diastolic}</span>}
                {v.heartRate && <span style={{ fontSize: 12, color: "#00e5ff" }}>HR: {v.heartRate}</span>}
                {v.bloodSugar?.value && <span style={{ fontSize: 12, color: "#a78bfa" }}>BS: {v.bloodSugar.value}</span>}
                {v.temperature && <span style={{ fontSize: 12, color: "#ffb300" }}>Temp: {v.temperature}°F</span>}
                {v.oxygenSaturation && <span style={{ fontSize: 12, color: "#00ff88" }}>SpO2: {v.oxygenSaturation}%</span>}
                {v.mlRisk?.risk_level && (
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: "100px", background: v.mlRisk.risk_level === "high" ? "rgba(255,61,113,0.15)" : v.mlRisk.risk_level === "medium" ? "rgba(255,179,0,0.15)" : "rgba(0,255,136,0.1)", color: v.mlRisk.risk_level === "high" ? "var(--accent-red)" : v.mlRisk.risk_level === "medium" ? "var(--accent-amber)" : "var(--accent-green)", fontWeight: 700 }}>
                    {v.mlRisk.risk_level.toUpperCase()} RISK
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsTracker;
