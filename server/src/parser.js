export function parseModelResponse(content) {
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
    ? parsed.structureDifferences.filter((x) => typeof x === "string")
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
