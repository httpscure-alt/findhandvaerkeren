import React from 'react';
import { ConsumerUser, Company, Language, ViewState } from '../types';
import { translations } from '../translations';
import ListingCard from './ListingCard';
import { Search, Heart, Settings, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsumerDashboardProps {
  user: ConsumerUser;
  savedCompanies: Company[];
  lang: Language;
  onViewProfile: (company: Company) => void;
  onBrowse: () => void;
  onToggleFavorite: (id: string) => void;
}

const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({
  user,
  savedCompanies,
  lang,
  onViewProfile,
  onBrowse,
  onToggleFavorite
}) => {
  const t = translations[lang].consumer;
  const navigate = useNavigate();

  // Mock activity
  const recentActivity = [
    { type: 'search', query: 'Plumbers in København', time: '2 hours ago' },
    { type: 'view', company: 'Summit Capital', time: 'Yesterday' },
    { type: 'inquiry', company: 'Nexus Solutions', time: '3 days ago', status: 'Pending' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F]">{t.welcome}, {user.name}</h1>
            <p className="text-gray-500">{user.location}</p>
          </div>
        </div>
        <button
          onClick={() => {/* Navigate to settings - handled by sidebar */ }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-[#1D1D1F] transition-colors flex items-center gap-2"
        >
          <Settings size={16} /> {t.accountSettings}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Saved Listings */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Action: Get 3 Quotes */}
          <div className="bg-[#1D1D1F] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                {lang === 'da' ? 'Brug for flere tilbud?' : 'Need multiple quotes?'}
              </h2>
              <p className="text-gray-400 mb-6 max-w-md">
                {lang === 'da'
                  ? 'Spar tid og penge ved at indhente 3 uforpligtende tilbud fra vores verificerede partnere.'
                  : 'Save time and money by getting 3 non-binding quotes from our verified partners.'}
              </p>
              <button
                onClick={() => navigate('/get-offers')}
                className="bg-white text-[#1D1D1F] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                {lang === 'da' ? 'Indhent 3 tilbud nu' : 'Get 3 Quotes Now'} <ArrowRight size={18} />
              </button>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-nexus-accent/20 rounded-full blur-3xl group-hover:bg-nexus-accent/30 transition-all duration-700"></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F] flex items-center gap-2">
                <Heart className="fill-red-500 text-red-500" size={20} /> {t.savedListings}
              </h2>
              <button
                onClick={onBrowse}
                className="text-sm font-medium text-nexus-accent hover:underline"
              >
                {t.browseNow}
              </button>
            </div>

            {savedCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedCompanies.map(company => (
                  <ListingCard
                    key={company.id}
                    company={company}
                    onViewProfile={onViewProfile}
                    lang={lang}
                    isFavorite={true}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Heart size={24} />
                </div>
                <p className="text-gray-500 mb-4">{t.noSaved}</p>
                <button
                  onClick={onBrowse}
                  className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
                >
                  {t.browseNow}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity & Inquiries */}
        <div className="space-y-6">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" /> {t.recentActivity}
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:pb-0 last:border-0">
                  <div className={`p-2 rounded-full shrink-0 ${item.type === 'search' ? 'bg-blue-50 text-blue-500' :
                      item.type === 'view' ? 'bg-purple-50 text-purple-500' : 'bg-green-50 text-green-500'
                    }`}>
                    {item.type === 'search' && <Search size={14} />}
                    {item.type === 'view' && <ArrowRight size={14} />}
                    {item.type === 'inquiry' && <MessageSquare size={14} />}
                  </div>
                  <div>
                    <div className="text-sm text-[#1D1D1F]">
                      {item.type === 'search' && <span>Searched: "{item.query}"</span>}
                      {item.type === 'view' && <span>Viewed: <span className="font-medium">{item.company}</span></span>}
                      {item.type === 'inquiry' && <span>Inquired: <span className="font-medium">{item.company}</span></span>}
                    </div>
                    <div className="text-xs text-gray-400">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Active Inquiries */}
          <div className="bg-gradient-to-br from-[#F5F5F7] to-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-gray-400" /> {t.inquiries}
            </h3>
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <img src="https://picsum.photos/id/42/200/200" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold">Nexus Solutions</div>
                  <div className="text-xs text-orange-500 font-medium">Pending Response</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
