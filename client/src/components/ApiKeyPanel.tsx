type Props = {
  apiKey: string;
  onChange: (key: string) => void;
};

export function ApiKeyPanel({ apiKey, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">OpenAI API Key</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Saved only in browser localStorage. Never persisted on server.
      </p>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-..."
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      />
    </section>
  );
}
