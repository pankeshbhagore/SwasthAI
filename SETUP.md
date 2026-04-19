# 🚀 SwasthAI — Quick Setup Guide

## ⚡ Fastest Way to Run (5 minutes)

### Option A: Without API keys (Offline mode)
Works with rule-based triage — no OpenAI needed.

```bash
# 1. Clone / extract project
cd swasthai

# 2. Install backend
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI (or use default localhost)

# 3. Start MongoDB (if not running)
mongod --dbpath /data/db &

# 4. Seed demo data
npm run seed

# 5. Start backend
npm run dev

# 6. Open new terminal — install frontend
cd ../frontend
npm install
npm start
```

Open **http://localhost:3000**

Login:
- **rahul@demo.com** / demo123
- **priya@demo.com** / demo123
- **admin@swasthai.com** / admin123

---

### Option B: With OpenAI (Full AI mode)

Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-...your key here...
```

Then follow Option A steps. The AI agents will activate automatically.

---

### Option C: Docker (One command)

```bash
# Set your keys
export OPENAI_API_KEY=sk-...

# Run everything
docker-compose up --build
```

Open **http://localhost:3000**

---

## 🔑 API Keys Reference

| Key | Where to Get | Impact if Missing |
|-----|-------------|-------------------|
| `OPENAI_API_KEY` | platform.openai.com | Falls back to rule-based triage |
| `MONGODB_URI` | MongoDB Atlas or local | **Required** — app won't start |
| `GOOGLE_MAPS_API_KEY` | console.cloud.google.com | Demo hospitals shown instead |
| `TWILIO_*` | console.twilio.com | Emergency SMS disabled |
| `AQI_API_KEY` | aqicn.org/api | AQI banner hidden |
| `OPENWEATHER_API_KEY` | openweathermap.org | Weather info hidden |

---

## 🎯 Demo Script for Judges

### 1. Health Chat (30 sec)
→ Go to **AI Health Chat**
→ Type: *"I have chest pain and difficulty breathing"*
→ Watch: Emergency detected, severity badge, Call 108 button

### 2. Symptom Analyzer (45 sec)
→ Go to **Symptom Analyzer**
→ Click quick-select: "Fever" + "Severe Headache" + "Vomiting"
→ Click **Analyze Symptoms**
→ Show: Multi-agent output — triage + recommendations + food advice

### 3. Voice Input (20 sec)
→ Click 🎤 mic button
→ Say: *"I have high fever and body ache"*
→ Symptoms auto-added

### 4. Hospital Finder (30 sec)
→ Go to **Find Hospitals**
→ Click "Use My Location"
→ Show: Hospitals ranked by distance + emergency capability

### 5. Report Analyzer (30 sec)
→ Go to **Report Analyzer**
→ Paste sample text: *"Patient prescribed: Tab. Metformin 500mg BD, Tab. Amlodipine 5mg OD. BP: 145/90 mmHg. Blood sugar fasting: 145 mg/dL (Normal: 70-100)"*
→ Show: AI explains medications and abnormal values in simple language

### 6. Emergency SOS (15 sec)
→ Go to **Emergency page** (no login needed)
→ Type: *"chest pain unconscious"*
→ Show: Offline detection + Call 108 button

### 7. Offline Mode (20 sec)
→ Disconnect internet / turn off WiFi
→ Note offline banner appears
→ Do a quick triage — still works!

---

## 🏗️ Architecture Overview

```
Browser (React)
    ↓  REST + WebSocket
API Gateway (Express + Socket.IO)
    ↓
┌─────────────────────────────────────┐
│  AI Service (Multi-Agent System)     │
│  ├── Triage Agent (GPT-4o + Rules)  │
│  ├── Recommendation Agent           │
│  ├── History Agent (Risk Predict)   │
│  ├── Translation Agent (10 langs)   │
│  └── Hospital Agent (Google Maps)   │
├─────────────────────────────────────┤
│  Triage Engine (Pure JS, Offline)   │
├─────────────────────────────────────┤
│  User Service (MongoDB)             │
├─────────────────────────────────────┤
│  Alert Service (Twilio SMS/Call)    │
└─────────────────────────────────────┘
    ↓
MongoDB Atlas / Local
```

---

## 📁 Complete File List (53 files)

### Backend (24 files)
- `server.js` — Express + Socket.IO gateway
- `seed.js` — Demo data seeder
- `routes/` — 7 route files (ai, users, triage, maps, alerts, reports, admin)
- `services/ai-service/` — Orchestrator + 5 agents + prompts
- `services/triage-service/` — Offline rule engine
- `services/user-service/` — User model
- `services/notification-service/` — Twilio + AQI + Weather
- `shared/` — DB, auth middleware, error handler, helpers
- `__tests__/` — Unit tests for triage + helpers

### Frontend (29 files)
- `App.js` — Router with auth guards
- `index.css` — Global design system
- `context/AuthContext.js` — Global auth state
- `hooks/` — useVoice, useSocket, useGeolocation, useHealth, useAQI (5 hooks)
- `utils/` — api.js, helpers.js, triageFrontend.js (3 utils)
- `components/` — 12 components across Chat, Dashboard, Hospital, Report, UI, Emergency, Layout
- `pages/` — 11 pages

---

## 🏆 Winning Points

| Feature | Why Judges Love It |
|---------|-------------------|
| Multi-Agent AI | Shows system design skills |
| Offline Triage | Real-world impact + innovation |
| Multilingual | Social impact for India |
| Emergency SOS | No login needed, life-saving |
| Voice Input | Accessibility + WOW factor |
| Health Dashboard | Data visualization skills |
| JWT + Encryption | Security awareness |
| Tests + Docker | Production-grade thinking |

---

*Built with ❤️ for Bharat — SwasthAI Hackathon 2024*
