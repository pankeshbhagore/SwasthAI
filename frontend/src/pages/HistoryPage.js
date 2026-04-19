import React from "react";
import { motion } from "framer-motion";
import PatientHistoryTimeline from "../components/Dashboard/PatientHistoryTimeline";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";

const HistoryPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
        Patient History
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        90-day health timeline · PDF report · ML risk analysis · Pattern detection
      </p>
    </motion.div>
    <PatientHistoryTimeline />
    <FloatingEmergencyButton />
  </div>
);

export default HistoryPage;
