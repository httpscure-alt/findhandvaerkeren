import React, { useState } from 'react';
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
import Get3QuotesPage from './components/pages/Get3QuotesPage';
import Footer from './components/layout/Footer';
import ConsumerSidebar from './components/layout/ConsumerSidebar';
import PartnerSidebar from './components/layout/PartnerSidebar';
import AdminSidebar from './components/layout/AdminSidebar';
import { Company, ModalState } from './types';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';

// Visitor Pages
import CategoriesPage from './components/pages/visitor/CategoriesPage';
import HowItWorksPage from './components/pages/visitor/HowItWorksPage';
import AboutPage from './components/pages/visitor/AboutPage';
import ContactPage from './components/pages/visitor/ContactPage';
import BlogPage from './components/pages/visitor/BlogPage';
import PrivacyPolicyPage from './components/pages/visitor/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/visitor/TermsOfServicePage';
import ForBusinessesPage from './components/pages/visitor/ForBusinessesPage';
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

import BillingSuccessPage from './components/pages/billing/BillingSuccessPage';
import BillingCancelPage from './components/pages/billing/BillingCancelPage';

const App: React.FC = () => {
  const { user, logout, isAuthenticated, refreshUser, showAuthModal, setShowAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    lang, setLang,
    filters, setFilters,
    companies,
    savedCompanyIds, toggleFavorite,
  } = useMarketplace();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const userRole = user?.role || null;
  const isLoggedIn = isAuthenticated;

  const getCurrentCompany = (): Company | null => {
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) return null;

    // 1. Try pre-populated company from user context
    if (user.ownedCompany) return user.ownedCompany as Company;
    if ((user as any).company) return (user as any).company as Company;

    // 2. Fallback: Search in companies list using user ID
    // In mock mode, the company ID typically matches the partner user ID
    return companies.find(c => c.id === user.id) || null;
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    navigate(`/profile/${company.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const needsSidebar = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  return (
    <div className="min-h-screen bg-nexus-bg font-sans text-nexus-text selection:bg-nexus-text selection:text-white relative">
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
            <Route path="/pricing" element={<Pricing lang={lang} user={user} onSelectPlan={() => navigate('/signup-select')} />} />
            <Route path="/auth" element={<AuthPage lang={lang} initialMode="login" onSuccess={() => navigate('/')} />} />
            <Route path="/for-businesses" element={<ForBusinessesPage lang={lang} />} />
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
            <Route path="/verify-email" element={<OtpVerification />} />
            <Route path="/get-offers" element={<Get3QuotesPage lang={lang} />} />

            <Route path="/profile/:id" element={<ProfileView company={selectedCompany || companies[0]} onBack={() => navigate('/browse')} lang={lang} onOpenModal={() => { }} />} />

            <Route path="/how-it-works" element={<HowItWorksPage lang={lang} onGetStarted={() => navigate('/pricing')} />} />
            <Route path="/about" element={<AboutPage lang={lang} />} />
            <Route path="/contact" element={<ContactPage lang={lang} />} />
            <Route path="/blog" element={<BlogPage lang={lang} />} />
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

            <Route path="/dashboard/saved" element={<SavedListingsPage savedCompanies={companies.filter(c => savedCompanyIds.includes(c.id))} lang={lang} onViewProfile={handleCompanyClick} onToggleFavorite={toggleFavorite} onBack={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/inquiries" element={userRole === 'PARTNER' ? <PartnerLeadDashboard /> : <MyInquiriesPage lang={lang} onBack={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/settings" element={userRole === 'PARTNER' ? <PartnerAccountSettings company={getCurrentCompany()!} lang={lang} onBack={() => navigate('/dashboard')} onSave={async () => { }} /> : <ConsumerAccountSettings user={user as any} lang={lang} onBack={() => navigate('/dashboard')} onSave={async () => { }} />} />

            <Route path="/dashboard/profile" element={<PartnerProfileEditor company={getCurrentCompany()!} lang={lang} onSave={() => navigate('/dashboard')} onCancel={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/services" element={<ServicesManagement services={getCurrentCompany()?.services || []} companyId={getCurrentCompany()?.id || ''} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/portfolio" element={<PortfolioManagement portfolio={getCurrentCompany()?.portfolio || []} companyId={getCurrentCompany()?.id || ''} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/testimonials" element={<TestimonialsManagement testimonials={getCurrentCompany()?.testimonials || []} companyId={getCurrentCompany()?.id || ''} lang={lang} onSave={refreshUser} onBack={() => navigate('/dashboard')} />} />
            <Route path="/dashboard/billing" element={<SubscriptionBillingPage company={getCurrentCompany()!} lang={lang} onBack={() => navigate('/dashboard')} onNavigate={() => { }} />} />
            <Route path="/dashboard/verification" element={<div className="max-w-5xl mx-auto px-4 py-10"><VerificationSection company={getCurrentCompany()!} lang={lang} onUpdate={() => navigate('/dashboard')} /></div>} />
            <Route path="/dashboard/growth" element={(userRole === 'PARTNER' || userRole === 'ADMIN') ? <GrowthDashboard company={getCurrentCompany() || companies[0] || {} as any} lang={lang} /> : <Navigate to="/auth" />} />
            <Route path="/dashboard/onboarding" element={<PartnerOnboardingWizard lang={lang} currentStep={1} onNavigate={() => { }} onComplete={() => {
              if (localStorage.getItem('selectedGrowthServices')) {
                navigate('/dashboard/growth');
              } else {
                navigate('/dashboard');
              }
            }} />} />

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
