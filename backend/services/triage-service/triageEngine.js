/**
 * SwasthAI Triage Engine
 * Hybrid: Rule-based scoring + ML-ready output
 */

const SYMPTOM_SCORES = {
  // Critical symptoms
  "chest pain": 65,
  "heart attack": 60,
  "difficulty breathing": 65,
  "breathing difficulty": 65,
  "shortness of breath": 62,
  "unconscious": 60,
  "seizure": 65,
  "stroke": 60,
  "heavy bleeding": 50,
  "severe head injury": 55,
  "anaphylaxis": 55,
  "severe allergic reaction": 50,

  // Moderate symptoms
  "high fever": 25,
  "fever": 15,
  "vomiting": 12,
  "diarrhea": 10,
  "severe headache": 20,
  "migraine": 18,
  "abdominal pain": 15,
  "severe abdominal pain": 25,
  "fracture": 22,
  "dizziness": 12,
  "fainting": 20,
  "high blood pressure": 20,
  "low blood pressure": 20,
  "diabetic emergency": 30,

  // Mild symptoms
  "headache": 8,
  "body ache": 7,
  "body pain": 7,
  "cold": 5,
  "cough": 5,
  "sore throat": 5,
  "runny nose": 3,
  "mild headache": 5,
  "fatigue": 5,
  "nausea": 8,
  "mild fever": 8,
  "skin rash": 6,
  "minor cut": 3,
  "muscle ache": 5,
  "back pain": 8,
  "toothache": 6,
  "ear pain": 5,
};

const AGE_MODIFIERS = {
  infant: 1.3,    // 0-2
  child: 1.15,    // 3-12
  teen: 1.0,      // 13-17
  adult: 1.0,     // 18-59
  elderly: 1.25,  // 60+
};

const RISK_FACTORS = {
  diabetes: 10,
  hypertension: 10,
  heart_disease: 15,
  asthma: 8,
  copd: 12,
  cancer: 15,
  immunocompromised: 12,
  pregnancy: 10,
  obesity: 5,
};

/**
 * Get age modifier based on patient age
 */
const getAgeModifier = (age) => {
  if (!age) return 1.0;
  if (age <= 2) return AGE_MODIFIERS.infant;
  if (age <= 12) return AGE_MODIFIERS.child;
  if (age <= 17) return AGE_MODIFIERS.teen;
  if (age <= 59) return AGE_MODIFIERS.adult;
  return AGE_MODIFIERS.elderly;
};

/**
 * Normalize symptom text for matching
 */
const normalizeSymptom = (symptom) => {
  return symptom.toLowerCase().trim();
};

/**
 * Calculate base symptom score
 */
const calculateSymptomScore = (symptoms) => {
  let score = 0;
  const matchedSymptoms = [];

  for (const symptom of symptoms) {
    const normalized = normalizeSymptom(symptom);

    // Direct match
    if (SYMPTOM_SCORES[normalized] !== undefined) {
      score += SYMPTOM_SCORES[normalized];
      matchedSymptoms.push({ symptom: normalized, score: SYMPTOM_SCORES[normalized] });
      continue;
    }

    // Partial match
    for (const [key, value] of Object.entries(SYMPTOM_SCORES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        score += value * 0.8; // 80% score for partial match
        matchedSymptoms.push({ symptom: key, score: value * 0.8, partial: true });
        break;
      }
    }
  }

  return { score, matchedSymptoms };
};

/**
 * Calculate risk factor modifier
 */
const calculateRiskModifier = (medicalHistory = []) => {
  let modifier = 0;
  for (const condition of medicalHistory) {
    const normalized = condition.toLowerCase();
    for (const [key, value] of Object.entries(RISK_FACTORS)) {
      if (normalized.includes(key)) {
        modifier += value;
      }
    }
  }
  return modifier;
};

/**
 * Determine severity level
 */
const determineSeverity = (totalScore) => {
  if (totalScore >= 60) return "EMERGENCY";
  if (totalScore >= 25) return "MODERATE";
  return "MILD";
};

/**
 * Determine risk level
 */
const determineRisk = (totalScore) => {
  if (totalScore >= 60) return "HIGH";
  if (totalScore >= 25) return "MEDIUM";
  return "LOW";
};

/**
 * Get possible conditions based on symptoms
 */
const getPossibleConditions = (symptoms) => {
  const conditions = [];
  const normalizedSymptoms = symptoms.map(normalizeSymptom);

  const conditionMap = {
    "Respiratory Infection": ["cough", "fever", "cold", "runny nose", "sore throat"],
    "Cardiac Event": ["chest pain", "heart attack", "shortness of breath"],
    "Hypertensive Crisis": ["severe headache", "high blood pressure", "dizziness"],
    "Gastrointestinal Issue": ["vomiting", "diarrhea", "abdominal pain", "nausea"],
    "Neurological Event": ["stroke", "seizure", "unconscious", "severe headache"],
    "Allergic Reaction": ["anaphylaxis", "skin rash", "severe allergic reaction"],
    "Diabetic Emergency": ["diabetic emergency", "dizziness", "fainting"],
    "Trauma/Injury": ["heavy bleeding", "fracture", "severe head injury"],
    "Viral Fever": ["fever", "fatigue", "muscle ache", "headache"],
    "Common Cold/Flu": ["cold", "cough", "runny nose", "mild fever"],
  };

  for (const [condition, condSymptoms] of Object.entries(conditionMap)) {
    const matchCount = condSymptoms.filter((cs) =>
      normalizedSymptoms.some((s) => s.includes(cs) || cs.includes(s))
    ).length;
    if (matchCount >= 1) {
      conditions.push({ condition, confidence: Math.min(matchCount / condSymptoms.length, 1) });
    }
  }

  // Sort by confidence
  conditions.sort((a, b) => b.confidence - a.confidence);
  return conditions.slice(0, 3).map((c) => c.condition);
};

/**
 * Generate advice based on severity
 */
const generateAdvice = (severity, symptoms) => {
  if (severity === "EMERGENCY") {
    return "🚨 IMMEDIATE ACTION REQUIRED: Call emergency services (108/112) NOW. Do not drive yourself. Stay calm and inform someone nearby.";
  }
  if (severity === "MODERATE") {
    return "⚠️ Visit a doctor or urgent care clinic within 24 hours. Monitor symptoms closely. Avoid strenuous activity. Stay hydrated.";
  }
  return "✅ Rest and stay hydrated. Take OTC medications if needed. Monitor symptoms. Consult doctor if symptoms worsen or persist beyond 3 days.";
};

/**
 * MAIN TRIAGE FUNCTION
 * @param {string[]} symptoms - Array of symptom strings
 * @param {number} age - Patient age
 * @param {string[]} medicalHistory - Array of medical conditions
 * @returns {Object} Triage result
 */
const performTriage = (symptoms = [], age = null, medicalHistory = []) => {
  if (!symptoms || symptoms.length === 0) {
    return {
      severity: "NORMAL",
      risk: "LOW",
      score: 0,
      possible_conditions: [],
      advice: "No symptoms provided. Stay healthy! 🌟",
      emergency: false,
      details: {},
    };
  }

  const { score: baseScore, matchedSymptoms } = calculateSymptomScore(symptoms);
  const ageModifier = getAgeModifier(age);
  const riskModifier = calculateRiskModifier(medicalHistory);
  
  const totalScore = (baseScore * ageModifier) + riskModifier;
  
  const severity = determineSeverity(totalScore);
  const risk = determineRisk(totalScore);
  const possibleConditions = getPossibleConditions(symptoms);
  const advice = generateAdvice(severity, symptoms);

  return {
    severity,
    risk,
    score: Math.round(totalScore),
    possible_conditions: possibleConditions,
    advice,
    emergency: severity === "EMERGENCY",
    details: {
      baseScore: Math.round(baseScore),
      ageModifier,
      riskModifier,
      matchedSymptoms,
      ageGroup: getAgeGroup(age),
    },
  };
};

const getAgeGroup = (age) => {
  if (!age) return "unknown";
  if (age <= 2) return "infant";
  if (age <= 12) return "child";
  if (age <= 17) return "teenager";
  if (age <= 59) return "adult";
  return "elderly";
};

module.exports = { performTriage, calculateSymptomScore, SYMPTOM_SCORES };
