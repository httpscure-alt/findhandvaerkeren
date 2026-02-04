import React, { useState } from 'react';
import SearchBar from '../../SearchBar';
import ListingCard from '../../ListingCard';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';
import { ErrorState } from '../../common/ErrorState';
import { Search, MapPin, Sparkles, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { translations } from '../../../translations';
import { useNavigate } from 'react-router-dom';

import { CATEGORY_LIST } from '../../../constants';

interface BrowsePageProps {
    onCompanyClick: (company: any) => void;
}

const BrowsePage: React.FC<BrowsePageProps> = ({ onCompanyClick }) => {
    const navigate = useNavigate();
    const {
        companies,
        locations,
        isLoadingCompanies,
        companiesError,
        filters,
        setFilters,
        lang,
        savedCompanyIds,
        toggleFavorite,
        handleSearch,
        isAnalyzing,
        aiSuggestion,
        refreshCompanies
    } = useMarketplace();

    const [showAllCategories, setShowAllCategories] = useState(false);

    const t = translations[lang];

    const coreCategories = CATEGORY_LIST.filter(c => c.isCore).map(c => c.id);
    const longTailCategories = CATEGORY_LIST.filter(c => c.isLongTail).map(c => c.id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 shrink-0 space-y-10">
                    <div className="relative">
                        <SearchBar
                            variant="sidebar"
                            value={filters.searchQuery}
                            onChange={(val) => setFilters(prev => ({ ...prev, searchQuery: val }))}
                            onSearch={handleSearch}
                            placeholder={t.discovery.searchPlaceholder}
                            lang={lang}
                        />
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <MapPin size={12} />
                            {t.listings.location}
                        </h3>
                        <div className="relative">
                            <select
                                value={filters.location || 'All'}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value === 'All' ? null : e.target.value })}
                                className="w-full appearance-none bg-[#F5F5F7] border-none rounded-xl px-4 py-3 text-sm text-[#1D1D1F] font-bold focus:ring-2 focus:ring-[#1D1D1F] cursor-pointer hover:bg-[#E8E8ED] transition-all"
                            >
                                <option value="All">{t.listings.allLocations}</option>
                                {locations.filter(l => l !== 'All').map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Search size={12} />
                            {lang === 'da' ? 'Postnr.' : 'Zip Code'}
                        </h3>
                        <input
                            type="text"
                            placeholder={lang === 'da' ? 'f.eks. 2100' : 'e.g. 2100'}
                            value={filters.zipCode}
                            onChange={(e) => setFilters(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="w-full bg-[#F5F5F7] border-none rounded-xl px-4 py-3 text-sm text-[#1D1D1F] font-bold focus:ring-2 focus:ring-[#1D1D1F] hover:bg-[#E8E8ED] transition-all placeholder:text-[#86868B]/50"
                            maxLength={8}
                        />
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] mb-4">{t.listings.categories}</h3>
                        <div className="space-y-1">
                            {/* All & Core */}
                            {['All', ...coreCategories].map(category => {
                                const label = (translations[lang] as any).categoryNames[category] || (category === 'All' ? t.categoryNames.All : null);
                                if (!label && category !== 'All') return null;

                                return (
                                    <button
                                        key={category}
                                        onClick={() => setFilters({ ...filters, category: category === 'All' ? null : category })}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${(category === 'All' && !filters.category) || filters.category === category
                                            ? 'bg-[#1D1D1F] text-white shadow-md'
                                            : 'text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}

                            {/* Long Tail Toggle */}
                            {longTailCategories.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowAllCategories(!showAllCategories)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-black text-[#1D1D1F] uppercase tracking-wider hover:bg-[#F5F5F7] rounded-lg transition-all"
                                    >
                                        {lang === 'da' ? 'Vis alle fag' : 'All crafts'}
                                        {showAllCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>

                                    {showAllCategories && (
                                        <div className="mt-2 space-y-1 animate-fadeIn">
                                            {longTailCategories.map(category => {
                                                const label = (translations[lang] as any).categoryNames[category];
                                                if (!label) return null;

                                                return (
                                                    <button
                                                        key={category}
                                                        onClick={() => setFilters({ ...filters, category })}
                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.category === category
                                                            ? 'bg-[#1D1D1F] text-white shadow-sm'
                                                            : 'text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-nexus-text uppercase tracking-wider mb-4">{t.listings.trustLevel}</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${filters.verifiedOnly ? 'bg-nexus-text' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${filters.verifiedOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.verifiedOnly}
                                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                            />
                            <span className="text-sm text-nexus-text">{t.listings.verifiedOnly}</span>
                        </label>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {isAnalyzing ? (
                        <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-50 flex items-center gap-3 animate-pulse">
                            <Loader2 className="animate-spin text-nexus-accent" size={20} />
                            <span className="text-sm text-nexus-subtext">{t.listings.analyzing}</span>
                        </div>
                    ) : aiSuggestion && (
                        <div className="mb-6 p-6 bg-gradient-to-r from-white to-indigo-50/30 rounded-2xl border border-indigo-100 shadow-sm">
                            <div className="flex items-start gap-3">
                                <Sparkles className="text-nexus-accent mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-nexus-text mb-1">{t.listings.smartRec}</h4>
                                    <p className="text-sm text-nexus-subtext mb-2">{aiSuggestion.reasoning}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoadingCompanies ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <LoadingSkeleton key={i} variant="card" />
                            ))}
                        </div>
                    ) : companiesError ? (
                        <ErrorState
                            title="Failed to load companies"
                            message={companiesError}
                            onRetry={refreshCompanies}
                        />
                    ) : companies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-6">
                            {companies.map(company => (
                                <ListingCard
                                    key={company.id}
                                    company={company}
                                    onViewProfile={onCompanyClick}
                                    lang={lang}
                                    isFavorite={savedCompanyIds.includes(company.id)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{t.listings.noResults}</h3>
                            <p className="text-gray-500 mt-1">{lang === 'da' ? 'Prøv at justere dine filtre.' : 'Try adjusting your filters or search terms.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrowsePage;
