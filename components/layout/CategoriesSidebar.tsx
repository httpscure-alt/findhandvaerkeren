import React from 'react';
import { Language } from '../../types';
import { CATEGORIES } from '../../constants';
import { translations } from '../../translations';

interface CategoriesSidebarProps {
  lang: Language;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  lang,
  selectedCategory,
  onCategorySelect
}) => {
  const t = translations[lang];
  const categoryNames = t.categoryNames as Record<string, string>;

  return (
    <aside className="hidden md:block w-full md:w-64 shrink-0">
      <h2 className="text-lg font-bold text-[#1D1D1F] mb-4">
        {lang === 'da' ? 'Kategorier' : 'Categories'}
      </h2>
      <div className="space-y-2">
        {CATEGORIES.filter(cat => cat !== 'All').map((category) => {
          const displayName = categoryNames[category] || category;
          return (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category
                  ? 'bg-nexus-bg text-[#1D1D1F] font-medium'
                  : 'text-nexus-subtext hover:bg-gray-50 hover:text-[#1D1D1F]'
                }`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoriesSidebar;
