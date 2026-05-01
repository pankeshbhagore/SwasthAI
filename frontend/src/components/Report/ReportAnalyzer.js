import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, AlertTriangle, CheckCircle, Pill, FlaskConical, Loader } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { uiTranslations } from "../../utils/translations";
import api from "../../utils/api";
import toast from "react-hot-toast";

const ReportAnalyzer = () => {
  const { language } = useLanguage();
  const t = uiTranslations[language] || uiTranslations.en;
  const [reportText, setReportText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("text"); // "text" | "upload"

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      toast.success(`File ready: ${accepted[0].name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "image/*": [], "text/plain": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!reportText.trim() && !file) {
      toast.error("Please enter report text or upload a file");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("report", file);
        if (reportText) formData.append("text", reportText);
        res = await api.post("/reports/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/reports/analyze-text", { text: reportText });
      }
      setResult(res.data.analysis);
      toast.success("Report analyzed successfully!");
    } catch (error) {
      toast.error(error.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Input Section */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FileText size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{t.medicalReportAnalyzer}</h3>
        </div>

        {/* Tab Switch */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", padding: 4 }}>
          {[{ key: "text", label: t.pasteText }, { key: "upload", label: t.uploadFile }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: "8px", borderRadius: "var(--radius-sm)",
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: tab === key ? "var(--bg-card)" : "transparent",
                color: tab === key ? "var(--accent-cyan)" : "var(--text-muted)",
                transition: "all var(--transition)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "text" ? (
          <textarea
            className="input"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder={t.pastePlaceholder}
            rows={8}
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
        ) : (
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? "var(--accent-cyan)" : "var(--border)"}`,
              borderRadius: "var(--radius-md)", padding: 40, textAlign: "center",
              cursor: "pointer", transition: "all var(--transition)",
              background: isDragActive ? "rgba(0,229,255,0.05)" : "transparent",
            }}
          >
            <input {...getInputProps()} />
            <Upload size={32} color={isDragActive ? "var(--accent-cyan)" : "var(--text-muted)"} style={{ marginBottom: 12 }} />
            {file ? (
              <div>
                <div style={{ fontWeight: 600, color: "var(--accent-green)", marginBottom: 4 }}>✅ {file.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  {isDragActive ? "Drop your file here" : t.dragDropReport}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF, JPG, PNG, or TXT — max 10MB</div>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={(!reportText.trim() && !file) || loading}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 16, padding: 13, fontSize: 15 }}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 18, height: 18 }} />{t.analyzingReport}</>
          ) : (
            <><FileText size={18} />{t.analyzeWithAI}</>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Summary */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <FileText size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>
                  {t.reportSummary} — <span style={{ color: "var(--accent-purple)", textTransform: "capitalize" }}>{result.report_type}</span>
                </h4>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
                {result.summary}
              </p>

              {result.key_findings?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.keyFindings}</div>
                  <ul style={{ paddingLeft: 18 }}>
                    {result.key_findings.map((f, i) => (
                      <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 5 }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Medications */}
            {result.medications?.length > 0 && (
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Pill size={16} color="var(--accent-green)" />
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{t.medicationsExplained}</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.medications.map((med, i) => (
                    <div key={i} style={{
                      padding: "12px 14px",
                      background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)",
                      borderRadius: "var(--radius-sm)",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-green)", marginBottom: 4 }}>{med.name}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        <strong>{t.purpose}:</strong> {med.purpose}
                      </div>
                      {med.notes && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>📝 {med.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abnormal Values */}
            {result.abnormal_values?.length > 0 && (
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <FlaskConical size={16} color="var(--accent-amber)" />
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{t.abnormalValues}</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.abnormal_values.map((val, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto",
                      gap: 8, padding: "10px 12px",
                      background: "rgba(255,179,0,0.05)", border: "1px solid rgba(255,179,0,0.15)",
                      borderRadius: "var(--radius-sm)", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{val.test}</span>
                      <span style={{ fontSize: 13, color: "var(--accent-amber)", fontWeight: 700 }}>{val.value}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.normal}: {val.normal_range}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{val.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow Up + Questions */}
            <div className="glass-card" style={{ padding: 20 }}>
              {result.follow_up && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.followUpAdvice}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{result.follow_up}</p>
                </div>
              )}

              {result.questions_to_ask_doctor?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {t.questionsToAsk}
                  </div>
                  <ol style={{ paddingLeft: 18 }}>
                    {result.questions_to_ask_doctor.map((q, i) => (
                      <li key={i} style={{ fontSize: 13, color: "var(--accent-cyan)", marginBottom: 5 }}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}

              {result.red_flags?.length > 0 && (
                <div style={{
                  marginTop: 14, padding: "12px 14px",
                  background: "rgba(255,61,113,0.07)", border: "1px solid rgba(255,61,113,0.2)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  <div style={{ fontSize: 12, color: "var(--accent-red)", fontWeight: 700, marginBottom: 6 }}>{t.redFlags}</div>
                  <ul style={{ paddingLeft: 16 }}>
                    {result.red_flags.map((f, i) => (
                      <li key={i} style={{ fontSize: 12, color: "rgba(255,61,113,0.8)", marginBottom: 3 }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportAnalyzer;
