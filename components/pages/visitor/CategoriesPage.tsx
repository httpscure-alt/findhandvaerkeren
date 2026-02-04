import React from 'react';
import { Language } from '../../../types';
import { CATEGORY_LIST } from '../../../constants';
import { translations } from '../../../translations';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CategoriesPageProps {
  lang: Language;
  onCategorySelect: (category: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ lang, onCategorySelect }) => {
  const navigate = useNavigate();
  const { setFilters } = useMarketplace();
  const t = translations[lang];
  const categoryNames = t.categoryNames as Record<string, string>;

  const coreCategories = CATEGORY_LIST.filter(c => c.isCore);
  const longTailCategories = CATEGORY_LIST.filter(c => c.isLongTail);

  const handleSelect = (categoryId: string) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    navigate('/browse');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fadeIn">
        {/* Header */}
        <div className="mb-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] mb-8 transition-colors group font-bold"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {lang === 'da' ? 'Tilbage' : 'Back'}
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1D1D1F] mb-6 tracking-tight">
            {lang === 'da' ? 'Alle håndværkerkategorier' : 'All craftsman categories'}
          </h1>
          <p className="text-xl text-[#86868B] max-w-2xl font-medium leading-relaxed">
            {lang === 'da'
              ? 'Find verificerede fagmænd til din opgave. Vi dækker alt fra små reparationer til store byggeprojekter.'
              : 'Find verified professionals for your task. We cover everything from small repairs to large construction projects.'}
          </p>
        </div>

        {/* 1. CORE CATEGORIES (Cards) */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-8">
            {lang === 'da' ? 'Populære Kategorier' : 'Popular Categories'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreCategories.map((cat) => {
              const displayName = categoryNames[cat.id];
              if (!displayName) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className="group bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-[#1D1D1F]/20 transition-all duration-500 text-left relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-[#1D1D1F] mb-2">{displayName}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#86868B] group-hover:text-[#1D1D1F] transition-colors">
                      {lang === 'da' ? 'Find håndværker' : 'Find professional'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-0 group-hover:opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                    <h3 className="text-6xl font-black text-[#1D1D1F]">{displayName.charAt(0)}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. LONG-TAIL CATEGORIES (Text List) */}
        <div>
          <h3 className="text-xl font-bold text-[#1D1D1F] mb-8 pt-12 border-t border-gray-100">
            {lang === 'da' ? 'Øvrige Kategorier' : 'Other Categories'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
            {longTailCategories.map((cat) => {
              const displayName = categoryNames[cat.id];
              if (!displayName) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className="text-left text-[#86868B] hover:text-[#1D1D1F] font-bold text-lg transition-colors py-2 block border-b border-transparent hover:border-gray-100"
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
