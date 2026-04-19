import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, ChevronRight, AlertCircle, Phone } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const ANSWER_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half" },
  { value: 3, label: "Nearly every day" },
];

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things (reading, TV)",
  "Moving or speaking slowly (or being fidgety / restless)",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const ScoreBar = ({ score, max, color, label }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color, fontWeight: 800 }}>{score}/{max}</span>
    </div>
    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${(score / max) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}60` }} />
    </div>
  </div>
);

const MentalHealthAssessment = () => {
  const [step, setStep] = useState("intro"); // intro | phq9 | gad7 | message | result
  const [phq9, setPhq9] = useState(Array(9).fill(null));
  const [gad7, setGad7] = useState(Array(7).fill(null));
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const setAnswer = (arr, setArr, idx, val) => {
    const updated = [...arr]; updated[idx] = val; setArr(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/advanced/mental-health/assess", {
        phq9Answers: phq9.map(v => v ?? 0),
        gad7Answers: gad7.map(v => v ?? 0),
        message,
      });
      setResult(res.data.data);
      setStep("result");
    } catch { toast.error("Assessment failed. Please try again."); } finally { setLoading(false); }
  };

  const renderQuestion = (questions, answers, setAnswers, section) => {
    const total = questions.length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Brain size={18} color={section === "phq9" ? "#a78bfa" : "#00e5ff"} />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>
            {section === "phq9" ? "Depression Screening (PHQ-9)" : "Anxiety Screening (GAD-7)"}
          </h3>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
            Over the last 2 weeks, how often...
          </span>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(answers.filter(a => a !== null).length / total) * 100}%`, background: section === "phq9" ? "#a78bfa" : "#00e5ff", transition: "width 0.3s" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {questions.map((q, i) => (
            <div key={i} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
              <p style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-muted)", marginRight: 8 }}>{i + 1}.</strong>{q}
                {i === 8 && section === "phq9" && (
                  <span style={{ display: "block", fontSize: 11, color: "var(--accent-red)", marginTop: 4 }}>
                    ⚠️ If you are having thoughts of self-harm, please call iCall: 9152987821
                  </span>
                )}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ANSWER_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setAnswer(answers, setAnswers, i, opt.value)}
                    style={{
                      padding: "7px 14px", fontSize: 12, borderRadius: "var(--radius-sm)", cursor: "pointer",
                      border: `1px solid ${answers[i] === opt.value ? (section === "phq9" ? "#a78bfa" : "#00e5ff") : "var(--border)"}`,
                      background: answers[i] === opt.value ? (section === "phq9" ? "rgba(167,139,250,0.15)" : "rgba(0,229,255,0.1)") : "transparent",
                      color: answers[i] === opt.value ? (section === "phq9" ? "#a78bfa" : "var(--accent-cyan)") : "var(--text-secondary)",
                      transition: "all var(--transition)", fontWeight: answers[i] === opt.value ? 700 : 400,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: 24, maxWidth: 720 }}>
      {/* Intro */}
      {step === "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Brain size={22} color="#a78bfa" />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>Mental Health Assessment</h2>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
            This confidential assessment uses PHQ-9 (depression) and GAD-7 (anxiety) — clinically validated tools used by doctors worldwide.
          </p>
          <div style={{ padding: "12px 16px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--radius-md)", marginBottom: 20, fontSize: 13, color: "var(--text-secondary)" }}>
            ⏱️ Takes about 3-5 minutes · Completely private · Results analyzed by AI
          </div>
          <div style={{ marginBottom: 20, padding: "12px 14px", background: "rgba(255,61,113,0.06)", border: "1px solid rgba(255,61,113,0.15)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
            <strong style={{ color: "var(--accent-red)" }}>Crisis Support:</strong>
            <div style={{ color: "var(--text-secondary)", marginTop: 4 }}>iCall: <a href="tel:9152987821" style={{ color: "var(--accent-red)" }}>9152987821</a> · Vandrevala: <a href="tel:18602662345" style={{ color: "var(--accent-red)" }}>1860-2662-345</a></div>
          </div>
          <button onClick={() => setStep("phq9")} className="btn btn-primary" style={{ width: "100%", padding: 12 }}>
            Start Assessment <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {/* PHQ9 */}
      {step === "phq9" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {renderQuestion(PHQ9_QUESTIONS, phq9, setPhq9, "phq9")}
          <button onClick={() => setStep("gad7")} disabled={phq9.some(a => a === null)} className="btn btn-primary" style={{ width: "100%", marginTop: 20, padding: 12 }}>
            Next: Anxiety Screening <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {/* GAD7 */}
      {step === "gad7" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {renderQuestion(GAD7_QUESTIONS, gad7, setGad7, "gad7")}
          <button onClick={() => setStep("message")} disabled={gad7.some(a => a === null)} className="btn btn-primary" style={{ width: "100%", marginTop: 20, padding: 12 }}>
            Next: Optional Message <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Optional Message */}
      {step === "message" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>
            Anything else you'd like to share? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </h3>
          <textarea className="input" value={message} onChange={e => setMessage(e.target.value)}
            placeholder="How are you feeling? What's been on your mind lately? The AI will consider this in its analysis..."
            rows={4} style={{ resize: "none", marginBottom: 16 }} />
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 15 }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} />Analyzing with AI...</> : <><Brain size={18} />Get My Results</>}
          </button>
        </motion.div>
      )}

      {/* Results */}
      {step === "result" && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 20 }}>Your Assessment Results</h3>

          {result.analysis?.crisis ? (
            <div style={{ padding: "16px", background: "rgba(255,61,113,0.15)", border: "2px solid rgba(255,61,113,0.4)", borderRadius: "var(--radius-lg)", marginBottom: 20, textAlign: "center" }}>
              <AlertCircle size={32} color="var(--accent-red)" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--accent-red)", marginBottom: 8 }}>You Are Not Alone</div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14 }}>{result.analysis.action}</p>
              {result.analysis.resources?.map((r, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}><Phone size={12} style={{ marginRight: 5 }} />{r}</div>
              ))}
            </div>
          ) : (
            <>
              <ScoreBar score={result.phq9.score} max={27} color={result.phq9.color} label={`Depression — ${result.phq9.label}`} />
              <ScoreBar score={result.gad7.score} max={21} color={result.gad7.color} label={`Anxiety — ${result.gad7.label}`} />

              {result.analysis?.affirmation && (
                <div style={{ padding: "14px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--radius-md)", marginBottom: 16, fontSize: 14, color: "var(--accent-purple)", fontStyle: "italic", textAlign: "center" }}>
                  💜 {result.analysis.affirmation}
                </div>
              )}

              {result.analysis?.summary && <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>{result.analysis.summary}</p>}

              {result.analysis?.coping_strategies?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Coping Strategies</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.analysis.coping_strategies.map((s, i) => (
                      <div key={i} style={{ padding: "8px 12px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>✅ {s}</div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: "12px 14px", background: "rgba(255,179,0,0.07)", border: "1px solid rgba(255,179,0,0.2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)" }}>
                🕐 <strong>Follow-up:</strong> {result.analysis?.follow_up || "Reassess in 2 weeks"}
              </div>
            </>
          )}

          <button onClick={() => { setStep("intro"); setPhq9(Array(9).fill(null)); setGad7(Array(7).fill(null)); setResult(null); }} className="btn btn-ghost" style={{ width: "100%", marginTop: 16 }}>
            Take Again
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MentalHealthAssessment;
