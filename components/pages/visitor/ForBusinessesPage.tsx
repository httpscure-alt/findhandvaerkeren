
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    Zap, 
    ArrowRight, 
    CheckCircle2, 
    Star, 
    Trophy,
    TrendingUp
} from 'lucide-react';
import { Language } from '../../../types';
import Pricing from '../../Pricing';

interface ForBusinessesPageProps {
    lang: Language;
}

const ForBusinessesPage: React.FC<ForBusinessesPageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const isDa = lang === 'da';

    return (
        <div className="bg-white">
            {/* HER0 - Community Focus */}
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-[#FBFBFD] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Users size={14} />
                        {isDa ? 'Danmarks største håndværker community' : "Denmark's largest craftsman community"}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
                        {isDa 
                            ? 'Få din virksomhed på kortet' 
                            : 'Get your business on the map'}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#86868B] mb-10 leading-relaxed font-medium">
                        {isDa
                            ? 'Bliv fundet af tusindvis af kunder hver måned. Enkel profil, manuel verificering, flere opgaver.'
                            : 'Be found by thousands of customers every month. Simple profile, manual verification, more jobs.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup?role=PARTNER')}
                            className="w-full sm:w-auto px-10 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold text-lg hover:bg-black hover:-translate-y-0.5 shadow-lg transition-all"
                        >
                            {isDa ? 'Opret profil nu' : 'Create profile now'}
                        </button>
                        <button
                            onClick={() => {
                                const el = document.getElementById('plans');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto px-10 py-4 bg-white text-[#1D1D1F] border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-gray-200 transition-all"
                        >
                            {isDa ? 'Se priser' : 'See pricing'}
                        </button>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-green-100 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-blue-100 rounded-full blur-[100px]" />
                </div>
            </section>

            {/* VALUE PROPS */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: ShieldCheck,
                                title: isDa ? 'Verificeret Tillid' : 'Verified Trust',
                                desc: isDa ? 'Vi verificerer din virksomhed manuelt, så kunderne ved, du er til at stole på.' : 'We verify your business manually, so customers know you are trustworthy.'
                            },
                            {
                                icon: Zap,
                                title: isDa ? 'Direkte Leads' : 'Direct Leads',
                                desc: isDa ? 'Modtag henvendelser direkte i din indbakke uden mellemmands-gebyrer.' : 'Receive inquiries directly in your inbox without middleman fees.'
                            },
                            {
                                icon: Trophy,
                                title: isDa ? 'Maksimal Synlighed' : 'Maximum Visibility',
                                desc: isDa ? 'Vores Guld-plan placerer dig øverst i søgeresultaterne i dit lokalområde.' : 'Our Gold plan places you at the top of search results in your local area.'
                            }
                        ].map((prop, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1D1D1F] mx-auto mb-6 group-hover:scale-110 transition-transform border border-gray-100">
                                    <prop.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-[#1D1D1F] mb-3">{prop.title}</h3>
                                <p className="text-[#86868B] leading-relaxed font-medium">{prop.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING EMBED */}
            <section id="plans" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] mb-6">
                            {isDa ? 'Vælg din plan' : 'Choose your plan'}
                        </h2>
                        <p className="text-[#86868B] font-medium max-w-2xl mx-auto">
                            {isDa 
                                ? 'Enkel prissætning. Ingen binding. Alt du skal bruge for at få flere kunder.' 
                                : 'Simple pricing. No commitment. Everything you need to get more customers.'}
                        </p>
                    </div>
                    <Pricing lang={lang} isEmbedded={true} onSelectPlan={(plan) => navigate(`/signup?role=PARTNER&plan=${plan.id}`)} />
                </div>
            </section>

            {/* CROSS-SELL TO MARKETING */}
            <section className="py-24 bg-[#1D1D1F] text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-white/5 rounded-[3rem] p-8 md:p-16 border border-white/10 backdrop-blur-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                                    <TrendingUp size={14} />
                                    {isDa ? 'Næste niveau vækst' : 'Next level growth'}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                    {isDa ? 'Vil du dominere markedet?' : 'Want to dominate the market?'}
                                </h2>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    {isDa 
                                        ? 'Vores professionelle Google Ads & SEO tjenester er designet til virksomheder, der ønsker eksplosiv vækst.' 
                                        : 'Our professional Google Ads & SEO services are designed for businesses looking for explosive growth.'}
                                </p>
                                <button
                                    onClick={() => navigate('/marketing')}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    {isDa ? 'Se Markedsføringstjenester' : 'See Marketing Services'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="relative">
                                <div className="bg-white/10 aspect-video rounded-3xl border border-white/10 flex items-center justify-center p-8">
                                    <div className="space-y-4 w-full">
                                        <div className="h-4 w-3/4 bg-white/20 rounded" />
                                        <div className="h-4 w-1/2 bg-white/10 rounded" />
                                        <div className="h-12 w-full bg-blue-500/30 rounded-xl mt-8 flex items-center px-4">
                                            <div className="h-2 w-32 bg-blue-400 rounded" />
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Badges */}
                                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-2xl shadow-xl animate-bounce">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bg Glow */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full" />
            </section>
        </div>
    );
};

export default ForBusinessesPage;
