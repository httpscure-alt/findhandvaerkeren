import React from 'react';
import { Language } from '../../../types';
import { Search, Clock, ArrowRight, X } from 'lucide-react';
import { translations } from '../../../translations';

interface RecentSearchesPageProps {
  lang: Language;
  onBack: () => void;
  onSearch: (query: string) => void;
}

const RecentSearchesPage: React.FC<RecentSearchesPageProps> = ({ lang, onBack, onSearch }) => {
  // Mock recent searches
  const recentSearches = [
    { id: '1', query: 'Technology companies in København', timestamp: '2 hours ago' },
    { id: '2', query: 'Marketing agencies', timestamp: 'Yesterday' },
    { id: '3', query: 'Legal services', timestamp: '3 days ago' },
    { id: '4', query: 'Finance consultants Aarhus', timestamp: '1 week ago' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-nexus-subtext hover:text-[#1D1D1F] mb-6 transition-colors"
      >
        <ArrowRight size={18} className="rotate-180" />
        {lang === 'da' ? 'Tilbage' : 'Back'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-nexus-accent" size={24} />
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Seneste Søgninger' : 'Recent Searches'}
        </h1>
      </div>

      <div className="space-y-3">
        {recentSearches.map((search) => (
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
                  {search.timestamp}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
              }}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {recentSearches.length === 0 && (
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
