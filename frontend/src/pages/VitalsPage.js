import React from "react";
import { motion } from "framer-motion";
import VitalsTracker from "../components/Vitals/VitalsTracker";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";

const VitalsPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Vitals Tracker</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Log BP, heart rate, blood sugar & more — ML model analyzes risk instantly
      </p>
    </motion.div>
    <VitalsTracker />
    <FloatingEmergencyButton />
  </div>
);
export default VitalsPage;
