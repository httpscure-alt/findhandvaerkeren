import React from 'react';
import { Language } from '../../../types';
import { CATEGORIES } from '../../../constants';
import { translations } from '../../../translations';
import { ArrowRight, Briefcase } from 'lucide-react';

interface CategoriesPageProps {
  lang: Language;
  onCategorySelect: (category: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ lang, onCategorySelect }) => {
  const t = translations[lang];

  const categoryDescriptions: Record<string, { en: string; da: string }> = {
    Technology: {
      en: 'IT services, software development, cloud solutions, and tech consulting',
      da: 'IT-tjenester, softwareudvikling, cloud-løsninger og teknologirådgivning'
    },
    Finance: {
      en: 'Financial services, accounting, investment, and banking solutions',
      da: 'Finansielle tjenester, regnskab, investering og bankløsninger'
    },
    Marketing: {
      en: 'Digital marketing, branding, advertising, and communication services',
      da: 'Digital markedsføring, branding, reklame og kommunikationstjenester'
    },
    Logistics: {
      en: 'Supply chain, shipping, warehousing, and distribution services',
      da: 'Forsyningskæde, shipping, lager og distributionsservices'
    },
    Consulting: {
      en: 'Business consulting, strategy, management, and advisory services',
      da: 'Forretningsrådgivning, strategi, ledelse og rådgivningstjenester'
    },
    Legal: {
      en: 'Legal services, compliance, intellectual property, and corporate law',
      da: 'Juridiske tjenester, compliance, intellektuel ejendomsret og selskabsret'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Kategorier' : 'Categories'}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {lang === 'da' 
            ? 'Udforsk virksomheder efter branche og serviceområde'
            : 'Explore companies by industry and service area'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.filter(cat => cat !== 'All').map((category) => (
          <div
            key={category}
            onClick={() => onCategorySelect(category)}
            className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-nexus-accent hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center group-hover:bg-nexus-accent/10 transition-colors">
                <Briefcase className="text-nexus-accent" size={24} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-nexus-accent transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">{category}</h3>
            <p className="text-nexus-subtext text-sm leading-relaxed">
              {categoryDescriptions[category]?.[lang] || categoryDescriptions[category]?.en || ''}
            </p>
            <button className="mt-4 text-sm font-medium text-nexus-accent hover:underline flex items-center gap-1">
              {lang === 'da' ? 'Se virksomheder' : 'View Companies'} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
