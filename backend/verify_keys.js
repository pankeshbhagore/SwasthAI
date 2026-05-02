require("dotenv").config();
const OpenAI = require("openai");
const axios = require("axios");
const twilio = require("twilio");

async function verifyOpenAI() {
  console.log("\n--- Testing OpenAI API ---");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    console.log("⚠️  OPENAI_API_KEY is not set or is a placeholder.");
    return false;
  }

  try {
    const openai = new OpenAI({ 
      apiKey,
      organization: process.env.OPENAI_ORG_ID
    });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: "Hello, this is a connectivity test." }],
      max_tokens: 5,
    });
    console.log("✅ OpenAI API is working!");
    return true;
  } catch (error) {
    console.log("❌ OpenAI API Error: " + error.message);
    return false;
  }
}

async function verifyTwilio() {
  console.log("\n--- Testing Twilio API ---");
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid.includes("your_")) {
    console.log("⚠️  Twilio credentials are not set or are placeholders.");
    return false;
  }

  try {
    const client = twilio(sid, token);
    const account = await client.api.v2010.accounts(sid).fetch();
    console.log(`✅ Twilio API is working! Account status: ${account.status}`);
    return true;
  } catch (error) {
    console.log("❌ Twilio API Error: " + error.message);
    return false;
  }
}

async function verifyAQI() {
  console.log("\n--- Testing AQI (WAQI) API ---");
  const apiKey = process.env.AQI_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    console.log("⚠️  AQI_API_KEY is not set or is a placeholder.");
    return false;
  }

  try {
    const response = await axios.get(`https://api.waqi.info/feed/delhi/?token=${apiKey}`);
    if (response.data.status === "ok") {
      console.log(`✅ AQI API is working! Current AQI in Delhi: ${response.data.data.aqi}`);
      return true;
    } else {
      console.log("❌ AQI API Error: " + response.data.data);
      return false;
    }
  } catch (error) {
    console.log("❌ AQI API Error: " + error.message);
    return false;
  }
}

async function verifyOpenWeather() {
  console.log("\n--- Testing OpenWeather API ---");
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    console.log("⚠️  OPENWEATHER_API_KEY is not set or is a placeholder.");
    return false;
  }

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: "Delhi",
        appid: apiKey,
        units: "metric",
      },
    });
    console.log(`✅ OpenWeather API is working! Temp in Delhi: ${response.data.main.temp}°C`);
    return true;
  } catch (error) {
    console.log("❌ OpenWeather API Error: " + error.message);
    return false;
  }
}

async function verifyNewsAPI() {
  console.log("\n--- Testing News API ---");
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    console.log("⚠️  NEWS_API_KEY is not set or is a placeholder.");
    return false;
  }

  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: "in",
        apiKey: apiKey,
      },
    });
    if (response.data.status === "ok") {
      console.log(`✅ News API is working! Found ${response.data.totalResults} headlines.`);
      return true;
    } else {
      console.log("❌ News API Error: " + response.data.message);
      return false;
    }
  } catch (error) {
    console.log("❌ News API Error: " + error.message);
    return false;
  }
}

async function verifyMongoDB() {
  console.log("\n--- Testing MongoDB Connection ---");
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("your_")) {
    console.log("⚠️  MONGODB_URI is not set or is a placeholder.");
    return false;
  }

  const mongoose = require("mongoose");
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB is connected!");
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log("❌ MongoDB Error: " + error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("MediMind API Verification Tool");
  console.log("===============================");
  
  await verifyMongoDB();
  await verifyOpenAI();
  await verifyTwilio();
  await verifyAQI();
  await verifyOpenWeather();
  await verifyNewsAPI();
  
  console.log("\n===============================");
  console.log("Verification Complete.");
}

runAllTests();
