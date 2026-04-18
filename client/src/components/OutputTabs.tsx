import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { AnalysisResult } from "../types";
import { SyntaxTreeView } from "./SyntaxTreeView";

type TabId = "translation" | "grammar" | "syntax";

type Props = {
  result: AnalysisResult | null;
};

export function OutputTabs({ result }: Props) {
  const [tab, setTab] = useState<TabId>("translation");

  if (!result) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Run analysis to view translation, grammar, and syntax tree.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Output Panel</h2>
      <div className="mt-3 flex gap-2">
        {(["translation", "grammar", "syntax"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl px-3 py-1.5 text-sm ${
              tab === id
                ? "bg-slate-900 text-white dark:bg-blue-600"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {id === "translation" ? "Translation" : id === "grammar" ? "Grammar Analysis" : "Syntax Tree"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {tab === "translation" ? (
            <p className="rounded-xl bg-slate-50 p-4 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {result.translation}
            </p>
          ) : null}

          {tab === "grammar" ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {result.grammarAnalysis.summary}
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {result.grammarAnalysis.partsOfSpeech.map((part) => (
                  <li
                    key={`${part.token}-${part.pos}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <strong>{part.token}</strong> ({part.pos}) - {part.explanation}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "syntax" ? <SyntaxTreeView tree={result.syntaxTree} /> : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
