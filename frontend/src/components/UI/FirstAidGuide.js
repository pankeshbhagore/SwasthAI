import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { getFirstAidTip } from "../../utils/triageFrontend";
import { useLanguage } from "../../context/LanguageContext";

const GUIDE_TRANSLATIONS = {
  en: {
    title: "First Aid Guide",
    placeholder: "Search first aid topics...",
    warning: "This is general guidance only. Call 108 for medical emergencies.",
    offline: "OFFLINE",
    topics: {
      "chest pain": "Chest Pain / Heart Attack",
      "breathing": "Breathing Difficulty",
      "seizure": "Seizure / Fits",
      "bleeding": "Severe Bleeding",
      "burn": "Burns",
      "choking": "Choking",
      "fever": "High Fever",
      "fracture": "Fracture / Broken Bone",
      "dizziness": "Dizziness / Fainting",
      "vomiting": "Vomiting / Nausea",
    }
  },
  hi: {
    title: "प्राथमिक चिकित्सा गाइड",
    placeholder: "प्राथमिक चिकित्सा विषयों को खोजें...",
    warning: "यह केवल सामान्य मार्गदर्शन है। चिकित्सा आपात स्थिति के लिए 108 पर कॉल करें।",
    offline: "ऑफलाइन",
    topics: {
      "chest pain": "सीने में दर्द / दिल का दौरा",
      "breathing": "सांस लेने में कठिनाई",
      "seizure": "दौरा / फिट्स",
      "bleeding": "गंभीर रक्तस्राव",
      "burn": "जलना",
      "choking": "दम घुटना",
      "fever": "तेज बुखार",
      "fracture": "फ्रैक्चर / हड्डी टूटना",
      "dizziness": "चक्कर आना / बेहोशी",
      "vomiting": "उल्टी / मतली",
    }
  },
  es: {
    title: "Guía de Primeros Auxilios",
    placeholder: "Buscar temas de primeros auxilios...",
    warning: "Esta es solo una guía general. Llame al 108 para emergencias médicas.",
    offline: "SIN CONEXIÓN",
    topics: {
      "chest pain": "Dolor en el pecho / Ataque cardíaco",
      "breathing": "Dificultad para respirar",
      "seizure": "Convulsión / Ataques",
      "bleeding": "Sangrado grave",
      "burn": "Quemaduras",
      "choking": "Asfixia",
      "fever": "Fiebre alta",
      "fracture": "Fractura / Hueso roto",
      "dizziness": "Mareos / Desmayos",
      "vomiting": "Vómitos / Náuseas",
    }
  }
};

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
  const { language } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const t = GUIDE_TRANSLATIONS[language] || GUIDE_TRANSLATIONS.en;

  const topics = FIRST_AID_TOPICS.map(topic => ({
    ...topic,
    displayTitle: t.topics[topic.keyword] || topic.title
  }));

  const filtered = topics.filter((t) =>
    t.displayTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Heart size={18} color="var(--accent-red)" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{t.title}</h3>
        <span style={{
          marginLeft: "auto", padding: "2px 8px", borderRadius: "100px",
          background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)",
          fontSize: 10, color: "var(--accent-green)", fontWeight: 700,
        }}>{t.offline}</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.placeholder}
          style={{ paddingLeft: 32, padding: "8px 12px 8px 32px" }}
        />
      </div>

      {/* Topics grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))", 
        gap: 8, 
        marginBottom: selected ? 14 : 0 
      }}>
        {filtered.map(({ keyword, displayTitle, emoji }) => (
          <button
            key={keyword}
            onClick={() => setSelected(selected?.keyword === keyword ? null : { keyword, displayTitle, emoji })}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 12px",
              background: selected?.keyword === keyword ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${selected?.keyword === keyword ? "rgba(0,229,255,0.3)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: selected?.keyword === keyword ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontSize: 11, fontWeight: 500, textAlign: "left",
              transition: "all var(--transition)",
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
            <span style={{ 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
              fontSize: 11 
            }} title={displayTitle}>{displayTitle}</span>
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
                {selected.emoji} {selected.displayTitle}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {getFirstAidTip(selected.keyword, language)}
              </p>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--accent-red)", fontWeight: 600 }}>
                ⚠️ {t.warning}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstAidGuide;
