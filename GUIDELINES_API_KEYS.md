# SwasthAI – External API Keys Setup Guidelines

To fully unlock the potential of SwasthAI, you need to configure several external API keys. Follow this guide to set them up in your `backend/.env` file.

## 1. OpenAI API Key (Required)
Used for the multi-agent AI system, health analysis, and conversational assistant.
- **Where to get**: [OpenAI Platform](https://platform.openai.com/)
- **Variable**: `OPENAI_API_KEY=your_key_here`
- **Model Choice**: By default, it uses `gpt-4o`. You can change it via `OPENAI_MODEL`.

## 2. Google Maps / Places API (Recommended)
Used for locating nearby hospitals and healthcare facilities.
- **Where to get**: [Google Cloud Console](https://console.cloud.google.com/)
- **Enable**: Places API, Maps JavaScript API, and Distance Matrix API.
- **Variable**: `GOOGLE_MAPS_API_KEY=your_key_here`

## 3. Twilio (Optional - for Emergency Alerts)
Used for sending SMS and Voice notifications during emergencies.
- **Where to get**: [Twilio Console](https://www.twilio.com/console)
- **Variables**:
  - `TWILIO_ACCOUNT_SID=your_sid`
  - `TWILIO_AUTH_TOKEN=your_token`
  - `TWILIO_PHONE_NUMBER=your_twilio_number`

## 4. WAQI (Air Quality) & OpenWeather (Optional)
Used for providing localized environmental health alerts.
- **WAQI Token**: [AQICN](https://aqicn.org/data-platform/token/)
- **Weather Key**: [OpenWeatherMap](https://openweathermap.org/api)
- **Variables**:
  - `WAQI_TOKEN=your_token`
  - `OPENWEATHER_API_KEY=your_key`

## 5. MongoDB (Required)
Used for storing user data, health history, and vitals.
- **Local**: `mongodb://localhost:27017/swasthai`
- **Atlas**: `mongodb+srv://<user>:<password>@cluster.mongodb.net/swasthai`
- **Variable**: `MONGO_URI=your_uri`

---

### How to add these to the project:
1. Navigate to the `backend/` directory.
2. Open the `.env` file (create it from `.env.example` if it doesn't exist).
3. Paste your keys into the corresponding fields.
4. Restart the backend server (`npm run dev`).

### Security Tip:
**NEVER** commit your `.env` file to version control (GitHub/GitLab). It is already included in `.gitignore` by default.
