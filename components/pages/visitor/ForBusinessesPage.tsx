
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Search,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Globe,
    Zap,
    MousePointer2,
    Target,
    BarChart3,
    FileSearch,
    Compass,
    Check,
    ShoppingCart,
    ShieldCheck
} from 'lucide-react';
import { Language } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';

interface ForBusinessesPageProps {
    lang: Language;
}

const ForBusinessesPage: React.FC<ForBusinessesPageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();
    const isDa = lang === 'da';

    // State for Tabs
    const [activeTab, setActiveTab] = useState<'seo' | 'ads'>('ads');

    // State for Selection
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [customBudget, setCustomBudget] = useState('');

    const scrollToServices = () => {
        const element = document.getElementById('growth-services');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectTier = (tierId: string) => {
        if (isAuthenticated) {
            // Only PARTNER users can access growth services
            if (user?.role === 'PARTNER') {
                navigate(`/dashboard/growth?tab=${activeTab}&tier=${tierId}`);
            } else {
                // Consumer users should not access partner services
                toast.error(lang === 'da'
                    ? 'Denne tjeneste er kun for erhvervskunder. Opret en partnerkonto for at fortsætte.'
                    : 'This service is for business customers only. Create a partner account to continue.');
                navigate('/pricing'); // Redirect to partner pricing/signup
            }
        } else {
            navigate(`/signup?service=${activeTab}&tier=${tierId}`);
        }
    };

    const tiers = {
        ads: [
            {
                id: 'ads_basic',
                name: isDa ? 'Basic' : 'Basic',
                label: isDa ? 'Lokal Synlighed' : 'Local Visibility',
                price: '1.000',
                features: [
                    isDa ? '1 Søgekampagne' : '1 Search Campaign',
                    isDa ? '5 Annoncegrupper' : '5 Ad Groups',
                    isDa ? 'Professionelle annoncer' : 'Professional Search Ads',
                    isDa ? 'Basal konverteringssporing' : 'Basic Conversion Tracking',
                    isDa ? 'Månedlig optimering' : 'Monthly Optimization'
                ],
                idealFor: isDa ? 'Små lokale virksomheder' : 'Small local businesses',
                color: 'bg-green-50 text-green-700 border-green-100'
            },
            {
                id: 'ads_standard',
                name: isDa ? 'Standard' : 'Standard',
                label: isDa ? 'Stabil Vækst' : 'Steady Growth',
                price: '2.000',
                popular: true,
                features: [
                    isDa ? '2 Søgekampagner' : '2 Search Campaigns',
                    isDa ? '15 Annoncegrupper' : '15 Ad Groups',
                    isDa ? 'Udvidet søgeordsanalyse' : 'Keyword Expansion',
                    isDa ? 'Avanceret sporing' : 'Advanced Tracking',
                    isDa ? 'Månedlig rapport' : 'Monthly Reporting'
                ],
                idealFor: isDa ? 'Virksomheder med flere services' : 'Businesses with multiple services',
                color: 'bg-blue-50 text-blue-700 border-blue-100'
            },
            {
                id: 'ads_pro',
                name: isDa ? 'Pro' : 'Pro',
                label: isDa ? 'Skalering & Performance' : 'Scaling & Performance',
                price: '5.000',
                features: [
                    isDa ? '5 Kampagner' : '5 Campaigns',
                    isDa ? '25+ Annoncegrupper' : '25+ Ad Groups',
                    isDa ? 'Aggressiv skalering' : 'Aggressive Scaling',
                    isDa ? 'A/B Test af annoncer' : 'A/B Ad Testing',
                    isDa ? 'Tæt overvågning' : 'Close Monitoring'
                ],
                idealFor: isDa ? 'Vækstfokus og konkurrencepræget' : 'High-growth & competitive',
                color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }
        ],
        seo: [
            {
                id: 'seo_basic',
                name: isDa ? 'Basic' : 'Basic',
                label: isDa ? 'Lokal Synlighed' : 'Local Visibility',
                price: '1.500',
                features: [
                    isDa ? 'Søgeordsanalyse (10 ord)' : 'Keyword Research (10)',
                    isDa ? 'On-page optimering' : 'On-page Optimization',
                    isDa ? 'Google Business Profile' : 'Google Business Profile',
                    isDa ? 'Månedlig status' : 'Monthly Status'
                ],
                idealFor: isDa ? 'Små lokale virksomheder' : 'Small local businesses',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
            },
            {
                id: 'seo_standard',
                name: isDa ? 'Standard' : 'Standard',
                label: isDa ? 'Stabil Vækst' : 'Steady Growth',
                price: '3.000',
                popular: true,
                features: [
                    isDa ? 'Udvidet analyse (25 ord)' : 'Extended Research (25)',
                    isDa ? 'Optimering af flere sider' : 'Multi-page Optimization',
                    isDa ? '2-3 Blogindlæg / md.' : '2-3 Blog Posts / mo.',
                    isDa ? 'Teknisk SEO' : 'Technical SEO',
                    isDa ? 'Rapportering med KPI' : 'KPI Reporting'
                ],
                idealFor: isDa ? 'Flere services eller lokationer' : 'Multiple services/locations',
                color: 'bg-teal-50 text-teal-700 border-teal-100'
            },
            {
                id: 'seo_pro',
                name: isDa ? 'Pro' : 'Pro',
                label: isDa ? 'Skalering & Performance' : 'Scaling & Performance',
                price: '5.000',
                features: [
                    isDa ? 'Fuld analyse' : 'Full Analysis',
                    isDa ? 'Hele websitet' : 'Entire Website',
                    isDa ? '4+ Blogindlæg / md.' : '4+ Blog Posts / mo.',
                    isDa ? 'Linkbuilding strategi' : 'Link Building Strategy',
                    isDa ? 'Tæt overvågning' : 'Close Monitoring'
                ],
                idealFor: isDa ? 'Nationalt fokus' : 'National focus',
                color: 'bg-violet-50 text-violet-700 border-violet-100'
            }
        ]
    };

    return (
        <div className="bg-white">
            {/* 1. HERO SECTION */}
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1D1D1F]/5 rounded-full text-[#1D1D1F] text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles size={14} className="text-blue-500" />
                        {isDa ? 'Eksklusive væksttjenester' : 'Exclusive growth services'}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
                        {isDa
                            ? 'Vækst din forretning med SEO og Google Ads'
                            : 'Grow your business with SEO and Google Ads'}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#86868B] mb-10 leading-relaxed font-medium">
                        {isDa
                            ? 'Skræddersyede pakker til enhver virksomhedsstørrelse. Ingen binding.'
                            : 'Tailored packages for every business size. No binding contracts.'}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <button
                            onClick={scrollToServices}
                            className="w-full sm:w-auto px-10 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} />
                            {isDa ? 'Se priser & pakker' : 'View pricing & packages'}
                        </button>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-blue-100 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-100 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* 2. PRICING TIERS SECTION */}
            <section id="growth-services" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-6">
                            {isDa ? 'Vælg din vækstmotor' : 'Choose your growth engine'}
                        </h2>

                        {/* TABS */}
                        <div className="inline-flex p-1.5 bg-gray-100 rounded-2xl mx-auto">
                            <button
                                onClick={() => setActiveTab('ads')}
                                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ads'
                                    ? 'bg-white text-[#1D1D1F] shadow-md'
                                    : 'text-nexus-subtext hover:text-nexus-text'
                                    }`}
                            >
                                <TrendingUp size={18} />
                                Google Ads
                            </button>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'seo'
                                    ? 'bg-white text-[#1D1D1F] shadow-md'
                                    : 'text-nexus-subtext hover:text-nexus-text'
                                    }`}
                            >
                                <Search size={18} />
                                SEO
                            </button>
                        </div>
                    </div>

                    {/* PRICING CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {tiers[activeTab].map((tier) => (
                            <div
                                key={tier.id}
                                className={`relative p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-1 ${tier.popular ? 'border-[#1D1D1F] shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                                    } bg-white flex flex-col`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#1D1D1F] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                        {isDa ? 'Mest Populær' : 'Most Popular'}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">{tier.name}</h3>
                                    <p className="text-sm font-medium text-nexus-subtext">{tier.label}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-[#1D1D1F]">{tier.price}</span>
                                        <span className="text-sm font-bold text-gray-400">DKK</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">/ {isDa ? 'md. ex. moms' : 'mo. ex. vat'}</p>
                                </div>

                                <div className={`p-4 rounded-2xl mb-8 ${tier.color}`}>
                                    <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-80">{isDa ? 'Ideel til:' : 'Ideal for:'}</p>
                                    <p className="text-sm font-bold">{tier.idealFor}</p>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[#1D1D1F]">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectTier(tier.id)}
                                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tier.popular
                                        ? 'bg-[#1D1D1F] text-white hover:bg-black'
                                        : 'bg-gray-50 text-[#1D1D1F] hover:bg-gray-100'
                                        }`}
                                >
                                    {isDa ? 'Vælg Pakke' : 'Select Package'}
                                    <ArrowRight size={16} />
                                </button>

                                {activeTab === 'ads' && (
                                    <p className="text-[10px] text-center text-gray-400 mt-4 italic">
                                        {isDa ? '* Annonceforbrug betales direkte til Google' : '* Ad spend paid directly to Google'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CUSTOM QUOTE FOR ADS */}
                    {activeTab === 'ads' && (
                        <div className="max-w-3xl mx-auto bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-4">{isDa ? 'Skræddersyet Budget?' : 'Custom Budget?'}</h3>
                                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                    {isDa
                                        ? 'Har du et større setup eller specifikke krav? Indtast dit budget, så laver vi et tilbud.'
                                        : 'Do you have a larger setup or specific requirements? Enter your budget, and we will make a quote.'}
                                </p>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                    <input
                                        type="text"
                                        placeholder={isDa ? 'Dit budget (f.eks. 15.000 DKK)' : 'Your budget (e.g. 15,000 DKK)'}
                                        value={customBudget}
                                        onChange={(e) => setCustomBudget(e.target.value)}
                                        className="w-full md:w-64 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:bg-white/20 transition-all font-medium"
                                    />
                                    <button
                                        onClick={() => handleSelectTier(`ads_custom_${customBudget}`)}
                                        className="w-full md:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        {isDa ? 'Få Tilbud' : 'Get Quote'}
                                    </button>
                                </div>
                            </div>

                            {/* Bg Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -ml-32 -mb-32" />
                        </div>
                    )}
                </div>
            </section>

            {/* 4. PROCESS SECTION (REFACTORED) */}
            <section className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
                            {isDa ? 'Sådan fungerer vores SEO & Ads service' : 'How our SEO & Ads service works'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            {
                                icon: FileSearch,
                                title: isDa ? 'Opsætning' : 'Initial Setup',
                                desc: isDa ? 'Vi konfigurerer dine profiler og konti til optimal performance.' : 'We configure your profiles and accounts for optimal performance.',
                                step: 1
                            },
                            {
                                icon: Compass,
                                title: isDa ? 'Målretning' : 'Targeting',
                                desc: isDa ? 'Definition af geografi, søgeord og målgrupper.' : 'Definition of geography, keywords, and target audiences.',
                                step: 2
                            },
                            {
                                icon: Target,
                                title: isDa ? 'Aktivering' : 'Activation',
                                desc: isDa ? 'Vi udruller kampagner og optimeringer med det samme.' : 'We roll out campaigns and optimizations immediately.',
                                step: 3
                            },
                            {
                                icon: BarChart3,
                                title: isDa ? 'Monitorering' : 'Monitoring',
                                desc: isDa ? 'Proaktiv justering baseret på faktiske performance-data.' : 'Proactive adjustment based on actual performance data.',
                                step: 4
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-[#1D1D1F] mb-6 border border-gray-100 shadow-sm z-10">
                                    <item.icon size={24} />
                                </div>
                                <div className="absolute top-4 left-6 text-2xl font-black text-gray-50 select-none">
                                    0{item.step}
                                </div>
                                <h3 className="text-lg font-bold text-[#1D1D1F] mb-3">{item.title}</h3>
                                <p className="text-xs text-[#86868B] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};



export default ForBusinessesPage;
