import React from 'react';
import { Language } from '../../../types';
import { Search, Clock, ArrowRight, X } from 'lucide-react';
import { api } from '../../../services/api';

interface RecentSearchesPageProps {
  lang: Language;
  onBack: () => void;
  onSearch: (query: string) => void;
}

const RecentSearchesPage: React.FC<RecentSearchesPageProps> = ({ lang, onBack, onSearch }) => {
  const [recentSearches, setRecentSearches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRecentSearches = async () => {
    try {
      setLoading(true);
      const response = await api.getRecentSearches();
      setRecentSearches(response.recentSearches);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch recent searches:', err);
      // Don't show error to user for this, just hide the section if it fails
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRecentSearches();
  }, []);

  const handleDelete = async (query: string) => {
    // Current API only supports 'clear all' or 'save'
    // For now we'll just clear all if child delete is clicked, or we can leave it
    // Actually let's implement clear all
  };

  const handleClearAll = async () => {
    try {
      await api.clearRecentSearches();
      setRecentSearches([]);
    } catch (err) {
      console.error('Failed to clear searches:', err);
    }
  };

  const formatTimestamp = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return lang === 'da' ? 'Lige nu' : 'Just now';
    if (hours < 24) return `${hours} ${lang === 'da' ? 'timer siden' : 'hours ago'}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return lang === 'da' ? 'I går' : 'Yesterday';
    return `${days} ${lang === 'da' ? 'dage siden' : 'days ago'}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] mb-6 transition-colors"
      >
        <ArrowRight size={18} className="rotate-180" />
        {lang === 'da' ? 'Tilbage' : 'Back'}
      </button>

      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Clock className="text-nexus-accent" size={24} />
          <h1 className="text-3xl font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Seneste Søgninger' : 'Recent Searches'}
          </h1>
        </div>
        {recentSearches.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            {lang === 'da' ? 'Ryd alle' : 'Clear all'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-2 border-nexus-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-nexus-subtext">{lang === 'da' ? 'Henter søgninger...' : 'Fetching searches...'}</p>
          </div>
        ) : recentSearches.map((search) => (
          <div
            key={search.id}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-nexus-accent hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            onClick={() => onSearch(search.query)}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-nexus-bg rounded-lg flex items-center justify-center">
                <Search className="text-nexus-accent" size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1D1D1F]">{search.query}</p>
                <p className="text-xs text-nexus-subtext flex items-center gap-1 mt-1">
                  <Clock size={12} />
                  {formatTimestamp(search.createdAt)}
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 p-2 text-nexus-accent transition-all">
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {!loading && recentSearches.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Search size={24} />
          </div>
          <p className="text-gray-500">
            {lang === 'da' ? 'Ingen seneste søgninger endnu.' : 'No recent searches yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentSearchesPage;
