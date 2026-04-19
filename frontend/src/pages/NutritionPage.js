import React from "react";
import { motion } from "framer-motion";
import NutritionAnalyzer from "../components/Nutrition/NutritionAnalyzer";

const NutritionPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Nutrition & Diet</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        AI meal analyzer · BMI calculator · 7-day personalized Indian diet plan
      </p>
    </motion.div>
    <NutritionAnalyzer />
  </div>
);
export default NutritionPage;
