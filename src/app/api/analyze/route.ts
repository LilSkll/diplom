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
  const apiKey =
    process.env.OPENAI_API_KEY ??
    process.env.GPT_API_KEY ??
    process.env.OPENAI_KEY ??
    process.env.OPENAI_TOKEN ??
    process.env.LLM_API_KEY;
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
        response_format: { type: "json_object" },
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

    const parsed = normalizeAndValidate(content, sourceLanguage);
    if (!parsed) {
      return buildDemoResponse(sourceLanguage, text);
    }

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
}

Important translation rule:
- Provide real, natural translations of the provided source text for all 4 target fields (en/es/de/ru), not labels and not transliterations.`;
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

function normalizeAndValidate(
  rawContent: string,
  sourceLanguage: LanguageCode,
): Omit<AnalysisResponse, "mode"> | null {
  const parsed = parseModelJson(rawContent);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const grammarFindings = toStringArray(parsed.grammarFindings, 3);
  const syntaxFindings = toStringArray(parsed.syntaxFindings, 3);
  const comparativeInsights = toStringArray(parsed.comparativeInsights, 3);
  const neuralSummary = toStringValue(parsed.neuralSummary);
  const syntaxTree = toStringValue(parsed.syntaxTree);
  const translations = toTranslations(parsed.translations, sourceLanguage);

  if (
    !grammarFindings ||
    !syntaxFindings ||
    !comparativeInsights ||
    !neuralSummary ||
    !syntaxTree ||
    !translations
  ) {
    return null;
  }

  return {
    sourceLanguage,
    grammarFindings,
    syntaxFindings,
    syntaxTree,
    translations,
    comparativeInsights,
    neuralSummary,
  };
}

function parseModelJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim()) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function toStringArray(value: unknown, minSize: number): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const strings = value.filter((item): item is string => typeof item === "string");
  if (strings.length < minSize) {
    return null;
  }
  return strings.slice(0, 5);
}

function toStringValue(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return value.trim();
}

function toTranslations(
  value: unknown,
  sourceLanguage: LanguageCode,
): Record<LanguageCode, string> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const maybe = value as Partial<Record<LanguageCode, unknown>>;
  const en = toStringValue(maybe.en);
  const es = toStringValue(maybe.es);
  const de = toStringValue(maybe.de);
  const ru = toStringValue(maybe.ru);

  if (!en || !es || !de || !ru) {
    return null;
  }

  const translations: Record<LanguageCode, string> = { en, es, de, ru };
  if (translations[sourceLanguage].length < 3) {
    return null;
  }
  return translations;
}
