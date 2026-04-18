"use client";

import { useMemo, useState } from "react";

type LanguageCode = "en" | "es" | "de" | "ru";

type ApiResponse = {
  sourceLanguage: LanguageCode;
  grammarFindings: string[];
  syntaxFindings: string[];
  syntaxTree: string;
  translations: Record<LanguageCode, string>;
  comparativeInsights: string[];
  neuralSummary: string;
  mode: "ai" | "demo";
};

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ru", label: "Russian" },
];

const EXAMPLE_TEXT =
  "Although I had studied Spanish for years, I still confuse ser and estar when I speak quickly.";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("en");
  const [text, setText] = useState(EXAMPLE_TEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  const sourceName = useMemo(
    () => LANGUAGES.find((lang) => lang.code === sourceLanguage)?.label ?? "Unknown",
    [sourceLanguage],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceLanguage, text }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to process analysis request.");
      }

      const payload = (await response.json()) as ApiResponse;
      setResult(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while analyzing text.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">Diploma Demo Platform</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Comparative analysis of grammar, syntax, and translation
        </h1>
        <p className="mt-3 max-w-4xl text-slate-600">
          NeuroLingo Compare demonstrates neural analysis across English, Spanish,
          German, and Russian. It provides linguistics-focused feedback and
          parallel translations for the same input sentence or paragraph.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-900">Input text for analysis</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select source language and enter sample text. The demo will run with live AI
            if API credentials are configured, otherwise it uses stable mock logic for
            presentation reliability.
          </p>

          <label htmlFor="language" className="mt-6 block text-sm font-medium text-slate-700">
            Source language
          </label>
          <select
            id="language"
            value={sourceLanguage}
            onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-indigo-500 focus:ring-2"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <label htmlFor="text" className="mt-4 block text-sm font-medium text-slate-700">
            Text fragment
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-indigo-500 focus:ring-2"
            placeholder="Enter sentence or short paragraph for multilingual analysis..."
            required
            minLength={8}
          />

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Run analysis"}
            </button>
            <button
              type="button"
              onClick={() => setText(EXAMPLE_TEXT)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Restore example
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Research focus</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>• Cross-language grammar diagnostics for one source fragment.</li>
            <li>• Syntax commentary on clause structure and word order shifts.</li>
            <li>• Parallel translation variants in EN / ES / DE / RU.</li>
            <li>• Comparative insight block with linguistically relevant observations.</li>
            <li>• Neural summary suitable for diploma presentation slides.</li>
          </ul>
          <p className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700">
            Current source language: <strong>{sourceName}</strong>
          </p>
        </aside>
      </section>

      {result ? (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">Analysis result</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Mode: {result.mode === "ai" ? "Live AI" : "Demo fallback"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard title="Grammar findings" items={result.grammarFindings} />
            <ResultCard title="Syntax findings" items={result.syntaxFindings} />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Syntax tree (bracket notation)</h3>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-800">
              {result.syntaxTree}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Parallel translations</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {lang.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{result.translations[lang.code]}</p>
                </div>
              ))}
            </div>
          </div>

          <ResultCard title="Comparative insights" items={result.comparativeInsights} />

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="text-lg font-semibold text-indigo-900">Neural summary</h3>
            <p className="mt-2 text-sm leading-6 text-indigo-800">{result.neuralSummary}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function ResultCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
