const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../shared/middleware/auth");
const aiService = require("../services/ai-service/index");
const User = require("../services/user-service/models/User");
const { calculateHealthScore } = require("../shared/utils/helpers");

/**
 * POST /api/ai/analyze
 * Full health analysis using multi-agent system
 */
router.post("/analyze", optionalAuth, async (req, res, next) => {
  try {
    const { symptoms, age, medicalHistory, location, language } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: "Symptoms are required" });
    }

    const result = await aiService.analyzeHealth({
      symptoms,
      age: age || req.user?.age,
      medicalHistory: medicalHistory || req.user?.medicalHistory?.chronicConditions || [],
      location,
      language: language || req.user?.preferredLanguage || "en",
      user: req.user,
    });

    // Save to user history if logged in
    if (req.user) {
      const historyEntry = {
        symptoms,
        severity: result.triage.severity,
        conditions: result.triage.possible_conditions,
        advice: result.triage.advice,
        risk: result.triage.risk,
        emergency: result.triage.emergency,
      };

      await User.findByIdAndUpdate(req.user._id, {
        $push: { healthHistory: historyEntry },
        healthScore: calculateHealthScore([...( req.user.healthHistory || []), historyEntry]),
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/chat
 * Conversational AI health chat
 */
router.post("/chat", optionalAuth, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages array required" });
    }

    const userContext = req.user
      ? {
          name: req.user.name,
          age: req.user.age,
          city: req.user.address?.city,
          conditions: req.user.medicalHistory?.chronicConditions,
          language: req.user.preferredLanguage,
        }
      : {};

    const result = await aiService.chat(messages, userContext);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/risk-prediction
 * Predict future health risks
 */
router.post("/risk-prediction", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const result = await aiService.predictRisk(user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/translate
 * Translate health advice to regional languages
 */
router.post("/translate", async (req, res, next) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, message: "text and targetLanguage required" });
    }
    const result = await aiService.translate(text, targetLanguage);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/health-score
 * Get user's health score
 */
router.get("/health-score", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const score = calculateHealthScore(user.healthHistory);
    res.json({
      success: true,
      data: {
        score,
        history: user.healthHistory.slice(-10),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
