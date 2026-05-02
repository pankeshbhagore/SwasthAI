import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Plus, X, Mic, MicOff, MapPin, Loader, ChevronDown, User, Navigation, Phone, Clock, Star } from "lucide-react";
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

const HospitalItem = ({ hospital, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{
      padding: "12px 16px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      marginBottom: 10,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div>
        <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{hospital.name}</h5>
        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          {hospital.isEmergency && <span style={{ color: "var(--accent-red)", fontWeight: 800 }}>ER</span>}
          <span>{hospital.address}</span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-cyan)" }}>{hospital.distanceKm} km</div>
        <div style={{ fontSize: 10, color: hospital.isOpen ? "var(--accent-green)" : "var(--accent-red)" }}>
          {hospital.isOpen ? "Open" : "Closed"}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-amber)" }}>
        <Star size={11} fill="currentColor" />
        {hospital.rating || "—"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11, height: 28 }}>
          <Navigation size={12} /> {uiTranslations.en.directions}
        </a>
        {hospital.phone && (
          <a href={`tel:${hospital.phone}`} className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11, height: 28 }}>
            <Phone size={12} />
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

const SymptomAnalyzer = () => {
  const { user } = useAuth();
  const { language: globalLang } = useLanguage();
  const t = uiTranslations[globalLang] || uiTranslations.en;
  
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [ageGroup, setAgeGroup] = useState("Adult (20-59)");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [localLanguage, setLocalLanguage] = useState(globalLang);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const { location, loading: locLoading, getLocation } = useGeolocation();

  useEffect(() => {
    setLocalLanguage(globalLang);
  }, [globalLang]);

  const { isListening, toggleListening } = useVoice((text) => {
    const parsed = normalizeSymptoms(text);
    addSymptoms(parsed);
  });

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

  const removeSymptom = (sym) => setSymptoms((prev) => prev.filter((s) => s !== sym));

  const handleAnalyze = async () => {
    if (symptoms.length === 0 && !inputValue.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }
    
    setLoading(true);
    setResult(null);

    const finalSymptoms = symptoms.length > 0 ? symptoms : normalizeSymptoms(inputValue);

    try {
      const res = await api.post("/ai/analyze", {
        symptoms: finalSymptoms,
        duration,
        reportedSeverity: severity,
        age: ageGroup,
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
      {/* Symptom Checker Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ 
            width: 44, height: 44, background: "rgba(0,229,255,0.1)", 
            borderRadius: "50%", display: "flex", alignItems: "center", 
            justifyContent: "center", margin: "0 auto 12px",
            border: "1px solid rgba(0,229,255,0.2)"
          }}>
            <Stethoscope size={22} color="var(--accent-cyan)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Symptom Checker
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            AI-powered triage based on your symptoms
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Response Language */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
              <span role="img" aria-label="lang">🌐</span> Response language
            </div>
            <select 
              className="input" 
              value={localLanguage} 
              onChange={e => setLocalLanguage(e.target.value)}
              style={{ width: "auto", padding: "4px 10px", fontSize: 12, height: 32 }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
              Describe your symptoms *
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                className="input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="e.g. fever, dry cough, body ache for 2 days"
                rows={4}
                style={{ paddingRight: 40, resize: "none" }}
              />
              <button 
                onClick={toggleListening}
                style={{ 
                  position: "absolute", right: 12, bottom: 12, 
                  background: isListening ? "var(--accent-red)" : "transparent",
                  border: isListening ? "none" : "1px solid var(--border)",
                  color: isListening ? "white" : "var(--text-muted)",
                  padding: 6, borderRadius: 6, cursor: "pointer"
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>

          {/* Dropdowns row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Duration</label>
              <select className="input" value={duration} onChange={e => setDuration(e.target.value)} style={{ fontSize: 13, height: 40 }}>
                <option value="">Select</option>
                <option value="Just started">Just started</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="Over a week">Over a week</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Severity</label>
              <select className="input" value={severity} onChange={e => setSeverity(e.target.value)} style={{ fontSize: 13, height: 40 }}>
                <option value="">Select</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Age group</label>
              <select className="input" value={ageGroup} onChange={e => setAgeGroup(e.target.value)} style={{ fontSize: 13, height: 40 }}>
                <option value="Infant (0-2)">Infant (0-2)</option>
                <option value="Child (3-12)">Child (3-12)</option>
                <option value="Teen (13-19)">Teen (13-19)</option>
                <option value="Adult (20-59)">Adult (20-59)</option>
                <option value="Senior (60+)">Senior (60+)</option>
              </select>
            </div>
          </div>

          {/* Analyze Button */}
          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze} 
            disabled={loading}
            style={{ 
              width: "100%", padding: 14, fontSize: 15, fontWeight: 600,
              background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
              border: "none", marginTop: 8
            }}
          >
            {loading ? <><Loader className="spinner" size={18} /> {t.analyzingAI}</> : "Analyze Symptoms"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Severity Card */}
              {result.triage && <SeverityCard result={result.triage} />}

              {/* Recommended Specialist Card */}
              {result.triage?.recommended_specialist && (
                <div className="glass-card" style={{ padding: 24, background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, background: "rgba(167,139,250,0.15)", 
                      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" 
                    }}>
                      <User size={20} color="var(--accent-purple)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{t.recommendedSpecialist}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                        {result.triage.recommended_specialist}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && (
                <div className="glass-card" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: "var(--font-display)", marginBottom: 20, color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💊</span> {t.recommendations}
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {result.recommendations.immediate_actions?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                          {t.immediateActions}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.recommendations.immediate_actions.map((a, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                              <span style={{ color: "var(--accent-cyan)" }}>•</span> {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {result.recommendations.foods_to_eat?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: "var(--accent-green)", marginBottom: 10, fontWeight: 700 }}>✅ {t.eat}</div>
                          <ul style={{ paddingLeft: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                            {result.recommendations.foods_to_eat.map((f, i) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                      {result.recommendations.foods_to_avoid?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: "var(--accent-red)", marginBottom: 10, fontWeight: 700 }}>❌ {t.avoid}</div>
                          <ul style={{ paddingLeft: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                            {result.recommendations.foods_to_avoid.map((f, i) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Results: Map & Hospitals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={16} color="var(--accent-cyan)" />
                    <h4 style={{ fontSize: 14, fontWeight: 700 }}>{t.nearbyHospitals}</h4>
                  </div>
                  <button onClick={getLocation} className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11, height: 28, background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
                    {t.useLocation}
                  </button>
                </div>

                {/* Mini Map */}
                <div style={{ height: 200, background: "var(--bg-secondary)", position: "relative" }}>
                  {location ? (
                    <iframe
                      title="Hospital Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=13&output=embed&theme=dark`}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
                      <MapPin size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.3 }} />
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Enable location to see nearby hospitals on map</p>
                    </div>
                  )}
                </div>

                {/* Hospital List */}
                <div style={{ padding: "16px", maxHeight: 400, overflowY: "auto" }}>
                  {result.hospitals?.hospitals?.length > 0 ? (
                    <>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                        {t.foundHospitals}: {result.hospitals.hospitals.length}
                      </div>
                      {result.hospitals.hospitals.map((h, i) => (
                        <HospitalItem key={h.id} hospital={h} index={i} />
                      ))}
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {location ? t.noHospitals : "Location required for hospital search"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Translation Card (if any) */}
              {result.translatedAdvice && localLanguage !== "en" && (
                <div className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--accent-cyan)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>
                    🌐 {result.translatedAdvice.language} Translation
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {result.translatedAdvice.translated_text}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymptomAnalyzer;
