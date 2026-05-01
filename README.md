# SwasthAI – Intelligent Public Health Copilot

SwasthAI is a production-level AI-driven platform designed to revolutionize public health response and individual healthcare management in India. It leverages a multi-agent AI system for real-time triage, symptom analysis, and emergency coordination.

## 🚀 Key Features

- **Multi-Agent Health Analysis**: Orchestrated AI agents (Triage, Recommendation, Hospital, History, Translation) providing comprehensive health insights.
- **Conversational Health Assistant**: Real-time AI chat for health queries with localized language support (10+ regional languages).
- **Emergency Infrastructure**: Real-time Socket.IO-based emergency alerts and Twilio-integrated SMS/Voice notifications.
- **Predictive Health Insights**: AI-driven risk prediction based on historical health data and vitals.
- **Premium UI/UX**: Stunning Light/Dark mode interface using the 'Rajdhani' font and glassmorphism design principles.
- **Secure Architecture**: JWT-based authentication, bcrypt hashing, input validation, and production-ready security middleware (Helmet, Rate Limiting).

## 🛠 Tech Stack

- **Frontend**: React, Framer Motion, Recharts, Lucide React, Tailwind-inspired Vanilla CSS.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO.
- **AI/ML**: OpenAI (GPT-4o), Multi-agent pipeline.
- **APIs**: Twilio (SMS/Voice), OpenWeather, WAQI (Air Quality).

## 📂 Project Structure

```text
swasthai/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic & AI agents
│   │   ├── middleware/    # Auth & Security
│   │   └── utils/         # Helpers
│   └── server.js          # Entry point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI parts
    │   ├── context/       # Auth & Theme state
    │   ├── pages/         # View components
    │   └── styles/        # Global CSS & Themes
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` and fill in your keys.
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm start`

## 🔑 Environment Variables

Required variables in `backend/.env`:
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret for token signing.
- `OPENAI_API_KEY`: Key for AI features.
- `TWILIO_ACCOUNT_SID`: (Optional) For SMS alerts.
- `TWILIO_AUTH_TOKEN`: (Optional) For SMS alerts.

## 📄 License
MIT
