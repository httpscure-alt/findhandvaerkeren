import React from 'react';
import { Language } from '../../../types';
import { TrendingUp, Users, Eye, MousePointer, Search, BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';

interface AnalyticsPageProps {
  lang: Language;
  onBack: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ lang }) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getPlatformAnalytics();
      setData(response);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-nexus-accent mb-4" size={48} />
        <p className="text-gray-500">{lang === 'da' ? 'Henter analytics...' : 'Loading analytics...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md mx-auto">
          <h3 className="text-lg font-bold mb-2">{lang === 'da' ? 'Indlæsningsfejl' : 'Error Loading'}</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            {lang === 'da' ? 'Prøv igen' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: lang === 'da' ? 'Totale Besøg' : 'Total Visits', value: data?.metrics?.totalVisits || 0, change: '+12%', icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: lang === 'da' ? 'Unikke Brugere' : 'Unique Users', value: data?.metrics?.uniqueUsers || 0, change: '+8%', icon: Users, color: 'bg-green-50 text-green-600' },
    { label: lang === 'da' ? 'Søgninger' : 'Searches', value: data?.metrics?.totalSearches || 0, change: '+15%', icon: Search, color: 'bg-purple-50 text-purple-600' },
    { label: lang === 'da' ? 'Konverteringer' : 'Conversions', value: data?.metrics?.totalConversions || 0, change: '+5%', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' }
  ];

  const topSearches = data?.topSearches || [];
  const activity = data?.activity || { newRegistrations: 0, newCompanies: 0, newInquiries: 0 };

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
            {topSearches.map((search: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1D1D1F]">{search.query}</span>
                    <span className="text-sm text-nexus-subtext">{search.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-nexus-accent h-2 rounded-full"
                      style={{ width: `${(search.count / (topSearches[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topSearches.length === 0 && (
              <p className="text-center py-6 text-gray-400">
                {lang === 'da' ? 'Ingen søgedata tilgængelig' : 'No search data available'}
              </p>
            )}
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
              <span className="font-bold text-[#1D1D1F]">+{activity.newRegistrations}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-nexus-bg rounded-xl">
              <span className="text-sm text-[#1D1D1F]">{lang === 'da' ? 'Nye Virksomheder' : 'New Companies'}</span>
              <span className="font-bold text-[#1D1D1F]">+{activity.newCompanies}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-nexus-bg rounded-xl">
              <span className="text-sm text-[#1D1D1F]">{lang === 'da' ? 'Nye Forespørgsler' : 'New Inquiries'}</span>
              <span className="font-bold text-[#1D1D1F]">+{activity.newInquiries}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
