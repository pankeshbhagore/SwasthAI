import React from "react";
import { motion } from "framer-motion";
import HospitalFinder from "../components/Hospital/HospitalFinder";

const HospitalsPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
        Find Hospitals
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Nearby hospitals ranked by distance and emergency capability
      </p>
    </motion.div>
    <HospitalFinder />
  </div>
);

export default HospitalsPage;
