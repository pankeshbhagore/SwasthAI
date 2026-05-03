import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Wind, BookOpen, ClipboardList, TrendingUp, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import api from "../../utils/api";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
  <div className="glass-card" style={{ padding: "24px 28px", flex: 1, border: "1px solid #063970" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ padding: 10, background: `rgba(6, 57, 112, 0.1)`, borderRadius: 12 }}>
        <Icon size={20} color="#063970" />
      </div>
      <span style={{ fontSize: 11, color: "#063970", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>{label}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 900, color: "#063970", marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 800 }}>{subValue}</div>
  </div>
);

const ActionCard = ({ icon: Icon, title, description, color, onClick, primary = false }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 40px ${color}15` }}
    onClick={onClick}
    className="glass-card"
    style={{
      padding: 32, cursor: "pointer", position: "relative", overflow: "hidden",
      background: primary ? `linear-gradient(135deg, rgba(6, 57, 112, 0.1), rgba(6, 57, 112, 0.02))` : "rgba(255,255,255,0.02)",
      border: `1px solid #063970`
    }}
  >
    {/* Decorative light effect */}
    {primary && (
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        background: color, filter: "blur(40px)", opacity: 0.2, borderRadius: "50%"
      }} />
    )}

    <div style={{
      width: 48, height: 48, background: `${color}20`, borderRadius: 14,
      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      boxShadow: `0 8px 16px ${color}10`
    }}>
      <Icon size={24} color={color} />
    </div>
    <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h4>
    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 700 }}>{description}</p>
    <div style={{ position: "absolute", bottom: 24, right: 24, opacity: 0.5 }}>
      <ChevronRight size={20} color={color} />
    </div>
  </motion.div>
);

const MentalDashboard = ({ setView, stats = {}, onRefresh }) => {
  const { language } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;

  const handleQuickCheckIn = async (score) => {
    // Intelligently map other metrics based on mood for quick check-in
    // 1 (Awful) -> Stress: 5, Energy: 1
    // 5 (Great) -> Stress: 1, Energy: 5
    const mappedStress = 6 - score;
    const mappedEnergy = score;

    try {
      await api.post("/wellness/check-in", {
        mood: score,
        sleep: 3,
        stress: mappedStress,
        energy: mappedEnergy,
        notes: "Quick check-in from dashboard"
      });
      toast.success("Mood & Stress recorded!");
      if (onRefresh) onRefresh();
    } catch (e) {
      toast.error("Failed to record mood");
    }
  };

  const MOOD_EMOJIS = [
    { label: "AWFUL", emoji: "😫", color: "#f43f5e", score: 1 },
    { label: "LOW", emoji: "🙁", color: "#f59e0b", score: 2 },
    { label: "OKAY", emoji: "😐", color: "#6366f1", score: 3 },
    { label: "GOOD", emoji: "😊", color: "#10b981", score: 4 },
    { label: "GREAT", emoji: "🤩", color: "#06b6d4", score: 5 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header Section */}
      <div style={{ textAlign: "center", maxWidth: 650, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--wellness-cyan)", marginBottom: 20 }}
        >
          <Heart size={20} fill="currentColor" />
          <span style={{ fontWeight: 800, letterSpacing: "0.2em", fontSize: 13 }}>SERENE WELLNESS</span>
        </motion.div>
        <h1 className="wellness-header-gradient" style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" }}>
          How are you <span style={{ fontStyle: "italic", fontWeight: 600 }}>feeling</span> right now?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, fontWeight: 700 }}>
          There's no wrong answer. Start with whatever feels easiest — a quick check-in, a journal entry, or just a moment to talk.
        </p>
      </div>

      {/* 1-Second Check-in */}
      <div className="glass-card" style={{ padding: 32, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>A 1-second check-in</h3>
          <button onClick={() => setView("checkin")} style={{ background: "none", border: "none", color: "var(--wellness-cyan)", fontSize: 13, cursor: "pointer", fontWeight: 800 }}>
            Detailed check-in →
          </button>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {MOOD_EMOJIS.map((m) => (
            <motion.button
              key={m.label}
              whileHover={{ y: -6, scale: 1.05, background: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickCheckIn(m.score)}
              style={{
                flex: 1, padding: "24px 12px", background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                cursor: "pointer", transition: "all 0.3s"
              }}
            >
              <span style={{ fontSize: 32 }}>{m.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.1em" }}>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          icon={TrendingUp} label="MOOD, LAST 7"
          value={stats.avgMood || "—"} subValue={`${stats.checkins || 0} check-ins`}
          color="#f59e0b"
        />
        <StatCard
          icon={Zap} label="STRESS, LAST 7"
          value={stats.avgStress || "—"} subValue={stats.stressLevel || "Log a check-in"}
          color="#6366f1"
        />
        <StatCard
          icon={ClipboardList} label="LATEST SCREENING"
          value={stats.lastScore || "—"} subValue="take a 2-min screen"
          color="#10b981"
        />
      </div>

      {/* Action Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <ActionCard
          icon={MessageCircle} title="Talk it out"
          description="A calm conversation, no judgment." color="#06b6d4"
          primary onClick={() => setView("talk")}
        />
        <ActionCard
          icon={Wind} title="Breathe, 60 sec"
          description="Slow your nervous system right now." color="#6366f1"
          onClick={() => setView("breathe")}
        />
        <ActionCard
          icon={BookOpen} title="Journal"
          description="Write freely. We'll gently reflect back." color="#10b981"
          onClick={() => setView("journal")}
        />
        <ActionCard
          icon={ClipboardList} title="Screening"
          description="PHQ-9 or GAD-7, ~2 minutes." color="#f43f5e"
          onClick={() => setView("assess")}
        />
        <ActionCard
          icon={TrendingUp} title="Your timeline"
          description="See patterns across days." color="#f59e0b"
          onClick={() => setView("timeline")}
        />
        <ActionCard
          icon={Sparkles} title="Calm plan"
          description="Tiny daily steps, made for today." color="#6366f1"
          onClick={() => setView("calmplan")}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Serene offers support, not diagnosis. If you're in crisis, please contact a local helpline or a trusted person.
        </p>
      </div>
    </motion.div>
  );
};

export default MentalDashboard;
