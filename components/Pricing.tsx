import React, { useState } from 'react';
import { Check, Star, Zap, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Language, SelectedPlan } from '../types';
import { translations } from '../translations';
import { PARTNER_PLAN_PRICING, getPartnerPlanFeatures, formatPrice } from '../constants/pricing';

interface PricingProps {
  lang: Language;
  user?: any;
  onSelectPlan?: (plan: SelectedPlan) => void;
  isEmbedded?: boolean;
}

type PricingMode = 'monthly' | 'annual';

const Pricing: React.FC<PricingProps> = ({ lang, onSelectPlan, isEmbedded = false }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const t = translations[lang];
  const planFeatures = getPartnerPlanFeatures(lang);

  const getPriceInfo = (monthlyPrice: number) => {
    return formatPrice(monthlyPrice, billingCycle, lang);
  };

  const handlePlanSelect = (tierName: string, monthlyPrice: number) => {
    const selectedPlan: SelectedPlan = {
      id: tierName,
      name: tierName,
      monthlyPrice,
      billingPeriod: billingCycle,
    };
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    localStorage.setItem('signupRole', 'PARTNER');
    onSelectPlan?.(selectedPlan);
  };

  const tiers = [
    {
      id: 'Basic',
      name: lang === 'da' ? 'Partner Basis' : 'Partner Basic',
      monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
      description: lang === 'da' ? 'Ideelt for selvstændige håndværkere der ønsker flere opgaver.' : 'Perfect for independent craftsmen looking for more jobs.',
      features: planFeatures.BASIC,
      cta: lang === 'da' ? 'Vælg Basis' : 'Choose Basic',
      highlight: false,
      icon: ShieldCheck
    },
    {
      id: 'Gold',
      name: lang === 'da' ? 'Partner Guld' : 'Partner Gold',
      monthlyPrice: PARTNER_PLAN_PRICING.GOLD_MONTHLY,
      description: lang === 'da' ? 'Maksimal synlighed og flest henvendelser. Bliv "Featured professional".' : 'Maximum visibility and most inquiries. Become a "Featured professional".',
      features: planFeatures.GOLD,
      cta: lang === 'da' ? 'Vælg Guld' : 'Choose Gold',
      highlight: true,
      icon: Star
    }
  ];

  return (
    <div className={`bg-white ${isEmbedded ? '' : 'min-h-screen'}`}>
      {/* Hero Header */}
      {!isEmbedded && (
        <section className="pt-32 pb-20 bg-[#FBFBFD] border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tight mb-6">
              {lang === 'da' ? 'Vækst din virksomhed' : 'Grow Your Business'}
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-[#86868B] mb-10 font-medium">
              {lang === 'da'
                ? 'Findhåndværkeren hjælper dig med at blive set af de rette kunder. Start i dag – helt uforpligtende.'
                : 'Findhåndværkeren helps you get noticed by the right customers. Start today – zero commitment.'}
            </p>

            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-2xl text-sm font-bold border border-green-100 shadow-sm animate-pulse">
              <Zap size={18} fill="currentColor" />
              {lang === 'da' ? 'FØRSTE 3 MÅNEDER 0 KR.' : 'FIRST 3 MONTHS 0 KR.'}
            </div>
          </div>
        </section>
      )}

      {/* Main Pricing Section */}
      <section className={isEmbedded ? 'py-4' : 'py-24'}>
        <div className={`max-w-6xl mx-auto ${isEmbedded ? '' : 'px-4 sm:px-6 lg:px-8'}`}>
          <div className={`grid grid-cols-1 ${isEmbedded ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-6 md:gap-10 items-stretch`}>
            {tiers.map((tier) => {
              const priceInfo = getPriceInfo(tier.monthlyPrice);
              const isGold = tier.id === 'Gold';
              const Icon = tier.icon;

              return (
                <div
                  key={tier.id}
                  className={`relative rounded-[2.5rem] p-10 md:p-12 flex flex-col transition-all duration-500 border
                    ${isGold
                      ? 'bg-white border-[#1D1D1F]/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] scale-105 z-10'
                      : 'bg-white text-[#1D1D1F] shadow-xl border-gray-100'
                    }`}
                >
                  {isGold && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#1D1D1F] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                      {lang === 'da' ? 'ANBEFALET' : 'RECOMMENDED'}
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center 
                        ${isGold ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
                        <Icon size={28} />
                      </div>
                      {isGold && (
                        <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                          {lang === 'da' ? 'Mest populær' : 'Most popular'}
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-[#1D1D1F] mb-1">{tier.name}</h3>
                    <p className="text-sm font-bold text-[#86868B] leading-relaxed mb-8">
                      {tier.description}
                    </p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-[#1D1D1F] tracking-tighter">{priceInfo.price}</span>
                      <span className="text-sm font-bold text-[#86868B]">
                        {priceInfo.period}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mb-8" />

                  <ul className="space-y-4 mb-10 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isGold ? 'bg-[#1D1D1F]' : 'bg-gray-100'}`}>
                          <Check size={12} className={isGold ? 'text-white' : 'text-[#86868B]'} />
                        </div>
                        <span className="text-sm font-bold text-[#1D1D1F]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(tier.id, tier.monthlyPrice)}
                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] shadow-lg
                      ${isGold
                        ? 'bg-[#1D1D1F] text-white hover:bg-black hover:shadow-2xl'
                        : 'bg-transparent border-2 border-[#1D1D1F] text-[#1D1D1F] hover:bg-[#F5F5F7]'
                      }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      {!isEmbedded && (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-[#1D1D1F] mb-4">
                {lang === 'da' ? 'Sammenlign Planer' : 'Compare Plans'}
              </h2>
              <p className="text-[#86868B]">
                {lang === 'da' ? 'Se detaljerne og find den rette løsning for dig.' : 'View details and find the right solution for you.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3 bg-[#FBFBFD] border-b border-gray-100 p-6">
                <div className="font-bold text-[#86868B]">{lang === 'da' ? 'Feature' : 'Feature'}</div>
                <div className="font-bold text-[#1D1D1F] text-center">{lang === 'da' ? 'Basis' : 'Basic'}</div>
                <div className="font-bold text-[#1D1D1F] text-center">{lang === 'da' ? 'Guld' : 'Gold'}</div>
              </div>

              {[
                { name: lang === 'da' ? 'Offentlig Profil' : 'Public Profile', basic: true, gold: true },
                { name: lang === 'da' ? 'Modtag Leads' : 'Receive Leads', basic: true, gold: true },
                { name: lang === 'da' ? 'Antal Billeder' : 'Portfolio Images', basic: '5', gold: 'Ubegrænset' },
                { name: lang === 'da' ? 'Verificeret Badge' : 'Verified Badge', basic: false, gold: true },
                { name: lang === 'da' ? 'Fremhævet i søgninger' : 'Featured in Search', basic: false, gold: true },
                { name: lang === 'da' ? 'SEO Analyse' : 'SEO Analysis', basic: false, gold: true },
                { name: lang === 'da' ? 'Support' : 'Support', basic: 'Email', gold: 'Email + Tel' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium text-[#1D1D1F]">{row.name}</div>
                  <div className="flex justify-center">
                    {typeof row.basic === 'boolean' ? (
                      row.basic ? <Check className="text-green-500" size={20} /> : <div className="w-5 h-1 bg-gray-200 rounded-full" />
                    ) : (
                      <span className="text-sm font-bold text-[#1D1D1F]">{row.basic}</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {typeof row.gold === 'boolean' ? (
                      row.gold ? <Check className="text-green-500" size={20} /> : <div className="w-5 h-1 bg-gray-200 rounded-full" />
                    ) : (
                      <span className="text-sm font-bold text-[#1D1D1F]">{row.gold}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Preview (Simulation) */}
      {!isEmbedded && (
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-[#1D1D1F] mb-4">
                {lang === 'da' ? 'Professionelt Dashboard' : 'Professional Dashboard'}
              </h2>
              <p className="text-[#86868B] max-w-2xl mx-auto">
                {lang === 'da'
                  ? 'Få fuldt overblik over dine leads, profilvisninger og kunderelationer et sted.'
                  : 'Get a full overview of your leads, profile views, and customer relationships in one place.'}
              </p>
            </div>

            <div className="relative mx-auto max-w-5xl rounded-[2rem] border-[8px] border-[#1D1D1F] bg-[#F5F5F7] shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
              {/* Fake UI Structure */}
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-16 md:w-64 bg-[#1D1D1F] flex flex-col p-4 gap-4 hidden md:flex">
                  <div className="h-8 w-8 bg-white/20 rounded-lg mb-8"></div>
                  <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                  <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                  <div className="h-4 w-full bg-white/20 rounded mt-4"></div>
                  <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-hidden bg-gray-50">
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                      <div className="h-8 w-16 bg-blue-500 rounded-lg opacity-20"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                      <div className="h-8 w-16 bg-green-500 rounded-lg opacity-20"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                      <div className="h-8 w-16 bg-purple-500 rounded-lg opacity-20"></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-64">
                    <div className="h-4 w-32 bg-gray-100 rounded mb-6"></div>
                    <div className="flex items-end gap-2 h-40">
                      <div className="w-full bg-blue-50 rounded-t h-[60%]"></div>
                      <div className="w-full bg-blue-100 rounded-t h-[80%]"></div>
                      <div className="w-full bg-blue-500 rounded-t h-[40%]"></div>
                      <div className="w-full bg-blue-200 rounded-t h-[70%]"></div>
                      <div className="w-full bg-blue-100 rounded-t h-[50%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Value Props Section */}
      {!isEmbedded && (
        <section className="py-24 bg-[#FBFBFD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-[#1D1D1F]">{lang === 'da' ? 'Hvorfor Findhåndværkeren?' : 'Why Findhåndværkeren?'}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { icon: TrendingUp, title: lang === 'da' ? 'Flere Leads' : 'More Leads', desc: lang === 'da' ? 'Vi sender dig kun relevante opgaver i dit område.' : 'We only send you relevant jobs in your area.' },
                { icon: Users, title: lang === 'da' ? 'Nye Kunder' : 'New Customers', desc: lang === 'da' ? 'Skab tætte kunderelationer gennem høj synlighed.' : 'Build strong customer relationships through high visibility.' },
                { icon: Zap, title: lang === 'da' ? 'Ingen Binding' : 'No Commitment', desc: lang === 'da' ? 'Opsig når som helst. Ingen skjulte gebyrer.' : 'Cancel anytime. No hidden fees.' }
              ].map((prop, i) => (
                <div key={i} className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-[1.5rem] shadow-sm text-[#1D1D1F]">
                    <prop.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1D1D1F]">{prop.title}</h3>
                  <p className="text--[#86868B] font-medium leading-relaxed">{prop.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Pricing;