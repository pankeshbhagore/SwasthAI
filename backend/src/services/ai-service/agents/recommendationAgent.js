const OpenAI = require("openai");
const { SYSTEM_PROMPT } = require("../prompts/healthPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORG_ID || undefined });

/**
 * Recommendation Agent - Suggests personalized health actions
 */
class RecommendationAgent {
  constructor() {
    this.name = "RecommendationAgent";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async recommend(triageResult, userProfile) {
    const prompt = this._buildPrompt(triageResult, userProfile);
    
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      
      return { agent: this.name, ...result };
    } catch (error) {
      console.error("Recommendation Agent error:", error.message);
      return this._getFallbackRecommendations(triageResult);
    }
  }

  _buildPrompt(triageResult, userProfile) {
    const language = userProfile?.language || "en";
    const languages = {
      hi: "Hindi (Devanagari script)",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi (Devanagari script)",
      bn: "Bengali",
      gu: "Gujarati",
      kn: "Kannada",
      ml: "Malayalam",
      pa: "Punjabi",
      ur: "Urdu",
      hinglish: "Hinglish (mix of Hindi and English)"
    };

    const langName = languages[language] || "English";
    const languageInstruction = language === "en" 
      ? "Respond in clear English." 
      : `Respond ENTIRELY in ${langName}. All textual fields in the JSON must be in ${langName}.`;

    return `${languageInstruction}

Based on this health assessment, provide personalized recommendations:

Assessment:
- Severity: ${triageResult.severity}
- Risk: ${triageResult.risk}
- Conditions: ${triageResult.possible_conditions?.join(", ")}

Patient Profile:
- Age: ${userProfile?.age || "Unknown"}
- Chronic Conditions: ${userProfile?.chronicConditions?.join(", ") || "None"}
- Current Medications: ${userProfile?.medications?.join(", ") || "None"}
- Location: ${userProfile?.city || "India"}

Provide recommendations in JSON:
{
  "immediate_actions": ["action1", "action2"],
  "home_remedies": ["remedy1", "remedy2"],
  "medications_to_consider": ["OTC med 1 with dosage"],
  "foods_to_eat": ["food1", "food2"],
  "foods_to_avoid": ["food1", "food2"],
  "activities_to_avoid": ["activity1"],
  "follow_up_timeline": "When to see a doctor",
  "monitoring_tips": ["What to watch for"],
  "lifestyle_changes": ["change1", "change2"]
}`;
  }

  _getFallbackRecommendations(triageResult) {
    if (triageResult.severity === "EMERGENCY") {
      return {
        agent: this.name,
        immediate_actions: ["Call 108 immediately", "Do not drive yourself", "Stay calm"],
        home_remedies: [],
        medications_to_consider: [],
        follow_up_timeline: "Immediate — go to emergency room now",
        monitoring_tips: ["Stay with someone until help arrives"],
      };
    }
    return {
      agent: this.name,
      immediate_actions: ["Rest", "Stay hydrated", "Monitor symptoms"],
      home_remedies: ["Drink warm water", "Get adequate sleep"],
      medications_to_consider: ["Consult a pharmacist for appropriate OTC medication"],
      follow_up_timeline: "Within 48 hours if no improvement",
      monitoring_tips: ["Track temperature", "Note any new symptoms"],
    };
  }
}

module.exports = new RecommendationAgent();
