import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CheckInSlider = ({ label, value, onChange, minLabel, maxLabel, color = "var(--wellness-cyan)" }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: color }}>{value}/5</span>
    </div>
    <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.05) ${((value - 1) / 4) * 100}%)`,
          borderRadius: 10,
          appearance: "none",
          cursor: "pointer",
          outline: "none",
          boxShadow: `0 0 15px ${color}20`
        }}
      />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
      <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{minLabel}</span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{maxLabel}</span>
    </div>
  </div>
);

const MoodCheckIn = ({ onBack, onSave }) => {
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/wellness/check-in", { 
        mood, sleep, stress, energy, notes 
      });
      if (onSave) onSave(res.data.data);
      toast.success("Check-in saved!");
      onBack();
    } catch (e) {
      toast.error("Failed to save check-in");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>A gentle <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent-cyan)" }}>check-in</span></h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Slide each one to where you are. Approximate is perfect.</p>

        <div className="glass-card" style={{ padding: 32 }}>
          <CheckInSlider label="Mood" value={mood} onChange={setMood} minLabel="Awful" maxLabel="Great" color="#06b6d4" />
          <CheckInSlider label="Sleep last night" value={sleep} onChange={setSleep} minLabel="Rough" maxLabel="Restorative" color="#6366f1" />
          <CheckInSlider label="Stress" value={stress} onChange={setStress} minLabel="Calm" maxLabel="Overwhelmed" color="#f43f5e" />
          <CheckInSlider label="Energy" value={energy} onChange={setEnergy} minLabel="Drained" maxLabel="Energized" color="#10b981" />

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Anything you'd like to note?</label>
            <textarea
              className="input" placeholder="Optional..." rows={4}
              value={notes} onChange={(e) => setNotes(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          <button 
            className="btn btn-primary" onClick={handleSave} disabled={saving}
            style={{ width: "100%", marginTop: 32, height: 50, fontSize: 16 }}
          >
            {saving ? "Saving..." : <><Save size={18} /> Save Check-in</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodCheckIn;
