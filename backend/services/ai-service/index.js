const triageAgent = require("./agents/triageAgent");
const recommendationAgent = require("./agents/recommendationAgent");
const hospitalAgent = require("./agents/hospitalAgent");
const historyAgent = require("./agents/historyAgent");
const translationAgent = require("./agents/translationAgent");
const OpenAI = require("openai");
const { SYSTEM_PROMPT, buildMedicalReportPrompt } = require("./prompts/healthPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * AI Service - Orchestrates all AI agents
 */
class AIService {
  /**
   * Full health analysis using multi-agent pipeline
   */
  async analyzeHealth(data) {
    const { symptoms, age, medicalHistory, location, language, user } = data;

    try {
      // Run triage and recommendation in parallel
      const [triageResult, historyResult] = await Promise.all([
        triageAgent.analyze(symptoms, age, medicalHistory, language),
        user ? historyAgent.analyzeHistory(user) : Promise.resolve(null),
      ]);

      // Get recommendations based on triage
      const recommendationResult = await recommendationAgent.recommend(triageResult, {
        age,
        chronicConditions: medicalHistory,
        city: user?.address?.city,
      });

      // Find nearby hospitals if location provided
      let hospitalResult = null;
      if (location?.lat && location?.lng) {
        hospitalResult = await hospitalAgent.findNearbyHospitals(
          location.lat,
          location.lng,
          triageResult.severity
        );
      }

      const response = {
        triage: triageResult,
        recommendations: recommendationResult,
        hospitals: hospitalResult,
        history: historyResult,
        timestamp: new Date().toISOString(),
      };

      // Translate if needed
      if (language && language !== "en") {
        const adviceToTranslate = triageResult.advice;
        const translation = await translationAgent.translate(adviceToTranslate, language);
        response.translatedAdvice = translation;
      }

      return response;
    } catch (error) {
      console.error("AI Service error:", error);
      throw error;
    }
  }

  /**
   * Chat with AI health assistant
   */
  async chat(messages, userContext = {}) {
    const systemWithContext = `${SYSTEM_PROMPT}

User Context:
- Name: ${userContext.name || "User"}
- Age: ${userContext.age || "Unknown"}
- Location: ${userContext.city || "India"}
- Known conditions: ${userContext.conditions?.join(", ") || "None"}
- Language preference: ${userContext.language || "English"}`;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: systemWithContext },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      return {
        message: response.choices[0].message.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error("Chat error:", error.message);
      throw error;
    }
  }

  /**
   * Analyze medical report/prescription
   */
  async analyzeReport(reportText) {
    try {
      const prompt = buildMedicalReportPrompt(reportText);
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Report analysis error:", error.message);
      throw error;
    }
  }

  /**
   * Predict health risks
   */
  async predictRisk(user) {
    return await historyAgent.analyzeHistory(user);
  }

  /**
   * Translate medical content
   */
  async translate(text, targetLanguage) {
    return await translationAgent.translate(text, targetLanguage);
  }

  /**
   * Find nearby hospitals
   */
  async findHospitals(lat, lng, severity) {
    return await hospitalAgent.findNearbyHospitals(lat, lng, severity);
  }
}

module.exports = new AIService();
