<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FounderCopilot AI

An AI-powered startup mentor that guides founders through the Design Thinking framework — from idea to launch.

---

## ⚡ Quick Start (Fresh Clone)

### Prerequisites
- **Node.js** v18+ installed
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd FounderCopilot-AI

# 2. Install all dependencies
npm install

# 3. Configure your API keys
cp backend/.env.example backend/.env
```

Open `backend/.env` and paste your keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
LOGO_API_KEY=your_logo_api_key_here   # can be the same key
PORT=5000
```

### Run

```bash
npm run dev
```

This starts **both** servers simultaneously:
| Server | URL |
|---|---|
| Frontend (Vite) | http://localhost:3000 |
| Backend (Express) | http://localhost:5000 |

The chatbot will show a **"AI service starting…"** banner briefly while the backend initialises, then automatically become ready.

---

## 🏗️ Architecture

```
FounderCopilot-AI/
├── backend/
│   ├── server.js          # Express API (Gemini calls happen here)
│   ├── .env               # Your secrets (gitignored)
│   └── .env.example       # Template — commit this, not .env
├── src/
│   ├── services/
│   │   ├── geminiService.ts   # Frontend → backend bridge
│   │   └── logoService.ts
│   └── pages/
│       └── DashboardPage.tsx
└── package.json           # `npm run dev` starts both servers
```

**The Gemini API key is never exposed to the browser.** All AI calls go through the Express backend.

### Backend API Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | AI connectivity check |
| POST | `/api/chat` | Basic chat completions |
| POST | `/startup-insights` | Full design-thinking analysis |
| POST | `/generate-logo` | SVG logo via Gemini |
| POST | `/api/generate-logo` | Photo-realistic logo via Imagen 3 |
| POST | `/edit-logo` | Logo editing |

---

## 🔑 API Keys

Get your free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

Add it to `backend/.env` (never commit this file — it's gitignored).

---

## 💡 Troubleshooting

| Problem | Fix |
|---|---|
| "AI service starting…" banner persists | Check `backend/.env` has a valid `GEMINI_API_KEY` and restart with `npm run dev` |
| Port 3000/5000 already in use | Kill the process: `lsof -ti:5000 \| xargs kill -9` |
| Logo generation fails | `LOGO_API_KEY` may be missing or Imagen 3 quota exceeded |
