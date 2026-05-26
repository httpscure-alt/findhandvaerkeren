import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { GrowthPricingSection } from '../../marketing/GrowthPricingSection';

/**
 * Standalone preview for the growth pricing section (`/brand-v2/growth-pricing`).
 * Toggles `class="dark"` on `<html>` for Tailwind dark mode (see `index.html` tailwind.config).
 */
export default function GrowthPricingPreviewPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    return () => root.classList.remove('dark');
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-white dark:selection:text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/[0.08] dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/platform"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ← Back
          </Link>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-white/25"
            aria-pressed={dark}
          >
            {dark ? <Sun className="h-3.5 w-3.5" aria-hidden /> : <Moon className="h-3.5 w-3.5" aria-hidden />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <GrowthPricingSection />
    </div>
  );
}
