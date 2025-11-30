import React from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { CATEGORIES } from '../../constants';

interface HeroSearchSectionProps {
  lang: Language;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const HeroSearchSection: React.FC<HeroSearchSectionProps> = ({
  lang,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  selectedCategory,
  onCategorySelect
}) => {
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="relative z-10">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4">
        {lang === 'da' ? 'Find den Rigtige Professionelle — Med Det Samme' : 'Find the Right Professional — Instantly'}
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl text-nexus-subtext mb-8 max-w-2xl">
        {lang === 'da' 
          ? 'Beskriv din opgave, og lad vores AI matche dig med troværdige, verificerede eksperter i hele Danmark.'
          : 'Describe your task and let our AI match you with trusted, verified experts across Denmark.'}
      </p>

      {/* Search Form - Single AI-Powered Search Field */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Single Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={lang === 'da' 
                ? 'Hvad leder du efter? (f.eks. elektriker, marketing bureau, IT-konsulent)' 
                : 'What are you looking for? (e.g. elektriker, marketing agency, IT consultant)'}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-nexus-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:border-nexus-accent transition-all"
            />
          </div>

          {/* Find Match Button */}
          <button
            type="submit"
            className="px-8 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {lang === 'da' ? 'Find match' : 'Find Match'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSearchSection;
