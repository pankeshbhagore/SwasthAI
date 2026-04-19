const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Nutrition database (per 100g)
const FOOD_DB = {
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  dal: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  roti: { calories: 297, protein: 10, carbs: 55, fat: 3, fiber: 4 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  paneer: { calories: 265, protein: 18, carbs: 3.4, fat: 20, fiber: 0 },
  idli: { calories: 58, protein: 2, carbs: 12, fat: 0.3, fiber: 0.5 },
  sambar: { calories: 55, protein: 3, carbs: 8, fat: 1.2, fiber: 2.5 },
};

/**
 * Analyze nutrition of a meal description
 */
const analyzeMeal = async (mealDescription, userProfile = {}) => {
  try {
    const prompt = `You are a nutritionist AI. Analyze this meal and provide detailed nutritional information.

Meal: ${mealDescription}
User profile: Age ${userProfile.age || "unknown"}, Gender: ${userProfile.gender || "unknown"}, ${userProfile.conditions?.join(", ") || "no conditions"}

Respond ONLY in JSON:
{
  "meal_name": "name",
  "estimated_calories": 0,
  "macros": {"protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0},
  "micronutrients": {"key vitamin or mineral": "amount"},
  "health_score": 0-100,
  "glycemic_index": "low/medium/high",
  "suitable_for": ["conditions this is good for"],
  "avoid_if": ["conditions to avoid for"],
  "improvements": ["suggestion to make it healthier"],
  "portion_advice": "advice on portion size",
  "timing": "best time to eat this"
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch {
    return _fallbackNutrition(mealDescription);
  }
};

/**
 * Generate personalized diet plan
 */
const generateDietPlan = async (userProfile, goals = []) => {
  try {
    const prompt = `Create a 7-day Indian diet plan for:
Age: ${userProfile.age}, Gender: ${userProfile.gender}
Conditions: ${userProfile.conditions?.join(", ") || "healthy"}
Goals: ${goals.join(", ") || "balanced diet"}
Budget: affordable Indian foods

Respond in JSON:
{
  "daily_calories_target": 0,
  "macros_target": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
  "week": [
    {
      "day": "Monday",
      "breakfast": {"meal": "", "calories": 0},
      "lunch": {"meal": "", "calories": 0},
      "dinner": {"meal": "", "calories": 0},
      "snacks": [{"meal": "", "calories": 0}]
    }
  ],
  "foods_to_eat": [],
  "foods_to_avoid": [],
  "hydration": "water intake recommendation",
  "supplements_if_needed": []
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    throw new Error("Diet plan generation failed: " + err.message);
  }
};

/**
 * Calculate BMI and body metrics
 */
const calculateBodyMetrics = (weight, height, age, gender) => {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  let bmiCategory, healthRisk;
  if (bmi < 18.5) { bmiCategory = "Underweight"; healthRisk = "Moderate"; }
  else if (bmi < 25) { bmiCategory = "Normal"; healthRisk = "Low"; }
  else if (bmi < 30) { bmiCategory = "Overweight"; healthRisk = "Increased"; }
  else if (bmi < 35) { bmiCategory = "Obese Class I"; healthRisk = "High"; }
  else if (bmi < 40) { bmiCategory = "Obese Class II"; healthRisk = "Very High"; }
  else { bmiCategory = "Obese Class III"; healthRisk = "Extremely High"; }

  // BMR (Mifflin-St Jeor)
  const bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  // Ideal weight (Devine formula)
  const idealWeight = gender === "male"
    ? 50 + 2.3 * ((height / 2.54 - 60))
    : 45.5 + 2.3 * ((height / 2.54 - 60));

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    healthRisk,
    bmr: Math.round(bmr),
    idealWeightKg: Math.round(idealWeight * 10) / 10,
    weightDifferenceKg: Math.round((weight - idealWeight) * 10) / 10,
    dailyCaloriesNeeded: {
      sedentary: Math.round(bmr * 1.2),
      light: Math.round(bmr * 1.375),
      moderate: Math.round(bmr * 1.55),
      active: Math.round(bmr * 1.725),
    },
  };
};

const _fallbackNutrition = (meal) => ({
  meal_name: meal,
  estimated_calories: 350,
  macros: { protein_g: 15, carbs_g: 45, fat_g: 10, fiber_g: 5 },
  health_score: 65,
  improvements: ["Add more vegetables", "Reduce oil", "Include protein"],
  portion_advice: "Standard serving size",
  source: "fallback",
});

module.exports = { analyzeMeal, generateDietPlan, calculateBodyMetrics, FOOD_DB };
