import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useMarketplace } from './contexts/MarketplaceContext';
import HomePage from './components/pages/visitor/HomePage';
import BrowsePage from './components/pages/visitor/BrowsePage';
import Navbar from './components/Navbar';
import ProfileView from './components/ProfileView';
import Pricing from './components/Pricing';
import AuthModal from './components/AuthModal';
import ConsumerDashboard from './components/ConsumerDashboard';
import PartnerOnboardingWizard from './components/PartnerOnboardingWizard';
import BusinessDashboard from './components/BusinessDashboard';
import SignupPage from './components/pages/auth/SignupPage';
import { useToast } from './hooks/useToast';
import AuthPage from './components/pages/auth/AuthPage';
import SignupSelectPage from './components/pages/auth/SignupSelectPage';
import { OtpVerification } from './components/auth/OtpVerification';
import SupabaseCallbackPage from './components/pages/auth/SupabaseCallbackPage';
import ForgotPasswordPage from './components/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/pages/auth/ResetPasswordPage';
import Get3QuotesPage from './components/pages/Get3QuotesPage';
import MockGet3QuotesModalCPage from './components/pages/mock/MockGet3QuotesModalCPage';
import Footer from './components/layout/Footer';
import ConsumerSidebar from './components/layout/ConsumerSidebar';
import PartnerSidebar from './components/layout/PartnerSidebar';
import AdminSidebar from './components/layout/AdminSidebar';
import { Company, ModalState } from './types';
import { useLocation, useNavigate, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Visitor Pages
import CategoriesPage from './components/pages/visitor/CategoriesPage';
import HowItWorksPage from './components/pages/visitor/HowItWorksPage';
import AboutPage from './components/pages/visitor/AboutPage';
import ContactPage from './components/pages/visitor/ContactPage';
import BlogPage from './components/pages/visitor/BlogPage';
import BlogPostPage from './components/pages/visitor/BlogPostPage';
import PrivacyPolicyPage from './components/pages/visitor/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/visitor/TermsOfServicePage';
import ForBusinessesPage from './components/pages/visitor/ForBusinessesPage';
import MarketingPage from './components/pages/visitor/MarketingPage';
import CookieConsent from './components/common/CookieConsent';

// Consumer Pages
import SavedListingsPage from './components/pages/consumer/SavedListingsPage';
import MyInquiriesPage from './components/pages/consumer/MyInquiriesPage';
import ConsumerAccountSettings from './components/pages/consumer/ConsumerAccountSettings';

// Partner Pages
import PartnerProfileEditor from './components/PartnerProfileEditor';
import ServicesManagement from './components/pages/partner/ServicesManagement';
import PortfolioManagement from './components/pages/partner/PortfolioManagement';
import TestimonialsManagement from './components/pages/partner/TestimonialsManagement';
import PartnerLeadDashboard from './components/pages/partner/PartnerLeadDashboard';
import LeadsMessagesPage from './components/pages/partner/LeadsMessagesPage';
import SubscriptionBillingPage from './components/pages/partner/SubscriptionBillingPage';
import PartnerAccountSettings from './components/pages/partner/PartnerAccountSettings';
import VerificationSection from './components/pages/partner/VerificationSection';
import GrowthDashboard from './components/pages/partner/GrowthDashboard';

// Admin Pages
import SuperAdminDashboard from './components/pages/admin/SuperAdminDashboard';
import CompaniesManagement from './components/pages/admin/CompaniesManagement';
import ConsumersManagement from './components/pages/admin/ConsumersManagement';
import PartnersManagement from './components/pages/admin/PartnersManagement';
import CategoriesManagement from './components/pages/admin/CategoriesManagement';
import LocationsManagement from './components/pages/admin/LocationsManagement';
import SubscriptionsManagement from './components/pages/admin/SubscriptionsManagement';
import AdminGrowthHub from './components/pages/admin/AdminGrowthHub';
import InquiriesManagement from './components/pages/admin/InquiriesManagement';
import AnalyticsPage from './components/pages/admin/AnalyticsPage';
import PlatformSettings from './components/pages/admin/PlatformSettings';
import AdminUsersPage from './components/pages/admin/AdminUsersPage';
import FinanceDashboard from './components/pages/admin/FinanceDashboard';
import TransactionsPage from './components/pages/admin/TransactionsPage';
import VerificationQueuePage from './components/pages/admin/VerificationQueuePage';
import ActivityLogsPage from './components/pages/admin/ActivityLogsPage';
import SecurityLogsPage from './components/pages/admin/SecurityLogsPage';
import DatabaseManagementPage from './components/pages/admin/DatabaseManagementPage';
import ApiMonitoringPage from './components/pages/admin/ApiMonitoringPage';
import BlogManagementPage from './components/pages/admin/BlogManagementPage';

import BillingSuccessPage from './components/pages/billing/BillingSuccessPage';
import BillingCancelPage from './components/pages/billing/BillingCancelPage';
import { api } from './services/api';

// Wrapper to handle direct URL navigation by slug or ID
const ProfileRouteWrapper: React.FC<{
  companies: Company[],
  selectedCompany: Company | null,
  lang: Language,
}> = ({ companies, selectedCompany, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // If clicked directly in UI, use selectedCompany
  if (selectedCompany && (selectedCompany.id === id || (selectedCompany as any).slug === id)) {
    return <ProfileView company={selectedCompany} onBack={() => navigate('/browse')} lang={lang} onOpenModal={() => { }} />;
  }

  // Otherwise find by slug or CUID from the loaded companies
  const foundCompany = companies.find((c: any) => c.slug === id || c.id === id);
  
  // Pass foundCompany (could be undefined if companies haven't loaded yet)
  return <ProfileView company={foundCompany as Company} onBack={() => navigate('/browse')} lang={lang} onOpenModal={() => { }} />;
};

const ReplayOnboardingRoute: React.FC<{
  lang: Language;
  onComplete: () => void;
}> = ({ lang, onComplete }) => {
  const { step } = useParams<{ step: string }>();
  const s = step ? Number(step) : 5;
  const forceStep = Number.isFinite(s) ? Math.max(1, Math.min(5, s)) : 5;
  return (
    <PartnerOnboardingWizard
      key={`replay-${forceStep}`}
      lang={lang}
      currentStep={forceStep}
      forceReplay={true}
      forceStep={forceStep}
      onNavigate={() => { }}
      onComplete={onComplete}
    />
  );
};

// Wrapper for Partner routes to ensure company exists
const PartnerRoute: React.FC<{
  children: React.ReactElement;
  company: Company | null;
  isLoading?: boolean;
}> = ({ children, company, isLoading }) => {
  const { isLoading: authLoading } = useAuth();
  
  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-nexus-accent" size={32} /></div>;
  }
  
  if (!company) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }
  
  return children;
};

const NexusGuard: React.FC<{
  children: (company: Company) => React.ReactElement;
  company: Company | null;
}> = ({ children, company }) => {
  const { isLoading: authLoading, user } = useAuth();
  
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-nexus-accent" size={32} /></div>;
  }
  
  const bypassEmails = new Set(
    String((import.meta as any).env?.VITE_TEST_BYPASS_EMAILS || 'httpscure@gmail.com')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean)
  );
  const isBypassUser = !!user?.email && bypassEmails.has(user.email.toLowerCase());

  if (!company && !isBypassUser) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  // For bypass users, allow rendering partner pages even if company is missing.
  // We provide a minimal "fake" company to satisfy existing components.
  const safeCompany = (company || ({
    id: 'test-bypass-company',
    name: user?.name || user?.email || 'Test user',
    shortDescription: '',
    isVerified: false,
    rating: 0,
    reviewCount: 0,
    category: '',
    location: '',
    tags: [],
    pricingTier: 'Basic',
    contactEmail: user?.email || '',
    website: '',
    services: [],
    portfolio: [],
    testimonials: [],
  } as any)) as Company;
  return children(safeCompany);
};

const App: React.FC = () => {
  const { user, logout, isAuthenticated, refreshUser, upgradeAccount, showAuthModal, setShowAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    lang, setLang,
    filters, setFilters,
    companies,
    savedCompanyIds, toggleFavorite,
  } = useMarketplace();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [partnerCompanyCache, setPartnerCompanyCache] = useState<Company | null>(() => {
    try {
      const raw = localStorage.getItem('partnerCompanyCache');
      return raw ? (JSON.parse(raw) as Company) : null;
    } catch {
      return null;
    }
  });

  const userRole = user?.role || null;
  const isLoggedIn = isAuthenticated;

  const getCurrentCompany = (): Company | null => {
    if (!user) return null;
    if (user.role !== 'PARTNER' && user.role !== 'ADMIN') return null;

    // 1. Search in companies list using ownerId
    const found = companies.find((c: any) => c.ownerId === user.id);
    if (found) return found;

    // 2. Fall back to cached company (useful right after onboarding completes before marketplace list refreshes)
    if (partnerCompanyCache && (partnerCompanyCache as any).ownerId === user.id) {
      return partnerCompanyCache;
    }

    return null;
  };

  // Keep partner company cache fresh (prevents guard redirect loops after onboarding)
  useEffect(() => {
    const refreshCachedCompany = async () => {
      if (!user || user.role !== 'PARTNER') return;
      try {
        const status = await api.getOnboardingStatus();
        if (status?.company) {
          setPartnerCompanyCache(status.company);
          try {
            localStorage.setItem('partnerCompanyCache', JSON.stringify(status.company));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    };
    refreshCachedCompany();
  }, [user?.id, user?.role]);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    navigate(`/profile/${(company as any).slug || company.id}`);
  };

  const handleLogout = () => {
    logout();
    toast.info(lang === 'da' ? 'Du er nu logget ud' : 'Logged out');
    navigate('/');
  };

  const needsSidebar = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  // Ensure redirects land at top (fixes "navigated to onboarding but stayed scrolled down")
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-nexus-bg font-sans text-nexus-text selection:bg-nexus-text selection:text-white relative">
      {(import.meta as any).env?.MODE === 'sim' && (
        <div className="fixed top-20 right-4 z-[9999] px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-black shadow-2xl">
          SIM MODE
        </div>
      )}
      {location.pathname.startsWith('/dashboard/onboarding/replay') && (
        <div className="fixed bottom-4 left-4 z-[9999] px-4 py-2 rounded-xl bg-black text-white text-xs font-bold shadow-2xl">
          REPLAY ROUTE ACTIVE: {location.pathname}
        </div>
      )}
      <Navbar
        lang={lang}
        setLang={setLang}
        onLoginPartner={() => navigate('/auth?mode=partner')}
        onLoginConsumer={() => navigate('/auth?mode=consumer')}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
        company={user?.role === 'PARTNER' ? getCurrentCompany() : null}
      />

      <div className="flex">
        {needsSidebar && userRole === 'CONSUMER' && (
          <ConsumerSidebar
            lang={lang}
            onLogout={handleLogout}
          />
        )}
        {needsSidebar && userRole === 'PARTNER' && (
          <PartnerSidebar
            lang={lang}
            onLogout={handleLogout}
          />
        )}
        {needsSidebar && (userRole === 'ADMIN' || location.pathname.startsWith('/admin')) && (
          <AdminSidebar
            lang={lang}
            onLogout={handleLogout}
          />
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage onCompanyClick={handleCompanyClick} />} />
            <Route path="/browse" element={<BrowsePage onCompanyClick={handleCompanyClick} />} />
            <Route path="/categories" element={<CategoriesPage lang={lang} onCategorySelect={(cat) => { setFilters({ ...filters, category: cat }); navigate('/browse'); }} />} />
            <Route path="/pricing" element={
              <Pricing
                lang={lang}
                user={user}
                onSelectPlan={async (plan) => {
                  // If user is already logged in as PARTNER, go directly to billing
                  if (user && userRole === 'PARTNER') {
                    navigate(`/dashboard/billing?plan=${plan.id}&period=${plan.billingPeriod}`);
                  } else if (user && userRole === 'CONSUMER') {
                    try {
                      toast.success(lang === 'da'
                        ? 'Opgraderer din konto til Erhverv...'
                        : 'Upgrading your account to Business...');
                      await upgradeAccount();
                      // We don't save growth services because this is standard platform pricing
                      // So we just take them to onboarding
                      navigate('/dashboard/onboarding');
                    } catch (error: any) {
                      toast.error(lang === 'da' ? 'Kunne ikke opgradere konto: ' + error.message : 'Could not upgrade account: ' + error.message);
                    }
                  } else {
                    // Not logged in, go to signup flow
                    navigate('/signup-select');
                  }
                }}
              />
            } />
            <Route path="/auth" element={<AuthPage lang={lang} initialMode="login" onSuccess={() => navigate('/')} />} />
            <Route path="/auth/supabase/callback" element={<SupabaseCallbackPage lang={lang} />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage lang={lang} />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage lang={lang} />} />
            <Route path="/for-businesses" element={<ForBusinessesPage lang={lang} />} />
            <Route path="/marketing" element={<MarketingPage lang={lang} />} />
            <Route path="/signup" element={
              <SignupPage
                lang={lang}
                onSuccess={(role) => navigate(role === 'PARTNER' ? '/dashboard/onboarding' : '/')}
                onBack={() => navigate('/auth')}
              />
            } />
            <Route path="/signup-select" element={
              <SignupSelectPage
                lang={lang}
                onBack={() => navigate('/auth')}
              />
            } />
            <Route path="/verify-email" element={<OtpVerification lang={lang} />} />
            <Route path="/get-offers" element={<Get3QuotesPage lang={lang} />} />
            <Route path="/mock/get-offers-modal-c" element={<MockGet3QuotesModalCPage lang={lang} />} />

            <Route path="/profile/:id" element={<ProfileRouteWrapper companies={companies} selectedCompany={selectedCompany} lang={lang} />} />

            <Route path="/how-it-works" element={<HowItWorksPage lang={lang} onGetStarted={() => navigate('/pricing')} />} />
            <Route path="/about" element={<AboutPage lang={lang} />} />
            <Route path="/contact" element={<ContactPage lang={lang} />} />
            <Route path="/blog" element={<BlogPage lang={lang} />} />
            <Route path="/blog/:slug" element={<BlogPostPage lang={lang} />} />
            <Route path="/privacy" element={<PrivacyPolicyPage lang={lang} onBack={() => navigate('/')} />} />
            <Route path="/terms" element={<TermsOfServicePage lang={lang} onBack={() => navigate('/')} />} />

            <Route path="/dashboard" element={
              userRole === 'CONSUMER' ? (
                <ConsumerDashboard
                  user={user as any}
                  savedCompanies={companies.filter(c => savedCompanyIds.includes(c.id))}
                  lang={lang}
                  onViewProfile={handleCompanyClick}
                  onBrowse={() => navigate('/browse')}
                  onToggleFavorite={toggleFavorite}
                />
              ) : userRole === 'PARTNER' ? (
                <BusinessDashboard
                  lang={lang}
                  onEditListing={() => navigate('/dashboard/profile')}
                  onManageServices={() => navigate('/dashboard/services')}
                  onManagePortfolio={() => navigate('/dashboard/portfolio')}
                  onManageTestimonials={() => navigate('/dashboard/testimonials')}
                  onViewInquiries={() => navigate('/dashboard/inquiries')}
                  onViewGrowth={() => navigate('/dashboard/growth')}
                />
              ) : userRole === 'ADMIN' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={userRole === 'ADMIN' ? <SuperAdminDashboard lang={lang} onNavigate={(path) => {
              if (path === 'GROWTH_HUB') {
                navigate('/admin/growth');
              } else {
                navigate(`/admin/${path.toLowerCase().replace('admin_', '').replace('_', '-')}`);
              }
            }} /> : <Navigate to="/auth" />} />
            <Route path="/admin/growth" element={userRole === 'ADMIN' ? <AdminGrowthHub lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/companies" element={userRole === 'ADMIN' ? <CompaniesManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/consumers" element={userRole === 'ADMIN' ? <ConsumersManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/partners" element={userRole === 'ADMIN' ? <PartnersManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/categories" element={userRole === 'ADMIN' ? <CategoriesManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/locations" element={userRole === 'ADMIN' ? <LocationsManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/subscriptions" element={userRole === 'ADMIN' ? <SubscriptionsManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/inquiries" element={userRole === 'ADMIN' ? <InquiriesManagement lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/analytics" element={userRole === 'ADMIN' ? <AnalyticsPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/settings" element={userRole === 'ADMIN' ? <PlatformSettings lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/users" element={userRole === 'ADMIN' ? <AdminUsersPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/finance" element={userRole === 'ADMIN' ? <FinanceDashboard lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/transactions" element={userRole === 'ADMIN' ? <TransactionsPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/verification-queue" element={userRole === 'ADMIN' ? <VerificationQueuePage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/activity-logs" element={userRole === 'ADMIN' ? <ActivityLogsPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/security-logs" element={userRole === 'ADMIN' ? <SecurityLogsPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/database" element={userRole === 'ADMIN' ? <DatabaseManagementPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/api-monitoring" element={userRole === 'ADMIN' ? <ApiMonitoringPage lang={lang} onBack={() => navigate('/admin')} /> : <Navigate to="/auth" />} />
            <Route path="/admin/blog" element={userRole === 'ADMIN' ? <BlogManagementPage /> : <Navigate to="/auth" />} />

            <Route path="/dashboard/settings" element={userRole === 'PARTNER' ? (
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <PartnerAccountSettings company={company} lang={lang} onBack={() => navigate('/dashboard')} onSave={async () => { }} />}
              </NexusGuard>
            ) : <ConsumerAccountSettings user={user as any} lang={lang} onBack={() => navigate('/dashboard')} onSave={async () => { }} />} />

            <Route path="/dashboard/profile" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <PartnerProfileEditor company={company} lang={lang} onSave={() => { refreshUser(); navigate('/dashboard'); }} onCancel={() => navigate('/dashboard')} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/services" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <ServicesManagement services={company.services || []} companyId={company.id} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/portfolio" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <PortfolioManagement portfolio={company.portfolio || []} companyId={company.id} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/testimonials" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <TestimonialsManagement testimonials={company.testimonials || []} companyId={company.id} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/inquiries" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <LeadsMessagesPage lang={lang} onBack={() => navigate('/dashboard')} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/billing" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <SubscriptionBillingPage company={company} lang={lang} onBack={() => navigate('/dashboard')} onNavigate={() => { }} />}
              </NexusGuard>
            } />
            <Route path="/dashboard/verification" element={
              <NexusGuard company={getCurrentCompany()}>
                {(company) => (
                  <div className="max-w-5xl mx-auto px-4 py-10">
                    <VerificationSection company={company} lang={lang} onUpdate={() => navigate('/dashboard')} />
                  </div>
                )}
              </NexusGuard>
            } />
            <Route path="/dashboard/growth" element={(userRole === 'PARTNER' || userRole === 'ADMIN') ? (
              <NexusGuard company={getCurrentCompany()}>
                {(company) => <GrowthDashboard company={company} lang={lang} />}
              </NexusGuard>
            ) : <Navigate to="/auth" />} />

            {/* Replay onboarding (no querystring) */}
            <Route
              path="/dashboard/onboarding/replay"
              element={
                <PartnerOnboardingWizard
                  key="replay"
                  lang={lang}
                  currentStep={5}
                  forceReplay={true}
                  forceStep={5}
                  onNavigate={() => { }}
                  onComplete={() => navigate('/dashboard')}
                />
              }
            />
            <Route
              path="/dashboard/onboarding/replay/5"
              element={
                <PartnerOnboardingWizard
                  key="replay-5-exact"
                  lang={lang}
                  currentStep={5}
                  forceReplay={true}
                  forceStep={5}
                  onNavigate={() => { }}
                  onComplete={() => navigate('/dashboard')}
                />
              }
            />
            <Route
              path="/dashboard/onboarding/replay/:step"
              element={
                <ReplayOnboardingRoute
                  lang={lang}
                  onComplete={() => navigate('/dashboard')}
                />
              }
            />

            <Route path="/dashboard/onboarding" element={<PartnerOnboardingWizard
              key={location.search}
              lang={lang}
              currentStep={1}
              forceReplay={new URLSearchParams(location.search).has('replay')}
              forceStep={Number(new URLSearchParams(location.search).get('step') || '') || undefined}
              onNavigate={() => { }}
              onComplete={() => {
              if (localStorage.getItem('selectedGrowthServices')) {
                navigate('/dashboard/growth');
              } else {
                navigate('/dashboard');
              }
            }}
            />} />

            <Route path="/billing/success" element={<BillingSuccessPage lang={lang} onContinue={() => navigate('/dashboard')} />} />
            <Route path="/billing/cancel" element={<BillingCancelPage lang={lang} onBack={() => navigate('/')} onRetry={() => navigate('/pricing')} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={true}
          type={ModalState.LOGIN}
          onClose={() => setShowAuthModal(false)}
          lang={lang}
          onSuccess={() => setShowAuthModal(false)}
          company={selectedCompany}
        />
      )}

      <Footer lang={lang} />
      {!needsSidebar && <CookieConsent lang={lang} />}
    </div>
  );
};

export default App;
