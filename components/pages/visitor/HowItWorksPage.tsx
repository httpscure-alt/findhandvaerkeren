import React from 'react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { Search, ShieldCheck, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  lang: Language;
  onGetStarted: () => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ lang, onGetStarted }) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Sådan Fungerer Det' : 'How It Works'}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {lang === 'da'
            ? 'Fire enkle trin til at finde den perfekte partner'
            : 'Four simple steps to find the perfect partner'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all h-full">
              <div className="flex items-center justify-center w-16 h-16 bg-nexus-bg rounded-2xl mb-6">
                <step.icon className="text-nexus-accent" size={32} />
              </div>
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-nexus-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] mb-3">{step.title}</h3>
              <p className="text-nexus-subtext leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-nexus-bg to-white rounded-3xl p-12 text-center border border-gray-100">
        <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Klar til at komme i gang?' : 'Ready to Get Started?'}
        </h2>
        <p className="text-nexus-subtext mb-8 max-w-2xl mx-auto">
          {lang === 'da'
            ? 'Opret en gratis konto i dag og begynd at opdage verificerede partnere.'
            : 'Create a free account today and start discovering verified partners.'}
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-[#1D1D1F] text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
        >
          {lang === 'da' ? 'Kom I Gang' : 'Get Started'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HowItWorksPage;
