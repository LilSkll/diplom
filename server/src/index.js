import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { parseModelResponse } from "./parser.js";
import { buildPrompt } from "./prompt.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8787;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/analyze", async (req, res) => {
  const { text, sourceLanguage, targetLanguage, apiKey } = req.body ?? {};

  if (!text || typeof text !== "string" || text.trim().length < 1) {
    return res.status(400).json({ error: "Text is required." });
  }
  if (!sourceLanguage || !targetLanguage) {
    return res
      .status(400)
      .json({ error: "Source and target language are required." });
  }
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "OpenAI API key is required." });
  }

  try {
    const prompt = buildPrompt(text.trim(), sourceLanguage, targetLanguage);
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert linguist for English, Spanish, German, and Russian. Return only valid JSON.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      return res.status(502).json({
        error: payload?.error?.message || "OpenAI request failed.",
      });
    }

    const content = payload?.choices?.[0]?.message?.content;
    const parsed = parseModelResponse(content);
    if (!parsed) {
      return res.status(502).json({
        error: "Failed to parse model response. Please retry.",
      });
    }

    res.json(parsed);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Unexpected server error occurred.",
    });
  }
});

app.listen(port, () => {
  console.log(`NeuroLingo server running on http://localhost:${port}`);
});
