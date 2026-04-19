import React from "react";
import { motion } from "framer-motion";
import MentalHealthAssessment from "../components/Mental/MentalHealthAssessment";

const MentalHealthPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Mental Health</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        PHQ-9 depression screening + GAD-7 anxiety assessment with AI-powered analysis
      </p>
    </motion.div>
    <MentalHealthAssessment />
  </div>
);
export default MentalHealthPage;
