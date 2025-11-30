import React from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { Search, ShieldCheck, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  lang: Language;
  onGetStarted: () => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ lang, onGetStarted }) => {
  const steps = [
    {
      icon: Search,
      title: lang === 'da' ? 'Søg eller Gennemse' : 'Search or Browse',
      description: lang === 'da' 
        ? 'Brug vores AI-drevne søgning eller gennemse kategorier for at finde den perfekte partner til dine behov.'
        : 'Use our AI-powered search or browse categories to find the perfect partner for your needs.'
    },
    {
      icon: ShieldCheck,
      title: lang === 'da' ? 'Verificerede Partnere' : 'Verified Partners',
      description: lang === 'da'
        ? 'Alle premium-lister er manuelt verificeret for at sikre kvalitet og troværdighed.'
        : 'All premium listings are manually verified to ensure quality and trustworthiness.'
    },
    {
      icon: MessageSquare,
      title: lang === 'da' ? 'Kontakt Direkte' : 'Contact Directly',
      description: lang === 'da'
        ? 'Send direkte henvendelser til virksomheder og få svar hurtigt.'
        : 'Send direct inquiries to companies and get responses quickly.'
    },
    {
      icon: CheckCircle,
      title: lang === 'da' ? 'Gem og Sammenlign' : 'Save & Compare',
      description: lang === 'da'
        ? 'Gem dine favoritvirksomheder og sammenlign dem side om side.'
        : 'Save your favorite companies and compare them side by side.'
    }
  ];

  return (
    <div className="bg-white py-8 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
            {lang === 'da' ? 'Sådan Fungerer Det' : 'How It Works'}
          </h2>
          <p className="text-lg text-nexus-subtext max-w-2xl mx-auto">
            {lang === 'da'
              ? 'Fire enkle trin til at finde den perfekte partner'
              : 'Four simple steps to find the perfect partner'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all h-full">
                <div className="flex items-center justify-center w-14 h-14 bg-nexus-bg rounded-2xl mb-4">
                  <step.icon className="text-nexus-accent" size={28} />
                </div>
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-nexus-accent text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">{step.title}</h3>
                <p className="text-sm text-nexus-subtext leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-nexus-bg to-white rounded-3xl p-8 text-center border border-gray-100">
          <h3 className="text-2xl font-bold text-[#1D1D1F] mb-3">
            {lang === 'da' ? 'Klar til at komme i gang?' : 'Ready to Get Started?'}
          </h3>
          <p className="text-nexus-subtext mb-6 max-w-2xl mx-auto">
            {lang === 'da'
              ? 'Opret en gratis konto i dag og begynd at opdage verificerede partnere.'
              : 'Create a free account today and start discovering verified partners.'}
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-[#1D1D1F] text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            {lang === 'da' ? 'Kom I Gang' : 'Get Started'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
