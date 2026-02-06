
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

interface ForBusinessesPageProps {
    lang: Language;
}

const ForBusinessesPage: React.FC<ForBusinessesPageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const isDa = lang === 'da';

    // 3. Selection Logic
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const totalPrice = selectedServices.length * 1000;

    const scrollToServices = () => {
        const element = document.getElementById('growth-services');
        element?.scrollIntoView({ behavior: 'smooth' });
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
                            ? 'Vælg de vækstværktøjer du har brug for. Fast pris, ingen binding og fuld gennemsigtighed.'
                            : 'Select the growth tools you need. Flat-fee, no binding, and full transparency.'}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6">
                        <button
                            onClick={scrollToServices}
                            className="w-full sm:w-auto px-10 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} />
                            {isDa ? 'Vælg væksttjenester' : 'Select growth services'}
                        </button>

                        <p className="text-xs font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {isDa ? 'Tilgængelig for verificerede fagfolk' : 'Available for verified professionals'}
                        </p>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-blue-100 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-100 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* 3. SERVICES SECTION */}
            <section id="growth-services" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-4">
                            {isDa ? 'Vækst-værktøjskasse' : 'Growth Toolkit'}
                        </h2>
                        <p className="text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
                            {isDa
                                ? 'Automatiserede og administrerede tjenester designet til at øge din digitale synlighed.'
                                : 'Automated and managed services designed to boost your digital visibility.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                        {/* 3.1 Local SEO Product */}
                        <div
                            onClick={() => toggleService('seo')}
                            className={`p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedServices.includes('seo')
                                ? 'bg-blue-50/30 border-blue-500 shadow-lg'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all ${selectedServices.includes('seo') ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 shadow-sm'
                                }`}>
                                <Search size={28} />
                            </div>

                            {selectedServices.includes('seo') && (
                                <div className="absolute top-6 right-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                                    <Check size={20} strokeWidth={3} />
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-[#1D1D1F] mb-4">
                                {isDa ? 'Lokal SEO Management' : 'Local SEO Management'}
                            </h3>
                            <p className="text-[#86868B] mb-8 leading-relaxed">
                                {isDa
                                    ? 'Optimering af Google Business Profile og Maps for at sikre, at kunder i dit nærområde finder dig først.'
                                    : 'Optimization of Google Business Profile and Maps to ensure customers in your local area find you first.'}
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    { t: isDa ? 'Google Maps optimering' : 'Google Maps optimization' },
                                    { t: isDa ? 'Lokal søgeordsmonitorering' : 'Local keyword monitoring' },
                                    { t: isDa ? 'Månedlig performance-rapport' : 'Monthly performance report' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-[#1D1D1F]">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        {item.t}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${selectedServices.includes('seo')
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-[#1D1D1F] border border-gray-200 group-hover:bg-[#1D1D1F] group-hover:text-white group-hover:border-[#1D1D1F]'
                                }`}>
                                {selectedServices.includes('seo')
                                    ? (isDa ? 'Valgt' : 'Selected')
                                    : (isDa ? 'Tilføj Lokal SEO — 1.000 DKK / md.' : 'Add Local SEO — 1.000 DKK / month')}
                            </button>
                        </div>

                        {/* 3.2 Google Ads Product */}
                        <div
                            onClick={() => toggleService('ads')}
                            className={`p-10 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group ${selectedServices.includes('ads')
                                ? 'bg-[#1D1D1F] border-[#1D1D1F] shadow-2xl text-white'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all ${selectedServices.includes('ads') ? 'bg-white text-[#1D1D1F]' : 'bg-white text-blue-600 shadow-sm'
                                }`}>
                                <TrendingUp size={28} />
                            </div>

                            {selectedServices.includes('ads') && (
                                <div className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1D1D1F] animate-in zoom-in duration-300">
                                    <Check size={20} strokeWidth={3} />
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-4 ${selectedServices.includes('ads') ? 'text-white' : 'text-[#1D1D1F]'}`}>
                                {isDa ? 'Google Ads Management' : 'Google Ads Management'}
                            </h3>
                            <p className={selectedServices.includes('ads') ? 'text-gray-400' : 'text-[#86868B]' + ' mb-8 leading-relaxed'}>
                                {isDa
                                    ? 'Betalt annoncering rettet mod kunder med høj købsintention. Vi administrerer dit budget effektivt.'
                                    : 'Paid advertising targeted at customers with high purchase intent. We manage your budget efficiently.'}
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    { t: isDa ? 'Strategisk budlægning' : 'Strategic bidding' },
                                    { t: isDa ? 'Annonceovervågning' : 'Ad monitoring' },
                                    { t: isDa ? 'Konverteringssporing' : 'Conversion tracking' }
                                ].map((item, i) => (
                                    <li key={i} className={`flex items-center gap-3 text-sm font-medium ${selectedServices.includes('ads') ? 'text-white/90' : 'text-[#1D1D1F]'}`}>
                                        <CheckCircle2 size={16} className={selectedServices.includes('ads') ? 'text-blue-400' : 'text-green-500'} />
                                        {item.t}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${selectedServices.includes('ads')
                                ? 'bg-white text-[#1D1D1F]'
                                : 'bg-white text-[#1D1D1F] border border-gray-200 group-hover:bg-[#1D1D1F] group-hover:text-white group-hover:border-[#1D1D1F]'
                                }`}>
                                {selectedServices.includes('ads')
                                    ? (isDa ? 'Valgt' : 'Selected')
                                    : (isDa ? 'Tilføj Google Ads — 1.000 DKK / md.' : 'Add Google Ads — 1.000 DKK / month')}
                            </button>
                        </div>
                    </div>

                    {/* 4. CONFIRMATION STEP */}
                    {selectedServices.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
                            <div className="bg-gray-50 rounded-[2rem] border border-gray-200 p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <ShoppingCart size={80} />
                                </div>
                                <h3 className="text-xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-2">
                                    <ShieldCheck className="text-blue-500" />
                                    {isDa ? 'Oversigt over valgte tjenester' : 'Overview of selected services'}
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {selectedServices.map(service => (
                                        <div key={service} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#1D1D1F]">
                                                    {service === 'seo' ? <Search size={16} /> : <TrendingUp size={16} />}
                                                </div>
                                                <span className="font-bold text-[#1D1D1F]">
                                                    {service === 'seo' ? (isDa ? 'Lokal SEO' : 'Local SEO') : 'Google Ads'}
                                                </span>
                                            </div>
                                            <span className="font-medium text-nexus-subtext text-sm">1.000 DKK / md.</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-200">
                                    <div>
                                        <p className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-1">
                                            {isDa ? 'Samlet månedlig pris' : 'Total monthly total'}
                                        </p>
                                        <p className="text-3xl font-black text-[#1D1D1F]">
                                            {totalPrice.toLocaleString()} DKK
                                            <span className="text-sm font-normal text-nexus-subtext ml-2">/ md. ex. moms</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isAuthenticated) {
                                                // If already logged in, save services and go to dashboard
                                                if (selectedServices.length > 0) {
                                                    localStorage.setItem('selectedGrowthServices', selectedServices.join(','));
                                                }

                                                if (user?.role === 'PARTNER') {
                                                    const firstService = selectedServices[0] || 'seo';
                                                    navigate(`/dashboard/growth?tab=${firstService === 'seo' ? 'seo' : 'ads'}`);
                                                } else {
                                                    navigate('/dashboard');
                                                }
                                            } else {
                                                navigate(`/signup?services=${selectedServices.join(',')}`);
                                            }
                                        }}
                                        className="w-full md:w-auto px-10 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {isDa ? 'Aktivér tjenester' : 'Activate services'}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>

                                <p className="mt-6 text-xs text-nexus-subtext text-center italic">
                                    {isDa
                                        ? '* Annonceforbrug betales direkte til Google. Ingen bindingsperiode.'
                                        : '* Ad spend paid directly to Google. No binding period.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. PROCESS SECTION (REFACTORED) */}
            <section className="py-24 bg-gray-50">
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

            {/* ELIGIBILITY SECTION */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-6">
                        {isDa ? 'Klar til at aktivere vækst?' : 'Ready to activate growth?'}
                    </h2>
                    <p className="text-[#86868B] text-lg mb-10 leading-relaxed">
                        {isDa
                            ? 'Vælg de tjenester der passer til din virksomhed ovenfor og kom i gang med det samme.'
                            : 'Select the services that suit your business above and get started immediately.'}
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={scrollToServices}
                            className="px-12 py-5 bg-[#1D1D1F] text-white rounded-xl font-bold text-xl hover:bg-black hover:shadow-2xl transition-all"
                        >
                            {isDa ? 'Gå til tjenester' : 'Go to services'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForBusinessesPage;
