import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageCircle, BookOpen, ClipboardList, TrendingUp, Wind, Heart, Zap } from "lucide-react";
import MentalDashboard from "../components/Mental/MentalDashboard";
import MoodCheckIn from "../components/Mental/MoodCheckIn";
import BreathingExercise from "../components/Mental/BreathingExercise";
import EmotionalTimeline from "../components/Mental/EmotionalTimeline";
import MentalHealthAssessment from "../components/Mental/MentalHealthAssessment";

import api from "../utils/api";

import TalkItOut from "../components/Mental/TalkItOut";
import Journaling from "../components/Mental/Journaling";
import CalmPlan from "../components/Mental/CalmPlan";

const MentalHealthPage = () => {
  const [view, setView] = useState("dashboard"); // dashboard, talk, journal, checkin, assess, timeline, breathe
  const [stats, setStats] = useState({
    avgMood: "—",
    checkins: 0,
    avgStress: "—",
    stressLevel: "Log a check-in",
    lastScore: "—",
    history: []
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/wellness/stats");
      setStats(res.data.data);
    } catch (e) {
      console.error("Failed to fetch wellness stats");
    }
  };

  const TABS = [
    { id: "dashboard", label: "Today" },
    { id: "talk", label: "Talk" },
    { id: "journal", label: "Journal" },
    { id: "checkin", label: "Check-In" },
    { id: "assess", label: "Assess" },
    { id: "timeline", label: "Timeline" },
    { id: "calmplan", label: "Calm Plan" },
    { id: "breathe", label: "Breathe" },
  ];

  const renderView = () => {
    switch (view) {
      case "dashboard": return <MentalDashboard setView={setView} stats={stats} onRefresh={fetchStats} />;
      case "checkin": return <MoodCheckIn onBack={() => setView("dashboard")} onSave={() => { fetchStats(); setView("dashboard"); }} />;
      case "talk": return <TalkItOut onBack={() => setView("dashboard")} />;
      case "journal": return <Journaling onBack={() => setView("dashboard")} />;
      case "breathe": return <BreathingExercise onBack={() => setView("dashboard")} onTalk={() => setView("talk")} />;
      case "timeline": return <EmotionalTimeline onBack={() => setView("dashboard")} history={stats.history} />;
      case "assess": return <MentalHealthAssessment onBack={() => setView("dashboard")} />;
      case "calmplan": return <CalmPlan onBack={() => setView("dashboard")} />;
      default: return (
        <div style={{ textAlign: "center", padding: 60 }}>
          <h2 style={{ opacity: 0.5 }}>{view.charAt(0).toUpperCase() + view.slice(1)} Feature Coming Soon</h2>
          <button className="btn btn-ghost" onClick={() => setView("dashboard")} style={{ marginTop: 20 }}>Back to Today</button>
        </div>
      );
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Immersive Background Blobs */}
      <div className="wellness-bg">
        <div className="wellness-blob wellness-blob-1" />
        <div className="wellness-blob wellness-blob-2" />
        <div className="wellness-blob wellness-blob-3" />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px", position: "relative", zIndex: 1 }}>
        {/* Navigation Tabs - Modern Pill Style */}
        <div style={{ 
          display: "flex", justifyContent: "center", marginBottom: 60,
          position: "sticky", top: 20, zIndex: 100
        }}>
          <div style={{ 
            display: "flex", background: "var(--bg-glass)", 
            backdropFilter: "blur(20px)", padding: 6, borderRadius: 100, 
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={view === tab.id ? "wellness-tab-active" : ""}
                style={{
                  padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700,
                  background: "transparent",
                  color: view === tab.id ? "#fff" : "var(--text-secondary)",
                  border: "none", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MentalHealthPage;
