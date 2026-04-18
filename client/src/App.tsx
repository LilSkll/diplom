import { useEffect, useState } from "react";
import { ApiKeyPanel } from "./components/ApiKeyPanel";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { InputPanel } from "./components/InputPanel";
import { OutputTabs } from "./components/OutputTabs";
import { ThemeToggle } from "./components/ThemeToggle";
import { analyzeText } from "./lib/api";
import type { AnalysisResult, Language } from "./types";

const STORAGE_KEY = "neurolingo_openai_key";
const THEME_KEY = "neurolingo_theme";

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(THEME_KEY) === "dark",
  );
  const [text, setText] = useState(
    "Although I have studied Spanish for years, I still make mistakes when speaking quickly.",
  );
  const [sourceLanguage, setSourceLanguage] = useState<Language>("English");
  const [targetLanguage, setTargetLanguage] = useState<Language>("Spanish");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function handleAnalyze() {
    if (!apiKey.trim()) {
      setError("Please provide your OpenAI API key.");
      return;
    }
    if (!text.trim()) {
      setError("Please enter text for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await analyzeText({
        apiKey: apiKey.trim(),
        text,
        sourceLanguage,
        targetLanguage,
      });
      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unexpected request error.",
      );
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  }

  function exportResult() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-result.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h1 className="text-xl font-semibold">NeuroLingo Comparative Platform</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              GPT-powered grammar, syntax, translation and tree parsing (EN/ES/DE/RU)
            </p>
          </div>
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((x) => !x)} />
        </header>

        <ApiKeyPanel apiKey={apiKey} onChange={setApiKey} />

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <InputPanel
            text={text}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onTextChange={setText}
            onSourceChange={setSourceLanguage}
            onTargetChange={setTargetLanguage}
            onAnalyze={handleAnalyze}
            loading={loading}
          />

          <div className="space-y-4">
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <OutputTabs result={result} />
            <ComparisonPanel result={result} />

            <div className="flex gap-2">
              <button
                onClick={copyResult}
                disabled={!result}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
                type="button"
              >
                Copy results
              </button>
              <button
                onClick={exportResult}
                disabled={!result}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
                type="button"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
