const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const { performTriage } = require("../services/triage-service/triageEngine");

/**
 * POST /api/triage/quick
 * Fast rule-based triage (works offline)
 */
router.post("/quick", optionalAuth, (req, res, next) => {
  try {
    const { symptoms, age, medicalHistory } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: "Symptoms required" });
    }

    const result = performTriage(symptoms, age, medicalHistory);
    res.json({ success: true, data: result, source: "rule-engine" });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/triage/emergency-check
 * Quick emergency detection
 */
router.post("/emergency-check", (req, res, next) => {
  try {
    const { symptoms } = req.body;
    const result = performTriage(symptoms);

    res.json({
      success: true,
      data: {
        isEmergency: result.emergency,
        severity: result.severity,
        advice: result.advice,
        callNumber: result.emergency ? "108" : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/triage/symptoms-list
 * Return list of all known symptoms
 */
router.get("/symptoms-list", (req, res) => {
  const { SYMPTOM_SCORES } = require("../services/triage-service/triageEngine");
  const symptoms = Object.keys(SYMPTOM_SCORES).map((s) => ({
    name: s,
    severity: SYMPTOM_SCORES[s] >= 40 ? "critical" : SYMPTOM_SCORES[s] >= 20 ? "moderate" : "mild",
  }));
  res.json({ success: true, data: symptoms });
});

module.exports = router;
