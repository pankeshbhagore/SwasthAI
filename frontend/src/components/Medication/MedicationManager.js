import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Plus, Check, X, Clock, AlertTriangle, Bell } from "lucide-react";
import api from "../../utils/api";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import toast from "react-hot-toast";

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "thrice_daily", label: "Three times daily" },
  { value: "four_times", label: "Four times daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

const FORMS = ["tablet", "capsule", "syrup", "injection", "inhaler", "drops", "cream", "other"];

const MedCard = ({ med, onTake, onDelete }) => {
  const adherence = med.takenLog?.length
    ? Math.round(med.takenLog.filter(l => l.taken).length / med.takenLog.length * 100)
    : null;

  const daysLeft = med.duration?.endDate
    ? Math.max(0, Math.ceil((new Date(med.duration.endDate) - Date.now()) / 86400000))
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Pill size={15} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: 15, fontWeight: 700 }}>{med.name}</h4>
            <span style={{ fontSize: 11, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "var(--radius-sm)", padding: "2px 7px", color: "var(--accent-cyan)" }}>{med.dosage}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            {FREQUENCIES.find(f => f.value === med.frequency)?.label || med.frequency}
            {med.times?.length ? ` · ${med.times.join(", ")}` : ""}
          </div>
          {med.purpose && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>📋 {med.purpose}</div>}
        </div>
        <button onClick={() => onDelete(med._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {adherence !== null && (
            <span style={{ fontSize: 11, color: adherence >= 80 ? "var(--accent-green)" : adherence >= 50 ? "var(--accent-amber)" : "var(--accent-red)", background: adherence >= 80 ? "rgba(0,255,136,0.1)" : adherence >= 50 ? "rgba(255,179,0,0.1)" : "rgba(255,61,113,0.1)", padding: "3px 8px", borderRadius: "100px", border: `1px solid ${adherence >= 80 ? "rgba(0,255,136,0.25)" : "var(--border)"}` }}>
              {adherence}% adherence
            </span>
          )}
          {daysLeft !== null && (
            <span style={{ fontSize: 11, color: daysLeft <= 3 ? "var(--accent-red)" : "var(--text-muted)" }}>
              <Clock size={10} style={{ marginRight: 3 }} />{daysLeft}d left
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onTake(med._id, false)} className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>Skip</button>
          <button onClick={() => onTake(med._id, true)} className="btn btn-primary" style={{ padding: "5px 12px", fontSize: 11 }}>
            <Check size={13} /> Taken
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const MedicationManager = () => {
  const { language } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "twice_daily", form: "tablet", purpose: "", startDate: new Date().toISOString().split("T")[0], times: ["08:00", "20:00"] });
  const [saving, setSaving] = useState(false);
  const [interactions, setInteractions] = useState(null);

  useEffect(() => { fetchMeds(); }, []);

  const fetchMeds = async () => {
    try {
      const res = await api.get("/advanced/medications");
      const medsData = res.data?.data || res.data || [];
      setMeds(Array.isArray(medsData) ? medsData : []);
      if (Array.isArray(medsData) && medsData.length >= 2) {
        checkInteractions(medsData);
      }
    } catch { setMeds([]); } finally { setLoading(false); }
  };

  const checkInteractions = async (medList) => {
    if (medList.length < 2) return;
    try {
      const res = await api.post("/advanced/drug-interactions", { medications: medList.map(m => m.name) });
      if (res.data.data.total > 0) setInteractions(res.data.data);
    } catch {}
  };

  const handleSave = async () => {
    if (!form.name || !form.dosage) { toast.error("Name and dosage required"); return; }
    setSaving(true);
    try {
      await api.post("/advanced/medications", { ...form, duration: { startDate: form.startDate } });
      toast.success("Medication added!");
      setShowForm(false);
      setForm({ name: "", dosage: "", frequency: "twice_daily", form: "tablet", purpose: "", startDate: new Date().toISOString().split("T")[0], times: ["08:00", "20:00"] });
      await fetchMeds();
      const updated = await api.get("/advanced/medications");
      checkInteractions(updated.data.data || []);
    } catch { toast.error("Failed to add medication"); } finally { setSaving(false); }
  };

  const handleTake = async (id, taken) => {
    try {
      await api.post(`/advanced/medications/${id}/take`, { taken });
      toast.success(taken ? "✓ Marked as taken" : "Skipped");
      fetchMeds();
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/advanced/medications/${id}`);
      toast.success("Medication removed");
      fetchMeds();
    } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>{t.medications}</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{meds.length} active · with adherence tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          <Plus size={16} /> {t.addMedication}
        </button>
      </div>

      {/* Drug Interaction Warning */}
      {interactions?.hasCritical && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "14px 16px", background: "rgba(255,61,113,0.1)", border: "2px solid rgba(255,61,113,0.3)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontWeight: 700, color: "var(--accent-red)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} />⚠️ Drug Interaction Warning
          </div>
          {interactions.interactions.map((i, idx) => (
            <div key={idx} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong style={{ color: "var(--accent-red)" }}>{i.severity}:</strong> {i.drug1} + {i.drug2} — {i.description}
            </div>
          ))}
        </motion.div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, marginBottom: 16 }}>{t.addMedication}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {[["name", t.medicationName + " *", "text", "e.g. Metformin"], ["dosage", t.dosage + " *", "text", "e.g. 500mg"], ["purpose", t.purpose, "text", "e.g. For diabetes"]].map(([k, l, t, p]) => (
                  <div key={k} style={k === "purpose" ? { gridColumn: "span 2" } : {}}>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>{l}</label>
                    <input className="input" type={t} value={form[k] || ""} onChange={e => setForm(p2 => ({ ...p2, [k]: e.target.value }))} placeholder={p} style={{ padding: "8px 12px" }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>{t.frequency}</label>
                  <select className="input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} style={{ padding: "8px 12px" }}>
                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Form</label>
                  <select className="input" value={form.form} onChange={e => setForm(p => ({ ...p, form: e.target.value }))} style={{ padding: "8px 12px", textTransform: "capitalize" }}>
                    {FORMS.map(f => <option key={f} value={f} style={{ textTransform: "capitalize" }}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} />Saving...</> : <><Pill size={14} />{t.addMedication}</>}
                </button>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ padding: "10px 16px" }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medications List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}><div className="spinner" style={{ width: 24, height: 24, margin: "0 auto" }} /></div>
      ) : meds.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
          {t.noMedications}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {meds.map(med => <MedCard key={med._id} med={med} onTake={handleTake} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
};

export default MedicationManager;
