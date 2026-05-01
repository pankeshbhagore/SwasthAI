const OpenAI = require("openai");
const { SYSTEM_PROMPT } = require("../prompts/healthPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORG_ID || undefined });

/**
 * Insight Agent - Provides deep analysis of health patterns
 */
class InsightAgent {
  constructor() {
    this.name = "InsightAgent";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async generateDailyInsights(user, vitals = []) {
    const history = user.healthHistory || [];
    
    const context = `
      Patient Name: ${user.name}
      Age: ${user.age}
      Chronic Conditions: ${user.medicalHistory?.chronicConditions?.join(", ") || "None"}
      Recent History: ${JSON.stringify(history.slice(-5))}
      Latest Vitals: ${JSON.stringify(vitals[0] || "None available")}
    `;

    const prompt = `
      Based on the patient's history and latest vitals, provide:
      1. A short "Health Status" summary (1 sentence).
      2. Identify any 3 potential health trends or concerns.
      3. Provide 3 highly personalized "Wellness Actions" for today.
      4. A "Deep Insight" based on long-term patterns.
      
      Format your response as a JSON object with keys: summary, trends (array), actions (array), deepInsight.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a senior medical consultant agent. Output only JSON." },
          { role: "user", content: context + "\n\n" + prompt },
        ],
        temperature: 0.4,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Insight Agent error:", error.message);
      return {
        summary: "Unable to generate insights at this time.",
        trends: ["No recent data to analyze"],
        actions: ["Continue your regular health routine"],
        deepInsight: "Focus on maintaining consistent monitoring."
      };
    }
  }
}

module.exports = new InsightAgent();
