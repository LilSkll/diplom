# NeuroLingo Platform

Production-ready web platform for comparative analysis of grammar, syntax, and translation across:

- English
- Spanish
- German
- Russian

## Stack

- Frontend: `React + Vite + TypeScript + TailwindCSS + Framer Motion + react-d3-tree`
- Backend: `Node.js + Express` (stateless proxy to OpenAI)
- No database used

## Features

- Input panel with source/target language selectors
- Real GPT translation and grammar analysis
- Syntax tree tab with JSON-to-tree rendering
- Comparison mode for 4 languages
- Dark/Light mode toggle
- Copy result and export JSON
- API key stored in browser `localStorage` only

## Run locally

```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev
```

Apps:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Configuration

Optional backend env in `server/.env`:

```env
PORT=8787
CLIENT_ORIGIN=http://localhost:5173
OPENAI_MODEL=gpt-4.1-mini
```

The OpenAI API key is entered by user in UI and sent as `Authorization: Bearer {API_KEY}` from server proxy call.
