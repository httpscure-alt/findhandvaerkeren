
import React from 'react';
import { Company, Language, ViewState } from '../types';
import { translations } from '../translations';
import ListingCard from './ListingCard';
import { BarChart3, Eye, MousePointer, MessageSquare, Settings, ExternalLink, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface PartnerDashboardProps {
  company: Company;
  lang: Language;
  onViewPublic: (company: Company) => void;
  onChangeView: (view: ViewState) => void;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ company, lang, onViewPublic, onChangeView }) => {
  const t = translations[lang].partner;

  // Mock analytics data
  const stats = [
    { label: t.profileViews, value: '1,245', change: '+12%', icon: Eye },
    { label: t.websiteClicks, value: '432', change: '+5%', icon: MousePointer },
    { label: t.leads, value: '28', change: '+15%', icon: MessageSquare },
    { label: t.searchAppearances, value: '5.6k', change: '+8%', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">{t.welcome}, {company.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              {t.active}
            </span>
            <span>•</span>
            <span className="text-sm">{company.pricingTier} Plan</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onChangeView(ViewState.PRICING)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-[#1D1D1F] transition-colors flex items-center gap-2"
          >
            <CreditCard size={16} /> {t.upgrade}
          </button>
          <button 
            onClick={() => onChangeView(ViewState.PARTNER_PROFILE_EDIT)}
            className="px-4 py-2 rounded-xl bg-[#1D1D1F] text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
          >
            <Settings size={16} /> {t.editProfile}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analytics Cards */}
          <div>
             <h3 className="text-lg font-bold text-[#1D1D1F] mb-4">{t.analytics}</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#F5F5F7] rounded-lg text-[#1D1D1F]">
                        <stat.icon size={18} />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#1D1D1F]">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
             </div>
          </div>

          {/* Action Required (Mock) */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Optimize your profile</h3>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Your profile is 85% complete. Add 2 more portfolio items to increase your visibility score and appear higher in search results.
              </p>
              <button className="mt-3 text-sm font-medium text-amber-800 hover:underline">
                Add Portfolio Items →
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1D1D1F]">{t.yourListing}</h3>
              <button 
                onClick={() => onViewPublic(company)}
                className="text-sm text-nexus-accent hover:underline flex items-center gap-1"
              >
                {t.viewPublic} <ExternalLink size={14} />
              </button>
           </div>
           
           {/* Render the actual listing card component but disable interaction or self-reference */}
           <div className="opacity-100 pointer-events-none">
             <ListingCard company={company} onViewProfile={() => {}} lang={lang} />
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <h4 className="font-medium text-[#1D1D1F] mb-2">Share your profile</h4>
              <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-gray-500 break-all font-mono mb-3">
                 https://findhaandvaerkeren.dk/company/{company.id}
              </div>
              <button className="text-sm font-medium text-nexus-accent">Copy Link</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
