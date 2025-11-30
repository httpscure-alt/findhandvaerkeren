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

  // Step 3: Images
  const [step3Data, setStep3Data] = useState({
    logoUrl: '',
    bannerUrl: '',
    gallery: [] as Array<{ imageUrl: string; title: string; category: string }>,
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
      await api.saveOnboardingStep3(step3Data);
      setCurrentStep(4);
      onNavigate(ViewState.PARTNER_ONBOARDING_STEP_4);
    } catch (err: any) {
      setError(err.message || 'Failed to save images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await api.completeOnboarding();
      // After step 4, redirect to plan review (step 5)
      setCurrentStep(5);
      onNavigate(ViewState.PLAN_REVIEW);
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
                ? `Trin ${currentStep} af 5` 
                : `Step ${currentStep} of 5`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
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

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Logo URL' : 'Logo URL'}
                </label>
                <input
                  type="url"
                  value={step3Data.logoUrl}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  {lang === 'da' ? 'Banner URL' : 'Banner URL'}
                </label>
                <input
                  type="url"
                  value={step3Data.bannerUrl}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, bannerUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-accent/20"
                  placeholder="https://example.com/banner.jpg"
                />
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

          {/* Step 4: Verification (Complete) */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Verificering' : 'Verification'}
              </h3>
              <p className="text-nexus-subtext">
                {lang === 'da' 
                  ? 'Din virksomhedsprofil er klar. Klik på "Fortsæt" for at gennemgå din plan og fortsætte til betaling.'
                  : 'Your business profile is ready. Click "Continue" to review your plan and proceed to payment.'}
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setCurrentStep(3);
                    onNavigate(ViewState.PARTNER_ONBOARDING_STEP_3);
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

          {/* Step 5: Plan Review (handled by separate component, but shown here for progress) */}
          {currentStep === 5 && (
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
