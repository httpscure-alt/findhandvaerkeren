import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, MapPin, Tag, FileText, Camera, X, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Language } from '../../types';
import { CORE_CATEGORIES } from '../../constants';
import { translations } from '../../translations';

interface Get3QuotesPageProps {
    lang: Language;
}

export default function Get3QuotesPage({ lang }: Get3QuotesPageProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const t = translations[lang];
    const categoryNames = t.categoryNames as Record<string, string>;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        postalCode: '',
        images: [] as string[],
        guestName: '',
        guestEmail: '',
        guestPhone: '',
    });

    const totalSteps = user ? 3 : 4;

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await api.getCategories();
            if (res && res.categories) {
                setCategories(res.categories);
            }
        } catch (err) {
            console.error('Failed to load categories', err);
            toast.error(lang === 'da' ? 'Kunne ikke indlæse kategorier' : 'Failed to load categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && !formData.category) return;
        if (step === 2 && (!formData.title || !formData.description || !formData.postalCode)) return;
        if (!user && step === 3 && (!formData.guestName || !formData.guestEmail || !formData.guestPhone)) return;
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.createJobRequest({
                ...formData,
                ...(!user && {
                    guestName: formData.guestName,
                    guestEmail: formData.guestEmail,
                    guestPhone: formData.guestPhone,
                }),
            });

            setSubmitted(true);
            toast.success(lang === 'da' ? 'Din anmodning er sendt!' : 'Your request has been submitted!');

            if (user) {
                setTimeout(() => navigate('/dashboard/my-jobs'), 3000);
            }
        } catch (err) {
            console.error(err);
            toast.error(lang === 'da' ? 'Kunne ikke indsende anmodning' : 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const maxFiles = 3;
        const maxSize = 2 * 1024 * 1024;

        if (formData.images.length + files.length > maxFiles) {
            toast.error(lang === 'da' ? `Max ${maxFiles} filer` : `Max ${maxFiles} files`);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > maxSize) continue;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64]
                }));
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const getProgressPercent = () => {
        return (step / totalSteps) * 100;
    };

    const isReviewStep = () => user ? step === 3 : step === 4;
    const isContactStep = () => !user && step === 3;

    if (submitted) {
        return (
            <div className="min-h-screen bg-white pt-32 pb-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1D1D1F] mb-4">
                        {lang === 'da' ? 'Anmodning sendt!' : 'Request Sent!'}
                    </h1>
                    <p className="text-lg text-[#86868B] mb-10 max-w-md mx-auto">
                        {lang === 'da'
                            ? 'Vi har modtaget din anmodning. Inden for kort tid vil du modtage op til 3 uforpligtende tilbud fra verificerede håndværkere.'
                            : "We've received your request. You'll soon receive up to 3 non-binding quotes from verified professionals."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black transition-all">
                            {lang === 'da' ? 'Gå til forsiden' : 'Go to Homepage'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header & Progress */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                                {lang === 'da' ? 'Få 3 uforpligtende tilbud' : 'Get 3 free quotes'}
                            </h1>
                            <p className="text-[#86868B] font-medium mt-1">
                                {lang === 'da' ? 'Det tager under 2 minutter' : 'Takes less than 2 minutes'}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-[#1D1D1F]">{step} / {totalSteps}</span>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#1D1D1F] transition-all duration-500 ease-out"
                            style={{ width: `${getProgressPercent()}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 md:p-12">
                    {/* Step 1: Category */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-8">
                                {lang === 'da' ? 'Hvilken type opgave drejer det sig om?' : 'What kind of job is it?'}
                            </h2>

                            {categoriesLoading ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {CORE_CATEGORIES.map((category) => {
                                        const isSelected = formData.category === category;
                                        const displayName = categoryNames[category];
                                        if (!displayName) return null;

                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setFormData({ ...formData, category: category })}
                                                className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 transform ${isSelected
                                                    ? 'border-[#1D1D1F] bg-[#1D1D1F]/5 shadow-md -translate-y-1'
                                                    : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-lg'
                                                    }`}
                                            >
                                                <div className={`font-bold text-lg ${isSelected ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                                    {displayName}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.category}
                                    className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-30 disabled:transform-none disabled:shadow-none"
                                >
                                    {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="animate-fadeIn space-y-8">
                            <h2 className="text-2xl font-bold text-[#1D1D1F]">
                                {lang === 'da' ? 'Beskriv opgaven kort' : 'Describe the task'}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">{lang === 'da' ? 'Titel på opgaven' : 'Job Title'}</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                        placeholder={lang === 'da' ? 'F.eks. Maling af stue' : 'E.g. Painting living room'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">{lang === 'da' ? 'Beskrivelse' : 'Description'}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                        placeholder={lang === 'da' ? 'Beskriv hvad der skal laves...' : 'Describe what needs to be done...'}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">{lang === 'da' ? 'Postnummer' : 'Postal Code'}</label>
                                        <input
                                            type="text"
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                            placeholder="2100"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="cursor-pointer w-full px-6 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 hover:border-[#1D1D1F] transition-all">
                                            <Camera size={20} className="text-[#86868B]" />
                                            <span className="text-sm font-bold text-[#86868B]">{lang === 'da' ? 'Vedhæft' : 'Attach'}</span>
                                            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between">
                                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                                    <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.title || !formData.description || !formData.postalCode}
                                    className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30"
                                >
                                    {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact (Guests only) */}
                    {isContactStep() && (
                        <div className="animate-fadeIn space-y-8">
                            <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                                <p className="text-sm text-blue-800 font-medium">
                                    {lang === 'da'
                                        ? 'Dine oplysninger er sikre. Vi deler dem kun med de 3 håndværkere, der bliver matchet med din opgave.'
                                        : 'Your info is secure. We only share it with the 3 professionals matched with your job.'}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">{lang === 'da' ? 'Dit fulde navn' : 'Your Full Name'}</label>
                                    <input
                                        type="text"
                                        value={formData.guestName}
                                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">Email</label>
                                        <input
                                            type="email"
                                            value={formData.guestEmail}
                                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[#1D1D1F] mb-2 uppercase tracking-tight">{lang === 'da' ? 'Telefon' : 'Phone'}</label>
                                        <input
                                            type="tel"
                                            value={formData.guestPhone}
                                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between">
                                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                                    <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.guestName || !formData.guestEmail || !formData.guestPhone}
                                    className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30"
                                >
                                    {lang === 'da' ? 'Gennemse' : 'Review'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Final Step: Review */}
                    {isReviewStep() && (
                        <div className="animate-fadeIn space-y-8">
                            <h2 className="text-2xl font-bold text-[#1D1D1F]">
                                {lang === 'da' ? 'Tjek oplysningerne en sidste gang' : 'One last look at your details'}
                            </h2>

                            <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{lang === 'da' ? 'Kategori' : 'Category'}</span>
                                        <p className="font-bold text-[#1D1D1F] text-lg">
                                            {(() => {
                                                const cat = categories.find(c => (c.slug === formData.category || c.name.toLowerCase().replace(/\s+/g, '-') === formData.category));
                                                return cat ? (categoryNames[cat.name] || cat.name) : formData.category;
                                            })()}
                                        </p>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] underline">{lang === 'da' ? 'Ret' : 'Edit'}</button>
                                </div>

                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{lang === 'da' ? 'Opgave & Sted' : 'Job & Location'}</span>
                                        <p className="font-bold text-[#1D1D1F]">{formData.title}</p>
                                        <p className="text-sm text-[#86868B] font-medium line-clamp-2">{formData.description}</p>
                                        <div className="flex items-center gap-1 text-[#1D1D1F] font-bold mt-2">
                                            <MapPin size={14} /> <span>{formData.postalCode}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(2)} className="text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] underline">{lang === 'da' ? 'Ret' : 'Edit'}</button>
                                </div>

                                {!user && (
                                    <div className="flex justify-between items-start pt-6 border-t border-gray-100">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{lang === 'da' ? 'Kontakt' : 'Contact'}</span>
                                            <p className="font-bold text-[#1D1D1F]">{formData.guestName}</p>
                                            <p className="text-sm text-[#86868B] font-medium">{formData.guestEmail} · {formData.guestPhone}</p>
                                        </div>
                                        <button onClick={() => setStep(3)} className="text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] underline">{lang === 'da' ? 'Ret' : 'Edit'}</button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-5 bg-[#1D1D1F] text-white rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] shadow-xl"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {lang === 'da' ? 'Indsend og få tilbud' : 'Submit and Get Quotes'}
                                        <ArrowRight size={22} />
                                    </>
                                )}
                            </button>

                            <button onClick={handleBack} className="w-full text-center text-sm font-bold text-[#86868B] hover:text-[#1D1D1F] transition-all">
                                {lang === 'da' ? 'Gå tilbage' : 'Go back'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-[0.2em]">
                        {lang === 'da' ? '✓ Ingen forpligtelse · ✓ 100% Gratis · ✓ Verificerede håndværkere' : '✓ No Obligation · ✓ 100% Free · ✓ Verified Professionals'}
                    </p>
                </div>
            </div>
        </div>
    );
}
