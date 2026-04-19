const OpenAI = require("openai");
const { buildRiskPredictionPrompt } = require("../prompts/healthPrompt");
const { calculateHealthScore } = require("../../../shared/utils/helpers");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * History Agent - Analyzes patient history and predicts future risks
 */
class HistoryAgent {
  constructor() {
    this.name = "HistoryAgent";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async analyzeHistory(user) {
    const history = user.healthHistory || [];
    const healthScore = calculateHealthScore(history);
    
    // Prepare patient data for analysis
    const patientData = {
      age: user.age,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      chronicConditions: user.medicalHistory?.chronicConditions || [],
      medications: user.medicalHistory?.currentMedications || [],
      recentSymptoms: this._extractRecentSymptoms(history),
    };

    let riskPrediction = this._getBasicRiskAssessment(patientData);

    try {
      const prompt = buildRiskPredictionPrompt(patientData);
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      riskPrediction = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("History Agent AI error:", error.message);
    }

    return {
      agent: this.name,
      healthScore,
      historyCount: history.length,
      recentHistory: history.slice(-5),
      trends: this._calculateTrends(history),
      riskPrediction,
    };
  }

  _extractRecentSymptoms(history, limit = 10) {
    return history
      .slice(-limit)
      .flatMap((h) => h.symptoms || [])
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 10);
  }

  _calculateTrends(history) {
    if (history.length === 0) return { improving: true, emergencies: 0, mostCommon: [] };

    const last30Days = history.filter(
      (h) => new Date(h.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const severityCounts = {};
    const symptomCounts = {};

    history.forEach((h) => {
      severityCounts[h.severity] = (severityCounts[h.severity] || 0) + 1;
      (h.symptoms || []).forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const mostCommon = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    const recentSeverities = history.slice(-5).map((h) => h.severity);
    const improving = !recentSeverities.includes("EMERGENCY") && 
      recentSeverities.filter((s) => s === "MODERATE").length < 2;

    return {
      improving,
      emergencies: severityCounts.EMERGENCY || 0,
      last30DaysCount: last30Days.length,
      mostCommon,
      severityBreakdown: severityCounts,
    };
  }

  _getBasicRiskAssessment(patientData) {
    let riskScore = 30; // baseline

    if (patientData.age > 60) riskScore += 20;
    else if (patientData.age > 40) riskScore += 10;
    
    riskScore += (patientData.chronicConditions?.length || 0) * 8;
    riskScore += (patientData.medications?.length || 0) * 3;

    const level = riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low";

    return {
      overall_risk: level,
      risk_score: Math.min(riskScore, 100),
      top_risks: [],
      preventive_measures: ["Regular health checkups", "Balanced diet", "Regular exercise"],
      lifestyle_recommendations: ["Sleep 7-8 hours", "Stay hydrated", "Manage stress"],
    };
  }
}

module.exports = new HistoryAgent();
