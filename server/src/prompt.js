export function buildPrompt(text, sourceLanguage, targetLanguage) {
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
