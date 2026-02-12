
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Globe,
    Target,
    Briefcase,
    CreditCard,
    Sparkles,
    Info,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Search,
    MousePointer2,
    TrendingUp,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import { Company, Language } from '../../../types';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface GrowthDashboardProps {
    company: Company;
    lang: Language;
}

type Tab = 'overview' | 'recommendations' | 'status' | 'seo' | 'ads';

const GrowthDashboard: React.FC<GrowthDashboardProps> = ({ company, lang }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('tab') as Tab) || 'overview';
    const initialTier = queryParams.get('tier') || '';

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [selectedTier, setSelectedTier] = useState(initialTier);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);
    const toast = useToast();

    // Map tier ID to readable name/price
    const getTierDetails = (tierId: string) => {
        const mapping: any = {
            'ads_basic': { name: 'Ads Basic', price: '1.000 DKK' },
            'ads_standard': { name: 'Ads Standard', price: '2.000 DKK' },
            'ads_pro': { name: 'Ads Pro', price: '5.000 DKK' },
            'seo_basic': { name: 'SEO Basic', price: '1.500 DKK' },
            'seo_standard': { name: 'SEO Standard', price: '3.000 DKK' },
            'seo_pro': { name: 'SEO Pro', price: '5.000 DKK' },
        };
        if (tierId.startsWith('ads_custom_')) return { name: 'Ads Custom', price: tierId.split('_')[2] + ' DKK' };
        return mapping[tierId] || { name: 'Unknown Tier', price: '-' };
    };

    // ... fetch metrics ...

    // Sync state with URL if it changes 
    React.useEffect(() => {
        const tab = queryParams.get('tab') as Tab;
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
        const tier = queryParams.get('tier');
        if (tier) setSelectedTier(tier);
    }, [location.search]);

    // ... form states ...
    const [seoForm, setSeoForm] = useState({
        website: company.website || '',
        country: lang === 'da' ? 'Danmark' : 'Denmark',
        objectives: '',
        areas: company.location || '',
        competitors: '',
        pages: '',
        companyId: company.id,
        tier: initialTier // Include tier in form
    });

    const [adsForm, setAdsForm] = useState({
        website: company.website || '',
        goal: '',
        locations: company.location || '',
        budget: '', // Will be overridden if custom tier
        hasAccount: 'no' as 'yes' | 'no',
        confirmAccess: false,
        companyId: company.id,
        tier: initialTier // Include tier in form
    });

    const handleSeoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tierToUse = selectedTier || seoForm.tier;
        if (!tierToUse) {
            toast.error(lang === 'da' ? 'Vælg venligst en pakke først' : 'Please select a package first');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate Stripe Checkout
            toast.info(lang === 'da' ? 'Sender dig til sikker betaling...' : 'Redirecting to secure payment...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            await api.submitGrowthRequest({
                services: ['seo'],
                details: { ...seoForm, tier: tierToUse }
            });
            setIsSuccess(true);
            toast.success(lang === 'da' ? 'Betaling gennemført & SEO aktiveret!' : 'Payment successful & SEO activated!');
        } catch (error) {
            console.error('Failed to submit SEO request:', error);
            toast.error(lang === 'da' ? 'Betaling mislykkedes' : 'Payment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tierToUse = selectedTier || adsForm.tier;
        if (!tierToUse) {
            toast.error(lang === 'da' ? 'Vælg venligst en pakke først' : 'Please select a package first');
            return;
        }

        setIsSubmitting(true);
        try {
            toast.info(lang === 'da' ? 'Sender dig til sikker betaling...' : 'Redirecting to secure payment...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            await api.submitGrowthRequest({
                services: ['ads'],
                details: { ...adsForm, tier: tierToUse }
            });
            setIsSuccess(true);
            toast.success(lang === 'da' ? 'Betaling gennemført & Ads aktiveret!' : 'Payment successful & Ads activated!');
        } catch (error) {
            console.error('Failed to submit Ads request:', error);
            toast.error(lang === 'da' ? 'Betaling mislykkedes' : 'Payment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#1D1D1F] mb-4">
                    {lang === 'da' ? 'Anmodning modtaget' : 'Request Received'}
                </h1>
                <p className="text-nexus-subtext text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                    {lang === 'da'
                        ? 'Vi har modtaget din anmodning om væksttjenester. Vores specialister vil gennemgå din profil og kontakte dig inden for 2 arbejdsdage.'
                        : 'We have received your request for growth services. Our specialists will review your profile and contact you within 2 working days.'}
                </p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-3 bg-[#1D1D1F] text-white rounded-xl font-semibold hover:bg-black transition-all"
                >
                    {lang === 'da' ? 'Gå tilbage' : 'Go back'}
                </button>
            </div>
        );
    }

    const renderPerformanceOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: lang === 'da' ? 'Eksponeringer' : 'Impressions', value: metrics?.impressions?.toLocaleString() || '0', change: '+14%', icon: Globe },
                    { label: lang === 'da' ? 'Klik' : 'Clicks', value: metrics?.clicks?.toLocaleString() || '0', change: '+8%', icon: MousePointer2 },
                    { label: lang === 'da' ? 'Konverteringer' : 'Conversions', value: metrics?.conversions?.toLocaleString() || '0', change: '+22%', icon: Target },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#1D1D1F]">
                                <stat.icon size={20} />
                            </div>
                            <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">{stat.change}</span>
                        </div>
                        <p className="text-nexus-subtext text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-[#1D1D1F]">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-lg text-[#1D1D1F]">{lang === 'da' ? 'Synlighedstrend' : 'Visibility Trend'}</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-nexus-subtext">Organic SEO</span>
                    </div>
                </div>
                <div className="h-48 flex items-end gap-2 px-2">
                    {(metrics?.trend || [20, 30, 25, 40, 35, 50, 45, 60, 55, 70]).map((h: number, i: number) => (
                        <div key={i} className="flex-1 bg-blue-500/10 rounded-t-lg relative group transition-all hover:bg-blue-500/20" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1D1D1F] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRecommendations = () => {
        const logs = metrics?.logs || [];

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1D1D1F]">{lang === 'da' ? 'Seneste optimeringer' : 'Recent Optimizations'}</h3>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {logs.length} {lang === 'da' ? 'Opdateringer' : 'Updates'}
                    </span>
                </div>

                {logs.length === 0 ? (
                    <div className="bg-gray-50 rounded-[2rem] p-10 text-center border border-dashed border-gray-200">
                        <TrendingUp className="mx-auto text-gray-300 mb-4" size={40} />
                        <p className="text-nexus-subtext font-medium italic">
                            {lang === 'da'
                                ? 'Vores eksperter arbejder på din sag. Opdateringer vil dukke op her.'
                                : 'Our experts are working on your case. Updates will appear here.'}
                        </p>
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                            <div className="flex items-start gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${log.type === 'ads' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {log.type === 'ads' ? <MousePointer2 size={24} /> : <Globe size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-[#1D1D1F] truncate group-hover:text-indigo-600 transition-colors">
                                            {log.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-nexus-subtext whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                                            {new Date(log.date).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-nexus-subtext leading-relaxed font-medium">
                                        {log.description}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            {lang === 'da' ? 'Gennemført' : 'Completed'}
                                        </div>
                                        <div className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            {log.type.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    const renderCampaignStatus = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-[#1D1D1F] mb-6">{lang === 'da' ? 'Aktive Kampagner' : 'Active Campaigns'}</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                <Search size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Local SEO Foundation</h4>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{lang === 'da' ? 'Aktiv' : 'Active'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[#1D1D1F]">1.000 DKK / md.</p>
                            <p className="text-[10px] text-nexus-subtext italic">Næste faktura: 01. mar</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">{lang === 'da' ? 'Klar til at skalere?' : 'Ready to scale?'}</h3>
                    <p className="text-indigo-100 mb-8 max-w-sm">
                        {lang === 'da'
                            ? 'Aktiver Google Ads og nå ud til flere kunder præcis når de søger.'
                            : 'Enable Google Ads and reach more customers exactly when they are searching.'}
                    </p>
                    <button
                        onClick={() => setActiveTab('ads')}
                        className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
                    >
                        {lang === 'da' ? 'Aktiver Ads nu' : 'Activate Ads now'}
                    </button>
                </div>
                <TrendingUp size={120} className="absolute -bottom-4 -right-4 text-white/10" />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-nexus-accent/5 rounded-full text-nexus-accent text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles size={14} />
                        {lang === 'da' ? 'SEO & Ads' : 'SEO & Ads'}
                    </div>
                    <h1 className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight mb-3">
                        {activeTab === 'overview' ? (lang === 'da' ? 'Performance Oversigt' : 'Performance Overview') :
                            activeTab === 'recommendations' ? (lang === 'da' ? 'Anbefalinger' : 'Recommendations') :
                                activeTab === 'status' ? (lang === 'da' ? 'Kampagne Status' : 'Campaign Status') :
                                    (lang === 'da' ? 'Vækst & Annoncering' : 'Growth & Advertising')}
                    </h1>
                    <p className="text-nexus-subtext text-lg max-w-2xl leading-relaxed">
                        {lang === 'da'
                            ? 'Professionel styring af din digitale tilstedeværelse. Skaler din forretning med gennemsigtige og datadrevne løsninger.'
                            : 'Professional management of your digital presence. Scale your business with transparent, data-driven solutions.'}
                    </p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {['overview', 'recommendations', 'status'].includes(activeTab) ? (
                        <>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#1D1D1F] text-white shadow-md' : 'text-nexus-subtext hover:text-nexus-text'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('recommendations')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'recommendations' ? 'bg-[#1D1D1F] text-white shadow-md' : 'text-nexus-subtext hover:text-nexus-text'}`}
                            >
                                Tips
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'seo' ? 'bg-[#1D1D1F] text-white shadow-md' : 'text-nexus-subtext hover:text-nexus-text'}`}
                            >
                                <Search size={16} />
                                SEO
                            </button>
                            <button
                                onClick={() => setActiveTab('ads')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ads' ? 'bg-[#1D1D1F] text-white shadow-md' : 'text-nexus-subtext hover:text-nexus-text'}`}
                            >
                                <TrendingUp size={16} />
                                Google Ads
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    {activeTab === 'overview' && renderPerformanceOverview()}
                    {activeTab === 'recommendations' && renderRecommendations()}
                    {activeTab === 'status' && renderCampaignStatus()}

                    {activeTab === 'seo' && (
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Search size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-[#1D1D1F]">
                                                {lang === 'da' ? 'Aktiver SEO-styring' : 'Activate SEO Management'}
                                            </h2>
                                            {selectedTier && selectedTier.includes('seo') && (
                                                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-200">
                                                    {getTierDetails(selectedTier).name} • {getTierDetails(selectedTier).price}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-nexus-subtext text-sm">
                                            {lang === 'da' ? 'Forbedr din organiske synlighed i Google.' : 'Improve your organic visibility in Google.'}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSeoSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest">
                                                    {lang === 'da' ? 'Hjemmeside URL' : 'Website URL'}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setSeoForm({ ...seoForm, website: 'findhaandvaerkeren.dk' })}
                                                    className="text-[10px] font-bold text-nexus-accent hover:underline"
                                                >
                                                    {lang === 'da' ? 'Brug demoside' : 'Use demo site'}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={seoForm.website}
                                                onChange={(e) => setSeoForm({ ...seoForm, website: e.target.value })}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                                placeholder="https://eksempel.dk"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                                {lang === 'da' ? 'Målområde' : 'Target Country'}
                                            </label>
                                            <input
                                                type="text"
                                                value={seoForm.country}
                                                onChange={(e) => setSeoForm({ ...seoForm, country: e.target.value })}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                            {lang === 'da' ? 'Søgeord eller Services' : 'Keywords or Services'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={seoForm.objectives}
                                            onChange={(e) => setSeoForm({ ...seoForm, objectives: e.target.value })}
                                            required
                                            placeholder={lang === 'da' ? 'Hvilke ydelser eller søgeord vil du findes på? (f.eks. Tømrer i Odense)' : 'What services or keywords do you want to be found for? (e.g., Plumber in London)'}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                            {lang === 'da' ? 'Geografiske Områder' : 'Target Locations'}
                                        </label>
                                        <input
                                            type="text"
                                            value={seoForm.areas}
                                            onChange={(e) => setSeoForm({ ...seoForm, areas: e.target.value })}
                                            required
                                            placeholder={lang === 'da' ? 'Byer, regioner eller hele landet' : 'Cities, regions, or nationwide'}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
                                                {lang === 'da' ? 'Vigtigste Konkurrenter' : 'Top Competitors'}
                                                <span className="text-[10px] font-medium text-nexus-subtext lowercase mt-0.5 tracking-normal italic opacity-60">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={seoForm.competitors}
                                                onChange={(e) => setSeoForm({ ...seoForm, competitors: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
                                                {lang === 'da' ? 'Prioriterede Sider' : 'Priority Pages'}
                                                <span className="text-[10px] font-medium text-nexus-subtext lowercase mt-0.5 tracking-normal italic opacity-60">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={seoForm.pages}
                                                onChange={(e) => setSeoForm({ ...seoForm, pages: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xl text-[#1D1D1F]">
                                                {selectedTier ? getTierDetails(selectedTier).price : '1.000'}
                                                <span className="text-sm font-medium text-nexus-subtext"> {lang === 'da' ? '' : ''}</span>
                                            </p>
                                            <p className="text-[10px] text-nexus-subtext">{lang === 'da' ? 'Ingen binding, opsig når som helst' : 'No binding, cancel anytime'}</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] shadow-xl hover:shadow-[#1D1D1F]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {lang === 'da' ? 'Bekræft & Aktiver' : 'Confirm & Activate'}
                                                    <ChevronRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ads' && (
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-[#1D1D1F]">
                                                {lang === 'da' ? 'Aktiver Google Ads' : 'Activate Google Ads'}
                                            </h2>
                                            {selectedTier && selectedTier.includes('ads') && (
                                                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold border border-amber-200">
                                                    {getTierDetails(selectedTier).name} • {getTierDetails(selectedTier).price}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-nexus-subtext text-sm">
                                            {lang === 'da' ? 'Skab trafik og leads med betalt annoncering.' : 'Drive traffic and leads with paid advertising.'}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleAdsSubmit} className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest">
                                                {lang === 'da' ? 'Hjemmeside URL' : 'Website URL'}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setAdsForm({ ...adsForm, website: 'findhaandvaerkeren.dk' })}
                                                className="text-[10px] font-bold text-nexus-accent hover:underline"
                                            >
                                                {lang === 'da' ? 'Brug demoside' : 'Use demo site'}
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={adsForm.website}
                                            onChange={(e) => setAdsForm({ ...adsForm, website: e.target.value })}
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                            placeholder="https://eksempel.dk"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                                {lang === 'da' ? 'Primært Mål' : 'Primary Goal'}
                                            </label>
                                            <select
                                                value={adsForm.goal}
                                                onChange={(e) => setAdsForm({ ...adsForm, goal: e.target.value })}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner appearance-none"
                                            >
                                                <option value="">{lang === 'da' ? 'Vælg mål' : 'Select a goal'}</option>
                                                <option value="leads">{lang === 'da' ? 'Flere henvendelser' : 'Get more leads'}</option>
                                                <option value="calls">{lang === 'da' ? 'Opkald direkte' : 'Get direct calls'}</option>
                                                <option value="traffic">{lang === 'da' ? 'Mere trafik til siden' : 'Website traffic'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                                {lang === 'da' ? 'Annoncebudget (mdl.)' : 'Ad Budget (Monthly)'}
                                            </label>
                                            <select
                                                value={adsForm.budget}
                                                onChange={(e) => setAdsForm({ ...adsForm, budget: e.target.value })}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner appearance-none"
                                            >
                                                <option value="">{lang === 'da' ? 'Vælg budgetområde' : 'Select range'}</option>
                                                <option value="2-5k">2.000 - 5.000 DKK</option>
                                                <option value="5-10k">5.000 - 10.000 DKK</option>
                                                <option value="10k+">10.000+ DKK</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-nexus-text uppercase tracking-widest mb-2 px-1">
                                            {lang === 'da' ? 'Målrettede Områder' : 'Target Locations'}
                                        </label>
                                        <input
                                            type="text"
                                            value={adsForm.locations}
                                            onChange={(e) => setAdsForm({ ...adsForm, locations: e.target.value })}
                                            required
                                            placeholder={lang === 'da' ? 'Byer eller regioner' : 'Cities or regions'}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent/20 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                        <label className="block text-sm font-bold text-[#1D1D1F]">
                                            {lang === 'da' ? 'Har du allerede en Google Ads konto?' : 'Do you already have a Google Ads account?'}
                                        </label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setAdsForm({ ...adsForm, hasAccount: 'yes' })}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${adsForm.hasAccount === 'yes' ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md' : 'bg-white text-nexus-subtext border-gray-200 hover:border-gray-300'}`}
                                            >
                                                {lang === 'da' ? 'Ja' : 'Yes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAdsForm({ ...adsForm, hasAccount: 'no' })}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border ${adsForm.hasAccount === 'no' ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md' : 'bg-white text-nexus-subtext border-gray-200 hover:border-gray-300'}`}
                                            >
                                                {lang === 'da' ? 'Nej, opret ny' : 'No, create new'}
                                            </button>
                                        </div>

                                        {adsForm.hasAccount === 'yes' && (
                                            <div className="pt-4 flex items-start gap-3">
                                                <div className="pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        id="confirmAccess"
                                                        checked={adsForm.confirmAccess}
                                                        onChange={(e) => setAdsForm({ ...adsForm, confirmAccess: e.target.checked })}
                                                        required
                                                        className="w-4 h-4 rounded border-gray-300 text-[#1D1D1F] focus:ring-[#1D1D1F]"
                                                    />
                                                </div>
                                                <label htmlFor="confirmAccess" className="text-xs text-nexus-subtext leading-relaxed">
                                                    {lang === 'da'
                                                        ? 'Jeg bekræfter, at jeg er villig til at give adgang til min Google Ads konto via e-mail invitation.'
                                                        : 'I confirm that I am willing to grant access to my Google Ads account via email invitation.'}
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xl text-[#1D1D1F]">
                                                {selectedTier ? getTierDetails(selectedTier).price : '1.000'}
                                                <span className="text-sm font-medium text-nexus-subtext"> {lang === 'da' ? '' : ''}</span>
                                            </p>
                                            <p className="text-[10px] text-nexus-subtext">{lang === 'da' ? '* Ekskl. forbrug til Google' : '* Excl. spend to Google'}</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] shadow-xl hover:shadow-[#1D1D1F]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {lang === 'da' ? 'Bekræft & Aktiver' : 'Confirm & Activate'}
                                                    <ChevronRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-lg">
                        <h3 className="font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                            <Info size={20} className="text-nexus-accent" />
                            {lang === 'da' ? 'Gode Grunde' : 'Service Philosophy'}
                        </h3>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex-shrink-0 flex items-center justify-center text-green-600">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-nexus-text mb-1">{lang === 'da' ? 'Ingen Binding' : 'No Long-term Contracts'}</h4>
                                    <p className="text-[11px] text-nexus-subtext leading-relaxed italic">
                                        {lang === 'da' ? 'Vi leverer resultater fremfor lange kontrakter.' : 'We focus on results rather than binding agreements.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-nexus-text mb-1">{lang === 'da' ? 'Gennemsigtighed' : 'Full Transparency'}</h4>
                                    <p className="text-[11px] text-nexus-subtext leading-relaxed italic">
                                        {lang === 'da' ? 'Du ejer alt data og adgang selv. Vi styrer det bare.' : 'You own all data and access. We simply manage it for you.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex-shrink-0 flex items-center justify-center text-purple-600">
                                    <MousePointer2 size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-nexus-text mb-1">{lang === 'da' ? 'Faste Priser' : 'Predictable Pricing'}</h4>
                                    <p className="text-[11px] text-nexus-subtext leading-relaxed italic">
                                        {lang === 'da' ? 'Altid fast lav pris på 1.000 DKK uden skjulte gebyrer.' : 'Always a flat fee of 1,000 DKK with no hidden costs.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-5 bg-nexus-bg rounded-2xl border border-nexus-accent/10">
                            <div className="flex items-center gap-2 text-nexus-accent mb-2">
                                <AlertCircle size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'da' ? 'Realistiske mål' : 'Realistic goals'}</span>
                            </div>
                            <p className="text-[10px] text-nexus-subtext italic leading-relaxed">
                                {lang === 'da' ? 'Vi lover ikke 1. pladser eller urealistiske ROAS, men vi lover hårdt arbejde og professionel vejledning.' : 'We don\'t promise #1 rankings or unrealistic ROAS, but we do promise hard work and professional guidance.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1D1D1F] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                                <Globe size={20} className="text-nexus-accent" />
                                {lang === 'da' ? 'Hvem styrer det?' : 'Expert Support'}
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                {lang === 'da'
                                    ? 'Alle opgaver udføres af specialiserede Google-håndværkere med mange års erfaring i det danske marked.'
                                    : 'All tasks are executed by specialized Google experts with years of experience in the Nordic market.'}
                            </p>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <img
                                        key={i}
                                        src={`https://i.pravatar.cc/150?u=${i}`}
                                        className="w-10 h-10 rounded-full border-2 border-[#1D1D1F] shadow-lg"
                                        alt="Team"
                                    />
                                ))}
                                <div className="w-10 h-10 rounded-full bg-nexus-accent border-2 border-[#1D1D1F] flex items-center justify-center text-[10px] font-bold shadow-lg">
                                    +12
                                </div>
                            </div>
                        </div>
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-nexus-accent/5 rounded-full -mr-24 -mt-24 blur-3xl transition-all duration-1000 group-hover:bg-nexus-accent/10" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthDashboard;
