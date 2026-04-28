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
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Press Analyze to generate translation, grammar notes, and a syntax tree.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-300/30 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-slate-950/50">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Analysis Result</h2>
      <div className="mt-4 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80">
        {(["translation", "grammar", "syntax"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700/70"
            }`}
          >
            {id === "translation"
              ? "Translation"
              : id === "grammar"
                ? "Grammar + POS"
                : "Syntax Tree"}
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
            <div className="space-y-4">
              <p className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {result.translation}
              </p>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Key grammar points
                </h3>
                <ul className="grid gap-2 md:grid-cols-2">
                  {result.grammarAnalysis.keyGrammarPoints.map((point) => (
                    <li
                      key={point}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {tab === "grammar" ? (
            <div className="space-y-4">
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {result.grammarAnalysis.summary}
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {result.grammarAnalysis.partsOfSpeech.map((part) => (
                  <li
                    key={`${part.token}-${part.pos}`}
                    className="rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
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
