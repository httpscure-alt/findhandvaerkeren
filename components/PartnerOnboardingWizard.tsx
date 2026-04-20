import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { Language, SelectedPlan, ViewState } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { CATEGORY_LIST, DANISH_CITIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import Pricing from './Pricing';
import { FileUpload } from './common/FileUpload';
import { useLocation, useNavigate } from 'react-router-dom';

interface PartnerOnboardingWizardProps {
  lang: Language;
  currentStep: number;
  onNavigate: (view: ViewState) => void;
  onComplete: () => void;
  forceReplay?: boolean;
  forceStep?: number;
}

const PartnerOnboardingWizard: React.FC<PartnerOnboardingWizardProps> = ({ lang, currentStep: propStep, onNavigate, onComplete, forceReplay, forceStep }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const replayParams = React.useMemo(() => {
    const rawSearch =
      (location && typeof location.search === 'string' ? location.search : '') ||
      (typeof window !== 'undefined' ? window.location.search : '');
    const params = new URLSearchParams(rawSearch);
    const allowReplay = params.has('replay');
    const stepParam = params.get('step');
    const nextStep = stepParam ? Math.max(1, Math.min(5, Number(stepParam))) : 5;
    return {
      allowReplay: !!forceReplay || allowReplay,
      nextStep: Number.isFinite(forceStep as number)
        ? Math.max(1, Math.min(5, Number(forceStep)))
        : (Number.isFinite(nextStep) ? nextStep : 5),
    };
  }, [location, forceReplay, forceStep]);

  const [currentStep, setCurrentStep] = useState(() => {
    if (replayParams.allowReplay) return replayParams.nextStep;
    return propStep || 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(() => {
    try {
      const raw = localStorage.getItem('selectedPlan');
      return raw ? (JSON.parse(raw) as SelectedPlan) : null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    address: '',
    cvrNumber: '',
    website: '',
    phone: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: user?.email || '',
  });

  const t = translations[lang];
  const categoryNames = (translations[lang] as any).categoryNames || {};

  const visibleCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return CATEGORY_LIST;
    return CATEGORY_LIST.filter((cat) => {
      const label = (categoryNames[cat.id] || cat.id) as string;
      return label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q);
    });
  }, [categoryQuery, categoryNames]);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (replayParams.allowReplay) {
          setCurrentStep(replayParams.nextStep);
          return;
        }

        const status = await api.getOnboardingStatus();
        if (status.onboardingCompleted) {
          onComplete();
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      }
    };
    checkOnboarding();
  }, [location.search, replayParams.allowReplay, replayParams.nextStep, onComplete]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Frontend guardrails (must also be validated server-side)
      if (!formData.name.trim()) {
        throw new Error(lang === 'da' ? 'Virksomhedsnavn er påkrævet' : 'Company name is required');
      }
      if (formData.cvrNumber.replace(/\D/g, '').length !== 8) {
        throw new Error(lang === 'da' ? 'CVR-nummer skal være 8 cifre' : 'CVR number must be 8 digits');
      }
      if (formData.phone.replace(/\D/g, '').length < 8) {
        throw new Error(lang === 'da' ? 'Telefonnummer er påkrævet' : 'Phone number is required');
      }

      // 1. Save Basic Info
      await api.saveOnboardingStep1({
        name: formData.name,
        category: formData.category,
        location: formData.location,
        address: formData.address,
        contactEmail: formData.contactEmail,
        website: formData.website,
        phone: formData.phone,
        cvrNumber: formData.cvrNumber,
      });

      // 2. Save Description
      await api.saveOnboardingStep2({
        shortDescription: formData.description.slice(0, 150),
        description: formData.description,
      });

      // 3. Save Images
      await api.saveOnboardingStep3({
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        gallery: [],
      });

      // 4. Complete Onboarding
      const completed = await api.completeOnboarding();
      if (completed?.company) {
        try {
          localStorage.setItem('partnerCompanyCache', JSON.stringify(completed.company));
        } catch {
          // ignore
        }
      }

      // After onboarding, route the user based on what they chose.
      // - Growth services: go to growth dashboard (existing behavior via onComplete)
      // - Platform plan selected: go to billing/checkout
      const hasSelectedGrowth = !!localStorage.getItem('selectedGrowthServices');
      if (hasSelectedGrowth) {
        onComplete();
        return;
      }

      const plan = selectedPlan;
      if (plan) {
        // Use full reload to avoid race with guarded routes that depend on company availability.
        window.location.href = `/dashboard/billing?plan=${encodeURIComponent(plan.id)}&period=${encodeURIComponent(plan.billingPeriod)}`;
        return;
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-[#F5F5F7] px-8 py-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Opret din virksomhed' : 'List your business'}
            </h2>
            <span className="text-sm font-bold text-[#1D1D1F] px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
              {currentStep} / 5
            </span>
          </div>
          {replayParams.allowReplay && (
            <div className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              {lang === 'da' ? 'Replay mode' : 'Replay mode'}
            </div>
          )}
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D1D1F] transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Business Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1D1D1F]">{lang === 'da' ? 'Virksomhedsoplysninger' : 'Business Information'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'Virksomhedsnavn' : 'Company Name'}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                    placeholder="F.eks. Mesterbyg ApS"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'CVR-nummer' : 'CVR Number'}</label>
                  <input
                    type="text"
                    value={formData.cvrNumber}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFormData({ ...formData, cvrNumber: digits });
                    }}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                    placeholder="12345678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'Telefon' : 'Phone'}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
                      setFormData({ ...formData, phone: digits });
                    }}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'Hjemmeside' : 'Website'}</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                    placeholder="eksempel.dk"
                  />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!formData.name || formData.cvrNumber.length !== 8 || formData.phone.length < 8}
                  className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30"
                >
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Categories */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1D1D1F]">{lang === 'da' ? 'Vælg din kategori' : 'Select your category'}</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">
                  {lang === 'da' ? 'Søg kategori' : 'Search category'}
                </label>
                <input
                  type="text"
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                  placeholder={lang === 'da' ? 'Skriv fx “VVS” eller “Maler”' : 'Type e.g. “Plumber” or “Painter”'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.category === cat.id
                      ? 'border-[#1D1D1F] bg-[#1D1D1F]/5 ring-4 ring-[#1D1D1F]/5'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                  >
                    <div className={`font-bold text-lg ${formData.category === cat.id ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                      {categoryNames[cat.id] || cat.id}
                    </div>
                  </button>
                ))}
              </div>
              {visibleCategories.length === 0 && (
                <div className="text-sm text-gray-500">
                  {lang === 'da' ? 'Ingen kategorier matcher din søgning.' : 'No categories match your search.'}
                </div>
              )}
              <div className="pt-8 flex justify-between">
                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                  <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button onClick={handleNext} disabled={!formData.category} className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30">
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1D1D1F]">{lang === 'da' ? 'Hvor findes din virksomhed?' : 'Where is your business located?'}</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'By' : 'City'}</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium appearance-none"
                    required
                  >
                    <option value="">{lang === 'da' ? 'Vælg by...' : 'Select city...'}</option>
                    {DANISH_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'Adresse' : 'Address'}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                  />
                </div>
              </div>
              <div className="pt-8 flex justify-between">
                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                  <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button onClick={handleNext} disabled={!formData.location} className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30">
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Profile Preview */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1D1D1F]">{lang === 'da' ? 'Forhåndsvisning af din profil' : 'Profile Preview'}</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1D1D1F] uppercase tracking-tight">{lang === 'da' ? 'Beskrivelse' : 'Description'}</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1D1D1F] font-medium"
                    placeholder={lang === 'da' ? 'Beskriv din virksomhed...' : 'Describe your business...'}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FileUpload
                      label={lang === 'da' ? 'Logo' : 'Logo'}
                      lang={lang}
                      currentUrl={formData.logoUrl}
                      onUpload={async (file) => {
                        const result = await api.uploadImage(file);
                        setFormData({ ...formData, logoUrl: result.imageUrl });
                        return result.imageUrl;
                      }}
                      accept="image/*"
                      maxSize={2}
                    />
                  </div>
                  <div className="space-y-2">
                     <FileUpload
                      label={lang === 'da' ? 'Banner Billede' : 'Banner Image'}
                      lang={lang}
                      currentUrl={formData.bannerUrl}
                      onUpload={async (file) => {
                        const result = await api.uploadImage(file);
                        setFormData({ ...formData, bannerUrl: result.imageUrl });
                        return result.imageUrl;
                      }}
                      accept="image/*"
                      maxSize={5}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex justify-between">
                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                  <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button onClick={handleNext} className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Pricing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {localStorage.getItem('selectedGrowthServices') ? (
                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl text-center mb-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm border border-indigo-100">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">
                    {lang === 'da' ? 'Klar til vækst?' : 'Ready for growth?'}
                  </h3>
                  <p className="text-indigo-700/80 text-sm mb-6 max-w-sm mx-auto italic font-medium">
                    {lang === 'da'
                      ? 'Da du har valgt vores væksttjenester (SEO & Ads), kan du springe platform-abonnementet over for nu og gå direkte til opsætningen.'
                      : 'Since you selected our growth services (SEO & Ads), you can skip the platform subscription for now and go straight to setup.'}
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mx-auto"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : (lang === 'da' ? 'Gå direkte til Vækst Center' : 'Go directly to Growth Hub')}
                    {!isLoading && <ArrowRight size={24} />}
                  </button>
                  <div className="mt-8 border-t border-indigo-100 pt-8">
                    <p className="text-xs text-indigo-900/50 font-bold uppercase tracking-widest mb-4">
                      {lang === 'da' ? 'Eller vælg en platform-plan' : 'Or select a platform plan'}
                    </p>
                    <Pricing
                      lang={lang}
                      isEmbedded={true}
                      selectedPlan={selectedPlan}
                      onSelectPlan={(plan) => {
                        setSelectedPlan(plan);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-[#1D1D1F] text-center mb-8">{lang === 'da' ? 'Vælg den rette plan for dig' : 'Select the right plan for you'}</h3>
                  <Pricing
                    lang={lang}
                    isEmbedded={true}
                    selectedPlan={selectedPlan}
                    onSelectPlan={(plan) => {
                      setSelectedPlan(plan);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </>
              )}
              <div className="pt-8 flex justify-between">
                <button onClick={handleBack} className="px-8 py-4 text-[#86868B] font-bold hover:text-[#1D1D1F] transition-all flex items-center gap-2">
                  <ArrowLeft size={20} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                {!localStorage.getItem('selectedGrowthServices') ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedPlan}
                    className="px-10 py-4 bg-[#1D1D1F] text-white rounded-2xl font-extrabold text-lg flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-30"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : (lang === 'da' ? 'Næste' : 'Next')}
                    {!isLoading && <ArrowRight size={20} />}
                  </button>
                ) : null}
              </div>
              {!localStorage.getItem('selectedGrowthServices') && !selectedPlan && (
                <p className="text-sm text-gray-500 text-center">
                  {lang === 'da' ? 'Vælg en plan for at fortsætte til betaling.' : 'Select a plan to continue to payment.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboardingWizard;
