import type { Language } from "../types";

const LANGUAGES: Language[] = ["English", "Spanish", "German", "Russian"];

type Props = {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  onTextChange: (text: string) => void;
  onSourceChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onAnalyze: () => void;
  loading: boolean;
};

export function InputPanel({
  text,
  sourceLanguage,
  targetLanguage,
  onTextChange,
  onSourceChange,
  onTargetChange,
  onAnalyze,
  loading,
}: Props) {
  const presets = [
    "An inventory of syntactic functions is taken to be primitive.",
    "Although I had prepared, I still forgot key vocabulary during the exam.",
    "If she had known earlier, she would have translated the paragraph differently.",
  ];

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-300/30 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-slate-950/50">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sentence Studio</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Enter any sentence and run GPT-based comparative analysis.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Source</span>
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value as Language)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none ring-blue-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Target</span>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value as Language)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none ring-blue-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Sentence</span>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={7}
          placeholder="Type sentence to analyze..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none ring-blue-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset, index) => (
          <button
            key={preset}
            type="button"
            onClick={() => onTextChange(preset)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Example {index + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={onAnalyze}
        className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </section>
  );
}
