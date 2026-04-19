import React from "react";
import { motion } from "framer-motion";
import HealthDashboard from "../components/Dashboard/HealthDashboard";
import RiskPredictionCard from "../components/Dashboard/RiskPredictionCard";
import HealthHistoryTable from "../components/Dashboard/HealthHistoryTable";
import AQIBanner from "../components/UI/AQIBanner";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Health Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋 — Here's your health overview.
        </p>
      </motion.div>

      <AQIBanner />
      <HealthDashboard />

      <div style={{ marginTop: 24 }}>
        <RiskPredictionCard />
      </div>

      <div style={{ marginTop: 24 }}>
        <HealthHistoryTable />
      </div>

      <FloatingEmergencyButton />
    </div>
  );
};

export default DashboardPage;
