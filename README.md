# 🏥 SwasthAI — Intelligent Healthcare Assistant Agent

[![Challenge 3](https://img.shields.io/badge/Challenge%203-Healthcare%20Assistant%20Agent-red?style=flat-square)](CHALLENGE_REQUIREMENTS.md)
[![GitHub Copilot](https://img.shields.io/badge/Built%20with-GitHub%20Copilot-black?style=flat-square&logo=github)](GITHUB_COPILOT.md)
[![PWA Offline](https://img.shields.io/badge/Offline-PWA%20Ready-green?style=flat-square)](frontend/public/sw.js)
[![10+ Languages](https://img.shields.io/badge/Languages-10+%20Indian-orange?style=flat-square)](CHALLENGE_REQUIREMENTS.md)

> **Agentic AI Hackathon 2026 | Team Altron | IPS Academy (IES), Indore**
>
> *Build a multilingual AI system that performs symptom-based triage, suggests next steps, locates healthcare facilities, and maintains patient history.*

---

## ✅ Challenge Requirements Coverage

| Challenge Requirement | Status | Key File |
|----------------------|--------|----------|
| Multilingual AI (10+ Indian languages) | ✅ | `agents/translationAgent.js` |
| Symptom-based triage (MILD/MOD/EMERGENCY) | ✅ | `triage-service/triageEngine.js` |
| Suggests next steps + recommendations | ✅ | `agents/recommendationAgent.js` |
| Locates healthcare facilities (Google Maps) | ✅ | `agents/hospitalAgent.js` |
| Maintains patient history (90 days) | ✅ | `models/User.js` + History Agent |
| Copilot: Generate chatbot workflows | ✅ | `ai-service/index.js` |
| Copilot: Build triage logic systems | ✅ | `triageEngine.js` + `ml_server.py` |
| Copilot: Integrate healthcare/maps APIs | ✅ | `hospitalAgent.js` + `alertService.js` |
| Copilot: Enable multilingual capabilities | ✅ | `translationAgent.js` + `useVoice.js` |

---

## 🧠 5-Agent AI Architecture

```
User (Voice/Text/Hindi/Tamil...)
    ↓
API Gateway  (Express.js + Socket.IO)
    ↓
AI Orchestrator  (GitHub Copilot-Assisted)
┌─────────────────────────────────────────────────────┐
│  🩺 Triage Agent     → MILD/MODERATE/EMERGENCY      │
│  💊 Recommend Agent  → Personalized next steps      │
│  🏥 Hospital Agent   → Google Maps nearest facility │
│  📋 History Agent    → 90-day records + ML risk     │
│  🌐 Translation      → 10+ Indian languages         │
└─────────────────────────────────────────────────────┘
    ↓                        ↓
ML Service (Python)      MongoDB Atlas
Random Forest            Patient data
40+ diseases             90-day history
```

---

## 🚀 Quick Start

```bash
# Clone and setup
cd swasthai/backend
cp .env.example .env        # Add your API keys
npm install && npm run seed  # Install + load demo data
npm run dev                  # Backend on :5000

cd ../frontend
npm install && npm start     # Frontend on :3000

# ML Service (optional — falls back to rules if offline)
cd backend/services/ml-service
pip install -r requirements.txt && python ml_server.py
```

**Demo login:** `rahul@demo.com` / `demo123` | `admin@swasthai.com` / `admin123`

**One-command Docker:**
```bash
OPENAI_API_KEY=sk-... docker-compose up --build
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Framer Motion, Recharts, PWA |
| Backend | Node.js, Express, Socket.IO |
| AI/LLM | OpenAI GPT-4o Multi-Agent |
| ML | Python Flask, scikit-learn (Random Forest + Gradient Boosting) |
| Database | MongoDB Atlas |
| Maps | Google Maps Places API |
| Emergency | Twilio SMS + Voice |
| DevOps | Docker + GitHub Actions CI/CD |
| Dev Tool | GitHub Copilot |

---

## 📋 Key Features

- 🩺 AI Symptom Triage (MILD/MODERATE/EMERGENCY) — rule-based + ML
- 🌐 10+ Indian Languages — Hindi, Tamil, Telugu, Marathi, Bengali + more
- 🏥 Real-time Hospital Finder — Google Maps, ranked by distance
- 📋 90-Day Patient History — vitals, medications, ML risk scoring
- 🚨 Emergency SOS — auto-dial 108, zero login, GPS auto-share
- 📴 100% Offline Mode — PWA Service Worker for rural India
- 🧠 Mental Health Screening — PHQ-9 + GAD-7 (free for all)
- 💊 Drug Interaction Checker — 15+ major interactions
- 📊 Health Dashboard — interactive charts, health score 0-100
- 📄 PDF Health Reports — auto-generated downloadable

---

## 👥 Team Altron

| Member | Role |
|--------|------|
| Nehal Jain | Team Leader · AI/ML |
| Akriti Goswami | Backend Development |
| Pankesh Bhagore | Full Stack Development |
| Kratik Jain | Frontend & Design |

**IPS Academy (Institute of Engineering & Science), Indore · B.Tech CSE, 3rd Year**

---

## 📚 Documentation

- [GITHUB_COPILOT.md](GITHUB_COPILOT.md) — How Copilot was used for each requirement
- [CHALLENGE_REQUIREMENTS.md](CHALLENGE_REQUIREMENTS.md) — Requirements → code mapping
- [SETUP.md](SETUP.md) — Detailed setup guide + hackathon demo script

---

*⚠️ Medical Disclaimer: SwasthAI provides guidance only — not a substitute for professional medical care. For emergencies, call 108.*

*Built with ❤️ and GitHub Copilot | Team Altron | Agentic AI Hackathon 2026*
