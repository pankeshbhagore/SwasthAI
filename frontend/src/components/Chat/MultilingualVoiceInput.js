import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Globe, Volume2 } from "lucide-react";
import useVoice from "../../hooks/useVoice";

/**
 * MultilingualVoiceInput
 * GitHub Copilot helped configure Web Speech API for 10+ Indian languages
 * Challenge 3 Requirement: Enable multilingual capabilities
 */

const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", label: "हिंदी", name: "Hindi", flag: "🇮🇳" },
  { code: "ta-IN", label: "தமிழ்", name: "Tamil", flag: "🇮🇳" },
  { code: "te-IN", label: "తెలుగు", name: "Telugu", flag: "🇮🇳" },
  { code: "mr-IN", label: "मराठी", name: "Marathi", flag: "🇮🇳" },
  { code: "bn-IN", label: "বাংলা", name: "Bengali", flag: "🇮🇳" },
  { code: "gu-IN", label: "ગુજરાતી", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn-IN", label: "ಕನ್ನಡ", name: "Kannada", flag: "🇮🇳" },
  { code: "ml-IN", label: "മലയാളം", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", name: "Punjabi", flag: "🇮🇳" },
  { code: "ur-IN", label: "اردو", name: "Urdu", flag: "🇮🇳" },
  { code: "en-IN", label: "English", name: "English (India)", flag: "🇮🇳" },
];

const PLACEHOLDER_BY_LANGUAGE = {
  "hi-IN": "अपने लक्षण बोलें... (जैसे: बुखार, सिरदर्द)",
  "ta-IN": "உங்கள் அறிகுறிகளை பேசுங்கள்...",
  "te-IN": "మీ లక్షణాలు చెప్పండి...",
  "mr-IN": "आपली लक्षणे सांगा...",
  "bn-IN": "আপনার লক্ষণগুলি বলুন...",
  "gu-IN": "તમારા લક્ષણો બોલો...",
  "kn-IN": "ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಹೇಳಿ...",
  "ml-IN": "നിങ്ങളുടെ ലക്ഷണങ്ങൾ പറയൂ...",
  "pa-IN": "ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ...",
  "ur-IN": "اپنی علامات بیان کریں...",
  "en-IN": "Speak your symptoms... (e.g. fever, headache)",
};

const MultilingualVoiceInput = ({ onResult, onTranscript }) => {
  const [selectedLang, setSelectedLang] = useState("hi-IN");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const { isListening, toggleListening, error } = useVoice((finalText) => {
    setLiveTranscript(finalText);
    if (onResult) onResult(finalText, selectedLang.split("-")[0]);
  });

  const selectedLangData = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);

  const handleToggle = () => {
    setLiveTranscript("");
    toggleListening(selectedLang);
    if (onTranscript) onTranscript("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Language Selector */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px",
            background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.2)",
            borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: 13,
            color: "var(--text-secondary)", width: "100%",
          }}
        >
          <Globe size={15} color="var(--accent-cyan)" />
          <span style={{ flex: 1, textAlign: "left" }}>
            {selectedLangData?.flag} {selectedLangData?.label} ({selectedLangData?.name})
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>▼</span>
        </button>

        <AnimatePresence>
          {showLangPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", overflow: "hidden",
                zIndex: 100, maxHeight: 260, overflowY: "auto",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 14px",
                    background: selectedLang === lang.code ? "rgba(0,229,255,0.1)" : "transparent",
                    border: "none", cursor: "pointer",
                    color: selectedLang === lang.code ? "var(--accent-cyan)" : "var(--text-secondary)",
                    fontSize: 13, textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{lang.flag}</span>
                  <div>
                    <div style={{ fontWeight: selectedLang === lang.code ? 700 : 400 }}>{lang.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{lang.name}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Input Button */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          style={{
            width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
            background: isListening
              ? "var(--accent-red)"
              : "linear-gradient(135deg, var(--accent-cyan), #0099bb)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isListening
              ? "0 0 0 0 rgba(255,61,113,0.4)"
              : "0 0 20px rgba(0,229,255,0.3)",
            animation: isListening ? "pulse-red 1.5s infinite" : "none",
          }}
          title={isListening ? "Stop listening" : `Speak in ${selectedLangData?.name}`}
        >
          {isListening ? <MicOff size={22} color="white" /> : <Mic size={22} color="white" />}
        </motion.button>

        <div style={{ flex: 1 }}>
          {isListening ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                padding: "10px 14px",
                background: "rgba(255,61,113,0.08)", border: "1px solid rgba(255,61,113,0.2)",
                borderRadius: "var(--radius-md)", fontSize: 13,
                color: "var(--text-primary)", minHeight: 44,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-red)", display: "inline-block", animation: "pulse-red 1s infinite" }} />
                <span style={{ fontSize: 11, color: "var(--accent-red)", fontWeight: 600 }}>
                  Listening in {selectedLangData?.name}...
                </span>
              </div>
              {liveTranscript && (
                <span style={{ color: "var(--text-primary)" }}>{liveTranscript}</span>
              )}
              {!liveTranscript && (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  {PLACEHOLDER_BY_LANGUAGE[selectedLang]}
                </span>
              )}
            </motion.div>
          ) : (
            <div style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", fontSize: 13,
              color: "var(--text-muted)", minHeight: 44, display: "flex", alignItems: "center",
            }}>
              <Volume2 size={14} style={{ marginRight: 8, flexShrink: 0 }} />
              {liveTranscript
                ? <span style={{ color: "var(--text-primary)" }}>{liveTranscript}</span>
                : <span style={{ fontStyle: "italic" }}>
                    Press mic and speak in {selectedLangData?.name}
                  </span>
              }
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ fontSize: 12, color: "var(--accent-amber)", padding: "6px 10px", background: "rgba(255,179,0,0.08)", borderRadius: "var(--radius-sm)" }}>
          ⚠️ {error}. Try Chrome browser for best voice support.
        </div>
      )}

      {/* Language badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLang(lang.code)}
            style={{
              padding: "3px 8px", fontSize: 10, borderRadius: "100px",
              border: `1px solid ${selectedLang === lang.code ? "rgba(0,229,255,0.4)" : "var(--border)"}`,
              background: selectedLang === lang.code ? "rgba(0,229,255,0.1)" : "transparent",
              color: selectedLang === lang.code ? "var(--accent-cyan)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultilingualVoiceInput;
