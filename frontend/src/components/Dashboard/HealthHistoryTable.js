import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../utils/api";
import { formatDate, formatTime, getSeverityBadgeClass, getSeverityEmoji } from "../../utils/helpers";
import toast from "react-hot-toast";

const HealthHistoryTable = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/users/history", { params: { page: p, limit: 8 } });
      setHistory(res.data.history);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch {
      // demo data
      setHistory([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this history entry?")) return;
    try {
      await api.delete(`/users/history/${id}`);
      toast.success("Entry removed");
      fetchHistory(page);
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <History size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>Health History</h3>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} records</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <div className="spinner" style={{ width: 24, height: 24, margin: "0 auto" }} />
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>
          No health history yet. Start your first symptom analysis!
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((entry, i) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", gap: 12,
                }}
              >
                {/* Left: severity + symptoms */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{getSeverityEmoji(entry.severity)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: "var(--text-primary)" }}>
                      {entry.conditions?.length > 0 
                        ? entry.conditions.join(", ") 
                        : (entry.symptoms?.length > 0 ? entry.symptoms[0] : "Health Check")}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Middle: badge */}
                <span className={`severity-badge ${getSeverityBadgeClass(entry.severity)}`} style={{ flexShrink: 0 }}>
                  {entry.severity}
                </span>

                {/* Right: conditions + delete */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {entry.conditions?.length > 0 && (
                    <span style={{
                      fontSize: 11, color: "var(--text-muted)",
                      maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {entry.conditions[0]}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(entry._id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", padding: 4, display: "flex",
                    }}
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost"
                style={{ padding: "6px 10px" }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-ghost"
                style={{ padding: "6px 10px" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HealthHistoryTable;
