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
import Footer from './components/layout/Footer';
import ConsumerSidebar from './components/layout/ConsumerSidebar';
import PartnerSidebar from './components/layout/PartnerSidebar';
import AdminSidebar from './components/layout/AdminSidebar';

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

  const t = translations[lang];

  // Determine user role from AuthContext or mock state
  const userRole = user?.role || (currentPartner ? 'PARTNER' : currentConsumer ? 'CONSUMER' : null);
  const isLoggedIn = isAuthenticated || !!currentPartner || !!currentConsumer;

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

  const renderHome = () => (
    <div className="animate-fadeIn">
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nexus-bg border border-gray-200 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexus-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nexus-accent"></span>
            </span>
            <span className="text-xs font-medium text-nexus-subtext tracking-wide uppercase">{t.hero.tag}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-nexus-text mb-6 max-w-4xl">
            {t.hero.title} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-text to-gray-500">{t.hero.subtitle}</span>
          </h1>
          <div className="w-full max-w-2xl mb-10">
            <SearchBar 
              variant="hero"
              value={filters.searchQuery}
              onChange={(val) => setFilters(prev => ({ ...prev, searchQuery: val }))}
              onSearch={(val) => { setFilters(prev => ({ ...prev, searchQuery: val })); handleSearch(); }}
              placeholder={t.hero.searchPlaceholder}
              lang={lang}
              buttonText={t.hero.searchButton}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setCurrentView(ViewState.LISTINGS)}
              className="px-8 py-3 rounded-full bg-nexus-text text-white font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              {t.hero.ctaPrimary} <ArrowRight size={16} />
            </button>
            {!isLoggedIn && (
              <button 
                onClick={() => setCurrentView(ViewState.PRICING)}
                className="px-8 py-3 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 text-nexus-text font-medium hover:bg-white transition-all flex items-center gap-2"
              >
                {t.hero.ctaSecondary}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-nexus-bg py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-nexus-accent">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Trust</h3>
              <p className="text-nexus-subtext leading-relaxed">Every premium listing is manually verified to ensure you connect with legitimate, high-quality partners.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-nexus-accent">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Discovery</h3>
              <p className="text-nexus-subtext leading-relaxed">Our AI-driven search understands your business intent, not just keywords, saving you hours of research.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-nexus-accent">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Network</h3>
              <p className="text-nexus-subtext leading-relaxed">Access a curated network of industry leaders spanning across technology, finance, and logistics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
    if (currentView === ViewState.PRICING) {
      return <Pricing lang={lang} onOpenModal={setActiveModal} />;
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

    // Partner Pages
    if (currentView === ViewState.PARTNER_DASHBOARD) {
      const company = getCurrentCompany();
      if (!company) return null;
      return (
        <PartnerDashboard 
          company={company} 
          lang={lang}
          onViewPublic={handleCompanyClick}
          onChangeView={setCurrentView}
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
        onLoginPartner={handlePartnerLogin}
        onLoginConsumer={handleConsumerLogin}
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
      <AuthModal 
        isOpen={activeModal !== ModalState.CLOSED}
        type={activeModal}
        onClose={() => setActiveModal(ModalState.CLOSED)}
        lang={lang}
        onSuccess={() => {
          // Refresh view after successful auth
          if (user?.role === 'CONSUMER') {
            setCurrentView(ViewState.CONSUMER_DASHBOARD);
          } else if (user?.role === 'PARTNER') {
            setCurrentView(ViewState.PARTNER_DASHBOARD);
          }
        }}
      />

      {/* Footer */}
      <Footer lang={lang} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
