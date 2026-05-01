const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORG_ID || undefined });

// PHQ-9 Depression Screening Questions
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly OR being fidgety or restless",
  "Thoughts that you would be better off dead or of hurting yourself",
];

// GAD-7 Anxiety Screening Questions
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

// Score labels
const PHQ9_SCORE_LABELS = [
  { max: 4, label: "Minimal", color: "#00ff88", action: "Monitor symptoms" },
  { max: 9, label: "Mild", color: "#ffb300", action: "Watchful waiting, repeat assessment in 2 weeks" },
  { max: 14, label: "Moderate", color: "#ff8c00", action: "Consider counseling/therapy" },
  { max: 19, label: "Moderately Severe", color: "#ff5500", action: "Active treatment recommended" },
  { max: 27, label: "Severe", color: "#ff3d71", action: "Immediate psychiatric evaluation needed" },
];

const GAD7_SCORE_LABELS = [
  { max: 4, label: "Minimal Anxiety", color: "#00ff88" },
  { max: 9, label: "Mild Anxiety", color: "#ffb300" },
  { max: 14, label: "Moderate Anxiety", color: "#ff8c00" },
  { max: 21, label: "Severe Anxiety", color: "#ff3d71" },
];

/**
 * Calculate PHQ-9 depression score
 * @param {number[]} answers - Array of 9 scores (0-3 each: Not at all=0, Several days=1, More than half=2, Nearly every day=3)
 */
const calculatePHQ9 = (answers) => {
  const total = answers.reduce((sum, a) => sum + (parseInt(a) || 0), 0);
  const label = PHQ9_SCORE_LABELS.find((l) => total <= l.max) || PHQ9_SCORE_LABELS[4];

  const hasIdeation = answers[8] > 0; // Q9 — self-harm/suicidal ideation

  return {
    score: total,
    maxScore: 27,
    label: label.label,
    color: label.color,
    action: label.action,
    hasIdeation,
    crisis: hasIdeation,
    questions: PHQ9_QUESTIONS,
    percentile: Math.round((total / 27) * 100),
  };
};

/**
 * Calculate GAD-7 anxiety score
 */
const calculateGAD7 = (answers) => {
  const total = answers.reduce((sum, a) => sum + (parseInt(a) || 0), 0);
  const label = GAD7_SCORE_LABELS.find((l) => total <= l.max) || GAD7_SCORE_LABELS[3];

  return {
    score: total,
    maxScore: 21,
    label: label.label,
    color: label.color,
    questions: GAD7_QUESTIONS,
    percentile: Math.round((total / 21) * 100),
  };
};

/**
 * AI-powered mental health analysis
 */
const analyzeMentalHealth = async (phq9Result, gad7Result, userMessage = "") => {
  const crisisResources = [
    "iCall (India): 9152987821",
    "Vandrevala Foundation: 1860-2662-345",
    "AASRA: 9820466627",
    "Snehi: 044-24640050",
  ];

  if (phq9Result.crisis) {
    return {
      summary: "We're concerned about your safety. Please reach out immediately.",
      crisis: true,
      resources: crisisResources,
      action: "URGENT: Please contact a mental health professional or crisis helpline NOW",
      aiAdvice: "You are not alone. Help is available 24/7. Please call one of the numbers above.",
    };
  }

  try {
    const prompt = `You are a compassionate mental health support AI. 
    
PHQ-9 Score: ${phq9Result.score}/27 (${phq9Result.label})
GAD-7 Score: ${gad7Result.score}/21 (${gad7Result.label})
User message: "${userMessage || "No additional message"}"

Provide supportive, evidence-based mental health guidance. Be warm and non-judgmental.
DO NOT diagnose. Encourage professional help where needed.

Respond in JSON:
{
  "summary": "warm 2-sentence summary",
  "key_insights": ["insight1", "insight2"],
  "coping_strategies": ["strategy1", "strategy2", "strategy3"],
  "lifestyle_tips": ["tip1", "tip2", "tip3"],
  "when_to_seek_help": "clear guidance",
  "affirmation": "positive affirmation message",
  "resources": ["helpline or resource"],
  "follow_up": "when to reassess"
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, crisis: false };
  } catch {
    return {
      summary: `Your PHQ-9 score is ${phq9Result.score} (${phq9Result.label}) and GAD-7 is ${gad7Result.score} (${gad7Result.label}).`,
      coping_strategies: ["Deep breathing exercises", "Regular sleep schedule", "Daily physical activity", "Talk to a trusted friend"],
      when_to_seek_help: phq9Result.score >= 10 ? "Consider speaking with a mental health professional soon" : "Monitor your mood over the next 2 weeks",
      resources: crisisResources,
      crisis: false,
    };
  }
};

module.exports = {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  calculatePHQ9,
  calculateGAD7,
  analyzeMentalHealth,
};
