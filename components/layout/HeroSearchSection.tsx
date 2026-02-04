import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../types';
import { translations } from '../../translations';
import { CATEGORIES } from '../../constants';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroSearchSectionProps {
  lang: Language;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  zipCode: string;
  onZipCodeChange: (value: string) => void;
  onSearch: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const HeroSearchSection: React.FC<HeroSearchSectionProps> = ({
  lang,
  searchQuery,
  onSearchQueryChange,
  zipCode,
  onZipCodeChange,
  onSearch,
  selectedCategory,
  onCategorySelect
}) => {
  const t = translations[lang];
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="relative z-10 animate-fadeIn">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1D1F] mb-4 leading-tight">
        {lang === 'da' ? 'Find den Rigtige Professionelle — Med Det Samme' : 'Find the Right Professional — Instantly'}
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-nexus-subtext mb-10 max-w-2xl leading-relaxed">
        {lang === 'da'
          ? 'Indhent tilbud fra de bedste lokale håndværkere. Nemt, hurtigt og uforpligtende.'
          : 'Get quotes from the best local craftsmen. Easy, fast, and no obligation.'}
      </p>

      {/* Primary CTA: 3 Quotes Feature */}
      <div className="mb-12">
        <button
          onClick={() => navigate('/get-offers')}
          className="group relative px-10 py-6 bg-nexus-accent text-white rounded-3xl font-bold text-xl shadow-2xl hover:bg-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">
            {lang === 'da' ? 'Indhent 3 gratis tilbud' : 'Get 3 Free Quotes'}
          </span>
          <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="mt-4 flex items-center gap-4 text-sm text-nexus-subtext ml-2">
          <div className="flex items-center gap-1">
            <CheckCircle className="text-green-500 w-4 h-4" />
            <span>{lang === 'da' ? '100% gratis' : '100% free'}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="text-green-500 w-4 h-4" />
            <span>{lang === 'da' ? 'Uforpligtende' : 'No obligation'}</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-12" />

      {/* Secondary: Traditional Search */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider mb-4 ml-1">
          {lang === 'da' ? 'Eller find en håndværker i oversigten' : 'Or find a craftsman in the directory'}
        </h2>
        <form onSubmit={handleSubmit} className="mb-2">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Single Search Input */}
            <div className="flex-[2]">
              <input
                type="text"
                placeholder={lang === 'da'
                  ? 'Hvad leder du efter? (f.eks. elektriker, maler)'
                  : 'What are you looking for? (e.g. plumber, painter)'}
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-nexus-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nexus-accent/30 focus:border-nexus-accent transition-all shadow-sm hover:shadow-md text-base"
              />
            </div>

            {/* Zip Code Input */}
            <div className="flex-1 sm:max-w-[150px]">
              <input
                type="text"
                placeholder={lang === 'da' ? 'Postnr.' : 'Zip Code'}
                value={zipCode}
                onChange={(e) => onZipCodeChange(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-nexus-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nexus-accent/30 focus:border-nexus-accent transition-all shadow-sm hover:shadow-md text-base"
                maxLength={8}
              />
            </div>

            {/* Find Match Button */}
            <button
              type="submit"
              className="px-8 py-4 bg-[#1D1D1F] text-white rounded-2xl font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl whitespace-nowrap transform hover:scale-105 active:scale-95"
            >
              {lang === 'da' ? 'Søg nu' : 'Search Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSearchSection;
