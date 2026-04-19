/**
 * Frontend Offline Triage Engine
 * Works 100% without any API calls — pure JS
 * Used on the Emergency page for instant assessment
 */

const CRITICAL_KEYWORDS = [
  "chest pain", "heart attack", "breathing difficulty", "can't breathe",
  "difficulty breathing", "shortness of breath", "seizure", "unconscious",
  "stroke", "heavy bleeding", "severe bleeding", "anaphylaxis",
  "allergic reaction", "choking", "poisoning", "overdose",
  "severe burn", "head injury", "neck injury", "paralysis",
];

const MODERATE_KEYWORDS = [
  "fever", "high fever", "vomiting", "diarrhea", "severe headache",
  "migraine", "abdominal pain", "stomach pain", "fracture", "broken bone",
  "dizziness", "fainting", "high blood pressure", "low blood pressure",
  "diabetic", "blood sugar", "swollen", "severe pain",
];

const MILD_KEYWORDS = [
  "cold", "cough", "sore throat", "runny nose", "mild headache",
  "fatigue", "nausea", "mild fever", "rash", "itching",
  "minor cut", "bruise", "muscle ache", "back pain",
  "toothache", "ear pain", "constipation",
];

/**
 * Perform client-side triage without any API
 * @param {string[]} symptoms - Array of symptom strings
 * @returns {{ severity, isEmergency, advice, score, callNumber }}
 */
export const performTriageFrontend = (symptoms = []) => {
  if (!symptoms || symptoms.length === 0) {
    return {
      severity: "NORMAL",
      isEmergency: false,
      advice: "No symptoms provided. Stay healthy!",
      score: 0,
      callNumber: null,
    };
  }

  const normalizedInput = symptoms
    .join(" ")
    .toLowerCase()
    .trim();

  let score = 0;
  const matchedCritical = [];
  const matchedModerate = [];
  const matchedMild = [];

  CRITICAL_KEYWORDS.forEach((kw) => {
    if (normalizedInput.includes(kw)) {
      score += 50;
      matchedCritical.push(kw);
    }
  });

  MODERATE_KEYWORDS.forEach((kw) => {
    if (normalizedInput.includes(kw)) {
      score += 20;
      matchedModerate.push(kw);
    }
  });

  MILD_KEYWORDS.forEach((kw) => {
    if (normalizedInput.includes(kw)) {
      score += 5;
      matchedMild.push(kw);
    }
  });

  let severity, advice, callNumber;

  if (score >= 50 || matchedCritical.length > 0) {
    severity = "EMERGENCY";
    callNumber = "108";
    advice =
      "🚨 CRITICAL SYMPTOMS DETECTED. Call 108 immediately. Do not drive yourself. Stay calm. Keep the patient conscious and still.";
  } else if (score >= 20 || matchedModerate.length > 0) {
    severity = "MODERATE";
    callNumber = "108";
    advice =
      "⚠️ Moderate symptoms detected. Visit a doctor or urgent care within 24 hours. If symptoms worsen rapidly, call 108.";
  } else if (score > 0) {
    severity = "MILD";
    callNumber = null;
    advice =
      "✅ Symptoms appear mild. Rest, stay hydrated, and monitor your condition. Consult a doctor if symptoms persist beyond 2-3 days.";
  } else {
    severity = "NORMAL";
    callNumber = null;
    advice =
      "No significant symptoms matched. If you feel unwell, please consult a doctor.";
  }

  return {
    severity,
    isEmergency: severity === "EMERGENCY",
    advice,
    score: Math.min(score, 100),
    callNumber,
    matchedCritical,
    matchedModerate,
    matchedMild,
  };
};

/**
 * Check single symptom urgency
 */
export const isSymptomCritical = (symptom) => {
  const s = symptom.toLowerCase();
  return CRITICAL_KEYWORDS.some((kw) => s.includes(kw));
};

/**
 * Get first-aid tip for a symptom
 */
export const getFirstAidTip = (symptom) => {
  const s = symptom.toLowerCase();
  const tips = {
    "chest pain": "Stop all activity. Sit or lie down. Loosen tight clothing. Chew aspirin if not allergic. Call 108.",
    "breathing": "Sit upright, loosen clothing, use prescribed inhaler if available. Call 108 if no improvement in 5 min.",
    "seizure": "Clear the area, protect head, do not restrain or put anything in mouth. Time the seizure. Call 108.",
    "bleeding": "Apply firm direct pressure with clean cloth. Elevate the injured area above heart if possible. Call 108.",
    "burn": "Cool under running cold water for 20 minutes. Do not use ice or butter. Cover loosely. Call 108.",
    "choking": "Encourage coughing. Give 5 back blows between shoulder blades. Give 5 abdominal thrusts (Heimlich). Call 108.",
    "fever": "Rest, drink plenty of fluids, take paracetamol, sponge with lukewarm water. See doctor if >103°F.",
    "vomiting": "Stay hydrated with small sips of water/ORS. Avoid solid food for 2-4 hours. See doctor if persistent.",
    "dizziness": "Sit or lie down immediately to avoid falling. Drink water. Avoid sudden movements.",
    "fracture": "Immobilize the limb, do not try to straighten. Apply ice wrapped in cloth. Go to ER.",
  };

  for (const [key, tip] of Object.entries(tips)) {
    if (s.includes(key)) return tip;
  }
  return "Consult a doctor. For emergencies, call 108 immediately.";
};
