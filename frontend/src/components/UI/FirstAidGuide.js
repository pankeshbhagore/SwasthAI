import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { getFirstAidTip } from "../../utils/triageFrontend";

const FIRST_AID_TOPICS = [
  { keyword: "chest pain", title: "Chest Pain / Heart Attack", emoji: "❤️" },
  { keyword: "breathing", title: "Breathing Difficulty", emoji: "🫁" },
  { keyword: "seizure", title: "Seizure / Fits", emoji: "🧠" },
  { keyword: "bleeding", title: "Severe Bleeding", emoji: "🩸" },
  { keyword: "burn", title: "Burns", emoji: "🔥" },
  { keyword: "choking", title: "Choking", emoji: "😮‍💨" },
  { keyword: "fever", title: "High Fever", emoji: "🌡️" },
  { keyword: "fracture", title: "Fracture / Broken Bone", emoji: "🦴" },
  { keyword: "dizziness", title: "Dizziness / Fainting", emoji: "💫" },
  { keyword: "vomiting", title: "Vomiting / Nausea", emoji: "🤢" },
];

const FirstAidGuide = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FIRST_AID_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Heart size={18} color="var(--accent-red)" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>First Aid Guide</h3>
        <span style={{
          marginLeft: "auto", padding: "2px 8px", borderRadius: "100px",
          background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)",
          fontSize: 10, color: "var(--accent-green)", fontWeight: 700,
        }}>OFFLINE</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search first aid topics..."
          style={{ paddingLeft: 32, padding: "8px 12px 8px 32px" }}
        />
      </div>

      {/* Topics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: selected ? 14 : 0 }}>
        {filtered.map(({ keyword, title, emoji }) => (
          <button
            key={keyword}
            onClick={() => setSelected(selected?.keyword === keyword ? null : { keyword, title, emoji })}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 12px",
              background: selected?.keyword === keyword ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${selected?.keyword === keyword ? "rgba(0,229,255,0.3)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: selected?.keyword === keyword ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 500, textAlign: "left",
              transition: "all var(--transition)",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
          </button>
        ))}
      </div>

      {/* Tip panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "14px 16px",
              background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: "var(--radius-md)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "var(--accent-cyan)" }}>
                {selected.emoji} {selected.title}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {getFirstAidTip(selected.keyword)}
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--accent-red)", fontWeight: 600 }}>
                ⚠️ This is general guidance only. Call{" "}
                <a href="tel:108" style={{ color: "var(--accent-red)" }}>108</a> for medical emergencies.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstAidGuide;
