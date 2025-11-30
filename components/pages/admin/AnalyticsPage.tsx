import React from 'react';
import { Language } from '../../../types';
import { TrendingUp, Users, Eye, MousePointer, Search, BarChart3 } from 'lucide-react';

interface AnalyticsPageProps {
  lang: Language;
  onBack: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ lang }) => {
  const metrics = [
    { label: lang === 'da' ? 'Totale Besøg' : 'Total Visits', value: '45.2k', change: '+12%', icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: lang === 'da' ? 'Unikke Brugere' : 'Unique Users', value: '12.8k', change: '+8%', icon: Users, color: 'bg-green-50 text-green-600' },
    { label: lang === 'da' ? 'Søgninger' : 'Searches', value: '8.5k', change: '+15%', icon: Search, color: 'bg-purple-50 text-purple-600' },
    { label: lang === 'da' ? 'Konverteringer' : 'Conversions', value: '342', change: '+5%', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' }
  ];

  const topSearches = [
    { query: 'Technology companies', count: 1245 },
    { query: 'Marketing agencies', count: 892 },
    { query: 'Legal services', count: 654 },
    { query: 'Finance consultants', count: 521 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#1D1D1F] mb-8">
        {lang === 'da' ? 'Platform Analytics' : 'Platform Analytics'}
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] mb-1">{metric.value}</h3>
              <p className="text-sm text-nexus-subtext">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Searches */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            {lang === 'da' ? 'Top Søgninger' : 'Top Searches'}
          </h3>
          <div className="space-y-4">
            {topSearches.map((search, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1D1D1F]">{search.query}</span>
                    <span className="text-sm text-nexus-subtext">{search.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-nexus-accent h-2 rounded-full"
                      style={{ width: `${(search.count / topSearches[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#1D1D1F] mb-6">
            {lang === 'da' ? 'Aktivitetsoversigt' : 'Activity Overview'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-nexus-bg rounded-xl">
              <span className="text-sm text-[#1D1D1F]">{lang === 'da' ? 'Nye Registreringer' : 'New Registrations'}</span>
              <span className="font-bold text-[#1D1D1F]">+24</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-nexus-bg rounded-xl">
              <span className="text-sm text-[#1D1D1F]">{lang === 'da' ? 'Nye Virksomheder' : 'New Companies'}</span>
              <span className="font-bold text-[#1D1D1F]">+8</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-nexus-bg rounded-xl">
              <span className="text-sm text-[#1D1D1F]">{lang === 'da' ? 'Nye Forespørgsler' : 'New Inquiries'}</span>
              <span className="font-bold text-[#1D1D1F]">+42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
