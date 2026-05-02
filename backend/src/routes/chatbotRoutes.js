const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const chatbotWorkflow = require("../services/ai-service/chatbotWorkflow");
const aiService = require("../services/ai-service/index");
const { v4: uuidv4 } = require("uuid");

/**
 * POST /api/chatbot/message
 * Process a multi-turn chatbot message through the workflow engine
 * This is the main GitHub Copilot-generated chatbot workflow endpoint
 */
router.post("/message", optionalAuth, async (req, res, next) => {
  try {
    const { message, sessionId, language } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message required" });
    }

    const userId = req.user?._id?.toString() || sessionId || uuidv4();
    const context = {
      language: language || req.user?.preferredLanguage || "en",
      location: req.body.location || null,
    };

    const result = await chatbotWorkflow.processMessage(userId, message, context);

    // Emit real-time via Socket.IO if emergency
    if (result.emergency) {
      const io = req.app.get("io");
      if (io && req.user) {
        io.to(req.user._id.toString()).emit("emergency-alert", {
          message: "Emergency detected in chat",
          triage: result.triage,
        });
      }
    }

    res.json({ success: true, sessionId: userId, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/chatbot/session/:sessionId
 * Clear a conversation session
 */
router.delete("/session/:sessionId", (req, res) => {
  chatbotWorkflow.clearSession(req.params.sessionId);
  res.json({ success: true, message: "Session cleared" });
});

/**
 * POST /api/chatbot/quick-triage
 * Instant triage from any language input (Copilot chatbot workflow)
 */
router.post("/quick-triage", optionalAuth, async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    // Auto-translate if needed, then triage
    let translatedText = text;
    if (language && language !== "en") {
      const translation = await aiService.translate(text, "en");
      translatedText = translation.translated_text || text;
    }

    const { performTriage } = require("../services/triage-service/triageEngine");
    const result = performTriage([translatedText], req.user?.age, []);

    res.json({ success: true, data: { ...result, originalText: text, translatedText } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chatbot/greeting/:language
 * Get localized greeting message
 */
router.get("/greeting/:language", (req, res) => {
  const greetings = {
    en: "Hello! I'm MediMind. Describe your symptoms and I'll help you.",
    hi: "नमस्ते! मैं MediMind हूं। अपने लक्षण बताएं, मैं आपकी मदद करूंगा।",
    ta: "வணக்கம்! நான் MediMind. உங்கள் அறிகுறிகளை விவரிக்கவும்.",
    te: "నమస్కారం! నేను MediMind. మీ లక్షణాలు చెప్పండి.",
    mr: "नमस्कार! मी MediMind आहे. आपली लक्षणे सांगा.",
    bn: "নমস্কার! আমি MediMind। আপনার লক্ষণগুলি বলুন।",
    gu: "નમસ્તે! હું MediMind છું. તમારા લક્ષણો જણાવો.",
    kn: "ನಮಸ್ಕಾರ! ನಾನು MediMind. ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ.",
    ml: "നമസ്കാരം! ഞാൻ MediMind ആണ്. നിങ്ങളുടെ ലക്ഷണങ്ങൾ പറയൂ.",
    pa: "ਸਤਿ ਸ੍ਰੀ ਅকাল! ਮੈਂ MediMind ਹਾਂ। ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ。",
  };
  const lang = req.params.language;
  res.json({
    success: true,
    data: {
      greeting: greetings[lang] || greetings.en,
      language: lang,
      suggestions: getSuggestions(lang),
    },
  });
});

function getSuggestions(lang) {
  const map = {
    en: ["I have chest pain", "Fever and headache", "Stomach ache", "Breathing difficulty"],
    hi: ["सीने में दर्द है", "बुखार और सिरदर्द", "पेट दर्द", "सांस लेने में तकलीफ"],
    ta: ["மார்பு வலி உள்ளது", "காய்ச்சல் மற்றும் தலைவலி", "வயிற்று வலி"],
    te: ["ఛాతి నొప్పి ఉంది", "జ్వరం మరియు తలనొప్పి", "పొట్ట నొప్పి"],
    mr: ["छातीत दुखतेय", "ताप आणि डोकेदुखी", "पोट दुखणे"],
  };
  return map[lang] || map.en;
}

module.exports = router;
