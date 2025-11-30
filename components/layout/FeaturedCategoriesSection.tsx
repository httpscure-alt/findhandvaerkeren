import React from 'react';
import { Language } from '../../types';
import { CATEGORIES } from '../../constants';
import { Briefcase, Zap, TrendingUp, Scale, Truck, Lightbulb } from 'lucide-react';

interface FeaturedCategoriesSectionProps {
  lang: Language;
  onCategorySelect: (category: string) => void;
}

const FeaturedCategoriesSection: React.FC<FeaturedCategoriesSectionProps> = ({ lang, onCategorySelect }) => {
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
    <div className="bg-white py-8 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
            {lang === 'da' ? 'Udforsk Kategorier' : 'Explore Categories'}
          </h2>
          <p className="text-lg text-nexus-subtext max-w-2xl mx-auto">
            {lang === 'da'
              ? 'Find specialiserede partnere inden for din branche'
              : 'Find specialized partners within your industry'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {featuredCategories.map((category) => {
            const Icon = categoryIcons[category] || Briefcase;
            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-nexus-accent hover:shadow-lg transition-all text-center flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="w-16 h-16 bg-nexus-bg rounded-2xl flex items-center justify-center mb-4 group-hover:bg-nexus-accent/10 transition-colors flex-shrink-0">
                  <Icon className="text-nexus-accent" size={32} />
                </div>
                <h3 className="text-sm font-bold text-[#1D1D1F] group-hover:text-nexus-accent transition-colors">
                  {category}
                </h3>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategoriesSection;
