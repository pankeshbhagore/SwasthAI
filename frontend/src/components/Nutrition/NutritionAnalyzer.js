import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Calculator, BookOpen, Send, Loader } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const MEAL_EXAMPLES = [
  "2 rotis with dal and sabzi",
  "Rice, rajma, salad",
  "Idli sambar with coconut chutney",
  "Paratha with curd and pickle",
];

const ScoreGauge = ({ score, label }) => {
  const color = score >= 70 ? "#00ff88" : score >= 50 ? "#ffb300" : "#ff3d71";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 8px" }}>
        <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
          <motion.circle cx={40} cy={40} r={32} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={2 * Math.PI * 32} initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - score / 100) }} transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color }}>{score}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
};

const NutritionAnalyzer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analyze"); // analyze | bmi | plan
  const [meal, setMeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bmiForm, setBmiForm] = useState({ weight: "", height: "", age: user?.age || "", gender: user?.gender || "male" });
  const [bmiResult, setBmiResult] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [goals, setGoals] = useState([]);

  const GOAL_OPTIONS = ["Weight loss", "Muscle gain", "Manage diabetes", "Lower cholesterol", "Better energy", "Heart health"];

  const analyzeMeal = async (overrideMeal) => {
    const mealToAnalyze = typeof overrideMeal === "string" ? overrideMeal : meal;
    if (!mealToAnalyze.trim()) { toast.error("Describe your meal first"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/advanced/nutrition/analyze", { meal: mealToAnalyze });
      setResult(res.data.data);
    } catch { toast.error("Analysis failed"); } finally { setLoading(false); }
  };

  // Jarvis Agentic Control
  useEffect(() => {
    const handleJarvis = (e) => {
      const { type, data } = e.detail;
      if (type === "ANALYZE_MEAL") {
        setActiveTab("analyze");
        setMeal(data);
        setTimeout(() => analyzeMeal(data), 500);
      }
    };
    window.addEventListener("JARVIS_ACTION", handleJarvis);
    return () => window.removeEventListener("JARVIS_ACTION", handleJarvis);
  }, []);

  const calculateBMI = async () => {
    if (!bmiForm.weight || !bmiForm.height) { toast.error("Weight and height required"); return; }
    try {
      const res = await api.post("/advanced/nutrition/bmi", bmiForm);
      setBmiResult(res.data.data);
    } catch { toast.error("Calculation failed"); }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const res = await api.post("/advanced/nutrition/diet-plan", { goals });
      setDietPlan(res.data.data);
      toast.success("Diet plan generated!");
    } catch { toast.error("Plan generation failed"); } finally { setPlanLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", padding: 4 }}>
        {[{ key: "analyze", label: "🥗 Meal Analyzer", icon: Apple }, { key: "bmi", label: "⚖️ BMI Calculator", icon: Calculator }, { key: "plan", label: "📅 Diet Plan", icon: BookOpen }].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: "9px 8px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === key ? 700 : 400, background: activeTab === key ? "var(--bg-card)" : "transparent", color: activeTab === key ? "var(--accent-cyan)" : "var(--text-muted)", transition: "all var(--transition)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Meal Analyzer */}
      {activeTab === "analyze" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Apple size={18} color="var(--accent-green)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>AI Meal Nutrition Analyzer</h3>
          </div>
          <textarea className="input" value={meal} onChange={e => setMeal(e.target.value)}
            placeholder="Describe your meal... e.g. '2 rotis, dal makhani, cucumber salad, 1 glass lassi'"
            rows={3} style={{ resize: "none", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {MEAL_EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setMeal(ex)} style={{ padding: "4px 10px", fontSize: 11, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>{ex}</button>
            ))}
          </div>
          <button onClick={analyzeMeal} disabled={loading || !meal.trim()} className="btn btn-primary" style={{ width: "100%", padding: 12 }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing...</> : <><Send size={15} />Analyze Nutrition</>}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
                  <ScoreGauge score={result.health_score || 65} label="Health Score" />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--accent-amber)" }}>{result.estimated_calories}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Calories</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: result.glycemic_index === "low" ? "var(--accent-green)" : result.glycemic_index === "high" ? "var(--accent-red)" : "var(--accent-amber)", textTransform: "capitalize" }}>{result.glycemic_index || "medium"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Glycemic Index</div>
                  </div>
                </div>

                {result.macros && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                    {[["Protein", result.macros.protein_g, "#00ff88"], ["Carbs", result.macros.carbs_g, "#ffb300"], ["Fat", result.macros.fat_g, "#ff8c00"], ["Fiber", result.macros.fiber_g, "#00e5ff"]].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: `${color}10`, border: `1px solid ${color}20`, borderRadius: "var(--radius-sm)" }}>
                        <div style={{ fontWeight: 800, color, fontSize: 16 }}>{val}g</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {result.improvements?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>💡 How to Make It Healthier</div>
                    {result.improvements.map((tip, i) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>• {tip}</div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* BMI Calculator */}
      {activeTab === "bmi" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Calculator size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>BMI & Body Metrics Calculator</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[["weight", "Weight (kg)", "65"], ["height", "Height (cm)", "170"], ["age", "Age", "30"]].map(([k, l, p]) => (
              <div key={k}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>{l}</label>
                <input className="input" type="number" value={bmiForm[k]} onChange={e => setBmiForm(p2 => ({ ...p2, [k]: e.target.value }))} placeholder={p} style={{ padding: "9px 12px" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Gender</label>
              <select className="input" value={bmiForm.gender} onChange={e => setBmiForm(p => ({ ...p, gender: e.target.value }))} style={{ padding: "9px 12px" }}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>
          <button onClick={calculateBMI} className="btn btn-primary" style={{ width: "100%", padding: 11 }}>Calculate</button>

          {bmiResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, color: bmiResult.bmi < 18.5 ? "#ffb300" : bmiResult.bmi < 25 ? "#00ff88" : bmiResult.bmi < 30 ? "#ffb300" : "#ff3d71" }}>{bmiResult.bmi}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{bmiResult.bmiCategory}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Health Risk: <strong>{bmiResult.healthRisk}</strong></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["BMR", `${bmiResult.bmr} kcal/day`, "#a78bfa"], ["Ideal Weight", `${bmiResult.idealWeightKg} kg`, "#00ff88"], ["Sedentary Calories", `${bmiResult.dailyCaloriesNeeded?.sedentary}`, "#00e5ff"], ["Active Calories", `${bmiResult.dailyCaloriesNeeded?.active}`, "#ffb300"]].map(([l, v, c]) => (
                  <div key={l} style={{ padding: "12px", background: `${c}10`, border: `1px solid ${c}20`, borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: c, fontSize: 15 }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Diet Plan */}
      {activeTab === "plan" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <BookOpen size={18} color="var(--accent-amber)" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>AI-Generated 7-Day Diet Plan</h3>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Select your goals (optional):</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {GOAL_OPTIONS.map(g => (
                <button key={g} onClick={() => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                  style={{ padding: "5px 12px", fontSize: 12, borderRadius: "var(--radius-sm)", border: `1px solid ${goals.includes(g) ? "rgba(255,179,0,0.4)" : "var(--border)"}`, background: goals.includes(g) ? "rgba(255,179,0,0.1)" : "transparent", color: goals.includes(g) ? "var(--accent-amber)" : "var(--text-muted)", cursor: "pointer" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generatePlan} disabled={planLoading} className="btn btn-primary" style={{ width: "100%", padding: 11 }}>
            {planLoading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Generating 7-day plan...</> : <><BookOpen size={15} />Generate My Diet Plan</>}
          </button>
          {dietPlan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 14, fontSize: 13, color: "var(--text-secondary)" }}>
                Daily target: <strong style={{ color: "var(--accent-amber)" }}>{dietPlan.daily_calories_target} kcal</strong>
                {dietPlan.macros_target && ` · P: ${dietPlan.macros_target.protein} · C: ${dietPlan.macros_target.carbs} · F: ${dietPlan.macros_target.fat}`}
              </div>
              {dietPlan.week?.map((day, i) => (
                <div key={i} style={{ marginBottom: 12, padding: "12px 14px", background: "rgba(255,179,0,0.05)", border: "1px solid rgba(255,179,0,0.15)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontWeight: 700, color: "var(--accent-amber)", marginBottom: 8 }}>{day.day}</div>
                  {[["🌅 Breakfast", day.breakfast], ["☀️ Lunch", day.lunch], ["🌙 Dinner", day.dinner]].map(([label, item]) => item && (
                    <div key={label} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                      <span><strong>{label}:</strong> {item.meal}</span>
                      <span style={{ color: "var(--text-muted)" }}>{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionAnalyzer;
