
import React from 'react';
import { Star, BadgeCheck, ArrowRight, Heart } from 'lucide-react';
import { Company, Language } from '../types';
import { translations } from '../translations';

interface ListingCardProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  lang: Language;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ company, onViewProfile, lang, isFavorite, onToggleFavorite }) => {
  const isPremium = company.isVerified;
  const t = translations[lang].listings;

  return (
    <div 
      className={`group relative rounded-3xl transition-all duration-500 ease-out overflow-hidden flex flex-col
        ${isPremium 
          ? 'bg-gradient-to-br from-[#F5F5F7] to-white shadow-lg hover:shadow-2xl hover:-translate-y-1' 
          : 'bg-white border border-transparent shadow-sm hover:shadow-lg hover:-translate-y-0.5'
        }
      `}
      style={isPremium ? { border: '1px solid rgba(200, 200, 255, 0.3)' } : {}}
    >
      
      {/* Top Right Actions: Verified Badge & Heart */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isPremium && (
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-50 shadow-sm">
             <BadgeCheck size={14} className="text-nexus-verified fill-nexus-verified text-white" />
             <span className="text-[10px] font-bold tracking-wide uppercase text-nexus-subtext">{t.verifiedPartner}</span>
          </div>
        )}
        
        {onToggleFavorite && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(company.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm border 
              ${isFavorite 
                ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
                : 'bg-white/80 text-gray-400 border-gray-100 hover:bg-white hover:text-red-400'
              }`}
          >
            <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      <div className="p-7 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
             {/* Logo */}
             <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-sm ${isPremium ? 'ring-1 ring-black/5' : ''}`}>
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
             </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
            <Star size={12} className="fill-gray-300 text-gray-300" />
            <span className="text-xs font-medium text-nexus-subtext">{company.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-nexus-text tracking-tight group-hover:text-black transition-colors">
              {company.name}
            </h3>
            {isPremium && <BadgeCheck size={18} className="text-nexus-verified" />}
          </div>
          <p className="text-sm text-nexus-subtext leading-relaxed line-clamp-3">
            {company.shortDescription}
          </p>
          
          {isPremium && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{t.premiumSelection}</span>
            </div>
          )}
        </div>

        {/* Footer / CTA */}
        <div className="mt-auto pt-5 border-t border-gray-100/80">
          {isPremium ? (
            <button 
              onClick={() => onViewProfile(company)}
              className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-black hover:scale-[1.02] transition-all duration-300"
            >
              {t.viewProfile}
              <ArrowRight size={14} />
            </button>
          ) : (
            <button 
              onClick={() => onViewProfile(company)}
              className="w-full py-3.5 rounded-xl bg-[#F5F5F7] text-nexus-text text-sm font-medium hover:bg-[#E5E5E7] transition-all"
            >
              {t.viewProfile}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
