const OpenAI = require("openai");
const { buildTranslationPrompt } = require("../prompts/healthPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Translation Agent - Multilingual support for Indian languages
 */
class TranslationAgent {
  constructor() {
    this.name = "TranslationAgent";
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
    this.supportedLanguages = ["hi", "ta", "te", "mr", "bn", "gu", "kn", "ml", "pa", "ur", "en"];
  }

  async translate(text, targetLanguage) {
    if (targetLanguage === "en" || !this.supportedLanguages.includes(targetLanguage)) {
      return { agent: this.name, translated_text: text, language: "English", original: true };
    }

    try {
      const prompt = buildTranslationPrompt(text, targetLanguage);
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      return { agent: this.name, ...result };
    } catch (error) {
      console.error("Translation Agent error:", error.message);
      return { agent: this.name, translated_text: text, language: "English", error: true };
    }
  }

  async detectLanguage(text) {
    // Simple heuristic detection for Indian scripts
    const patterns = {
      hi: /[\u0900-\u097F]/,
      ta: /[\u0B80-\u0BFF]/,
      te: /[\u0C00-\u0C7F]/,
      bn: /[\u0980-\u09FF]/,
      gu: /[\u0A80-\u0AFF]/,
      kn: /[\u0C80-\u0CFF]/,
      ml: /[\u0D00-\u0D7F]/,
      pa: /[\u0A00-\u0A7F]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) return lang;
    }
    return "en";
  }
}

module.exports = new TranslationAgent();
