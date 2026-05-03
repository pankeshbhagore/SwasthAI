import React from "react";
import { motion } from "framer-motion";
import HealthDashboard from "../components/Dashboard/HealthDashboard";
import DoctorDashboard from "../components/Dashboard/DoctorDashboard";
import RiskPredictionCard from "../components/Dashboard/RiskPredictionCard";
import HealthHistoryTable from "../components/Dashboard/HealthHistoryTable";
import FloatingEmergencyButton from "../components/Emergency/FloatingEmergencyButton";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  return (
    <div style={{ padding: 32 }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          {isDoctor ? "Doctor Dashboard" : "Health Dashboard"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋 — {isDoctor ? "Managing your patient requests and history." : "Here's your health overview."}
        </p>
      </motion.div>

      {isDoctor ? (
        <DoctorDashboard />
      ) : (
        <>
          <HealthDashboard />
          <div style={{ marginTop: 24 }}>
            <RiskPredictionCard />
          </div>
          <div style={{ marginTop: 24 }}>
            <HealthHistoryTable />
          </div>
        </>
      )}

      {!isDoctor && <FloatingEmergencyButton />}
    </div>
  );
};

export default DashboardPage;
