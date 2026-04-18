# NeuroLingo Compare (Diploma Demo)

Demo web app for the diploma theme:

> Разработка веб-платформы для сравнительного анализа грамматики, синтаксиса и перевода английского, испанского, немецкого и русского языков с использованием нейросетевых технологий.

## What the demo includes

- Text input with source language selection (`EN`, `ES`, `DE`, `RU`)
- Comparative output blocks:
  - grammar findings
  - syntax findings
  - parallel translations for 4 languages
  - comparative linguistic insights
  - concise neural summary
- Two runtime modes:
  - `Live AI` (when API key is configured)
  - `Demo fallback` (stable local mock response for presentations)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Note: this demo uses Webpack mode in scripts for better compatibility when project paths contain non-Latin characters.

## Environment variables (optional, for live AI)

Create `.env.local` in project root:

```env
OPENAI_API_KEY=your_gpt_api_key_here
# Optional aliases that also work:
# GPT_API_KEY=...
# OPENAI_KEY=...
LLM_MODEL=gpt-4.1-mini
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

If `OPENAI_API_KEY` is missing, the app automatically uses demo fallback mode.

The API now also returns `syntaxTree` (bracket notation) to improve syntactic demonstration quality in diploma presentations.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import repository in [Vercel](https://vercel.com/new).
3. (Optional) Add environment variables in Vercel Project Settings.
4. Deploy.

No extra server setup is required. The API route is implemented in `src/app/api/analyze/route.ts`.
