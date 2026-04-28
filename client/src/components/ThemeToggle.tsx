type Props = {
  darkMode: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ darkMode, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:scale-[1.02] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      type="button"
    >
      {darkMode ? "Switch to light" : "Switch to dark"}
    </button>
  );
}
