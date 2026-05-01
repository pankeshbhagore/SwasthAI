const aiService = require("../services/ai-service/index");
const insightAgent = require("../services/ai-service/agents/insightAgent");
const User = require("../models/User");
const { calculateHealthScore } = require("../utils/helpers");

/**
 * @desc    Full health analysis
 * @route   POST /api/ai/analyze
 * @access  Optional
 */
exports.analyzeHealth = async (req, res, next) => {
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
        healthScore: calculateHealthScore([...(req.user.healthHistory || []), historyEntry]),
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chat with AI
 * @route   POST /api/ai/chat
 * @access  Optional
 */
exports.chatWithAI = async (req, res, next) => {
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
};

/**
 * @desc    Predict health risks
 * @route   POST /api/ai/risk-prediction
 * @access  Private
 */
exports.predictHealthRisks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const result = await aiService.predictRisk(user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Translate medical content
 * @route   POST /api/ai/translate
 * @access  Public
 */
exports.translateContent = async (req, res, next) => {
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
};

/**
 * @desc    Get daily health insights
 * @route   GET /api/ai/insights
 * @access  Private
 */
exports.getDailyInsights = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const result = await insightAgent.generateDailyInsights(user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
