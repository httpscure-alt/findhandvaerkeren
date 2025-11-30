import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Language, ViewState } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { CATEGORIES } from '../constants';

interface PartnerOnboardingWizardProps {
  lang: Language;
  currentStep: number;
  onNavigate: (view: ViewState) => void;
  onComplete: () => void;
}

const PartnerOnboardingWizard: React.FC<PartnerOnboardingWizardProps> = ({ lang, currentStep: propStep, onNavigate, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(propStep || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Business Info (Company name, category, location, short description)
  const [step1Data, setStep1Data] = useState({
    name: '',
    category: '',
    location: '',
    shortDescription: '',
  });

  // Step 2: Full Description
  const [step2Data, setStep2Data] = useState({
    description: '',
  });

  // Step 3: Images (logo and banner are optional)
  const [step3Data, setStep3Data] = useState({
    logoUrl: '',
    bannerUrl: '',
    gallery: [] as Array<{ imageUrl: string; title: string; category: string }>,
  });

  // Step 4: Business Verification (Danish verification fields)
  const [step4Data, setStep4Data] = useState({
    cvrNumber: '',
    vatNumber: '',
    legalName: '',
    businessAddress: '',
    cvrLookupUrl: '',
    permitType: '',
    permitIssuer: '',
    permitNumber: '',
    permitDocuments: [] as string[],
    requestVerification: false,
  });

  useEffect(() => {
    setCurrentStep(propStep || 1);
  }, [propStep]);

  useEffect(() => {
    // Check onboarding status on mount and load saved data
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { step, hasCompany, company } = await api.getOnboardingStatus();
      if (hasCompany && company) {
        // Load saved company data into step1Data
        setStep1Data({
          name: company.name || '',
          category: company.category || '',
          location: company.location || '',
          shortDescription: company.shortDescription || '',
        });
        
        // Load saved description into step2Data
        if (company.description) {
          setStep2Data({
            description: company.description,
          });
        }
        
        // Determine current step based on what's been completed
        if (step > 0 && step < 5) {
          const targetStep = step + 1;
          setCurrentStep(targetStep);
          // Navigate to correct step view
          const stepViewMap: Record<number, ViewState> = {
            1: ViewState.PARTNER_ONBOARDING_STEP_1,
            2: ViewState.PARTNER_ONBOARDING_STEP_2,
            3: ViewState.PARTNER_ONBOARDING_STEP_3,
            4: ViewState.PARTNER_ONBOARDING_STEP_4,
          };
          if (stepViewMap[targetStep]) {
            onNavigate(stepViewMap[targetStep]);
          }
        }
      }
    } catch (error) {
      // API not available, start from step 1
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Save basic info (name, category, location)
      // contactEmail will be auto-filled from user email in the API
      await api.saveOnboardingStep1({
        name: step1Data.name,
        category: step1Data.category,
        location: step1Data.location,
        contactEmail: '', // API will use user email
        website: '',
        phone: '',
      });
      
      // Also save short description immediately (it's part of step 1 now)
      if (step1Data.shortDescription) {
        await api.saveOnboardingStep2({
          shortDescription: step1Data.shortDescription,
          description: '', // Will be filled in step 2
        });
      }
      
      setCurrentStep(2);
      onNavigate(ViewState.PARTNER_ONBOARDING_STEP_2);
    } catch (err: any) {
      setError(err.message || 'Failed to save business info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 2 only saves full description (short description was saved in step 1)
      // Get existing short description from step 1 data
      await api.saveOnboardingStep2({
        shortDescription: step1Data.shortDescription || '',
        description: step2Data.description,
      });
      setCurrentStep(3);
      onNavigate(ViewState.PARTNER_ONBOARDING_STEP_3);
    } catch (err: any) {
      setError(err.message || 'Failed to save description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Logo and banner are optional - save even if empty
      await api.saveOnboardingStep3(step3Data);
      setCurrentStep(4);
      onNavigate(ViewState.PARTNER_ONBOARDING_STEP_4);
    } catch (err: any) {
      setError(err.message || 'Failed to save images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Save verification data - status will be set to "pending" if verification requested
      await api.saveOnboardingStep4(step4Data);
      setCurrentStep(5);
      onNavigate(ViewState.PARTNER_ONBOARDING_STEP_5);
    } catch (err: any) {
      setError(err.message || 'Failed to save verification info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.completeOnboarding();
      // Set onboardingCompleted = true in backend (already done in API)
      // After step 5, redirect to plan review (if plan selected) or dashboard
      const savedPlan = localStorage.getItem('selectedPlan');
      if (savedPlan) {
        // Redirect to plan review to show selected plan
        onNavigate(ViewState.PLAN_REVIEW);
      } else {
        // No plan selected, go directly to dashboard
        onNavigate(ViewState.PARTNER_DASHBOARD);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  const addGalleryItem = () => {
    setStep3Data(prev => ({
      ...prev,
      gallery: [...prev.gallery, { imageUrl: '', title: '', category: 'General' }],
    }));
  };

  const updateGalleryItem = (index: number, field: string, value: string) => {
    setStep3Data(prev => ({
      ...prev,
      gallery: prev.gallery.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeGalleryItem = (index: number) => {
    setStep3Data(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Opret Din Virksomhedsprofil' : 'Create Your Business Profile'}
            </h2>
            <p className="text-sm text-nexus-subtext mt-1">
              {lang === 'da' 
                ? `Trin ${currentStep} af 6` 
                : `Step ${currentStep} of 6`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? 'bg-nexus-accent' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Business Info (Company name, category, location, short description) */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Virksomhedsnavn' : 'Company Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={step1Data.name}
                  onChange={(e) => setStep1Data(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'F.eks. Mesterbyg ApS' : 'Ex. Acme Corp'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Kategori' : 'Category'} *
                </label>
                <select
                  required
                  value={step1Data.category}
                  onChange={(e) => setStep1Data(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                >
                  <option value="">{lang === 'da' ? 'Vælg kategori' : 'Select category'}</option>
                  {CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'By' : 'City'} *
                </label>
                <input
                  type="text"
                  required
                  value={step1Data.location}
                  onChange={(e) => setStep1Data(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'F.eks. København' : 'Ex. Copenhagen'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Kort Beskrivelse' : 'Short Description'} *
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={200}
                  value={step1Data.shortDescription}
                  onChange={(e) => setStep1Data(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'Kort beskrivelse af din virksomhed (max 200 tegn)' : 'Brief description of your business (max 200 characters)'}
                />
                <p className="text-xs text-nexus-subtext mt-1">
                  {step1Data.shortDescription.length}/200
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Full Description */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Fuld Beskrivelse' : 'Full Description'} *
                </label>
                <textarea
                  required
                  rows={8}
                  value={step2Data.description}
                  onChange={(e) => setStep2Data(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'Detaljeret beskrivelse af din virksomhed, tjenester og ekspertise' : 'Detailed description of your business, services, and expertise'}
                />
                <p className="text-xs text-nexus-subtext mt-1">
                  {lang === 'da' 
                    ? 'Beskriv din virksomheds historie, værdier og hvad der gør jer unikke'
                    : 'Describe your company history, values, and what makes you unique'}
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    onNavigate(ViewState.PARTNER_ONBOARDING_STEP_1);
                  }}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Images (Optional) */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  {lang === 'da' 
                    ? 'Logo og banner er valgfrie. Du kan tilføje dem senere.'
                    : 'Logo and banner are optional. You can add them later.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Logo URL' : 'Logo URL'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
                </label>
                <input
                  type="url"
                  value={step3Data.logoUrl}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder="https://example.com/logo.png"
                />
                {step3Data.logoUrl && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={step3Data.logoUrl} alt="Logo preview" className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Banner URL' : 'Banner URL'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
                </label>
                <input
                  type="url"
                  value={step3Data.bannerUrl}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, bannerUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder="https://example.com/banner.jpg"
                />
                {step3Data.bannerUrl && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={step3Data.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-nexus-text">
                    {lang === 'da' ? 'Galleri' : 'Gallery'} (valgfrit)
                  </label>
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="text-sm text-nexus-accent hover:underline flex items-center gap-1"
                  >
                    <ImageIcon size={16} /> {lang === 'da' ? 'Tilføj' : 'Add'}
                  </button>
                </div>
                {step3Data.gallery.map((item, index) => (
                  <div key={index} className="mb-3 p-3 border border-gray-200 rounded-xl space-y-2">
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(e) => updateGalleryItem(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateGalleryItem(index, 'title', e.target.value)}
                        placeholder="Title"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => updateGalleryItem(index, 'category', e.target.value)}
                          placeholder="Category"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    onNavigate(ViewState.PARTNER_ONBOARDING_STEP_2);
                  }}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Business Verification */}
          {currentStep === 4 && (
            <form onSubmit={handleStep4Submit} className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {lang === 'da' ? 'Forbrugervirksomhedsverificering' : 'Danish Business Verification'}
                </h4>
                <p className="text-sm text-blue-700">
                  {lang === 'da' 
                    ? 'For at blive verificeret som partner skal du angive danske virksomhedsoplysninger og tilladelser. Du kan springe dette over og fortsætte som uverificeret.'
                    : 'To become a verified partner, you must provide Danish business information and permits. You can skip this and continue as unverified.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'CVR-nummer' : 'CVR Number'} {step4Data.requestVerification && '*'}
                </label>
                <input
                  type="text"
                  required={step4Data.requestVerification}
                  value={step4Data.cvrNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setStep4Data(prev => ({ ...prev, cvrNumber: value }));
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? '12345678 (8 cifre)' : '12345678 (8 digits)'}
                />
                <p className="text-xs text-nexus-subtext mt-1">
                  {lang === 'da' ? '8-cifret Central Business Register nummer' : '8-digit Central Business Register number'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Juridisk navn' : 'Legal Company Name'}
                </label>
                <input
                  type="text"
                  value={step4Data.legalName}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, legalName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={step1Data.name || (lang === 'da' ? 'Juridisk navn' : 'Legal name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Forretningsadresse' : 'Business Address'}
                </label>
                <input
                  type="text"
                  value={step4Data.businessAddress}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, businessAddress: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'Gade, Postnummer, By' : 'Street, Postal Code, City'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Tilladelsestype' : 'Permit Type'}
                </label>
                <select
                  value={step4Data.permitType}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, permitType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                >
                  <option value="">{lang === 'da' ? 'Vælg type' : 'Select type'}</option>
                  <option value="Electrician">{lang === 'da' ? 'Elektriker' : 'Electrician'}</option>
                  <option value="Plumbing">{lang === 'da' ? 'Rørlægger' : 'Plumbing'}</option>
                  <option value="Construction">{lang === 'da' ? 'Byggearbejde' : 'Construction'}</option>
                  <option value="Painting">{lang === 'da' ? 'Maler' : 'Painting'}</option>
                  <option value="General">{lang === 'da' ? 'Generel entreprenør' : 'General Contractor'}</option>
                  <option value="Other">{lang === 'da' ? 'Andet' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Udsteder' : 'Issuing Authority'}
                </label>
                <input
                  type="text"
                  value={step4Data.permitIssuer}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, permitIssuer: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'F.eks. Sikkerhedsstyrelsen, Kommune' : 'Ex. Safety Authority, Municipality'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Tilladelsesnummer' : 'Permit Number'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
                </label>
                <input
                  type="text"
                  value={step4Data.permitNumber}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, permitNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder={lang === 'da' ? 'Tilladelsesreference' : 'Permit reference'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'CVR Profillink' : 'CVR Profile Link'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
                </label>
                <input
                  type="url"
                  value={step4Data.cvrLookupUrl}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, cvrLookupUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder="https://datacvr.virk.dk/data/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Tilladelsesdokumenter' : 'Permit Documents'} {step4Data.requestVerification && '*'}
                </label>
                <p className="text-xs text-nexus-subtext mb-2">
                  {lang === 'da' 
                    ? 'Upload PDF eller billeder af dine tilladelser (valgfrit, men påkrævet for verificering)'
                    : 'Upload PDFs or images of your permits (optional, but required for verification)'}
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const urls = files.map(f => URL.createObjectURL(f));
                    setStep4Data(prev => ({ ...prev, permitDocuments: [...prev.permitDocuments, ...urls] }));
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                />
                {step4Data.permitDocuments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {step4Data.permitDocuments.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-700">Document {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setStep4Data(prev => ({ ...prev, permitDocuments: prev.permitDocuments.filter((_, i) => i !== idx) }))}
                          className="text-red-500 hover:text-red-700"
                        >
                          {lang === 'da' ? 'Fjern' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="requestVerification"
                  checked={step4Data.requestVerification}
                  onChange={(e) => setStep4Data(prev => ({ ...prev, requestVerification: e.target.checked }))}
                  className="w-4 h-4 text-nexus-accent border-gray-300 rounded focus:ring-nexus-accent"
                />
                <label htmlFor="requestVerification" className="text-sm text-nexus-text">
                  {lang === 'da' 
                    ? 'Anmod om verificeret partner-status (kræver CVR-nummer og mindst ét dokument)'
                    : 'Request verified partner status (requires CVR number and at least one document)'}
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    onNavigate(ViewState.PARTNER_ONBOARDING_STEP_3);
                  }}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (step4Data.requestVerification && (!step4Data.cvrNumber || step4Data.permitDocuments.length === 0))}
                  className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {lang === 'da' ? 'Næste' : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Verification Complete */}
          {currentStep === 5 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Profil klar' : 'Profile Ready'}
              </h3>
              <p className="text-nexus-subtext">
                {step4Data.requestVerification 
                  ? (lang === 'da' 
                      ? 'Din verificeringsanmodning er sendt til gennemgang. Du vil modtage en e-mail, når den er godkendt.'
                      : 'Your verification request has been submitted for review. You will receive an email when it is approved.')
                    : (lang === 'da'
                        ? 'Din virksomhedsprofil er klar. Klik på "Fortsæt" for at gennemgå din plan og fortsætte til betaling.'
                        : 'Your business profile is ready. Click "Continue" to review your plan and proceed to payment.')
                }
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setCurrentStep(4);
                    onNavigate(ViewState.PARTNER_ONBOARDING_STEP_4);
                  }}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> {lang === 'da' ? 'Tilbage' : 'Back'}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {lang === 'da' ? 'Fortsæt' : 'Continue'} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Plan Review (handled by separate component, but shown here for progress) */}
          {currentStep === 6 && (
            <div className="text-center space-y-6">
              <p className="text-nexus-subtext">
                {lang === 'da' 
                  ? 'Plan Review - Redirecting...'
                  : 'Plan Review - Redirecting...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboardingWizard;
