/**
 * SwasthAI Chatbot Workflow Engine
 * Built with GitHub Copilot — Challenge 3: Healthcare Assistant Agent
 *
 * Implements multi-turn conversation flows for:
 * - Symptom collection
 * - Triage assessment
 * - Hospital routing
 * - Patient history intake
 * - Emergency escalation
 */

const triageAgent = require("../ai-service/agents/triageAgent");
const recommendationAgent = require("../ai-service/agents/recommendationAgent");
const hospitalAgent = require("../ai-service/agents/hospitalAgent");
const translationAgent = require("../ai-service/agents/translationAgent");
const { performTriage } = require("../triage-service/triageEngine");

// ── Conversation States ────────────────────────────────────────────
const STATES = {
  GREETING: "greeting",
  COLLECTING_SYMPTOMS: "collecting_symptoms",
  ASKING_AGE: "asking_age",
  ASKING_HISTORY: "asking_history",
  TRIAGE: "triage",
  RECOMMENDING: "recommending",
  HOSPITAL_SEARCH: "hospital_search",
  EMERGENCY: "emergency",
  FOLLOW_UP: "follow_up",
  HISTORY_INTAKE: "history_intake",
  COMPLETE: "complete",
};

// ── Language-aware response templates ─────────────────────────────
const RESPONSES = {
  en: {
    greeting: "Hello! I'm SwasthAI, your health assistant. How are you feeling today? Please describe your symptoms.",
    askAge: "To give you better guidance, may I know your age?",
    askHistory: "Do you have any chronic conditions like diabetes, hypertension, or asthma?",
    analyzing: "Analyzing your symptoms... This will take a moment.",
    emergency: "🚨 EMERGENCY DETECTED. Please call 108 immediately! Do not drive yourself.",
    noSymptoms: "I didn't catch any symptoms. Could you please describe how you're feeling?",
    followUp: "How long have you been experiencing these symptoms?",
  },
  hi: {
    greeting: "नमस्ते! मैं SwasthAI हूं, आपका स्वास्थ्य सहायक। आज आप कैसा महसूस कर रहे हैं?",
    askAge: "बेहतर मार्गदर्शन के लिए, क्या आप अपनी उम्र बता सकते हैं?",
    askHistory: "क्या आपको कोई पुरानी बीमारी है जैसे मधुमेह, उच्च रक्तचाप?",
    analyzing: "आपके लक्षणों का विश्लेषण हो रहा है...",
    emergency: "🚨 आपातकाल! तुरंत 108 पर कॉल करें!",
    noSymptoms: "मैं समझ नहीं पाया। कृपया बताएं आप कैसा महसूस कर रहे हैं?",
    followUp: "ये लक्षण कितने समय से हैं?",
  },
  ta: {
    greeting: "வணக்கம்! நான் SwasthAI, உங்கள் சுகாதார உதவியாளர். இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    askAge: "சிறந்த வழிகாட்டுதலுக்கு, உங்கள் வயது என்ன?",
    emergency: "🚨 அவசரநிலை! உடனே 108 அழைக்கவும்!",
    noSymptoms: "புரியவில்லை. உங்கள் அறிகுறிகளை விவரிக்கவும்.",
    analyzing: "உங்கள் அறிகுறிகளை பகுப்பாய்வு செய்கிறோம்...",
    askHistory: "நீரிழிவு, உயர் இரத்த அழுத்தம் போன்ற நோய்கள் உள்ளதா?",
    followUp: "இந்த அறிகுறிகள் எத்தனை நாட்களாக உள்ளன?",
  },
  te: {
    greeting: "నమస్కారం! నేను SwasthAI, మీ ఆరోగ్య సహాయకుడు. ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?",
    askAge: "మెరుగైన మార్గదర్శకత్వం కోసం, మీ వయసు చెప్పగలరా?",
    emergency: "🚨 అత్యవసరం! వెంటనే 108 కి కాల్ చేయండి!",
    noSymptoms: "అర్థం కాలేదు. మీ లక్షణాలను వివరించండి.",
    analyzing: "మీ లక్షణాలను విశ్లేషిస్తున్నాం...",
    askHistory: "మీకు మధుమేహం, రక్తపోటు వంటి దీర్ఘకాలిక వ్యాధులు ఉన్నాయా?",
    followUp: "ఈ లక్షణాలు ఎంత కాలంగా ఉన్నాయి?",
  },
};

/**
 * ChatbotWorkflowEngine
 * Manages multi-turn conversation state for healthcare triage
 * GitHub Copilot generated the conversation flow logic
 */
class ChatbotWorkflowEngine {
  constructor() {
    this.sessions = new Map(); // userId → session state
  }

  /**
   * Initialize a new conversation session
   */
  createSession(userId, language = "en") {
    const session = {
      userId,
      language,
      state: STATES.GREETING,
      symptoms: [],
      age: null,
      chronicConditions: [],
      location: null,
      turnCount: 0,
      startTime: new Date(),
      triageResult: null,
      conversationHistory: [],
    };
    this.sessions.set(userId, session);
    return session;
  }

  /**
   * Get or create a session
   */
  getSession(userId, language = "en") {
    if (!this.sessions.has(userId)) {
      return this.createSession(userId, language);
    }
    return this.sessions.get(userId);
  }

  /**
   * Process a user message through the workflow
   * This is the main chatbot loop — GitHub Copilot generated the state machine
   */
  async processMessage(userId, userMessage, context = {}) {
    const session = this.getSession(userId, context.language || "en");
    session.turnCount++;
    session.conversationHistory.push({ role: "user", content: userMessage, time: new Date() });

    const lang = session.language;
    const responses = RESPONSES[lang] || RESPONSES.en;

    try {
      // Detect emergency keywords first — always highest priority
      const emergencyDetected = this._detectEmergency(userMessage);
      if (emergencyDetected) {
        return this._handleEmergency(session, responses);
      }

      // Route through conversation state machine
      switch (session.state) {
        case STATES.GREETING:
          return this._handleGreeting(session, userMessage, responses);

        case STATES.COLLECTING_SYMPTOMS:
          return await this._handleSymptomCollection(session, userMessage, responses);

        case STATES.ASKING_AGE:
          return this._handleAgeInput(session, userMessage, responses);

        case STATES.ASKING_HISTORY:
          return await this._handleHistoryInput(session, userMessage, responses);

        case STATES.TRIAGE:
          return await this._handleTriage(session, responses);

        case STATES.FOLLOW_UP:
          return await this._handleFollowUp(session, userMessage, responses);

        default:
          return await this._handleGeneral(session, userMessage, responses);
      }
    } catch (error) {
      console.error("Workflow error:", error);
      return {
        message: "I'm having trouble connecting. For emergencies, please call 108. 🏥",
        state: session.state,
        error: true,
      };
    }
  }

  // ── State Handlers ───────────────────────────────────────────────

  _handleGreeting(session, userMessage, responses) {
    // Extract any symptoms mentioned in greeting
    const symptoms = this._extractSymptoms(userMessage);
    if (symptoms.length > 0) {
      session.symptoms = symptoms;
      session.state = STATES.ASKING_AGE;
      return { message: responses.askAge, state: session.state, symptoms };
    }

    session.state = STATES.COLLECTING_SYMPTOMS;
    return {
      message: responses.greeting,
      state: session.state,
      suggestions: this._getSuggestions(session.language),
    };
  }

  async _handleSymptomCollection(session, userMessage, responses) {
    const symptoms = this._extractSymptoms(userMessage);
    session.symptoms = [...session.symptoms, ...symptoms];

    if (session.symptoms.length === 0) {
      return { message: responses.noSymptoms, state: session.state };
    }

    // Quick offline triage to check for emergency
    const quickTriage = performTriage(session.symptoms);
    if (quickTriage.emergency) {
      session.triageResult = quickTriage;
      return this._handleEmergency(session, responses);
    }

    session.state = STATES.ASKING_AGE;
    return {
      message: responses.askAge,
      state: session.state,
      symptomsCollected: session.symptoms,
    };
  }

  _handleAgeInput(session, userMessage, responses) {
    const age = this._extractAge(userMessage);
    if (age) {
      session.age = age;
    }
    session.state = STATES.ASKING_HISTORY;
    return { message: responses.askHistory, state: session.state };
  }

  async _handleHistoryInput(session, userMessage, responses) {
    const conditions = this._extractConditions(userMessage);
    session.chronicConditions = conditions;
    session.state = STATES.TRIAGE;
    return await this._handleTriage(session, responses);
  }

  async _handleTriage(session, responses) {
    // Run full AI triage
    const [triageResult] = await Promise.all([
      triageAgent.analyze(session.symptoms, session.age, session.chronicConditions, session.language),
    ]);

    session.triageResult = triageResult;

    if (triageResult.emergency) {
      return this._handleEmergency(session, responses);
    }

    // Get recommendations
    const recommendations = await recommendationAgent.recommend(triageResult, {
      age: session.age,
      chronicConditions: session.chronicConditions,
    });

    session.state = STATES.FOLLOW_UP;

    return {
      message: triageResult.advice,
      state: session.state,
      triage: triageResult,
      recommendations,
      showHospitalSearch: triageResult.severity === "MODERATE",
    };
  }

  async _handleFollowUp(session, userMessage, responses) {
    session.state = STATES.COMPLETE;
    // Final summary
    return {
      message: `Based on everything you've shared, ${session.triageResult?.advice || "please monitor your symptoms and see a doctor if they worsen."}`,
      state: session.state,
      triage: session.triageResult,
      complete: true,
    };
  }

  async _handleGeneral(session, userMessage, responses) {
    // Restart or continue conversation
    const symptoms = this._extractSymptoms(userMessage);
    if (symptoms.length > 0) {
      session.symptoms = symptoms;
      session.state = STATES.ASKING_AGE;
      return { message: responses.askAge, state: session.state, symptoms };
    }
    return { message: responses.greeting, state: STATES.COLLECTING_SYMPTOMS };
  }

  _handleEmergency(session, responses) {
    session.state = STATES.EMERGENCY;
    return {
      message: responses.emergency || RESPONSES.en.emergency,
      state: session.state,
      emergency: true,
      callNumber: "108",
      triage: session.triageResult || { severity: "EMERGENCY", emergency: true },
    };
  }

  // ── Helper Methods ───────────────────────────────────────────────

  _detectEmergency(text) {
    const emergencyTerms = [
      "chest pain", "heart attack", "can't breathe", "unconscious",
      "seizure", "stroke", "heavy bleeding", "choking",
      "छाती में दर्द", "सांस नहीं", "बेहोश",
      "மார்பு வலி", "மூச்சு வர", "ఛాతి నొప్పి",
    ];
    const lower = text.toLowerCase();
    return emergencyTerms.some((term) => lower.includes(term.toLowerCase()));
  }

  _extractSymptoms(text) {
    const SYMPTOM_MAP = [
      "fever", "headache", "cough", "cold", "sore throat", "chest pain",
      "breathing difficulty", "shortness of breath", "vomiting", "diarrhea",
      "abdominal pain", "back pain", "dizziness", "fatigue", "nausea",
      "rash", "muscle ache", "joint pain", "blood sugar", "high bp",
      // Hindi
      "बुखार", "सिरदर्द", "खांसी", "सर्दी", "सीने में दर्द",
      // Tamil
      "காய்ச்சல்", "தலைவலி", "இருமல்",
      // Telugu
      "జ్వరం", "తలనొప్పి", "దగ్గు",
    ];
    const lower = text.toLowerCase();
    return SYMPTOM_MAP.filter((s) => lower.includes(s.toLowerCase()));
  }

  _extractAge(text) {
    const match = text.match(/\b(\d{1,3})\b/);
    if (match) {
      const age = parseInt(match[1]);
      if (age > 0 && age < 150) return age;
    }
    return null;
  }

  _extractConditions(text) {
    const CONDITIONS = [
      "diabetes", "hypertension", "asthma", "heart disease",
      "cancer", "thyroid", "obesity", "copd", "arthritis",
      "मधुमेह", "उच्च रक्तचाप", "दमा",
    ];
    const lower = text.toLowerCase();
    return CONDITIONS.filter((c) => lower.includes(c.toLowerCase()));
  }

  _getSuggestions(lang) {
    const suggestions = {
      en: ["I have chest pain", "Fever and headache", "Stomach ache", "Breathing difficulty"],
      hi: ["सीने में दर्द है", "बुखार और सिरदर्द", "पेट दर्द", "सांस लेने में तकलीफ"],
      ta: ["மார்பு வலி", "காய்ச்சல் மற்றும் தலைவலி", "வயிற்று வலி"],
      te: ["ఛాతి నొప్పి", "జ్వరం మరియు తలనొప్పి", "పొట్ట నొప్పి"],
    };
    return suggestions[lang] || suggestions.en;
  }

  clearSession(userId) {
    this.sessions.delete(userId);
  }
}

// Export singleton
module.exports = new ChatbotWorkflowEngine();
