import type { AnalysisResult, Language } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

type AnalyzeInput = {
  apiKey: string;
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
};

export async function analyzeText(input: AnalyzeInput): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as AnalysisResult & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}
