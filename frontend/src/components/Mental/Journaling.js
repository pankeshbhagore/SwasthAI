import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Save, Sparkles, History } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const Journaling = ({ onBack }) => {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [reflection, setReflection] = useState(null);

  const handleSave = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await api.post("/wellness/journal", { content });
      setReflection(res.data.data.aiReflection);
      toast.success("Entry saved!");
    } catch (e) {
      toast.error("Failed to save journal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Journaling</h2>
        <div style={{ width: 40 }} />
      </div>

      <AnimatePresence mode="wait">
        {!reflection ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="glass-card" style={{ padding: 24, minHeight: 400, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--text-muted)" }}>
                <BookOpen size={16} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>
              <textarea
                autoFocus
                className="input"
                placeholder="How was your day? What's on your mind? No rules, just write..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ 
                  flex: 1, border: "none", background: "transparent", fontSize: 16, 
                  lineHeight: 1.6, padding: 0, boxShadow: "none", resize: "none"
                }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={!content.trim() || saving}
                style={{ marginTop: 20, alignSelf: "flex-end", padding: "10px 24px" }}
              >
                {saving ? "Reflecting..." : <><Save size={16} /> Finish Entry</>}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: "50%", background: "rgba(0,229,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
              }}>
                <Sparkles size={24} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Serene's Reflection</h3>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 32 }}>
                "{reflection}"
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn btn-ghost" onClick={() => { setReflection(null); setContent(""); }}>
                  New Entry
                </button>
                <button className="btn btn-primary" onClick={onBack}>
                  Return to Today
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journaling;
