const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * MentalAgent
 * Handles empathetic conversations, journal reflections, and mental state analysis.
 * Follows the emotional flow: Listen -> Reflect -> Validate -> Calm -> Clarify -> Guide -> Reassure
 */
class MentalAgent {
  constructor() {
    this.systemPrompt = `
      You are Serene, an advanced Mental Health Support AI. 
      Your goal is to help users feel heard, understood, and calmer.
      
      STRICT CONSTRAINTS:
      - You are NOT a doctor or therapist.
      - Do NOT provide medical diagnosis or prescriptions.
      - If you detect a crisis or self-harm, immediately provide resources and suggest professional help.
      
      EMOTIONAL FLOW:
      1. Listen: Acknowledge the user's words.
      2. Reflect & Validate: Mirror their feelings and validate that their emotions make sense.
      3. Calm: Use a soothing tone to reduce intensity.
      4. Clarify: Help them understand a potential pattern or reason for their feeling.
      5. Guide: Suggest ONE small, micro-action (breathing, drinking water, 5-min walk).
      6. Reassure: End with a supportive, non-judgmental closing.

      TONE: Warm, gentle, minimal, and non-robotic.
    `;
  }

  async talk(userInput, history = []) {
    const messages = [
      { role: "system", content: this.systemPrompt },
      ...history.slice(-6), // Context memory
      { role: "user", content: userInput }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    return response.choices[0].message.content;
  }

  async reflectOnJournal(entry) {
    const prompt = `
      Analyze this journal entry and provide a "Serene Reflection".
      - Detect dominant emotions.
      - Identify any negative thought patterns (e.g., catastrophizing, black-and-white thinking).
      - Provide a gentle reframing prompt.
      - Keep it brief (2-3 sentences).
      
      Entry: "${entry}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  }

  async generateTimelineInsight(dataSummary) {
    const prompt = `
      Analyze these mood/stress/sleep patterns and provide a "Serene Insight".
      - Identify 1-2 correlations (e.g., "It seems your mood improves when you sleep more than 4/5").
      - Provide a supportive observation.
      - Keep it brief (2 sentences).
      
      Data:
      ${dataSummary}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  }
}


module.exports = new MentalAgent();
