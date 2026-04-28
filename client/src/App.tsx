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
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top,_#c7d2fe_0%,_transparent_45%),radial-gradient(circle_at_right,_#a5f3fc_0%,_transparent_35%)] dark:bg-[radial-gradient(circle_at_top,_#1e1b4b_0%,_transparent_40%),radial-gradient(circle_at_right,_#083344_0%,_transparent_30%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-slate-950/50">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-300">
              Comparative Linguistics Studio
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">NeuroLingo AI Analyzer</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Clean translation, grammar explanation, and syntax tree generation for English,
              Spanish, German, and Russian.
            </p>
          </div>
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((x) => !x)} />
        </header>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          OpenAI key is now read on the server from `OPENAI_API_KEY` (Vercel Environment
          Variables). Users no longer need to enter keys in the UI.
        </section>

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
