import React from 'react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { Target, Users, Globe, Zap } from 'lucide-react';

interface AboutPageProps {
  lang: Language;
}

const AboutPage: React.FC<AboutPageProps> = ({ lang }) => {
  const content = {
    en: {
      title: 'About Findhåndværkeren',
      mission: 'Our Mission',
      missionText: 'To help businesses find new customers easily with our help and business profiles.',
      vision: 'Our Vision',
      visionText: 'We want to help businesses grow, for a cheap price, but with the same results as everyone else.',
      values: [
        { title: 'Trust', description: 'Every partner is verified and vetted for quality.' },
        { title: 'Transparency', description: 'Clear information helps you make informed decisions.' },
        { title: 'Pricing', description: 'We want people to pay the same amount, regardless of how much money they have.' },
        { title: 'Innovation', description: 'AI-powered search makes finding partners effortless.' },
        { title: 'Excellence', description: 'We curate only the best companies for our platform.' }
      ]
    },
    da: {
      title: 'Om Findhåndværkeren',
      mission: 'Vores Mission',
      missionText: 'At hjælpe virksomheder med at finde nye kunder nemt med vores hjælp og virksomhedsprofiler.',
      vision: 'Vores Vision',
      visionText: 'Vi ønsker at hjælpe virksomheder med at vokse til en billig pris, men med de samme resultater som alle andre.',
      values: [
        { title: 'Tillid', description: 'Hver partner er verificeret og kontrolleret for kvalitet.' },
        { title: 'Gennemsigtighed', description: 'Klare oplysninger hjælper dig med at træffe informerede beslutninger.' },
        { title: 'Prissætning', description: 'Vi ønsker, at folk betaler det samme beløb, uanset hvor mange penge de har.' },
        { title: 'Innovation', description: 'AI-drevet søgning gør det nemt at finde partnere.' },
        { title: 'Excellence', description: 'Vi kuraterer kun de bedste virksomheder til vores platform.' }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-6">{t.title}</h1>
        <p className="text-xl text-nexus-subtext max-w-3xl mx-auto leading-relaxed">
          {lang === 'da'
            ? 'Findhåndværkeren er designet til at hjælpe små og store virksomheder med at finde nye kunder til den samme pris.'
            : 'Findhåndværkeren is designed to help small and big businesses find new customers for the same price.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-3xl p-10 border border-gray-100">
          <div className="w-16 h-16 bg-nexus-bg rounded-2xl flex items-center justify-center mb-6">
            <Target className="text-nexus-accent" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">{t.mission}</h2>
          <p className="text-nexus-subtext leading-relaxed text-lg">{t.missionText}</p>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-gray-100">
          <div className="w-16 h-16 bg-nexus-bg rounded-2xl flex items-center justify-center mb-6">
            <Globe className="text-nexus-accent" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">{t.vision}</h2>
          <p className="text-nexus-subtext leading-relaxed text-lg">{t.visionText}</p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-[#1D1D1F] text-center mb-12">
          {lang === 'da' ? 'Vores Værdier' : 'Our Values'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {t.values.map((value, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-nexus-accent" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">{value.title}</h3>
              <p className="text-nexus-subtext text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-nexus-bg to-white rounded-3xl p-12 text-center border border-gray-100">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Users className="text-nexus-accent" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Bliv En Del Af Fællesskabet' : 'Join Our Community'}
        </h2>
        <p className="text-nexus-subtext text-lg max-w-2xl mx-auto">
          {lang === 'da'
            ? 'Tusindvis af virksomheder stoler på Findhåndværkeren til at finde deres næste partner.'
            : 'Thousands of businesses trust Findhåndværkeren to find their next partner.'}
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
