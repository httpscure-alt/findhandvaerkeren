import React from 'react';
import { Language } from '../../types';
import { POPULAR_CATEGORIES } from '../../constants';
import { translations } from '../../translations';
import {
  Hammer,
  Wrench,
  Zap,
  PaintBucket,
  Flower2,
  Layers
} from 'lucide-react';

interface HeroCategoriesGridProps {
  lang: Language;
  onCategorySelect: (category: string) => void;
}

const HeroCategoriesGrid: React.FC<HeroCategoriesGridProps> = ({ lang, onCategorySelect }) => {
  // Craftsman category icons
  const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'Tømrer': Hammer,
    'Murer': Layers,
    'VVS-installatør': Wrench,
    'Elektriker': Zap,
    'Maler': PaintBucket,
    'Haveservice': Flower2
  };

  const t = translations[lang];
  const categoryNames = t.categoryNames as Record<string, string>;

  // Show top 6 popular categories in hero grid
  const heroCategories = POPULAR_CATEGORIES.slice(0, 6);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
      {heroCategories.map((category) => {
        const Icon = categoryIcons[category] || Hammer;
        const displayName = categoryNames[category] || category;
        return (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className="group flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-nexus-accent transition-all duration-200"
          >
            <div className="w-12 h-12 bg-nexus-bg rounded-2xl flex items-center justify-center group-hover:bg-nexus-accent/10 transition-colors flex-shrink-0">
              <Icon className="text-nexus-accent" size={24} />
            </div>
            <h3 className="text-xs font-bold text-[#1D1D1F] group-hover:text-nexus-accent transition-colors text-center">
              {displayName}
            </h3>
          </button>
        );
      })}
    </div>
  );
};

export default HeroCategoriesGrid;
