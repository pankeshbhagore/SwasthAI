const express = require("express");
const router = express.Router();
const {
  analyzeHealth,
  chatWithAI,
  predictHealthRisks,
  translateContent,
  getDailyInsights,
} = require("../controllers/aiController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/analyze", optionalAuth, analyzeHealth);
router.post("/chat", optionalAuth, chatWithAI);
router.post("/risk-prediction", protect, predictHealthRisks);
router.post("/translate", translateContent);
router.get("/insights", protect, getDailyInsights);

module.exports = router;
