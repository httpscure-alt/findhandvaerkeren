import React from 'react';
import { Company, Language } from '../../../types';
import ListingCard from '../../ListingCard';
import { Heart, ArrowLeft } from 'lucide-react';
import { translations } from '../../../translations';

interface SavedListingsPageProps {
  savedCompanies: Company[];
  lang: Language;
  onViewProfile: (company: Company) => void;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
}

const SavedListingsPage: React.FC<SavedListingsPageProps> = ({
  savedCompanies,
  lang,
  onViewProfile,
  onToggleFavorite,
  onBack
}) => {
  const t = translations[lang].consumer;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        {lang === 'da' ? 'Tilbage' : 'Back'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Heart className="fill-red-500 text-red-500" size={24} />
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {t.savedListings}
        </h1>
        <span className="text-sm text-nexus-subtext">({savedCompanies.length})</span>
      </div>

      {savedCompanies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedCompanies.map(company => (
            <ListingCard
              key={company.id}
              company={company}
              onViewProfile={onViewProfile}
              lang={lang}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Heart size={24} />
          </div>
          <p className="text-gray-500 mb-4">{t.noSaved}</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
          >
            {t.browseNow}
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedListingsPage;
