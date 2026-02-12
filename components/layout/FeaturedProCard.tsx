import React, { useState, useEffect } from 'react';
import { Company, Language } from '../../types';
import { Phone, Mail, MessageSquare, BadgeCheck } from 'lucide-react';
import { translations } from '../../translations';

interface FeaturedProCardProps {
  company: Company;
  lang: Language;
  onViewProfile: (company: Company) => void;
}

const FeaturedProCard: React.FC<FeaturedProCardProps> = ({ company, lang, onViewProfile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const t = translations[lang].listings;

  // Determine tiers
  const isVerified = company.verificationStatus === 'verified' || company.isVerified;
  const isGold = company.pricingTier === 'Gold';

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-500 cursor-pointer 
        ${isGold ? 'border-yellow-200 shadow-yellow-100 shadow-xl' : 'border-gray-100 shadow-lg'}
        hover:shadow-xl transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={() => onViewProfile(company)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Image - with placeholder if missing */}
      <div className="relative h-32 bg-gray-100 overflow-hidden rounded-t-2xl">
        {company.bannerUrl || company.logoUrl ? (
          <img
            src={company.bannerUrl || company.logoUrl}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
        )}

        {/* Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          {isGold && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1.5 rounded-full border border-yellow-300 shadow-md">
              <BadgeCheck size={14} className="text-white fill-white" />
              <span className="text-[10px] font-bold tracking-wide uppercase text-white">{lang === 'da' ? 'Guld Profil' : 'Gold Profile'}</span>
            </div>
          )}
          {isVerified && !isGold && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-50 shadow-sm">
              <BadgeCheck size={14} className="text-nexus-verified fill-nexus-verified text-white" />
              <span className="text-[10px] font-bold tracking-wide uppercase text-nexus-subtext">{t.verifiedPartner}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-lg font-bold ${isGold ? 'text-yellow-700' : 'text-[#1D1D1F]'}`}>{company.name}</h3>
          {isVerified && (
            <BadgeCheck size={18} className={isGold ? 'text-yellow-500' : 'text-nexus-verified'} />
          )}
        </div>
        <p className="text-sm text-nexus-subtext mb-2">{company.category}</p>
        <p className={`text-sm text-nexus-text transition-all duration-300 ${isExpanded ? 'mb-4 line-clamp-3' : 'mb-0 line-clamp-2'}`}>
          {company.shortDescription}
        </p>

        {/* Action Buttons - Expandable */}
        <div className={`flex flex-col gap-2 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${company.contactEmail}`;
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-nexus-text hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            {lang === 'da' ? 'Ring' : 'Call'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${company.contactEmail}`;
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-nexus-text hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={16} />
            {lang === 'da' ? 'Email' : 'Email'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(company);
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-nexus-text hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            {lang === 'da' ? 'Kontakt' : 'Contact'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProCard;
