const OpenAI = require("openai");
const { performTriage } = require("../../triage-service/triageEngine");
const { SYSTEM_PROMPT, buildHealthAnalysisPrompt } = require("../prompts/healthPrompt");
const mlBridge = require("../../ml-service/mlBridge");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORG_ID || undefined });

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

    // Step 2: ML-based disease prediction
    let mlResult = null;
    try {
      mlResult = await mlBridge.predictDisease(symptoms);
    } catch (error) {
      console.error("ML Prediction error:", error.message);
    }

    // Step 3: AI-enhanced analysis (if API available)
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
      console.error("AI Triage error (falling back to rules):", error.message);
    }

    // Step 4: Merge results (AI takes precedence, validated by rules and ML)
    const finalResult = this._mergeResults(ruleBasedResult, aiResult, mlResult);
    
    return {
      agent: this.name,
      ...finalResult,
      source: aiResult ? "ai+ml+rules" : mlResult ? "ml+rules" : "rules",
    };
  }

  _mergeResults(ruleResult, aiResult, mlResult) {
    if (!aiResult && !mlResult) return ruleResult;

    // Severity Assessment: Take the most severe for safety
    const aiSeverity = aiResult?.severity?.toUpperCase();
    const mlSeverity = mlResult?.overall_severity?.toUpperCase();
    const ruleSeverity = ruleResult.severity;

    let severity = this._takeMostSevere(aiSeverity, ruleSeverity);
    severity = this._takeMostSevere(severity, mlSeverity);

    // Combine possible conditions from all sources
    const conditions = new Set([
      ...(aiResult?.possible_conditions || []),
      ...(mlResult?.predictions?.map(p => p.disease) || []),
      ...(ruleResult.possible_conditions || [])
    ]);

    return {
      severity,
      risk: aiResult?.risk || mlResult?.risk_level?.toUpperCase() || ruleResult.risk,
      score: ruleResult.score,
      possible_conditions: Array.from(conditions).slice(0, 5),
      advice: aiResult?.advice || ruleResult.advice,
      emergency: severity === "EMERGENCY",
      explanation: aiResult?.explanation || "",
      next_steps: aiResult?.next_steps || [],
      warning_signs: aiResult?.warning_signs || [],
      when_to_seek_help: aiResult?.when_to_seek_help || "",
      ml_predictions: mlResult?.predictions || [],
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
