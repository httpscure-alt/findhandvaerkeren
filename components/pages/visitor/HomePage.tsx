import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Search,
    MapPin,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { translations } from '../../../translations';
import ListingCard from '../../ListingCard';
import { LoadingSkeleton } from '../../common/LoadingSkeleton';

import { CORE_CATEGORIES } from '../../../constants';

interface HomePageProps {
    onCompanyClick: (company: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCompanyClick }) => {
    const navigate = useNavigate();
    const {
        companies,
        isLoadingCompanies,
        isLoadingCategories,
        filters,
        setFilters,
        lang,
        savedCompanyIds,
        toggleFavorite,
        handleSearch
    } = useMarketplace();

    const [localSearch, setLocalSearch] = useState(filters.searchQuery || '');
    const [localZip, setLocalZip] = useState(filters.zipCode || '');

    const t = translations[lang];

    const handleHeroSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            searchQuery: localSearch,
            zipCode: localZip
        }));
        handleSearch();
        navigate('/browse');
    };

    // Use curated core categories for discovery section
    const featuredCategories = CORE_CATEGORIES;

    // Take first 3-6 verified companies for featured section (Prefer Gold)
    const featuredPros = [...companies]
        .filter(c => c.isVerified)
        .sort((a, b) => {
            if (a.pricingTier === 'Gold' && b.pricingTier !== 'Gold') return -1;
            if (a.pricingTier !== 'Gold' && b.pricingTier === 'Gold') return 1;
            return 0;
        })
        .slice(0, 3);

    return (
        <div className="bg-white">
            {/* 1. HERO SECTION */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-blue-50 rounded-full blur-3xl opacity-60 animate-blob" />
                    <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[50%] bg-slate-50 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tight mb-6">
                        {t.hero.headline}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#86868B] mb-10 leading-relaxed font-medium">
                        {t.hero.subheadline}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        {/* 1. PRIMARY: User conversion */}
                        <button
                            onClick={() => navigate('/get-offers')}
                            className="w-full sm:w-auto px-10 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 active:scale-[0.98] shadow-lg"
                        >
                            {t.hero.primaryCTA}
                        </button>
                        {/* 2. SECONDARY: Exploration */}
                        <button
                            onClick={() => navigate('/browse')}
                            className="w-full sm:w-auto px-10 py-4 bg-transparent text-[#1D1D1F] border-2 border-[#1D1D1F] rounded-xl font-bold text-lg hover:bg-[#F5F5F7] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group"
                        >
                            {t.hero.secondaryCTA}
                            <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                        {t.hero.trustIndicators.map((text: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                <CheckCircle2 className="text-[#1D1D1F]" size={18} />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 1.5 SOCIAL PROOF STRIP */}
            <div className="bg-white border-y border-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-[#86868B] text-sm font-bold tracking-wide uppercase opacity-70">
                        {t.hero.socialProof}
                    </p>
                </div>
            </div>

            {/* 2. GUIDED SEARCH */}
            <section className="relative -mt-8 md:-mt-12 z-20 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-2 md:p-3">
                    <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row items-stretch gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder={t.discovery.searchPlaceholder}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <MapPin className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder={t.discovery.locationPlaceholder}
                                value={localZip}
                                onChange={(e) => setLocalZip(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                        >
                            {t.discovery.findButton}
                        </button>
                    </form>
                </div>
            </section>

            {/* 3. POPULAR CATEGORIES */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
                            {t.discovery.title}
                        </h2>
                        <p className="text-[#86868B] font-medium">{t.discovery.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
                        {isLoadingCategories ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            featuredCategories.map((cat: string) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setFilters(prev => ({ ...prev, category: cat }));
                                        navigate('/browse');
                                    }}
                                    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#1D1D1F]/30 transition-all duration-300 text-center group"
                                >
                                    <p className="text-lg font-bold text-[#1D1D1F] group-hover:text-black transition-colors">
                                        {t.categoryNames[cat] || cat}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/categories')}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gray-200 text-[#1D1D1F] font-bold hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {lang === 'da' ? 'Vis alle kategorier' : 'View all categories'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 3.5 HOW IT WORKS */}
            <section className="py-24 bg-[#FBFBFD] border-y border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.3em] mb-4">
                            {t.hero.howItWorks.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {(t.hero.howItWorks.steps as string[]).map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-black text-xl">
                                    {i + 1}
                                </div>
                                <p className="text-lg font-bold text-[#1D1D1F] max-w-[200px]">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FEATURED PROFESSIONALS */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="text-left max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
                                {t.pros.featuredTitle}
                            </h2>
                            <p className="text-sm text-[#86868B] font-medium leading-relaxed">
                                {t.pros.verifiedDisclaimer}
                            </p>
                        </div>
                        <button onClick={() => navigate('/browse')} className="hidden md:flex items-center gap-1 text-[#1D1D1F] font-bold hover:opacity-70 transition-all">
                            {t.hero.secondaryCTA} <ChevronRight size={18} />
                        </button>
                    </div>

                    {isLoadingCompanies ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <LoadingSkeleton key={i} variant="card" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredPros.map(company => (
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
                    )}
                </div>
            </section>

            {/* 5. SUPPLY-SIDE CTA */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#F5F5F7] rounded-[2rem] p-8 md:p-16 text-center md:text-left relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-6 leading-tight">
                                    {t.supply.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/onboarding')}
                                className="whitespace-nowrap px-10 py-5 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-md active:scale-[0.98]"
                            >
                                {t.supply.button}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
