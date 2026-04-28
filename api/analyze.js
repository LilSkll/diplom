const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { text, sourceLanguage, targetLanguage } = req.body ?? {};
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured on the server.",
    });
  }
  if (!text || typeof text !== "string" || text.trim().length < 1) {
    return res.status(400).json({ error: "Text is required." });
  }
  if (!sourceLanguage || !targetLanguage) {
    return res.status(400).json({
      error: "Source and target language are required.",
    });
  }

  try {
    const prompt = buildPrompt(text.trim(), sourceLanguage, targetLanguage);
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
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

    const parsed = parseModelResponse(payload?.choices?.[0]?.message?.content);
    if (!parsed) {
      return res.status(502).json({
        error: "Failed to parse model response. Please retry.",
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Unexpected server error occurred.",
    });
  }
};

function buildPrompt(text, sourceLanguage, targetLanguage) {
  return `Analyze this sentence for comparative linguistics.
Source language: ${sourceLanguage}
Preferred translation target language: ${targetLanguage}
Input sentence: """${text}"""

Return only JSON with exact shape:
{
  "translation": "high-quality translation into preferred target language",
  "grammarAnalysis": {
    "summary": "short paragraph",
    "partsOfSpeech": [
      { "token": "word", "pos": "part_of_speech", "explanation": "brief note" }
    ],
    "keyGrammarPoints": ["point1", "point2", "point3"]
  },
  "syntaxTree": {
    "name": "S",
    "children": [{ "name": "NP", "children": [] }]
  },
  "translationsByLanguage": {
    "English": "translation",
    "Spanish": "translation",
    "German": "translation",
    "Russian": "translation"
  },
  "structureDifferences": [
    "difference between language structures"
  ]
}

Rules:
- Syntax tree must be valid hierarchical JSON suitable for d3 tree rendering.
- Syntax tree must be a phrase-structure (constituency) tree, not a dependency list.
- Use linguistic labels similar to textbook trees (e.g., S, NP, VP, PP, DET, N, V, ADJ, ADV, AUX, TO).
- Include lexical terminals as leaf nodes so each important word from the sentence appears at the bottom level.
- Prefer 3-6 tree levels when sentence length allows; avoid a flat tree.
- Keep node names concise, e.g. "NP", "VP", "DET", "N", "is", "inventory".
- Provide real translations, never placeholders.
- Keep partsOfSpeech between 5 and 20 items when possible.
- Include all four language translations every time.`;
}

function parseModelResponse(content) {
  if (!content || typeof content !== "string") {
    return null;
  }

  const parsed = parseJson(content);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const translation =
    typeof parsed.translation === "string" ? parsed.translation.trim() : "";
  const grammarAnalysis =
    parsed.grammarAnalysis && typeof parsed.grammarAnalysis === "object"
      ? parsed.grammarAnalysis
      : null;
  const syntaxTree =
    parsed.syntaxTree && typeof parsed.syntaxTree === "object"
      ? parsed.syntaxTree
      : null;
  const translationsByLanguage =
    parsed.translationsByLanguage &&
    typeof parsed.translationsByLanguage === "object"
      ? parsed.translationsByLanguage
      : null;
  const structureDifferences = Array.isArray(parsed.structureDifferences)
    ? parsed.structureDifferences.filter((item) => typeof item === "string")
    : [];

  if (!translation || !grammarAnalysis || !syntaxTree || !translationsByLanguage) {
    return null;
  }

  return {
    translation,
    grammarAnalysis: {
      summary:
        typeof grammarAnalysis.summary === "string"
          ? grammarAnalysis.summary
          : "No summary provided.",
      partsOfSpeech: Array.isArray(grammarAnalysis.partsOfSpeech)
        ? grammarAnalysis.partsOfSpeech.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.token === "string" &&
              typeof item.pos === "string" &&
              typeof item.explanation === "string",
          )
        : [],
      keyGrammarPoints: Array.isArray(grammarAnalysis.keyGrammarPoints)
        ? grammarAnalysis.keyGrammarPoints.filter((item) => typeof item === "string")
        : [],
    },
    syntaxTree,
    translationsByLanguage: {
      English: stringOrEmpty(translationsByLanguage.English),
      Spanish: stringOrEmpty(translationsByLanguage.Spanish),
      German: stringOrEmpty(translationsByLanguage.German),
      Russian: stringOrEmpty(translationsByLanguage.Russian),
    },
    structureDifferences,
  };
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (!fenced?.[1]) {
      return null;
    }
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      return null;
    }
  }
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}
