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
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Input Panel</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Enter any sentence and run GPT-based comparative analysis.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Source</span>
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value as Language)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Target</span>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value as Language)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
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
        <span className="mb-1 block text-slate-600 dark:text-slate-300">Sentence</span>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={6}
          placeholder="Type sentence to analyze..."
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>

      <button
        type="button"
        disabled={loading}
        onClick={onAnalyze}
        className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </section>
  );
}
