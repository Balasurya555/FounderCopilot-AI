<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b86ade05-8111-43d7-bc24-f02052ffbe21

## Run Locally
**Prerequisites:** Node.js (>=16)

Steps to run the project locally:

1. Clone the repository

   git clone <repo_url>
   cd <repo_folder>

2. Copy the example env file to create your local env file

   cp .env.example .env.local

3. Add your API keys to `.env.local` (backend-only secrets)

   - For Gemini: `GEMINI_API_KEY=your_gemini_key_here`
   - For OpenAI-compatible usage: `OPENAI_API_KEY=your_openai_key_here`
   - Do NOT use `NEXT_PUBLIC_` or other frontend-prefixed names for secret keys.

4. Install dependencies

   npm install

5. Run the app

   # Start frontend (Vite)
   npm run dev

   # Or start backend + frontend together
   npm run dev:all

Notes:
- Never commit real API keys. Keep them only in `.env.local` and ensure it is ignored by git.
- The backend reads `process.env.OPENAI_API_KEY` (and will fall back to `GEMINI_API_KEY` in this project). If the key is missing, the server logs a clear error and returns a JSON error response instead of crashing.
- Check the backend health endpoint at `http://localhost:5000/health` when running locally.
# FounderCopilot-AI
