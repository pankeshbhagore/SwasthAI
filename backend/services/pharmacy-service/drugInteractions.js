/**
 * SwasthAI Drug Interaction Checker
 * Rule-based database of known drug interactions
 * In production: integrate with RxNorm / OpenFDA API
 */

const INTERACTION_DB = {
  // Format: "drug_a:drug_b" → { severity, description, recommendation }
  "warfarin:aspirin": {
    severity: "MAJOR",
    description: "Increased bleeding risk. Both thin blood, combination is dangerous.",
    recommendation: "Avoid combination. Consult doctor immediately.",
  },
  "warfarin:ibuprofen": {
    severity: "MAJOR",
    description: "NSAIDs can increase anticoagulation effects significantly.",
    recommendation: "Use paracetamol instead. Monitor closely.",
  },
  "metformin:alcohol": {
    severity: "MODERATE",
    description: "Alcohol increases risk of lactic acidosis with metformin.",
    recommendation: "Limit or avoid alcohol consumption.",
  },
  "amlodipine:simvastatin": {
    severity: "MODERATE",
    description: "Amlodipine can increase simvastatin blood levels, raising myopathy risk.",
    recommendation: "Use lower simvastatin dose. Monitor for muscle pain.",
  },
  "lisinopril:potassium": {
    severity: "MODERATE",
    description: "ACE inhibitors increase potassium. Supplements can cause hyperkalemia.",
    recommendation: "Avoid potassium supplements unless prescribed.",
  },
  "metformin:contrast_dye": {
    severity: "MAJOR",
    description: "Hold metformin before procedures with contrast dye — kidney risk.",
    recommendation: "Stop 48 hours before and after contrast procedures.",
  },
  "ciprofloxacin:antacids": {
    severity: "MODERATE",
    description: "Antacids reduce ciprofloxacin absorption by up to 90%.",
    recommendation: "Take ciprofloxacin 2 hours before or 6 hours after antacids.",
  },
  "ssri:tramadol": {
    severity: "MAJOR",
    description: "Risk of serotonin syndrome — potentially life threatening.",
    recommendation: "Avoid combination. Seek alternative pain management.",
  },
  "sildenafil:nitrates": {
    severity: "CONTRAINDICATED",
    description: "Severe hypotension risk. Can be fatal.",
    recommendation: "NEVER combine. Absolute contraindication.",
  },
  "digoxin:amiodarone": {
    severity: "MAJOR",
    description: "Amiodarone increases digoxin levels significantly.",
    recommendation: "Reduce digoxin dose by 50%. Monitor levels.",
  },
  "aspirin:ibuprofen": {
    severity: "MODERATE",
    description: "Ibuprofen can block aspirin's cardioprotective effects.",
    recommendation: "Take aspirin 2 hours before ibuprofen if needed.",
  },
  "clopidogrel:omeprazole": {
    severity: "MODERATE",
    description: "Omeprazole reduces clopidogrel effectiveness.",
    recommendation: "Use pantoprazole instead as safer alternative.",
  },
  "atorvastatin:clarithromycin": {
    severity: "MAJOR",
    description: "Clarithromycin significantly increases statin levels — myopathy risk.",
    recommendation: "Temporarily stop statin during antibiotic course.",
  },
  "levothyroxine:calcium": {
    severity: "MODERATE",
    description: "Calcium reduces thyroid hormone absorption.",
    recommendation: "Take levothyroxine 4 hours apart from calcium.",
  },
  "methotrexate:nsaids": {
    severity: "MAJOR",
    description: "NSAIDs reduce methotrexate elimination — toxicity risk.",
    recommendation: "Avoid NSAIDs with methotrexate.",
  },
};

// Normalize drug name
const normalizeDrug = (name) => name.toLowerCase().trim().replace(/\s+/g, "_");

/**
 * Check interaction between two drugs
 */
const checkInteraction = (drug1, drug2) => {
  const d1 = normalizeDrug(drug1);
  const d2 = normalizeDrug(drug2);

  const key1 = `${d1}:${d2}`;
  const key2 = `${d2}:${d1}`;

  return INTERACTION_DB[key1] || INTERACTION_DB[key2] || null;
};

/**
 * Check all interactions in a medication list
 */
const checkAllInteractions = (medications) => {
  const results = [];
  const normalized = medications.map(normalizeDrug);

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const interaction = checkInteraction(normalized[i], normalized[j]);
      if (interaction) {
        results.push({
          drug1: medications[i],
          drug2: medications[j],
          ...interaction,
        });
      }
    }
  }

  // Sort by severity
  const severityOrder = { CONTRAINDICATED: 4, MAJOR: 3, MODERATE: 2, MINOR: 1 };
  results.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

  return {
    interactions: results,
    hasCritical: results.some((r) => ["CONTRAINDICATED", "MAJOR"].includes(r.severity)),
    total: results.length,
  };
};

/**
 * Get drug info (basic)
 */
const getDrugInfo = (drugName) => {
  const drug = normalizeDrug(drugName);
  const knownDrugs = {
    metformin: { class: "Biguanide", use: "Type 2 Diabetes", commonSideEffects: ["Nausea", "Diarrhea", "Stomach upset"] },
    amlodipine: { class: "Calcium Channel Blocker", use: "Hypertension, Angina", commonSideEffects: ["Swollen ankles", "Flushing", "Headache"] },
    atorvastatin: { class: "Statin", use: "High Cholesterol", commonSideEffects: ["Muscle pain", "Liver enzyme elevation"] },
    aspirin: { class: "NSAID/Antiplatelet", use: "Pain, Fever, Heart disease prevention", commonSideEffects: ["GI irritation", "Bleeding"] },
    lisinopril: { class: "ACE Inhibitor", use: "Hypertension, Heart failure", commonSideEffects: ["Dry cough", "Dizziness", "Hyperkalemia"] },
    omeprazole: { class: "PPI", use: "Acid reflux, Ulcers", commonSideEffects: ["Headache", "Nausea", "Bone loss with long use"] },
    metoprolol: { class: "Beta Blocker", use: "Hypertension, Heart failure", commonSideEffects: ["Fatigue", "Cold hands", "Slow heart rate"] },
    warfarin: { class: "Anticoagulant", use: "Blood clot prevention", commonSideEffects: ["Bleeding", "Bruising"] },
    levothyroxine: { class: "Thyroid Hormone", use: "Hypothyroidism", commonSideEffects: ["Palpitations", "Insomnia if overdosed"] },
    paracetamol: { class: "Analgesic/Antipyretic", use: "Pain, Fever", commonSideEffects: ["Liver damage at high doses"] },
  };
  return drug in knownDrugs ? drug in knownDrugs && knownDrugs[drug] : null;
};

module.exports = { checkInteraction, checkAllInteractions, getDrugInfo, normalizeDrug };
