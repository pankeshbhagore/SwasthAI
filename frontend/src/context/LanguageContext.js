import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("swasthai_lang") || "en");

  useEffect(() => {
    localStorage.setItem("swasthai_lang", language);
    const langData = LANGUAGES.find(l => l.code === language);
    document.documentElement.dir = langData?.dir || "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = (code) => {
    setLanguage(code);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
