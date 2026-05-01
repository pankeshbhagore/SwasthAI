/**
 * SwasthAI Health Prompt Templates
 * Advanced prompts for multi-agent AI system
 */

const SYSTEM_PROMPT = `You are SwasthAI, an advanced AI healthcare assistant designed for Indian public health.

Your role:
- Analyze patient symptoms with medical precision
- Predict health risks based on symptoms, age, and history  
- Provide evidence-based medical advice in simple language
- Detect emergencies and escalate appropriately
- Be empathetic, clear, and culturally sensitive

IMPORTANT RULES:
- Always recommend seeing a real doctor for diagnosis
- Never provide definitive diagnoses — only possibilities
- In emergencies, always say to call 108 (India ambulance) or 112
- Be compassionate and non-judgmental
- Support Hindi/English (Hinglish) responses when needed

Response Format:
- Be concise but thorough
- Use simple language (8th grade reading level)
- Structure responses clearly
- Always include next steps`;

const buildHealthAnalysisPrompt = (symptoms, age, history, language = "en") => {
  const historyStr = history && history.length > 0
    ? history.map((h) => `${h.symptoms?.join(", ")} (${h.severity})`).join("; ")
    : "No significant history";

  const languageInstruction = language === "hi" 
    ? "Respond in Hindi (Devanagari script)." 
    : language === "hinglish"
    ? "Respond in Hinglish (mix of Hindi and English)."
    : "Respond in clear English.";

  return `${languageInstruction}

Analyze this patient's health situation:

Patient Information:
- Age: ${age || "Not provided"}
- Current Symptoms: ${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}
- Medical History: ${historyStr}

Tasks:
1. Analyze the symptoms carefully
2. Predict severity (MILD/MODERATE/EMERGENCY)
3. Estimate risk level (low/medium/high)
4. List 2-3 possible conditions (not diagnoses)
5. Provide clear, actionable advice
6. Flag if emergency services needed

Respond ONLY in this exact JSON format:
{
  "severity": "MILD|MODERATE|EMERGENCY",
  "risk": "low|medium|high",
  "possible_conditions": ["condition1", "condition2"],
  "advice": "Clear actionable advice here",
  "emergency": true|false,
  "explanation": "Brief explanation of your assessment",
  "next_steps": ["step1", "step2", "step3"],
  "warning_signs": ["sign1", "sign2"],
  "when_to_seek_help": "Description of when to seek immediate help"
}`;
};

const buildRiskPredictionPrompt = (patientData) => {
  return `As a medical risk assessment AI, analyze this patient profile for future health risks:

Patient Profile:
- Age: ${patientData.age || "Unknown"}
- Gender: ${patientData.gender || "Unknown"}
- Blood Group: ${patientData.bloodGroup || "Unknown"}
- Chronic Conditions: ${patientData.chronicConditions?.join(", ") || "None"}
- Current Medications: ${patientData.medications?.join(", ") || "None"}
- Recent Symptoms: ${patientData.recentSymptoms?.join(", ") || "None"}
- Lifestyle factors: ${patientData.lifestyle || "Not provided"}

Provide a comprehensive risk prediction in JSON:
{
  "overall_risk": "low|medium|high",
  "risk_score": 0-100,
  "top_risks": [
    {"condition": "condition name", "probability": "percentage", "description": "brief description"}
  ],
  "preventive_measures": ["measure1", "measure2"],
  "lifestyle_recommendations": ["recommendation1", "recommendation2"],
  "recommended_screenings": ["screening1", "screening2"],
  "health_goals": ["goal1", "goal2"]
}`;
};

const buildMedicalReportPrompt = (reportText) => {
  return `You are a medical report interpreter. Analyze this medical report/prescription and explain it in simple language that a patient can understand.

Report Content:
${reportText}

Provide explanation in JSON format:
{
  "report_type": "prescription|lab_report|scan|other",
  "summary": "Simple 2-3 sentence summary",
  "key_findings": ["finding1", "finding2"],
  "medications": [
    {"name": "med name", "purpose": "what it's for", "notes": "important notes"}
  ],
  "abnormal_values": [
    {"test": "test name", "value": "value", "normal_range": "range", "interpretation": "what it means"}
  ],
  "follow_up": "What patient should do next",
  "questions_to_ask_doctor": ["question1", "question2"],
  "red_flags": ["any concerning findings"]
}`;
};

const buildTranslationPrompt = (text, targetLanguage) => {
  const languages = {
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    bn: "Bengali",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
    ur: "Urdu",
  };
  
  const langName = languages[targetLanguage] || "Hindi";
  
  return `Translate the following medical advice to ${langName} in a simple, clear way that a common person can understand. Preserve all medical information accurately.

Text to translate:
${text}

Provide translation in JSON:
{
  "translated_text": "translation here",
  "language": "${langName}",
  "simplified": true
}`;
};

module.exports = {
  SYSTEM_PROMPT,
  buildHealthAnalysisPrompt,
  buildRiskPredictionPrompt,
  buildMedicalReportPrompt,
  buildTranslationPrompt,
};
