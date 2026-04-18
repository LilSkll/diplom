import { NextResponse } from "next/server";

type LanguageCode = "en" | "es" | "de" | "ru";

type AnalysisResponse = {
  sourceLanguage: LanguageCode;
  grammarFindings: string[];
  syntaxFindings: string[];
  syntaxTree: string;
  translations: Record<LanguageCode, string>;
  comparativeInsights: string[];
  neuralSummary: string;
  mode: "ai" | "demo";
};

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  ru: "Russian",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sourceLanguage?: LanguageCode;
      text?: string;
    };

    if (!body.text || body.text.trim().length < 8 || !body.sourceLanguage) {
      return NextResponse.json(
        {
          error:
            "Please provide source language and a text fragment with at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const safeText = body.text.trim().slice(0, 1000);
    const response = await runAnalysis(body.sourceLanguage, safeText);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to process request. Check payload format." },
      { status: 400 },
    );
  }
}

async function runAnalysis(
  sourceLanguage: LanguageCode,
  text: string,
): Promise<AnalysisResponse> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";
  const apiUrl =
    process.env.LLM_API_URL ?? "https://api.openai.com/v1/chat/completions";

  if (!apiKey) {
    return buildDemoResponse(sourceLanguage, text);
  }

  try {
    const prompt = buildPrompt(sourceLanguage, text);
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a linguistics assistant. Return strict JSON without markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!upstream.ok) {
      return buildDemoResponse(sourceLanguage, text);
    }

    const payload = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return buildDemoResponse(sourceLanguage, text);
    }

    const parsed = JSON.parse(content) as Omit<AnalysisResponse, "mode">;
    return {
      ...parsed,
      sourceLanguage,
      mode: "ai",
    };
  } catch {
    return buildDemoResponse(sourceLanguage, text);
  }
}

function buildPrompt(sourceLanguage: LanguageCode, text: string) {
  return `Analyze the following text for comparative linguistics.

Source language: ${LANGUAGE_NAMES[sourceLanguage]}
Text: "${text}"

Return JSON object with exactly these fields:
{
  "sourceLanguage": "${sourceLanguage}",
  "grammarFindings": ["3-5 short bullets"],
  "syntaxFindings": ["3-5 short bullets"],
  "syntaxTree": "compact bracketed parse tree for the source text",
  "translations": {
    "en": "translation",
    "es": "translation",
    "de": "translation",
    "ru": "translation"
  },
  "comparativeInsights": ["3-5 short bullets"],
  "neuralSummary": "2-3 sentence summary for academic presentation"
}`;
}

function buildDemoResponse(
  sourceLanguage: LanguageCode,
  text: string,
): AnalysisResponse {
  const shortText = text.length > 140 ? `${text.slice(0, 137)}...` : text;
  return {
    sourceLanguage,
    grammarFindings: [
      `The source fragment (${LANGUAGE_NAMES[sourceLanguage]}) shows stable tense agreement in its main clause.`,
      "Article and determiner usage appears consistent, but lexical ambiguity remains in one phrase.",
      "Function words are distributed naturally, suggesting fluent L2-style production.",
    ],
    syntaxFindings: [
      "The sentence uses a complex clause structure with a clear dependency between subordinate and main propositions.",
      "Word-order transfer risk is moderate when mapping into German and Russian due to stricter positional constraints.",
      "Information focus is front-loaded, which can change emphasis after translation.",
    ],
    syntaxTree:
      "(S (SBAR (IN Although) (S (NP I) (VP had studied (NP Spanish) (PP for (NP years))))) (, ,) (NP I) (VP still confuse (NP ser and estar) (SBAR (WHADVP when) (S (NP I) (VP speak (ADVP quickly))))))",
    translations: {
      en: shortText,
      es: `Traduccion demo: ${shortText}`,
      de: `Demo-Uebersetzung: ${shortText}`,
      ru: `Демо-перевод: ${shortText}`,
    },
    comparativeInsights: [
      "Spanish and Russian often realize aspectual nuance differently from English simple/perfect contrasts.",
      "German clause-final verb placement can increase syntactic distance compared to English and Spanish.",
      "Russian allows higher flexibility in constituent order, which influences discourse prominence.",
    ],
    neuralSummary:
      "The demo indicates that neural comparative analysis can jointly evaluate grammar stability, syntactic transfer effects, and multilingual translation quality. Even on short inputs, the platform exposes language-specific constraints that are useful for pedagogical and research interpretation.",
    mode: "demo",
  };
}
