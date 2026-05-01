const twilio = require("twilio");

/**
 * Alert Service - Emergency notifications via Twilio
 */
class AlertService {
  constructor() {
    this.client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
      ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      : null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.cache = new Map();
  }

  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 mins cache
      return cached.data;
    }
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Send emergency SMS alert
   */
  async sendEmergencySMS(toNumber, patientName, symptoms, location) {
    if (!this.client) {
      console.log("📱 [DEMO] SMS Alert:", { toNumber, patientName, symptoms });
      return { success: true, demo: true, message: "Demo mode - SMS not sent" };
    }

    const message = `🚨 SWASTHAI EMERGENCY ALERT
Patient: ${patientName}
Symptoms: ${symptoms.join(", ")}
Location: ${location?.address || `${location?.lat},${location?.lng}`}
Time: ${new Date().toLocaleString("en-IN")}
Please call 108 immediately.`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber,
      });
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error("SMS Error:", error.message);
      throw error;
    }
  }

  /**
   * Send emergency voice call
   */
  async sendEmergencyCall(toNumber, patientName) {
    if (!this.client) {
      console.log("📞 [DEMO] Emergency Call:", { toNumber, patientName });
      return { success: true, demo: true };
    }

    const twiml = `<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    यह SwasthAI से एक आपातकालीन अलर्ट है। ${patientName} को तत्काल चिकित्सा सहायता की आवश्यकता है। 
    कृपया तुरंत 108 पर कॉल करें।
    This is an emergency alert from SwasthAI. ${patientName} needs immediate medical help. Please call 108 now.
  </Say>
</Response>`;

    try {
      const call = await this.client.calls.create({
        twiml,
        from: this.fromNumber,
        to: toNumber,
      });
      return { success: true, sid: call.sid };
    } catch (error) {
      console.error("Call Error:", error.message);
      throw error;
    }
  }

  /**
   * Get real-time air quality
   */
  async getAirQuality(city = "delhi", lat, lng) {
    const cacheKey = lat && lng ? `aqi-${lat}-${lng}` : `aqi-${city}`;
    const cached = this._getCache(cacheKey);
    if (cached) return cached;

    try {
      const axios = require("axios");
      const queryParam = lat && lng ? `geo:${lat};${lng}` : city;
      const response = await axios.get(
        `https://api.waqi.info/feed/${queryParam}/?token=${process.env.AQI_API_KEY}`
      );

      if (response.data.status === "ok") {
        const data = response.data.data;
        const aqi = data.aqi;
        
        let category, advice, color;
        if (aqi <= 50) { category = "Good"; advice = "Air quality is satisfactory."; color = "green"; }
        else if (aqi <= 100) { category = "Moderate"; advice = "Unusually sensitive people should limit outdoor activity."; color = "yellow"; }
        else if (aqi <= 150) { category = "Unhealthy for Sensitive Groups"; advice = "People with respiratory issues should limit outdoor activity."; color = "orange"; }
        else if (aqi <= 200) { category = "Unhealthy"; advice = "Everyone should limit outdoor activity."; color = "red"; }
        else { category = "Hazardous"; advice = "Avoid outdoor activity. Wear N95 mask if going out."; color = "purple"; }

        const result = {
          aqi,
          category,
          advice,
          color,
          city: data.city?.name || city,
          pm25: data.iaqi?.pm25?.v,
          pm10: data.iaqi?.pm10?.v,
          timestamp: data.time?.iso,
        };
        this._setCache(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error("AQI Error:", error.message);
      return null;
    }
  }

  /**
   * Get weather data
   */
  async getWeather(lat, lng) {
    const cacheKey = `weather-${lat}-${lng}`;
    const cached = this._getCache(cacheKey);
    if (cached) return cached;

    try {
      const axios = require("axios");
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat, lon: lng,
            appid: process.env.OPENWEATHER_API_KEY,
            units: "metric",
          },
        }
      );

      const result = {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        city: response.data.name,
        heatIndex: this._calculateHeatIndex(response.data.main.temp, response.data.main.humidity),
      };
      this._setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Weather Error:", error.message);
      return null;
    }
  }

  _calculateHeatIndex(tempC, humidity) {
    if (tempC < 27) return "Normal";
    if (tempC > 40 && humidity > 40) return "Dangerous";
    if (tempC > 35) return "High";
    return "Moderate";
  }
}

module.exports = new AlertService();
