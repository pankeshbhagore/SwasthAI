import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Plus, X, Mic, MicOff, MapPin, Loader, ChevronDown } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import { normalizeSymptoms } from "../../utils/helpers";
import useVoice from "../../hooks/useVoice";
import useGeolocation from "../../hooks/useGeolocation";
import SeverityCard from "../UI/SeverityCard";
import toast from "react-hot-toast";

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Cold", "Sore throat",
  "Chest pain", "Breathing difficulty", "Nausea", "Vomiting",
  "Diarrhea", "Abdominal pain", "Dizziness", "Fatigue",
  "Back pain", "Skin rash", "High BP", "Diabetes issue",
];

const SymptomAnalyzer = () => {
  const { user } = useAuth();
  const { language: globalLang } = useLanguage();
  const t = uiTranslations[globalLang] || uiTranslations.en;
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [age, setAge] = useState(user?.age || "");
  const [localLanguage, setLocalLanguage] = useState(globalLang);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local language when global changes
  useEffect(() => {
    setLocalLanguage(globalLang);
  }, [globalLang]);

  const { isListening, toggleListening } = useVoice((text) => {
    const parsed = normalizeSymptoms(text);
    addSymptoms(parsed);
  });

  const { location, loading: locLoading, getLocation } = useGeolocation();

  const addSymptoms = (items) => {
    setSymptoms((prev) => {
      const combined = [...prev, ...items];
      return [...new Set(combined)].slice(0, 15);
    });
  };

  const addInputSymptom = () => {
    if (!inputValue.trim()) return;
    const parsed = normalizeSymptoms(inputValue);
    addSymptoms(parsed);
    setInputValue("");
  };

  const removeSymptom = (sym) => {
    setSymptoms((prev) => prev.filter((s) => s !== sym));
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      toast.error("Please add at least one symptom");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/ai/analyze", {
        symptoms,
        age: age || user?.age,
        medicalHistory: user?.medicalHistory?.chronicConditions || [],
        location: location || null,
        language: localLanguage,
      });

      setResult(res.data.data);

      if (res.data.data.triage?.emergency) {
        toast.error("🚨 EMERGENCY: Please call 108 immediately!", { duration: 8000 });
      } else {
        toast.success("Analysis complete!");
      }
    } catch (error) {
      toast.error(error.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Symptom Input */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Stethoscope size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{t.addSymptoms}</h3>
        </div>

        {/* Text input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addInputSymptom()}
            placeholder={t.typeSymptom}
          />
          <button onClick={addInputSymptom} className="btn btn-ghost" style={{ flexShrink: 0, padding: "10px 14px" }}>
            <Plus size={18} />
          </button>
          <button
            onClick={() => toggleListening()}
            className={`btn ${isListening ? "btn-danger" : "btn-ghost"}`}
            style={{ flexShrink: 0, padding: "10px 14px" }}
            title="Voice input"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {isListening && (
          <div style={{
            marginBottom: 12, padding: "8px 12px",
            background: "rgba(255,61,113,0.08)", border: "1px solid rgba(255,61,113,0.2)",
            borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--accent-red)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-red)", display: "inline-block", animation: "pulse-red 1s infinite" }} />
            {t.listening}
          </div>
        )}

        {/* Quick symptoms */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t.quickSelect}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COMMON_SYMPTOMS.map((sym) => (
              <button
                key={sym}
                onClick={() => addSymptoms([sym.toLowerCase()])}
                disabled={symptoms.includes(sym.toLowerCase())}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${symptoms.includes(sym.toLowerCase()) ? "rgba(0,229,255,0.4)" : "var(--border)"}`,
                  background: symptoms.includes(sym.toLowerCase()) ? "rgba(0,229,255,0.1)" : "transparent",
                  color: symptoms.includes(sym.toLowerCase()) ? "var(--accent-cyan)" : "var(--text-muted)",
                  fontSize: 12, cursor: "pointer", transition: "all var(--transition)",
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Selected symptoms */}
        {symptoms.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {t.selectedSymptoms} ({symptoms.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <AnimatePresence>
                {symptoms.map((sym) => (
                  <motion.span
                    key={sym}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "5px 10px",
                      background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
                      borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-primary)",
                    }}
                  >
                    {sym}
                    <button
                      onClick={() => removeSymptom(sym)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Advanced options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 12,
            display: "flex", alignItems: "center", gap: 6, marginBottom: showAdvanced ? 12 : 0,
          }}
        >
          <ChevronDown size={14} style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform var(--transition)" }} />
          {t.advancedOptions}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Age</label>
                  <input
                    className="input" type="number" value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    style={{ padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Analysis Language</label>
                  <select
                    className="input"
                    value={localLanguage}
                    onChange={(e) => setLocalLanguage(e.target.value)}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
              </div>

              <button
                onClick={getLocation}
                disabled={locLoading}
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: "7px 12px" }}
              >
                {locLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <MapPin size={14} />}
                {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Add Location (for hospital search)"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={symptoms.length === 0 || loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 16, padding: "13px", fontSize: 15 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18 }} />
              {t.analyzingAI}
            </>
          ) : (
            <>
              <Stethoscope size={18} />
              {t.analyzeSymptoms}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Triage Result */}
            {result.triage && <SeverityCard result={result.triage} />}

            {/* Recommendations */}
            {result.recommendations && (
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontFamily: "var(--font-display)", marginBottom: 16, color: "var(--accent-cyan)" }}>
                  💊 {t.recommendations}
                </h4>

                {result.recommendations.immediate_actions?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.immediateActions}
                    </div>
                    <ul style={{ paddingLeft: 18 }}>
                      {result.recommendations.immediate_actions.map((a, i) => (
                        <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {result.recommendations.foods_to_eat?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--accent-green)", marginBottom: 6, fontWeight: 600 }}>✅ {t.eat}</div>
                      <ul style={{ paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                        {result.recommendations.foods_to_eat.map((f, i) => <li key={i} style={{ marginBottom: 3 }}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.foods_to_avoid?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--accent-red)", marginBottom: 6, fontWeight: 600 }}>❌ {t.avoid}</div>
                      <ul style={{ paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                        {result.recommendations.foods_to_avoid.map((f, i) => <li key={i} style={{ marginBottom: 3 }}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {result.recommendations.follow_up_timeline && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px",
                    background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)",
                    borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)",
                  }}>
                    🕐 <strong>{t.followUp}:</strong> {result.recommendations.follow_up_timeline}
                  </div>
                )}
              </div>
            )}

            {/* Translated Advice */}
            {result.translatedAdvice && language !== "en" && (
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontFamily: "var(--font-display)", marginBottom: 12, fontSize: 14 }}>
                  🌐 {result.translatedAdvice.language} Translation
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {result.translatedAdvice.translated_text}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymptomAnalyzer;
