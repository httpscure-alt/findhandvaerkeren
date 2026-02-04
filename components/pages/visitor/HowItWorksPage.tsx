import React from 'react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { Search, ShieldCheck, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  lang: Language;
  onGetStarted: () => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ lang, onGetStarted }) => {
  const t = translations[lang].howItWorks;

  const steps = [
    {
      icon: Search,
      title: t.step1.title,
      description: t.step1.desc
    },
    {
      icon: ShieldCheck,
      title: t.step2.title,
      description: t.step2.desc
    },
    {
      icon: MessageSquare,
      title: t.step3.title,
      description: t.step3.desc
    },
    {
      icon: CheckCircle,
      title: t.step4.title,
      description: t.step4.desc
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-4">
          {t.title}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {t.subtitle}
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
          {t.ctaTitle}
        </h2>
        <p className="text-nexus-subtext mb-8 max-w-2xl mx-auto">
          {t.ctaDesc}
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-[#1D1D1F] text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
        >
          {t.ctaButton} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default HowItWorksPage;
