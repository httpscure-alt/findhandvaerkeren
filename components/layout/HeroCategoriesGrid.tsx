import React from 'react';
import { Language } from '../../types';
import { CATEGORIES } from '../../constants';
import { Briefcase, Zap, TrendingUp, Scale, Truck, Lightbulb } from 'lucide-react';

interface HeroCategoriesGridProps {
  lang: Language;
  onCategorySelect: (category: string) => void;
}

const HeroCategoriesGrid: React.FC<HeroCategoriesGridProps> = ({ lang, onCategorySelect }) => {
  const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Technology: Zap,
    Finance: TrendingUp,
    Marketing: Lightbulb,
    Logistics: Truck,
    Consulting: Briefcase,
    Legal: Scale
  };

  const featuredCategories = CATEGORIES.filter(cat => cat !== 'All').slice(0, 6);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
      {featuredCategories.map((category) => {
        const Icon = categoryIcons[category] || Briefcase;
        return (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-nexus-bg rounded-2xl flex items-center justify-center group-hover:bg-nexus-accent/10 transition-colors flex-shrink-0">
              <Icon className="text-nexus-accent" size={24} />
            </div>
            <h3 className="text-xs font-bold text-[#1D1D1F] group-hover:text-nexus-accent transition-colors">
              {category}
            </h3>
          </button>
        );
      })}
    </div>
  );
};

export default HeroCategoriesGrid;
