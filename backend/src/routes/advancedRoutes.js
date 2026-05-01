const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middleware/auth");

// Services
const mlBridge = require("../services/ml-service/mlBridge");
const Vitals = require("../services/vitals-service/Vitals");
const Medication = require("../services/vitals-service/Medication");
const { calculateBodyMetrics, analyzeMeal, generateDietPlan } = require("../services/vitals-service/nutritionService");
const { calculatePHQ9, calculateGAD7, analyzeMentalHealth, PHQ9_QUESTIONS, GAD7_QUESTIONS } = require("../services/vitals-service/mentalHealthService");
const { checkAllInteractions, getDrugInfo } = require("../services/pharmacy-service/drugInteractions");
const { fetchHealthNews, getPersonalizedAlerts } = require("../services/news-service/healthNews");
const { generateHealthReport } = require("../services/pdf-service/reportGenerator");
const User = require("../models/User");

// ═══════════════════════════════════════════════════════════════════════
// ML ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/advanced/ml/predict-disease */
router.post("/ml/predict-disease", optionalAuth, async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms?.length) return res.status(400).json({ success: false, message: "Symptoms required" });
    const result = await mlBridge.predictDisease(symptoms);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

/** POST /api/advanced/ml/predict-vitals */
router.post("/ml/predict-vitals", optionalAuth, async (req, res, next) => {
  try {
    const result = await mlBridge.predictVitalsRisk(req.body);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

/** GET /api/advanced/ml/model-info */
router.get("/ml/model-info", async (req, res, next) => {
  try {
    const info = await mlBridge.getModelInfo();
    res.json({ success: true, data: info });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// VITALS ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/advanced/vitals */
router.post("/vitals", protect, async (req, res, next) => {
  try {
    const vitalsData = { ...req.body, userId: req.user._id };

    // ML risk prediction for vitals
    if (vitalsData.bloodPressure || vitalsData.heartRate || vitalsData.bloodSugar) {
      const mlResult = await mlBridge.predictVitalsRisk({
        age: req.user.age || 30,
        systolic_bp: vitalsData.bloodPressure?.systolic || 120,
        diastolic_bp: vitalsData.bloodPressure?.diastolic || 80,
        heart_rate: vitalsData.heartRate || 72,
        blood_sugar: vitalsData.bloodSugar?.value || 90,
        bmi: vitalsData.bmi || 22,
        temperature: vitalsData.temperature || 98.6,
      });
      vitalsData.mlRisk = mlResult;

      // Emit real-time alert if critical
      if (mlResult.alerts?.some((a) => a.type === "CRITICAL")) {
        const io = req.app.get("io");
        if (io) io.to(req.user._id.toString()).emit("vitals-alert", { alerts: mlResult.alerts });
      }
    }

    const vitals = await Vitals.create(vitalsData);
    res.status(201).json({ success: true, data: vitals });
  } catch (e) { next(e); }
});

/** GET /api/advanced/vitals */
router.get("/vitals", protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const vitals = await Vitals.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Calculate trends
    const bpTrend = vitals
      .filter((v) => v.bloodPressure?.systolic)
      .slice(0, 14)
      .reverse()
      .map((v) => ({
        date: v.createdAt,
        systolic: v.bloodPressure.systolic,
        diastolic: v.bloodPressure.diastolic,
      }));

    res.json({ success: true, data: { vitals, bpTrend, total: vitals.length } });
  } catch (e) { next(e); }
});

/** GET /api/advanced/vitals/latest */
router.get("/vitals/latest", protect, async (req, res, next) => {
  try {
    const latest = await Vitals.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: latest });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// MEDICATION ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/advanced/medications */
router.post("/medications", protect, async (req, res, next) => {
  try {
    const med = await Medication.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: med });
  } catch (e) { next(e); }
});

/** GET /api/advanced/medications */
router.get("/medications", protect, async (req, res, next) => {
  try {
    const meds = await Medication.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: meds });
  } catch (e) { next(e); }
});

/** PUT /api/advanced/medications/:id */
router.put("/medications/:id", protect, async (req, res, next) => {
  try {
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!med) return res.status(404).json({ success: false, message: "Medication not found" });
    res.json({ success: true, data: med });
  } catch (e) { next(e); }
});

/** POST /api/advanced/medications/:id/take */
router.post("/medications/:id/take", protect, async (req, res, next) => {
  try {
    const { taken = true, notes } = req.body;
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { takenLog: { date: new Date(), taken, time: new Date().toTimeString().slice(0, 5), notes } } },
      { new: true }
    );
    res.json({ success: true, data: med, message: taken ? "Marked as taken ✓" : "Marked as skipped" });
  } catch (e) { next(e); }
});

/** DELETE /api/advanced/medications/:id */
router.delete("/medications/:id", protect, async (req, res, next) => {
  try {
    await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false }
    );
    res.json({ success: true, message: "Medication removed" });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// DRUG INTERACTION ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/advanced/drug-interactions */
router.post("/drug-interactions", optionalAuth, (req, res) => {
  const { medications } = req.body;
  if (!medications?.length || medications.length < 2) {
    return res.status(400).json({ success: false, message: "At least 2 medications required" });
  }
  const result = checkAllInteractions(medications);
  res.json({ success: true, data: result });
});

/** GET /api/advanced/drug-info/:name */
router.get("/drug-info/:name", (req, res) => {
  const info = getDrugInfo(req.params.name);
  res.json({ success: true, data: info || { message: "Drug not found in database" } });
});

// ═══════════════════════════════════════════════════════════════════════
// NUTRITION ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** POST /api/advanced/nutrition/analyze */
router.post("/nutrition/analyze", optionalAuth, async (req, res, next) => {
  try {
    const { meal } = req.body;
    if (!meal) return res.status(400).json({ success: false, message: "Meal description required" });
    const userProfile = req.user ? { age: req.user.age, gender: req.user.gender, conditions: req.user.medicalHistory?.chronicConditions } : {};
    const result = await analyzeMeal(meal, userProfile);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

/** POST /api/advanced/nutrition/diet-plan */
router.post("/nutrition/diet-plan", protect, async (req, res, next) => {
  try {
    const { goals } = req.body;
    const userProfile = {
      age: req.user.age,
      gender: req.user.gender,
      conditions: req.user.medicalHistory?.chronicConditions,
    };
    const plan = await generateDietPlan(userProfile, goals || []);
    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
});

/** POST /api/advanced/nutrition/bmi */
router.post("/nutrition/bmi", (req, res) => {
  const { weight, height, age, gender } = req.body;
  if (!weight || !height) return res.status(400).json({ success: false, message: "weight and height required" });
  const result = calculateBodyMetrics(weight, height, age || 30, gender || "male");
  res.json({ success: true, data: result });
});

// ═══════════════════════════════════════════════════════════════════════
// MENTAL HEALTH ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/advanced/mental-health/questions */
router.get("/mental-health/questions", (req, res) => {
  res.json({ success: true, data: { phq9: PHQ9_QUESTIONS, gad7: GAD7_QUESTIONS } });
});

/** POST /api/advanced/mental-health/assess */
router.post("/mental-health/assess", optionalAuth, async (req, res, next) => {
  try {
    const { phq9Answers, gad7Answers, message } = req.body;
    if (!phq9Answers || phq9Answers.length !== 9) {
      return res.status(400).json({ success: false, message: "9 PHQ-9 answers required (0-3 each)" });
    }
    if (!gad7Answers || gad7Answers.length !== 7) {
      return res.status(400).json({ success: false, message: "7 GAD-7 answers required (0-3 each)" });
    }

    const phq9Result = calculatePHQ9(phq9Answers);
    const gad7Result = calculateGAD7(gad7Answers);
    const analysis = await analyzeMentalHealth(phq9Result, gad7Result, message);

    // Save to user history if logged in and score is significant
    if (req.user && phq9Result.score >= 5) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          healthHistory: {
            symptoms: [`PHQ-9: ${phq9Result.score}`, `GAD-7: ${gad7Result.score}`],
            severity: phq9Result.score >= 15 ? "MODERATE" : "MILD",
            advice: analysis.summary,
            risk: phq9Result.score >= 15 ? "medium" : "low",
            emergency: phq9Result.crisis,
          },
        },
      });
    }

    res.json({
      success: true,
      data: { phq9: phq9Result, gad7: gad7Result, analysis },
    });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// HEALTH NEWS ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/advanced/news */
router.get("/news", optionalAuth, async (req, res, next) => {
  try {
    const { topic = "health India" } = req.query;
    const news = await fetchHealthNews(topic, 8);
    res.json({ success: true, data: news });
  } catch (e) { next(e); }
});

/** GET /api/advanced/news/alerts */
router.get("/news/alerts", protect, async (req, res, next) => {
  try {
    const alerts = await getPersonalizedAlerts({
      age: req.user.age,
      conditions: req.user.medicalHistory?.chronicConditions,
      city: req.user.address?.city,
    });
    res.json({ success: true, data: alerts });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// PDF REPORT ROUTES
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/advanced/report/pdf */
router.get("/report/pdf", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { filePath, filename } = await generateHealthReport(user);
    res.download(filePath, filename, (err) => {
      if (err) next(err);
    });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════════════════════════════════════
// VACCINATION TRACKER
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/advanced/vaccinations/schedule */
router.get("/vaccinations/schedule", optionalAuth, (req, res) => {
  const age = req.query.age ? parseInt(req.query.age) : req.user?.age || 25;

  const schedule = [];

  // Universal vaccines
  schedule.push(
    { name: "COVID-19 Booster", due: "Annual", priority: "HIGH", available: "Government hospitals" },
    { name: "Influenza (Flu)", due: "Annual", priority: "HIGH", available: "Pharmacies & hospitals" },
    { name: "Tetanus Booster", due: "Every 10 years", priority: "MEDIUM", available: "PHC centers" },
  );

  if (age >= 60) {
    schedule.push(
      { name: "Pneumococcal", due: "Once (age 65)", priority: "HIGH", available: "Government hospitals" },
      { name: "Shingles (Zoster)", due: "Age 60+", priority: "MEDIUM", available: "Private clinics" },
    );
  }

  if (age >= 40) {
    schedule.push({ name: "Hepatitis A", due: "2-dose series", priority: "MEDIUM", available: "Clinics" });
  }

  if (age <= 45) {
    schedule.push(
      { name: "Hepatitis B", due: "3-dose series if not done", priority: "HIGH", available: "PHC centers" },
      { name: "MMR (Measles)", due: "If not vaccinated", priority: "MEDIUM", available: "PHC centers" },
    );
  }

  res.json({ success: true, data: { schedule, age, totalRecommended: schedule.length } });
});

// ═══════════════════════════════════════════════════════════════════════
// HEALTH GOALS & STREAKS
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/advanced/goals */
router.get("/goals", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const history = user.healthHistory || [];

    // Auto-generate goals based on profile
    const goals = [];
    const today = new Date();
    const consultationsThisMonth = history.filter((h) =>
      new Date(h.createdAt).getMonth() === today.getMonth()
    ).length;

    goals.push({
      id: "weekly_checkup",
      title: "Weekly Health Check",
      description: "Log symptoms or vitals at least once a week",
      progress: Math.min(consultationsThisMonth, 4),
      target: 4,
      unit: "logs",
      streak: consultationsThisMonth,
      completed: consultationsThisMonth >= 4,
    });

    goals.push({
      id: "health_score",
      title: "Improve Health Score",
      description: `Reach a health score of 80 (current: ${user.healthScore})`,
      progress: user.healthScore || 75,
      target: 80,
      unit: "points",
      completed: (user.healthScore || 75) >= 80,
    });

    goals.push({
      id: "no_emergency",
      title: "30-Day No Emergency",
      description: "Stay healthy with no emergency incidents for 30 days",
      progress: history.filter((h) => {
        const daysAgo = (Date.now() - new Date(h.createdAt)) / 86400000;
        return daysAgo <= 30 && h.severity === "EMERGENCY";
      }).length === 0 ? 30 : 0,
      target: 30,
      unit: "days",
      completed: !history.some((h) => {
        const daysAgo = (Date.now() - new Date(h.createdAt)) / 86400000;
        return daysAgo <= 30 && h.severity === "EMERGENCY";
      }),
    });

    res.json({ success: true, data: goals });
  } catch (e) { next(e); }
});

module.exports = router;
