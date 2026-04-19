const OpenAI = require("openai");
const { performTriage } = require("../../triage-service/triageEngine");
const { SYSTEM_PROMPT, buildHealthAnalysisPrompt } = require("../prompts/healthPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Triage Agent - Determines severity and emergency status
 */
class TriageAgent {
  constructor() {
    this.name = "TriageAgent";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async analyze(symptoms, age, medicalHistory, language = "en") {
    // Step 1: Rule-based triage (fast, offline-capable)
    const ruleBasedResult = performTriage(symptoms, age, medicalHistory);

    // Step 2: AI-enhanced analysis (if API available)
    let aiResult = null;
    try {
      const prompt = buildHealthAnalysisPrompt(symptoms, age, medicalHistory, language);
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      aiResult = JSON.parse(content);
    } catch (error) {
      console.error("AI Triage error (falling back to rule-based):", error.message);
    }

    // Step 3: Merge results (AI takes precedence if available)
    const finalResult = this._mergeResults(ruleBasedResult, aiResult);
    
    return {
      agent: this.name,
      ...finalResult,
      source: aiResult ? "ai+rules" : "rules",
    };
  }

  _mergeResults(ruleResult, aiResult) {
    if (!aiResult) return ruleResult;

    // Use AI's assessment but validate against rule-based
    const aiSeverity = aiResult.severity?.toUpperCase();
    const ruleSeverity = ruleResult.severity;

    // Take the more severe assessment for safety
    const severity = this._takeMostSevere(aiSeverity, ruleSeverity);

    return {
      severity,
      risk: aiResult.risk || ruleResult.risk,
      score: ruleResult.score,
      possible_conditions: aiResult.possible_conditions || ruleResult.possible_conditions,
      advice: aiResult.advice || ruleResult.advice,
      emergency: severity === "EMERGENCY",
      explanation: aiResult.explanation || "",
      next_steps: aiResult.next_steps || [],
      warning_signs: aiResult.warning_signs || [],
      when_to_seek_help: aiResult.when_to_seek_help || "",
      details: ruleResult.details,
    };
  }

  _takeMostSevere(s1, s2) {
    const order = { EMERGENCY: 3, MODERATE: 2, MILD: 1, NORMAL: 0 };
    const v1 = order[s1] || 0;
    const v2 = order[s2] || 0;
    return v1 >= v2 ? s1 : s2;
  }
}

module.exports = new TriageAgent();
