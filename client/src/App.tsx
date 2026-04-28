import { useEffect, useState } from "react";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { InputPanel } from "./components/InputPanel";
import { OutputTabs } from "./components/OutputTabs";
import { ThemeToggle } from "./components/ThemeToggle";
import { analyzeText } from "./lib/api";
import type { AnalysisResult, Language } from "./types";

const THEME_KEY = "neurolingo_theme";

function App() {
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
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function handleAnalyze() {
    if (!text.trim()) {
      setError("Please enter text for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await analyzeText({
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
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_10%_0%,_#bfdbfe_0%,_transparent_35%),radial-gradient(circle_at_90%_0%,_#a7f3d0_0%,_transparent_25%)] dark:bg-[radial-gradient(circle_at_10%_0%,_#1d4ed8_0%,_transparent_25%),radial-gradient(circle_at_90%_0%,_#064e3b_0%,_transparent_22%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 md:px-6">
        <header className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-300/40 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-slate-950/50">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-cyan-300">
                Comparative Linguistics Studio
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                NeuroLingo: Syntax & Grammar Intelligence
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                A complete pipeline for translation, grammar diagnostics, and phrase-structure
                syntax trees across four languages.
              </p>
            </div>
            <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((x) => !x)} />
          </div>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold">Server-secured key</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">OpenAI key only in Vercel env.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold">Textbook syntax trees</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Hierarchical constituent view.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold">Deployment-ready</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Vercel + GitHub compatible setup.</p>
            </div>
          </div>
        </header>

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
              <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <OutputTabs result={result} />
            <ComparisonPanel result={result} />

            <div className="flex gap-2">
              <button
                onClick={copyResult}
                disabled={!result}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                type="button"
              >
                Copy results
              </button>
              <button
                onClick={exportResult}
                disabled={!result}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
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
