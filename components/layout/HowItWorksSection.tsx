import React from 'react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { Search, ShieldCheck, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  lang: Language;
  onGetStarted: () => void;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ lang, onGetStarted }) => {
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
    <div className="bg-white py-8 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-nexus-subtext max-w-2xl mx-auto">
            {t.subtitle}
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
            {t.ctaTitle}
          </h3>
          <p className="text-nexus-subtext mb-6 max-w-2xl mx-auto">
            {t.ctaDesc}
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-[#1D1D1F] text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            {t.ctaButton} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
