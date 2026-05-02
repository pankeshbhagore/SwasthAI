import React from "react";
import { motion } from "framer-motion";
import FamilyDoctor from "../components/Doctor/FamilyDoctor";

const FamilyDoctorPage = () => {
  return (
    <div style={{ padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Family Doctor
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Your personal medical partner for lifelong health and wellness.
        </p>
      </motion.div>

      <FamilyDoctor />
    </div>
  );
};

export default FamilyDoctorPage;
