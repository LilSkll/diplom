import type { AnalysisResult, Language } from "../types";

const LANGUAGE_ORDER: Language[] = ["English", "Spanish", "German", "Russian"];

type Props = {
  result: AnalysisResult | null;
};

export function ComparisonPanel({ result }: Props) {
  if (!result) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Comparison Mode</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {LANGUAGE_ORDER.map((lang) => (
          <article
            key={lang}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{lang}</h3>
            <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
              {result.translationsByLanguage[lang]}
            </p>
          </article>
        ))}
      </div>

      <h3 className="mt-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Structural differences
      </h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        {result.structureDifferences.map((item) => (
          <li key={item} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
