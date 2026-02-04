
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
  // Use verificationStatus === 'verified' for verified badge (Danish verification requirements)
  const isVerified = company.verificationStatus === 'verified' || company.isVerified;
  const isGold = company.pricingTier === 'Gold';
  const isPremium = isVerified || isGold;
  const t = translations[lang].listings;

  return (
    <div
      className={`group relative rounded-[2rem] transition-all duration-500 ease-out overflow-hidden flex flex-col
        ${isGold
          ? 'bg-white border-2 border-[#1D1D1F]/10 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] hover:-translate-y-2 z-10 scale-[1.02]'
          : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
        }
      `}
    >

      {/* Top Right Actions: Badge & Heart */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isGold && (
          <div className="flex items-center gap-1.5 bg-[#1D1D1F] px-3 py-1.5 rounded-full shadow-lg">
            <Star size={12} className="text-white fill-white" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white">{lang === 'da' ? 'UDVALGT' : 'FEATURED'}</span>
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
                : 'bg-white/80 text-[#86868B] border-gray-100 hover:bg-white hover:text-red-500'
              }`}
          >
            <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
          </button>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        {/* Logo Section */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-[#F5F5F7] shadow-inner">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#86868B] font-black text-xl">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 flex-1">
          {/* Line 1: Identity & Trust */}
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight group-hover:text-black transition-colors leading-tight">
              {company.name}
            </h3>
            {isVerified && (
              <div className="flex items-center gap-1 bg-[#1D1D1F]/10 px-2 py-1 rounded-lg border border-[#1D1D1F]/5">
                <BadgeCheck size={12} className="text-[#1D1D1F]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#1D1D1F]">
                  {lang === 'da' ? 'VERIFICERET' : 'VERIFIED'}
                </span>
              </div>
            )}
          </div>

          {/* Line 2: Reputation */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              <Star size={14} className="fill-[#1D1D1F] text-[#1D1D1F]" />
              <span className="text-sm font-black text-[#1D1D1F]">{company.rating}</span>
            </div>
            <span className="text-xs text-[#86868B] font-medium opacity-60">
              ({company.reviewCount} {lang === 'da' ? 'anmeldelser' : 'reviews'})
            </span>
          </div>

          {/* Line 3: Description */}
          <p className="text-sm text-[#86868B] font-medium leading-relaxed line-clamp-1">
            {company.shortDescription}
          </p>
        </div>

        {/* Footer / CTA */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <button
            onClick={() => onViewProfile(company)}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]
              ${isGold
                ? 'bg-[#1D1D1F] text-white hover:bg-black shadow-lg hover:shadow-2xl'
                : 'bg-white border-2 border-[#1D1D1F] text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
          >
            {t.viewProfile}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
