import React from "react";
import { motion } from "framer-motion";
import SymptomAnalyzer from "../components/Dashboard/SymptomAnalyzer";
import FirstAidGuide from "../components/UI/FirstAidGuide";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";

const AnalyzePage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
        Symptom Analyzer
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Multi-agent AI: Triage · Recommendation · Translation agents working in parallel
      </p>
    </motion.div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
      <SymptomAnalyzer />
      <FirstAidGuide />
    </div>

    <FloatingEmergencyButton />
  </div>
);

export default AnalyzePage;
