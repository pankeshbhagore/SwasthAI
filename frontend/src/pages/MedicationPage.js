import React from "react";
import { motion } from "framer-motion";
import MedicationManager from "../components/Medication/MedicationManager";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";

const MedicationPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Medications</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Track medications, set reminders, check drug interactions & adherence
      </p>
    </motion.div>
    <MedicationManager />
    <FloatingEmergencyButton />
  </div>
);
export default MedicationPage;
