import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ListingCard from './components/ListingCard';
import ProfileView from './components/ProfileView';
import Pricing from './components/Pricing';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import PartnerDashboard from './components/PartnerDashboard';
import ConsumerDashboard from './components/ConsumerDashboard';
import PartnerOnboardingWizard from './components/PartnerOnboardingWizard';
import BusinessDashboard from './components/BusinessDashboard';
import PlanReview from './components/PlanReview';
import PaymentComingSoon from './components/PaymentComingSoon';
import SignupPage from './components/pages/auth/SignupPage';
import AuthPage from './components/pages/auth/AuthPage';
import SignupSelectPage from './components/pages/auth/SignupSelectPage';
import Footer from './components/layout/Footer';
import ConsumerSidebar from './components/layout/ConsumerSidebar';
import PartnerSidebar from './components/layout/PartnerSidebar';
import AdminSidebar from './components/layout/AdminSidebar';
import HeroSearchSection from './components/layout/HeroSearchSection';
import CategoriesSidebar from './components/layout/CategoriesSidebar';
import FeaturedProCard from './components/layout/FeaturedProCard';
import HowItWorksSection from './components/layout/HowItWorksSection';
import FeaturedCategoriesSection from './components/layout/FeaturedCategoriesSection';

// Visitor Pages
import CategoriesPage from './components/pages/visitor/CategoriesPage';
import HowItWorksPage from './components/pages/visitor/HowItWorksPage';
import AboutPage from './components/pages/visitor/AboutPage';
import ContactPage from './components/pages/visitor/ContactPage';
import BlogPage from './components/pages/visitor/BlogPage';

// Consumer Pages
import SavedListingsPage from './components/pages/consumer/SavedListingsPage';
import RecentSearchesPage from './components/pages/consumer/RecentSearchesPage';
import MyInquiriesPage from './components/pages/consumer/MyInquiriesPage';
import ConsumerAccountSettings from './components/pages/consumer/ConsumerAccountSettings';

// Partner Pages
import PartnerProfileEditor from './components/PartnerProfileEditor';
import ServicesManagement from './components/pages/partner/ServicesManagement';
import PortfolioManagement from './components/pages/partner/PortfolioManagement';
import TestimonialsManagement from './components/pages/partner/TestimonialsManagement';
import LeadsMessagesPage from './components/pages/partner/LeadsMessagesPage';
import SubscriptionBillingPage from './components/pages/partner/SubscriptionBillingPage';
import PartnerAccountSettings from './components/pages/partner/PartnerAccountSettings';

// Admin Pages
import CompaniesManagement from './components/pages/admin/CompaniesManagement';
import ConsumersManagement from './components/pages/admin/ConsumersManagement';
import PartnersManagement from './components/pages/admin/PartnersManagement';
import CategoriesManagement from './components/pages/admin/CategoriesManagement';
import LocationsManagement from './components/pages/admin/LocationsManagement';
import SubscriptionsManagement from './components/pages/admin/SubscriptionsManagement';
import InquiriesManagement from './components/pages/admin/InquiriesManagement';
import AnalyticsPage from './components/pages/admin/AnalyticsPage';
import PlatformSettings from './components/pages/admin/PlatformSettings';
import AdminUsersPage from './components/pages/admin/AdminUsersPage';

import { Company, FilterState, ViewState, GeminiSearchResponse, Language, ModalState, ConsumerUser } from './types';
import { MOCK_COMPANIES, CATEGORIES, MOCK_CONSUMER } from './constants';
import { Search, X, Sparkles, Loader2, ArrowRight, ShieldCheck, Zap, Globe, MapPin } from 'lucide-react';
import { analyzeSearchQuery } from './services/geminiService';
import { translations } from './translations';
import { useVerifiedPartnerRotation } from './hooks/useVerifiedPartnerRotation';
import { api } from './services/api';

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // User Session State (for backward compatibility with mock login)
  const [currentPartner, setCurrentPartner] = useState<Company | null>(null);
  const [currentConsumer, setCurrentConsumer] = useState<ConsumerUser | null>(null);

  const [lang, setLang] = useState<Language>('en');
  const [activeModal, setActiveModal] = useState<ModalState>(ModalState.CLOSED);
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    location: 'All',
    verifiedOnly: false,
    searchQuery: ''
  });
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<GeminiSearchResponse | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Get rotating verified partner for hero section
  const featuredCompany = useVerifiedPartnerRotation(MOCK_COMPANIES, 8000);

  const t = translations[lang];

  // Determine user role from AuthContext or mock state
  const userRole = user?.role || (currentPartner ? 'PARTNER' : currentConsumer ? 'CONSUMER' : null);
  const isLoggedIn = isAuthenticated || !!currentPartner || !!currentConsumer;

  // Check onboarding status for partners
  useEffect(() => {
    const checkOnboarding = async () => {
      if (userRole === 'PARTNER' && isAuthenticated && user) {
        try {
          const { step, hasCompany } = await api.getOnboardingStatus();
          setOnboardingStep(step);
          if (!hasCompany || step < 4) {
            setShowOnboarding(true);
          }
        } catch (error) {
          // API not available or error - check if user has company
          if (user.ownedCompany) {
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        }
      }
    };
    checkOnboarding();
  }, [userRole, isAuthenticated, user]);

  // Get current company for partner (from user or mock)
  const getCurrentCompany = (): Company | null => {
    if (user?.role === 'PARTNER' && user?.ownedCompany) {
      return user.ownedCompany as Company;
    }
    return currentPartner || MOCK_COMPANIES[0];
  };

  // Get current consumer user
  const getCurrentConsumerUser = (): ConsumerUser | null => {
    if (user?.role === 'CONSUMER') {
      return {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        avatarUrl: user.avatarUrl || 'https://i.pravatar.cc/150?img=11',
        location: user.location || 'København'
      };
    }
    return currentConsumer || MOCK_CONSUMER;
  };

  const availableLocations = useMemo(() => {
    const locs = MOCK_COMPANIES.map(c => c.location);
    return ['All', ...Array.from(new Set(locs))];
  }, []);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView(ViewState.PROFILE);
    window.scrollTo(0, 0);
  };

  const handleBackToDirectory = () => {
    setSelectedCompany(null);
    setCurrentView(ViewState.LISTINGS);
  };

  const handlePartnerLogin = () => {
    const demoUser = MOCK_COMPANIES[0];
    setCurrentPartner(demoUser);
    setCurrentConsumer(null);
    setCurrentView(ViewState.PARTNER_DASHBOARD);
    window.scrollTo(0, 0);
  };

  const handleConsumerLogin = () => {
    setCurrentConsumer(MOCK_CONSUMER);
    setCurrentPartner(null);
    if (savedCompanyIds.length === 0) {
      setSavedCompanyIds(['2', '3']);
    }
    setCurrentView(ViewState.CONSUMER_DASHBOARD);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    setCurrentPartner(null);
    setCurrentConsumer(null);
    setCurrentView(ViewState.HOME);
  };

  const handleToggleFavorite = (id: string) => {
    if (!isLoggedIn) {
      alert(lang === 'da' ? 'Log venligst ind for at gemme.' : 'Please log in to save listings.');
      return;
    }
    setSavedCompanyIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filters.searchQuery.trim()) return;

    setCurrentView(ViewState.LISTINGS);
    setIsAnalyzing(true);
    setAiSuggestion(null);
    
    const analysis = await analyzeSearchQuery(filters.searchQuery);
    
    if (analysis) {
      setAiSuggestion(analysis);
      setFilters(prev => {
        const newFilters = { ...prev };
        if (analysis.suggestedCategory && analysis.suggestedCategory !== 'All' && CATEGORIES.includes(analysis.suggestedCategory)) {
          newFilters.category = analysis.suggestedCategory;
        }
        if (analysis.suggestedLocation) {
          const matchedLocation = availableLocations.find(
            loc => loc.toLowerCase().includes(analysis.suggestedLocation.toLowerCase())
          );
          if (matchedLocation) {
            newFilters.location = matchedLocation;
          }
        }
        return newFilters;
      });
    }
    setIsAnalyzing(false);
  };

  const filteredCompanies = MOCK_COMPANIES.filter(company => {
    const matchesCategory = filters.category === 'All' || company.category === filters.category;
    const matchesLocation = filters.location === 'All' || !filters.location || company.location === filters.location;
    const matchesVerified = !filters.verifiedOnly || company.isVerified;
    const query = filters.searchQuery.toLowerCase();
    const matchesSearch = !query || 
      company.name.toLowerCase().includes(query) || 
      company.description.toLowerCase().includes(query) ||
      company.location.toLowerCase().includes(query) ||
      (aiSuggestion && aiSuggestion.keywords.some(k => company.tags.some(t => t.toLowerCase().includes(k.toLowerCase()))));
    return matchesCategory && matchesLocation && matchesVerified && matchesSearch;
  });

  // Check if current view needs sidebar
  const needsSidebar = 
    currentView === ViewState.CONSUMER_DASHBOARD ||
    currentView === ViewState.CONSUMER_SAVED_LISTINGS ||
    currentView === ViewState.CONSUMER_RECENT_SEARCHES ||
    currentView === ViewState.CONSUMER_INQUIRIES ||
    currentView === ViewState.CONSUMER_SETTINGS ||
    currentView === ViewState.PARTNER_DASHBOARD ||
    currentView === ViewState.PARTNER_PROFILE_EDIT ||
    currentView === ViewState.PARTNER_SERVICES ||
    currentView === ViewState.PARTNER_PORTFOLIO ||
    currentView === ViewState.PARTNER_TESTIMONIALS ||
    currentView === ViewState.PARTNER_LEADS ||
    currentView === ViewState.PARTNER_BILLING ||
    currentView === ViewState.PARTNER_SETTINGS ||
    currentView === ViewState.ADMIN ||
    currentView.toString().startsWith('ADMIN_');

  const handleHeroSearch = () => {
    // Use the search query directly from filters
    handleSearch();
  };

  const renderHome = () => {
    const displayCompanies = filteredCompanies.slice(0, 6); // Show first 6 companies

    return (
      <div className="animate-fadeIn">
        {/* Hero Section with Search - Soft Scandinavian Gradient Background */}
        <div className="relative overflow-visible bg-gradient-to-b from-neutral-50 via-slate-50 to-white py-8 md:py-10">
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4">
              <div className={`grid grid-cols-1 gap-8 items-start ${featuredCompany ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
                {/* Left: Hero Search Section (takes 2 columns when card exists, full width when not) */}
                <div className={featuredCompany ? 'lg:col-span-2' : 'lg:col-span-1'}>
                  <HeroSearchSection
                    lang={lang}
                    searchQuery={filters.searchQuery}
                    onSearchQueryChange={(val) => setFilters(prev => ({ ...prev, searchQuery: val }))}
                    onSearch={handleHeroSearch}
                    selectedCategory={filters.category || 'All'}
                    onCategorySelect={(cat) => setFilters(prev => ({ ...prev, category: cat }))}
                  />
                </div>

                {/* Right: Featured Pro Card (floating, expandable) - Only show if verified partner exists */}
                {featuredCompany && (
                  <div className="w-full lg:col-span-1">
                    <div className="sticky top-24">
                      <FeaturedProCard
                        key={featuredCompany.id}
                        company={featuredCompany}
                        lang={lang}
                        onViewProfile={handleCompanyClick}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area: Categories Sidebar + Listings Grid */}
        <div className="bg-nexus-bg py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Categories Sidebar */}
              <CategoriesSidebar
                lang={lang}
                selectedCategory={filters.category || 'All'}
                onCategorySelect={(cat) => setFilters(prev => ({ ...prev, category: cat }))}
              />

              {/* Right: Listings Grid */}
              <div className="flex-1">
                {/* Category Filter Chips (above listings) */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pb-4 mb-6 scrollbar-hide">
                  {CATEGORIES.filter(cat => cat !== 'All').map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilters(prev => ({ ...prev, category }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        filters.category === category
                          ? 'bg-nexus-accent text-white'
                          : 'bg-white border border-gray-200 text-nexus-text hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Listings Grid */}
                {displayCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-6">
                    {displayCompanies.map(company => (
                      <ListingCard 
                        key={company.id} 
                        company={company} 
                        onViewProfile={handleCompanyClick} 
                        lang={lang}
                        isFavorite={savedCompanyIds.includes(company.id)}
                        onToggleFavorite={handleToggleFavorite}
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
        </div>

        {/* How It Works Section - Moved to bottom, above footer */}
        <HowItWorksSection
          lang={lang}
          onGetStarted={() => setCurrentView(ViewState.PRICING)}
        />
      </div>
    );
  };

  const renderListings = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div className="relative">
            <SearchBar 
              variant="sidebar"
              value={filters.searchQuery}
              onChange={(val) => setFilters(prev => ({ ...prev, searchQuery: val }))}
              onSearch={(val) => { setFilters(prev => ({ ...prev, searchQuery: val })); handleSearch(); }}
              placeholder={t.hero.searchPlaceholder}
              lang={lang}
            />
          </div>
          <div>
            <h3 className="text-xs font-bold text-nexus-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={12} />
              {t.listings.location}
            </h3>
            <div className="relative">
              <select 
                value={filters.location || 'All'} 
                onChange={(e) => setFilters({...filters, location: e.target.value === 'All' ? null : e.target.value})}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="All">{t.listings.allLocations}</option>
                {availableLocations.filter(l => l !== 'All').map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-nexus-text uppercase tracking-wider mb-4">{t.listings.categories}</h3>
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.category === category ? 'border-nexus-text bg-nexus-text' : 'border-gray-300 group-hover:border-gray-400'}`}>
                    {filters.category === category && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name="category" 
                    className="hidden"
                    checked={filters.category === category}
                    onChange={() => setFilters({...filters, category})}
                  />
                  <span className={`text-sm ${filters.category === category ? 'font-medium text-nexus-text' : 'text-nexus-subtext group-hover:text-gray-600'}`}>
                    {category}
                  </span>
                </label>
              ))}
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
                onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
              />
              <span className="text-sm text-nexus-text">{t.listings.verifiedOnly}</span>
            </label>
          </div>
        </div>
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
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestion.suggestedCategory !== 'All' && (
                      <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                        Category: {aiSuggestion.suggestedCategory}
                      </span>
                    )}
                    {aiSuggestion.suggestedLocation && (
                      <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 flex items-center gap-1">
                        <MapPin size={10} /> {aiSuggestion.suggestedLocation}
                      </span>
                    )}
                    {aiSuggestion.keywords.map((k, i) => (
                      <span key={i} className="text-xs text-gray-500 px-2 py-1 bg-white border border-gray-200 rounded-md">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setAiSuggestion(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-nexus-text">
                {filters.category === 'All' ? (lang === 'da' ? 'Alle Virksomheder' : 'All Companies') : filters.category}
                <span className="ml-2 text-sm font-normal text-gray-400">({filteredCompanies.length})</span>
              </h2>
              {filters.location && filters.location !== 'All' && (
                <span className="text-sm text-nexus-subtext flex items-center gap-1 mt-1">
                  <MapPin size={12} /> In {filters.location}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-nexus-subtext">{t.listings.sortBy}:</span>
              <select className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer text-nexus-text">
                <option>Recommended</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCompanies.map(company => (
                <ListingCard 
                  key={company.id} 
                  company={company} 
                  onViewProfile={handleCompanyClick} 
                  lang={lang}
                  isFavorite={savedCompanyIds.includes(company.id)}
                  onToggleFavorite={handleToggleFavorite}
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
              <button 
                onClick={() => setFilters({category: 'All', verifiedOnly: false, searchQuery: '', location: 'All'})}
                className="mt-6 text-nexus-accent font-medium hover:underline"
              >
                {t.listings.clearFilters}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    // Visitor Pages
    if (currentView === ViewState.HOME) return renderHome();
    if (currentView === ViewState.LISTINGS) return renderListings();
    if (currentView === ViewState.PROFILE && selectedCompany) {
      return (
        <ProfileView 
          company={selectedCompany} 
          onBack={handleBackToDirectory} 
          lang={lang} 
          onOpenModal={setActiveModal}
        />
      );
    }
    if (currentView === ViewState.AUTH) {
      return (
        <AuthPage
          lang={lang}
          initialMode={new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'login'}
          onSuccess={() => {
            // After successful login, redirect based on user role
            if (user?.role === 'CONSUMER') {
              setCurrentView(ViewState.CONSUMER_DASHBOARD);
            } else if (user?.role === 'PARTNER') {
              setCurrentView(ViewState.PARTNER_DASHBOARD);
            } else {
              setCurrentView(ViewState.HOME);
            }
          }}
          onBack={() => setCurrentView(ViewState.HOME)}
          onNavigateToSignup={() => setCurrentView(ViewState.SIGNUP_SELECT)}
        />
      );
    }
    if (currentView === ViewState.SIGNUP_SELECT) {
      return (
        <SignupSelectPage
          lang={lang}
          onSelect={(view) => setCurrentView(view)}
          onBack={() => setCurrentView(ViewState.AUTH)}
        />
      );
    }
    if (currentView === ViewState.CONSUMER_SIGNUP) {
      return (
        <SignupPage
          lang={lang}
          role="CONSUMER"
          onSuccess={(userRole) => {
            // Consumer signup - redirect to dashboard or home
            setCurrentView(ViewState.CONSUMER_DASHBOARD);
          }}
          onBack={() => setCurrentView(ViewState.SIGNUP_SELECT)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_REGISTER) {
      return (
        <SignupPage
          lang={lang}
          role="PARTNER"
          onSuccess={(userRole) => {
            // Partner signup - always redirect to onboarding wizard
            setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
          }}
          onBack={() => setCurrentView(ViewState.SIGNUP_SELECT)}
        />
      );
    }
    if (currentView === ViewState.SIGNUP) {
      // Legacy signup route - redirect to signup select or determine from context
      // If coming from pricing page, go directly to partner register
      const savedPlan = localStorage.getItem('selectedPlan');
      const savedRole = localStorage.getItem('signupRole') as 'CONSUMER' | 'PARTNER' | null;
      
      if (savedPlan || savedRole === 'PARTNER') {
        // Coming from pricing - go directly to partner register
        return (
          <SignupPage
            lang={lang}
            role="PARTNER"
            onSuccess={(userRole) => {
              setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
            }}
            onBack={() => setCurrentView(ViewState.HOME)}
          />
        );
      } else {
        // Default to signup select page
        return (
          <SignupSelectPage
            lang={lang}
            onSelect={(view) => setCurrentView(view)}
            onBack={() => setCurrentView(ViewState.HOME)}
          />
        );
      }
    }
    if (currentView === ViewState.PRICING) {
      return (
        <Pricing 
          lang={lang} 
          onOpenModal={(modal) => {
            // For partner plans, redirect to signup instead of modal
            if (modal === ModalState.REGISTER_FREE) {
              const savedPlan = localStorage.getItem('selectedPlan');
              if (savedPlan) {
                setCurrentView(ViewState.SIGNUP);
                return;
              }
            }
            setActiveModal(modal);
          }}
          onPlanSelected={(plan) => {
            setSelectedPlan(plan);
            // Plan is saved to localStorage in Pricing component
            // Redirect to signup
            setCurrentView(ViewState.SIGNUP);
          }}
        />
      );
    }
    if (currentView === ViewState.PLAN_REVIEW) {
      return (
        <PlanReview
          lang={lang}
          onContinueToPayment={() => setCurrentView(ViewState.PAYMENT_COMING_SOON)}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PAYMENT_COMING_SOON) {
      return (
        <PaymentComingSoon
          lang={lang}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.CATEGORIES) {
      return <CategoriesPage lang={lang} onCategorySelect={(cat) => { setFilters({...filters, category: cat}); setCurrentView(ViewState.LISTINGS); }} />;
    }
    if (currentView === ViewState.HOW_IT_WORKS) {
      return <HowItWorksPage lang={lang} onGetStarted={() => setCurrentView(ViewState.PRICING)} />;
    }
    if (currentView === ViewState.ABOUT) {
      return <AboutPage lang={lang} />;
    }
    if (currentView === ViewState.CONTACT) {
      return <ContactPage lang={lang} />;
    }
    if (currentView === ViewState.BLOG) {
      return <BlogPage lang={lang} />;
    }

    // Consumer Pages
    if (currentView === ViewState.CONSUMER_DASHBOARD) {
      const consumerUser = getCurrentConsumerUser();
      if (!consumerUser) return null;
      return (
        <ConsumerDashboard 
          user={consumerUser}
          savedCompanies={MOCK_COMPANIES.filter(c => savedCompanyIds.includes(c.id))}
          lang={lang}
          onViewProfile={handleCompanyClick}
          onBrowse={() => setCurrentView(ViewState.LISTINGS)}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }
    if (currentView === ViewState.CONSUMER_SAVED_LISTINGS) {
      const consumerUser = getCurrentConsumerUser();
      if (!consumerUser) return null;
      return (
        <SavedListingsPage
          savedCompanies={MOCK_COMPANIES.filter(c => savedCompanyIds.includes(c.id))}
          lang={lang}
          onViewProfile={handleCompanyClick}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => setCurrentView(ViewState.CONSUMER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.CONSUMER_RECENT_SEARCHES) {
      return (
        <RecentSearchesPage
          lang={lang}
          onBack={() => setCurrentView(ViewState.CONSUMER_DASHBOARD)}
          onSearch={(query) => { setFilters({...filters, searchQuery: query}); setCurrentView(ViewState.LISTINGS); }}
        />
      );
    }
    if (currentView === ViewState.CONSUMER_INQUIRIES) {
      return (
        <MyInquiriesPage
          lang={lang}
          onBack={() => setCurrentView(ViewState.CONSUMER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.CONSUMER_SETTINGS) {
      const consumerUser = getCurrentConsumerUser();
      if (!consumerUser) return null;
      return (
        <ConsumerAccountSettings
          user={consumerUser}
          lang={lang}
          onBack={() => setCurrentView(ViewState.CONSUMER_DASHBOARD)}
          onSave={(updated) => { /* Handle save */ }}
        />
      );
    }

    // Partner Onboarding Steps
    if (currentView === ViewState.PARTNER_ONBOARDING_STEP_1) {
      return (
        <PartnerOnboardingWizard
          lang={lang}
          currentStep={1}
          onNavigate={setCurrentView}
          onComplete={() => {
            // Step 4 completion redirects to plan review (step 5)
            // This callback is called after step 4 completes
            const savedPlan = localStorage.getItem('selectedPlan');
            if (savedPlan) {
              setCurrentView(ViewState.PLAN_REVIEW);
            } else {
              setCurrentView(ViewState.PARTNER_DASHBOARD);
            }
          }}
        />
      );
    }
    if (currentView === ViewState.PARTNER_ONBOARDING_STEP_2) {
      return (
        <PartnerOnboardingWizard
          lang={lang}
          currentStep={2}
          onNavigate={setCurrentView}
          onComplete={() => {
            const savedPlan = localStorage.getItem('selectedPlan');
            if (savedPlan) {
              setCurrentView(ViewState.PLAN_REVIEW);
            } else {
              setCurrentView(ViewState.PARTNER_DASHBOARD);
            }
          }}
        />
      );
    }
    if (currentView === ViewState.PARTNER_ONBOARDING_STEP_3) {
      return (
        <PartnerOnboardingWizard
          lang={lang}
          currentStep={3}
          onNavigate={setCurrentView}
          onComplete={() => {
            const savedPlan = localStorage.getItem('selectedPlan');
            if (savedPlan) {
              setCurrentView(ViewState.PLAN_REVIEW);
            } else {
              setCurrentView(ViewState.PARTNER_DASHBOARD);
            }
          }}
        />
      );
    }
    if (currentView === ViewState.PARTNER_ONBOARDING_STEP_4) {
      return (
        <PartnerOnboardingWizard
          lang={lang}
          currentStep={4}
          onNavigate={setCurrentView}
          onComplete={() => {
            // Step 4 completion automatically navigates to PLAN_REVIEW via handleComplete
            // This callback is a fallback
            const savedPlan = localStorage.getItem('selectedPlan');
            if (savedPlan) {
              setCurrentView(ViewState.PLAN_REVIEW);
            } else {
              setCurrentView(ViewState.PARTNER_DASHBOARD);
            }
          }}
        />
      );
    }

    // Partner Pages
    if (currentView === ViewState.PARTNER_DASHBOARD) {
      const company = getCurrentCompany();
      // Only redirect to onboarding if user just signed up (has selectedPlan)
      // Don't auto-redirect existing partners who navigate to dashboard
      const savedPlan = localStorage.getItem('selectedPlan');
      if (savedPlan && (!company || showOnboarding)) {
        // User just signed up - check onboarding status and redirect
        const checkAndRedirect = async () => {
          try {
            const { step } = await api.getOnboardingStatus();
            const stepViewMap: Record<number, ViewState> = {
              0: ViewState.PARTNER_ONBOARDING_STEP_1,
              1: ViewState.PARTNER_ONBOARDING_STEP_2,
              2: ViewState.PARTNER_ONBOARDING_STEP_3,
              3: ViewState.PARTNER_ONBOARDING_STEP_4,
            };
            if (stepViewMap[step]) {
              setCurrentView(stepViewMap[step]);
            } else {
              setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
            }
          } catch {
            setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
          }
        };
        checkAndRedirect();
        return null;
      }
      // If no savedPlan, user is an existing partner - show dashboard normally
      // Show business dashboard if company exists
      return (
        <BusinessDashboard
          lang={lang}
          onEditListing={() => setCurrentView(ViewState.PARTNER_PROFILE_EDIT)}
          onManageServices={() => setCurrentView(ViewState.PARTNER_SERVICES)}
          onManagePortfolio={() => setCurrentView(ViewState.PARTNER_PORTFOLIO)}
          onManageTestimonials={() => setCurrentView(ViewState.PARTNER_TESTIMONIALS)}
          onViewInquiries={() => setCurrentView(ViewState.PARTNER_LEADS)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_PROFILE_EDIT) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <PartnerProfileEditor
          company={company}
          lang={lang}
          onSave={(updated) => { setCurrentPartner(updated); setCurrentView(ViewState.PARTNER_DASHBOARD); }}
          onCancel={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_SERVICES) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <ServicesManagement
          services={company.services || []}
          lang={lang}
          onSave={(services) => { /* Handle save */ }}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_PORTFOLIO) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <PortfolioManagement
          portfolio={company.portfolio || []}
          lang={lang}
          onSave={(portfolio) => { /* Handle save */ }}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_TESTIMONIALS) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <TestimonialsManagement
          testimonials={company.testimonials || []}
          lang={lang}
          onSave={(testimonials) => { /* Handle save */ }}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_LEADS) {
      return (
        <LeadsMessagesPage
          lang={lang}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_BILLING) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <SubscriptionBillingPage
          company={company}
          lang={lang}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
          onUpgrade={() => setCurrentView(ViewState.PRICING)}
        />
      );
    }
    if (currentView === ViewState.PARTNER_SETTINGS) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <PartnerAccountSettings
          company={company}
          lang={lang}
          onBack={() => setCurrentView(ViewState.PARTNER_DASHBOARD)}
          onSave={(updated) => { /* Handle save */ }}
        />
      );
    }

    // Admin Pages
    if (currentView === ViewState.ADMIN) {
      return <AdminDashboard lang={lang} />;
    }
    if (currentView === ViewState.ADMIN_COMPANIES) {
      return <CompaniesManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_CONSUMERS) {
      return <ConsumersManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_PARTNERS) {
      return <PartnersManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_CATEGORIES) {
      return <CategoriesManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_LOCATIONS) {
      return <LocationsManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_SUBSCRIPTIONS) {
      return <SubscriptionsManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_INQUIRIES) {
      return <InquiriesManagement lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_ANALYTICS) {
      return <AnalyticsPage lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_SETTINGS) {
      return <PlatformSettings lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }
    if (currentView === ViewState.ADMIN_USERS) {
      return <AdminUsersPage lang={lang} onBack={() => setCurrentView(ViewState.ADMIN)} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-nexus-bg font-sans text-nexus-text selection:bg-nexus-text selection:text-white relative">
      <Navbar 
        setView={setCurrentView} 
        currentView={currentView} 
        lang={lang} 
        setLang={setLang}
        onLoginPartner={() => setCurrentView(ViewState.AUTH)}
        onLoginConsumer={() => setCurrentView(ViewState.AUTH)}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
      />
      
      <div className="flex">
        {/* Sidebars */}
        {needsSidebar && userRole === 'CONSUMER' && (
          <ConsumerSidebar
            currentView={currentView}
            lang={lang}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        )}
        {needsSidebar && userRole === 'PARTNER' && (
          <PartnerSidebar
            currentView={currentView}
            lang={lang}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        )}
        {needsSidebar && (userRole === 'ADMIN' || currentView.toString().startsWith('ADMIN_')) && (
          <AdminSidebar
            currentView={currentView}
            lang={lang}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 pt-4 ${needsSidebar ? '' : ''}`}>
          {renderContent()}
        </main>
      </div>
      
      {/* Global Modal */}
      {/* AuthModal kept only for contact forms (CONTACT_SALES, CONTACT_VENDOR) */}
      {activeModal === ModalState.CONTACT_SALES || activeModal === ModalState.CONTACT_VENDOR ? (
        <AuthModal
          isOpen={activeModal !== ModalState.CLOSED}
          type={activeModal}
          onClose={() => setActiveModal(ModalState.CLOSED)}
          lang={lang}
          onSuccess={() => {
            setActiveModal(ModalState.CLOSED);
          }}
        />
      ) : null}

      {/* Footer */}
      <Footer lang={lang} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
