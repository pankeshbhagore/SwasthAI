import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HealthNewsWidget from "../components/News/HealthNewsWidget";
import HealthGoals from "../components/Dashboard/HealthGoals";
import { Syringe, Download, CheckCircle } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const VaccinationSchedule = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    api.get("/advanced/vaccinations/schedule", { params: { age: user?.age } })
      .then(res => {
        const scheduleData = res.data?.data?.schedule || res.data?.schedule || [];
        setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
      })
      .catch(() => setSchedule([]));
  }, [user]);

  const priorityColor = { HIGH: "var(--accent-red)", MEDIUM: "var(--accent-amber)", LOW: "var(--accent-green)" };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Syringe size={18} color="var(--accent-green)" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Vaccination Schedule</h3>
      </div>
      {schedule.map((v, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
          <CheckCircle size={16} color={priorityColor[v.priority] || "var(--text-muted)"} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.due} · {v.available}</div>
          </div>
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: "100px", background: `${priorityColor[v.priority]}15`, color: priorityColor[v.priority], fontWeight: 700 }}>{v.priority}</span>
        </motion.div>
      ))}
    </div>
  );
};

const DownloadReportCard = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/advanced/report/pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "swasthai_health_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Health report downloaded!");
    } catch { toast.error("Download failed. Try again."); } finally { setDownloading(false); }
  };

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Download size={18} color="var(--accent-cyan)" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Download Health Report</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF summary of your complete health data</div>
        </div>
      </div>
      <button onClick={handleDownload} disabled={downloading} className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
        {downloading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating PDF...</> : <><Download size={14} />Download My Health Report</>}
      </button>
    </div>
  );
};

const WellnessPage = () => (
  <div style={{ padding: 32 }}>
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Wellness Hub</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Health news · Goals · Vaccination schedule · Report download</p>
    </motion.div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <HealthGoals />
        <HealthNewsWidget />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DownloadReportCard />
        <VaccinationSchedule />
      </div>
    </div>
  </div>
);

export default WellnessPage;
