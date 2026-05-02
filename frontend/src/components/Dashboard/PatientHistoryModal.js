import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Activity, Zap, Shield, FileText } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const PatientHistoryModal = ({ patient, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [patient._id]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/doctors/patient/${patient._id}/history`);
      setHistory(res.data.data.history);
    } catch (err) {
      toast.error("Failed to load patient history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20
      }}
    >
      <motion.div 
        initial={{ y: 20 }} animate={{ y: 0 }}
        style={{
          width: "100%", maxWidth: 800, maxHeight: "90vh",
          background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden"
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Health History: {patient.name}</h2>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{patient.age}y • {patient.gender} • {patient.bloodGroup}</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost"><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {loading ? (
            <div className="spinner" />
          ) : history.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {history.map((record, i) => (
                <div key={i} className="glass-card" style={{ padding: 16, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-cyan)", fontWeight: 600 }}>
                      <Calendar size={14} /> {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                    <span style={{ 
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: record.severity === "EMERGENCY" ? "rgba(255,61,113,0.1)" : "rgba(0,255,136,0.1)",
                      color: record.severity === "EMERGENCY" ? "var(--accent-red)" : "var(--accent-green)"
                    }}>
                      {record.severity}
                    </span>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>SYMPTOMS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {record.symptoms.map(s => (
                        <span key={s} style={{ padding: "2px 8px", background: "var(--bg-card)", borderRadius: 100, fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>ASSESSMENT</div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{record.assessment}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              No history found for this patient.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PatientHistoryModal;
