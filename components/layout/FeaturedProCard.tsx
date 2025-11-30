import React, { useState } from 'react';
import { Company, Language } from '../../types';
import { Phone, Mail, MessageSquare } from 'lucide-react';

interface FeaturedProCardProps {
  company: Company;
  lang: Language;
  onViewProfile: (company: Company) => void;
}

const FeaturedProCard: React.FC<FeaturedProCardProps> = ({ company, lang, onViewProfile }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardInteraction = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all cursor-pointer"
      onClick={handleCardInteraction}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Image */}
      <div className="relative h-32 bg-gray-100 overflow-hidden rounded-t-2xl">
        <img 
          src={company.bannerUrl || company.logoUrl} 
          alt={company.name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">{company.name}</h3>
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
