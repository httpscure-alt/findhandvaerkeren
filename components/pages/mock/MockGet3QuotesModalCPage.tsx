import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { CATEGORY_LIST } from '../../../constants';

interface MockGet3QuotesModalCPageProps {
  lang: Language;
}

/**
 * Standalone UI mockup: “Get 3 quotes” step 1 using Option C — category choice in a
 * modal with search + grid (vs long scroll on the main page).
 * Does not submit to the API; for design review only.
 */
export default function MockGet3QuotesModalCPage({ lang }: MockGet3QuotesModalCPageProps) {
  const navigate = useNavigate();
  const t = translations[lang];
  const categoryNames = t.categoryNames as Record<string, string>;

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const categories = useMemo(
    () => CATEGORY_LIST.map((c) => ({ slug: c.id, name: categoryNames[c.id] || c.id })),
    [categoryNames]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.slug.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, closeModal]);

  const selectedLabel = selectedSlug
    ? categoryNames[selectedSlug] || selectedSlug
    : null;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
          {lang === 'da' ? 'UI-mockup' : 'UI mockup'} · Option C (modal + søgning)
        </div>

        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              {lang === 'da' ? 'Få 3 uforpligtende tilbud' : 'Get 3 free quotes'}
            </h1>
            <p className="text-[#86868B] font-medium mt-1">
              {lang === 'da'
                ? 'Kun trin 1 — kategori (modal) som demo'
                : 'Step 1 only — category (modal) demo'}
            </p>
          </div>
          <span className="text-sm font-bold text-[#1D1D1F] shrink-0">1 / 3</span>
        </div>

        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-10">
          <div className="h-full bg-[#1D1D1F] w-[33%] transition-all duration-500" />
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Hvilken type opgave drejer det sig om?' : 'What kind of job is it?'}
          </h2>
          <p className="text-sm text-[#86868B] mb-8">
            {lang === 'da'
              ? 'Åbn modal for at søge og vælge — hovedsiden forbliver kort.'
              : 'Open the modal to search and pick — the main page stays short.'}
          </p>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#86868B]">
              {lang === 'da' ? 'Kategori' : 'Category'}
            </label>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl border-2 border-gray-100 bg-gray-50/80 px-6 py-5 text-left transition hover:border-gray-200 hover:bg-white"
            >
              <span className={selectedLabel ? 'font-bold text-[#1D1D1F]' : 'text-[#86868B]'}>
                {selectedLabel ||
                  (lang === 'da' ? 'Vælg kategori…' : 'Choose category…')}
              </span>
              <ArrowRight className="h-5 w-5 text-[#86868B]" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/get-offers')}
              className="text-sm font-bold text-[#86868B] hover:text-[#1D1D1F]"
            >
              {lang === 'da' ? '← Til nuværende flow' : '← Current production flow'}
            </button>
            <button
              type="button"
              disabled={!selectedSlug}
              className="px-10 py-4 rounded-2xl bg-[#1D1D1F] text-white font-bold flex items-center gap-2 hover:bg-black transition disabled:opacity-30"
            >
              {lang === 'da' ? 'Næste (demo)' : 'Next (demo)'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-category-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={closeModal}
            aria-label="Close"
          />
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem] ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 id="modal-category-title" className="text-lg font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Vælg kategori' : 'Choose category'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-[#86868B] hover:bg-gray-100 hover:text-[#1D1D1F]"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative border-b border-gray-50 px-4 py-3">
              <Search className="pointer-events-none absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 text-[#86868B]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === 'da' ? 'Søg kategori…' : 'Search categories…'}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-[#1D1D1F] placeholder:text-[#86868B] focus:border-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/20"
                autoFocus
              />
            </div>

            <div className="min-h-[200px] flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                {filtered.map((c) => {
                  const selected = selectedSlug === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setSelectedSlug(c.slug)}
                      className={`rounded-2xl border-2 p-4 text-left text-sm font-bold transition ${
                        selected
                          ? 'border-[#1D1D1F] bg-[#1D1D1F]/5 shadow-md'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <span className={selected ? 'text-[#1D1D1F]' : 'text-[#86868B]'}>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-[#86868B]">
                  {lang === 'da' ? 'Ingen kategorier fundet.' : 'No categories found.'}
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/80 px-4 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl py-3.5 font-bold text-[#86868B] hover:bg-gray-100 hover:text-[#1D1D1F]"
              >
                {lang === 'da' ? 'Annuller' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={!selectedSlug}
                onClick={closeModal}
                className="flex-1 rounded-xl bg-[#1D1D1F] py-3.5 font-bold text-white hover:bg-black disabled:opacity-30"
              >
                {lang === 'da' ? 'Brug valg' : 'Use selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
