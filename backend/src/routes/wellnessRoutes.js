const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { logCheckIn, getWellnessStats, submitJournal, talkToSerene, generateInsights } = require("../controllers/wellnessController");

router.post("/check-in", protect, logCheckIn);
router.get("/stats", protect, getWellnessStats);
router.post("/journal", protect, submitJournal);
router.post("/talk", protect, talkToSerene);
router.post("/insights", protect, generateInsights);

module.exports = router;
