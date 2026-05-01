const axios = require("axios");

const ML_BASE = process.env.ML_SERVICE_URL || "http://localhost:5001";

/**
 * ML Service Bridge
 * Connects Node.js backend to Python ML service
 * Falls back gracefully if ML service is unavailable
 */
class MLBridge {
  constructor() {
    this.baseURL = ML_BASE;
    this.available = false;
    this._checkAvailability();
  }

  async _checkAvailability() {
    try {
      await axios.get(`${this.baseURL}/health`, { timeout: 3000 });
      this.available = true;
      console.log("🤖 ML Service connected:", this.baseURL);
    } catch {
      console.log("⚠️  ML Service unavailable — using rule-based fallback");
    }
  }

  /**
   * Predict disease from symptoms using ML model
   */
  async predictDisease(symptoms) {
    if (!this.available) {
      return this._fallbackDiseasePrediction(symptoms);
    }
    try {
      const res = await axios.post(
        `${this.baseURL}/predict/disease`,
        { symptoms },
        { timeout: 5000 }
      );
      return { ...res.data.data, source: "ml_model" };
    } catch {
      return this._fallbackDiseasePrediction(symptoms);
    }
  }

  /**
   * Predict vitals risk using ML model
   */
  async predictVitalsRisk(vitals) {
    if (!this.available) {
      return this._fallbackVitalsRisk(vitals);
    }
    try {
      const res = await axios.post(
        `${this.baseURL}/predict/vitals`,
        vitals,
        { timeout: 5000 }
      );
      return { ...res.data.data, source: "ml_model" };
    } catch {
      return this._fallbackVitalsRisk(vitals);
    }
  }

  /**
   * Get ML model info
   */
  async getModelInfo() {
    try {
      const res = await axios.get(`${this.baseURL}/model/info`, { timeout: 3000 });
      return res.data.data;
    } catch {
      return { available: false, message: "ML service not running" };
    }
  }

  // ── Rule-based fallbacks ──────────────────────────────────────────────────

  _fallbackDiseasePrediction(symptoms) {
    const text = symptoms.join(" ").toLowerCase();
    const predictions = [];

    const rules = [
      { keywords: ["chest pain", "heart"], disease: "Cardiac Issue", severity: "EMERGENCY" },
      { keywords: ["breathing", "respiratory"], disease: "Respiratory Issue", severity: "EMERGENCY" },
      { keywords: ["seizure", "convulsion"], disease: "Neurological Issue", severity: "EMERGENCY" },
      { keywords: ["fever", "chills", "body ache"], disease: "Influenza", severity: "MODERATE" },
      { keywords: ["fever", "joint pain", "rash"], disease: "Dengue", severity: "MODERATE" },
      { keywords: ["cold", "cough", "sore throat"], disease: "Common Cold", severity: "MILD" },
      { keywords: ["headache", "fatigue"], disease: "Tension Headache", severity: "MILD" },
    ];

    rules.forEach(({ keywords, disease, severity }) => {
      const matches = keywords.filter((k) => text.includes(k)).length;
      if (matches > 0) {
        predictions.push({
          disease,
          confidence: Math.min(matches * 35, 90),
          severity,
        });
      }
    });

    return {
      predictions: predictions.slice(0, 3),
      overall_severity: predictions[0]?.severity || "NORMAL",
      source: "rule_based_fallback",
    };
  }

  _fallbackVitalsRisk({ systolic_bp = 120, diastolic_bp = 80, heart_rate = 72, blood_sugar = 90, age = 30 }) {
    const alerts = [];
    let riskScore = 0;

    if (systolic_bp > 180) { alerts.push({ type: "CRITICAL", message: "Hypertensive Crisis" }); riskScore += 40; }
    else if (systolic_bp > 140) { alerts.push({ type: "WARNING", message: "High blood pressure" }); riskScore += 20; }
    if (blood_sugar > 300) { alerts.push({ type: "CRITICAL", message: "Critical blood sugar" }); riskScore += 40; }
    else if (blood_sugar > 200) { alerts.push({ type: "WARNING", message: "High blood sugar" }); riskScore += 20; }
    if (age > 60) riskScore += 10;

    return {
      risk_level: riskScore > 50 ? "high" : riskScore > 25 ? "medium" : "low",
      alerts,
      source: "rule_based_fallback",
    };
  }
}

module.exports = new MLBridge();
