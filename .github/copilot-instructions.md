# SwasthAI — GitHub Copilot Workspace Instructions
# Challenge 3: Healthcare Assistant Agent — Agentic AI Hackathon 2026

## Project Overview
SwasthAI is a multilingual AI-powered healthcare assistant that:
1. Performs symptom-based triage (MILD/MODERATE/EMERGENCY)
2. Suggests personalized next steps and recommendations
3. Locates nearest healthcare facilities via Google Maps
4. Maintains complete 90-day patient history with ML risk scoring

## How GitHub Copilot Was Used in This Project

### 1. Generate Chatbot Workflows
Copilot helped generate:
- Multi-turn conversational AI flows in `backend/services/ai-service/`
- Agent orchestration logic in `backend/services/ai-service/index.js`
- Prompt templates in `backend/services/ai-service/prompts/healthPrompt.js`
- Chat interface component in `frontend/src/components/Chat/ChatInterface.js`

### 2. Build Triage Logic Systems
Copilot helped build:
- Symptom scoring engine in `backend/services/triage-service/triageEngine.js`
- ML disease classifier in `backend/services/ml-service/ml_server.py`
- Rule-based offline triage in `frontend/src/utils/triageFrontend.js`
- Severity classification (MILD/MODERATE/EMERGENCY) algorithms

### 3. Integrate Healthcare and Maps APIs
Copilot helped integrate:
- Google Maps Places API in `backend/services/ai-service/agents/hospitalAgent.js`
- Twilio emergency SMS/call in `backend/services/notification-service/alertService.js`
- OpenAI GPT-4o multi-agent system in `backend/services/ai-service/`
- AQI and Weather APIs in `backend/services/notification-service/alertService.js`

### 4. Enable Multilingual Capabilities
Copilot helped configure:
- Translation agent for 10+ Indian languages in `backend/services/ai-service/agents/translationAgent.js`
- Language detection (Devanagari, Tamil, Telugu scripts) 
- Multilingual prompts in `backend/services/ai-service/prompts/healthPrompt.js`
- Voice input with Web Speech API in `frontend/src/hooks/useVoice.js`

## Code Style Guidelines (for Copilot)
- Use async/await throughout (no callbacks)
- All AI responses must be JSON-structured
- Every route must have error handling with next(error)
- MongoDB schemas use Mongoose with validation
- React components: functional + hooks only
- Always include medical disclaimer on health outputs
- Emergency detection must ALWAYS fall back to rule-based if AI fails

## Key Files for Copilot Context
- `backend/server.js` — API Gateway + Socket.IO
- `backend/services/ai-service/index.js` — AI Orchestrator
- `backend/services/triage-service/triageEngine.js` — Core triage logic
- `backend/services/ai-service/agents/triageAgent.js` — AI triage
- `backend/services/ai-service/agents/translationAgent.js` — Multilingual
- `backend/services/ai-service/agents/hospitalAgent.js` — Maps integration
- `frontend/src/components/Chat/ChatInterface.js` — Chatbot UI
- `frontend/src/pages/EmergencyPage.js` — Emergency SOS

## Challenge Requirements Mapping
| Challenge Requirement | Implementation File |
|----------------------|---------------------|
| Multilingual AI | `agents/translationAgent.js` + `useVoice.js` |
| Symptom-based triage | `triageEngine.js` + `agents/triageAgent.js` |
| Suggests next steps | `agents/recommendationAgent.js` |
| Locates healthcare facilities | `agents/hospitalAgent.js` + Google Maps API |
| Maintains patient history | `services/user-service/models/User.js` + History Agent |
| Generate chatbot workflows | `services/ai-service/index.js` + ChatInterface |
| Build triage logic systems | `triageEngine.js` + `ml_server.py` |
| Integrate healthcare/maps APIs | `hospitalAgent.js` + `alertService.js` |
| Enable multilingual capabilities | `translationAgent.js` + voice hooks |
