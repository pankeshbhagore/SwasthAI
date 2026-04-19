const axios = require("axios");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Curated health topics for India
const HEALTH_TOPICS = [
  "disease outbreak India",
  "monsoon diseases prevention",
  "India health ministry advisory",
  "dengue malaria season India",
  "air pollution health effects India",
  "diabetes hypertension India",
  "vaccination drive India",
  "mental health awareness India",
];

/**
 * Fetch health news from NewsAPI
 */
const fetchHealthNews = async (query = "health India", pageSize = 10) => {
  if (!process.env.NEWS_API_KEY) {
    return _getDemoNews();
  }

  try {
    const res = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        language: "en",
        sortBy: "publishedAt",
        pageSize,
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 8000,
    });

    return res.data.articles.map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source.name,
      publishedAt: a.publishedAt,
      urlToImage: a.urlToImage,
    }));
  } catch {
    return _getDemoNews();
  }
};

/**
 * AI-summarize a health article
 */
const summarizeArticle = async (articleText) => {
  try {
    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{
        role: "user",
        content: `Summarize this health article in 3 bullet points. Be simple and clear for general public:\n\n${articleText}`,
      }],
      temperature: 0.3,
      max_tokens: 300,
    });
    return res.choices[0].message.content;
  } catch {
    return null;
  }
};

/**
 * Generate personalized health alerts based on user profile
 */
const getPersonalizedAlerts = async (userProfile) => {
  const { age, conditions = [], city = "India" } = userProfile;

  const alerts = [];
  const month = new Date().getMonth() + 1;

  // Seasonal alerts
  if (month >= 6 && month <= 9) {
    alerts.push({ type: "SEASONAL", title: "Monsoon Season Alert", message: "High risk of dengue, malaria, and waterborne diseases. Use mosquito repellent, drink boiled water.", severity: "WARNING" });
  }
  if (month >= 3 && month <= 5) {
    alerts.push({ type: "SEASONAL", title: "Summer Health Advisory", message: "Risk of heat stroke and dehydration. Drink at least 3-4 liters of water daily.", severity: "INFO" });
  }
  if (month >= 10 && month <= 12) {
    alerts.push({ type: "SEASONAL", title: "Winter Health Advisory", message: "Flu and respiratory infection season. Get vaccinated if not done.", severity: "INFO" });
  }

  // Condition-specific alerts
  if (conditions.includes("Diabetes") || conditions.includes("diabetes")) {
    alerts.push({ type: "CONDITION", title: "Diabetes Monitoring", message: "Check blood sugar regularly. Stay hydrated this season. Foot care is important.", severity: "INFO" });
  }
  if (conditions.includes("Hypertension") || conditions.includes("hypertension")) {
    alerts.push({ type: "CONDITION", title: "BP Management Reminder", message: "Take medications on time. Reduce salt intake. Monitor BP twice daily.", severity: "INFO" });
  }
  if (conditions.includes("Asthma") || conditions.includes("asthma")) {
    alerts.push({ type: "CONDITION", title: "Asthma Alert", message: "Keep your inhaler accessible. Avoid outdoor activity during high pollution days.", severity: "WARNING" });
  }

  // Age-based alerts
  if (age >= 40) {
    alerts.push({ type: "PREVENTIVE", title: "Annual Health Checkup Due", message: "Recommended: Blood sugar, BP, cholesterol, kidney function, eye exam.", severity: "INFO" });
  }
  if (age >= 50) {
    alerts.push({ type: "PREVENTIVE", title: "Cancer Screening", message: "Consider age-appropriate cancer screenings as recommended by your doctor.", severity: "INFO" });
  }

  return alerts;
};

const _getDemoNews = () => [
  {
    title: "India Strengthens Dengue Prevention as Monsoon Cases Rise",
    description: "Health Ministry issues advisory as dengue cases increase in northern states. Experts recommend mosquito control and early testing.",
    source: "Health India",
    publishedAt: new Date().toISOString(),
    url: "#",
  },
  {
    title: "New Study Shows Yoga Reduces BP in Hypertension Patients",
    description: "AIIMS study confirms 30-min daily yoga reduces systolic blood pressure by 8-12 mmHg in hypertensive patients.",
    source: "Medical Journal India",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    url: "#",
  },
  {
    title: "Government Launches Free Mental Health Helpline",
    description: "NIMHANS launches 24x7 mental health support line accessible via iCall. Available in 10 Indian languages.",
    source: "Ministry of Health",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    url: "#",
  },
  {
    title: "Diabetes Cases Surge in Urban India — Lifestyle Changes Critical",
    description: "Over 101 million diabetics in India. Experts stress need for diet modification, exercise, and regular monitoring.",
    source: "Indian Diabetes Society",
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    url: "#",
  },
];

module.exports = { fetchHealthNews, summarizeArticle, getPersonalizedAlerts };
