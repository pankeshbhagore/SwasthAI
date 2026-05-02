import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Phone, MapPin, Mic, MicOff, Send, Zap } from "lucide-react";
import { normalizeSymptoms } from "../utils/helpers";
import { performTriageFrontend } from "../utils/triageFrontend";
import useVoice from "../hooks/useVoice";
import useGeolocation from "../hooks/useGeolocation";
import { useLanguage } from "../context/LanguageContext";

const EMERGENCY_TRANSLATIONS = {
  en: {
    title: "Emergency SOS",
    quickDial: "🚨 Quick Emergency Dial",
    quickDialSub: "Tap to call immediately — no login required",
    checkTitle: "Quick Symptom Check (Offline)",
    placeholder: "Describe symptoms quickly... e.g. chest pain, difficulty breathing",
    assessBtn: "Quick Assess",
    resultEmergency: "🚨 EMERGENCY DETECTED",
    resultEmergencySub: "Critical symptoms detected. Call emergency services IMMEDIATELY.",
    callNow: "📞 Call 108 NOW",
    resultModerate: "⚠️ MODERATE CONCERN",
    resultModerateSub: "Symptoms need medical attention. Visit a doctor within 24 hours or call 108 if symptoms worsen.",
    resultMild: "✅ MILD — MONITOR AT HOME",
    resultMildSub: "Symptoms appear mild. Rest, stay hydrated, and monitor. See a doctor if symptoms worsen.",
    cta: "For full AI analysis, history tracking & hospital finder — ",
    ctaLink: "Create free account →",
    numbers: {
      Ambulance: "Ambulance",
      National: "National Emergency",
      Police: "Police",
      Fire: "Fire",
      Disaster: "Disaster",
      Women: "Women Helpline",
    }
  },
  hi: {
    title: "आपातकालीन SOS",
    quickDial: "🚨 त्वरित आपातकालीन डायल",
    quickDialSub: "तुरंत कॉल करने के लिए टैप करें - लॉगिन की आवश्यकता नहीं है",
    checkTitle: "त्वरित लक्षण जांच (ऑफलाइन)",
    placeholder: "लक्षणों का संक्षेप में वर्णन करें... जैसे सीने में दर्द, सांस लेने में कठिनाई",
    assessBtn: "त्वरित मूल्यांकन",
    resultEmergency: "🚨 आपातकालीन स्थिति",
    resultEmergencySub: "गंभीर लक्षणों का पता चला है। तुरंत आपातकालीन सेवाओं को कॉल करें।",
    callNow: "📞 अभी 108 पर कॉल करें",
    resultModerate: "⚠️ मध्यम चिंता",
    resultModerateSub: "लक्षणों को चिकित्सा ध्यान देने की आवश्यकता है। 24 घंटे के भीतर डॉक्टर से मिलें या लक्षण बिगड़ने पर 108 पर कॉल करें।",
    resultMild: "✅ हल्का - घर पर निगरानी रखें",
    resultMildSub: "लक्षण हल्के दिखाई देते हैं। आराम करें, हाइड्रेटेड रहें और निगरानी रखें। यदि लक्षण बिगड़ते हैं तो डॉक्टर से मिलें।",
    cta: "पूर्ण AI विश्लेषण, इतिहास ट्रैकिंग और अस्पताल खोजक के लिए — ",
    ctaLink: "मुफ्त खाता बनाएं →",
    numbers: {
      Ambulance: "एम्बुलेंस",
      National: "राष्ट्रीय आपातकाल",
      Police: "पुलिस",
      Fire: "दमकल",
      Disaster: "आपदा",
      Women: "महिला हेल्पलाइन",
    }
  },
  es: {
    title: "SOS de Emergencia",
    quickDial: "🚨 Marcación Rápida de Emergencia",
    quickDialSub: "Toque para llamar de inmediato — no se requiere inicio de sesión",
    checkTitle: "Verificación Rápida de Síntomas (Sin conexión)",
    placeholder: "Describa los síntomas rápidamente... ej. dolor en el pecho, dificultad para respirar",
    assessBtn: "Evaluación Rápida",
    resultEmergency: "🚨 EMERGENCIA DETECTADA",
    resultEmergencySub: "Síntomas críticos detectados. Llame a los servicios de emergencia INMEDIATAMENTE.",
    callNow: "📞 Llame al 108 AHORA",
    resultModerate: "⚠️ PREOCUPACIÓN MODERADA",
    resultModerateSub: "Los síntomas necesitan atención médica. Visite a un médico en 24 horas o llame al 108 si los síntomas empeoran.",
    resultMild: "✅ LEVE — MONITOREAR EN CASA",
    resultMildSub: "Los síntomas parecen leves. Descanse, manténgase hidratado y monitoree. Vea a un médico si los síntomas empeoran.",
    cta: "Para un análisis completo de IA, seguimiento de historial y buscador de hospitales — ",
    ctaLink: "Crear cuenta gratuita →",
    numbers: {
      Ambulance: "Ambulancia",
      National: "Emergencia Nacional",
      Police: "Policía",
      Fire: "Bomberos",
      Disaster: "Desastre",
      Women: "Línea de Ayuda a la Mujer",
    }
  }
};

// Standalone offline triage for emergency page (no API needed)
const EMERGENCY_NUMBERS = [
  { label: "Ambulance", number: "108", color: "#ff3d71", emoji: "🚑" },
  { label: "National Emergency", number: "112", color: "#ff3d71", emoji: "🆘" },
  { label: "Police", number: "100", color: "#3b82f6", emoji: "🚔" },
  { label: "Fire", number: "101", color: "#f59e0b", emoji: "🚒" },
  { label: "Disaster", number: "1078", color: "#a78bfa", emoji: "⚠️" },
  { label: "Women Helpline", number: "181", color: "#ec4899", emoji: "👩" },
];

const EmergencyPage = () => {
  const { language } = useLanguage();
  const t = EMERGENCY_TRANSLATIONS[language] || EMERGENCY_TRANSLATIONS.en;

  const [symptoms, setSymptoms] = useState("");
  const [assessed, setAssessed] = useState(false);
  const [severity, setSeverity] = useState(null);
  const { location, loading: locLoading, getLocation } = useGeolocation();
  const { isListening, toggleListening } = useVoice((text) => setSymptoms((p) => p ? `${p}, ${text}` : text));

  const handleAssess = () => {
    if (!symptoms.trim()) return;
    const parsed = normalizeSymptoms(symptoms);
    // Simple frontend-only triage
    const emergency = parsed.some(s =>
      ["chest pain","breathing","seizure","stroke","unconscious","bleeding","heart attack"].some(k => s.includes(k))
    );
    const moderate = !emergency && parsed.some(s =>
      ["fever","vomiting","pain","dizziness","headache"].some(k => s.includes(k))
    );
    setSeverity(emergency ? "EMERGENCY" : moderate ? "MODERATE" : "MILD");
    setAssessed(true);
  };

  const emergencyNumbers = EMERGENCY_NUMBERS.map(n => ({
    ...n,
    displayLabel: t.numbers[n.label] || n.label
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,61,113,0.1)", borderBottom: "1px solid rgba(255,61,113,0.3)",
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={24} color="var(--accent-red)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--accent-red)" }}>
            {t.title}
          </span>
        </div>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
          <Zap size={16} color="var(--accent-cyan)" />
          MediMind
        </Link>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        {/* Emergency Call Buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
            {t.quickDial}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
            {t.quickDialSub}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {emergencyNumbers.map(({ displayLabel, number, color, emoji }) => (
              <motion.a
                key={number}
                href={`tel:${number}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "16px 8px",
                  background: `${color}10`, border: `1px solid ${color}30`,
                  borderRadius: "var(--radius-md)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color }}>{number}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textAlign: "center" }}>{displayLabel}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Symptom Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 24, marginBottom: 24 }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>
            {t.checkTitle}
          </h3>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <textarea
              className="input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t.placeholder}
              rows={3}
              style={{ resize: "none", paddingRight: 44 }}
            />
            <button
              onClick={() => toggleListening()}
              style={{
                position: "absolute", right: 10, bottom: 10,
                background: isListening ? "var(--accent-red)" : "rgba(0,229,255,0.1)",
                border: `1px solid ${isListening ? "var(--accent-red)" : "rgba(0,229,255,0.2)"}`,
                borderRadius: "var(--radius-sm)", padding: "6px",
                cursor: "pointer", color: isListening ? "white" : "var(--accent-cyan)",
                display: "flex",
              }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAssess}
              disabled={!symptoms.trim()}
              className="btn btn-danger"
              style={{ flex: 1, padding: "11px" }}
            >
              <Send size={16} /> {t.assessBtn}
            </button>
            <button
              onClick={getLocation}
              disabled={locLoading}
              className="btn btn-ghost"
              style={{ padding: "11px 14px" }}
            >
              {locLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <MapPin size={16} />}
            </button>
          </div>

          {location && (
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent-green)" }}>
              📍 Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </motion.div>

        {/* Result */}
        {assessed && severity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: 20, borderRadius: "var(--radius-lg)", marginBottom: 24,
              ...(severity === "EMERGENCY" ? {
                background: "rgba(255,61,113,0.1)", border: "2px solid rgba(255,61,113,0.4)",
                animation: "pulse-red 1.5s infinite",
              } : severity === "MODERATE" ? {
                background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.3)",
              } : {
                background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)",
              }),
            }}
          >
            {severity === "EMERGENCY" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-red)", marginBottom: 8 }}>
                  {t.resultEmergency}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,61,113,0.9)", marginBottom: 14 }}>
                  {t.resultEmergencySub}
                </p>
                <a href="tel:108" className="btn btn-danger" style={{ display: "inline-flex", fontSize: 16, padding: "12px 24px" }}>
                  {t.callNow}
                </a>
              </>
            )}
            {severity === "MODERATE" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-amber)", marginBottom: 8 }}>
                  {t.resultModerate}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,179,0,0.9)" }}>
                  {t.resultModerateSub}
                </p>
              </>
            )}
            {severity === "MILD" && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)", marginBottom: 8 }}>
                  {t.resultMild}
                </div>
                <p style={{ fontSize: 14, color: "rgba(0,255,136,0.9)" }}>
                  {t.resultMildSub}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Sign up CTA */}
        <div style={{
          textAlign: "center", padding: "20px",
          background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)",
          borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--text-muted)",
        }}>
          {t.cta}
          <Link to="/register" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            {t.ctaLink}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
