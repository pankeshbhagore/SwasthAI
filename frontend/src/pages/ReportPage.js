import React from "react";
import { motion } from "framer-motion";
import ReportAnalyzer from "../components/Report/ReportAnalyzer";

const ReportPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
        Medical Report Analyzer
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Upload a prescription or lab report — AI explains it in simple language
      </p>
    </motion.div>
    <ReportAnalyzer />
  </div>
);

export default ReportPage;
