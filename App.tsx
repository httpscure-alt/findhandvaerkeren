import React, { useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMarketplace } from './contexts/MarketplaceContext';
import SignupPage from './components/pages/auth/SignupPage';
import SupabaseCallbackPage from './components/pages/auth/SupabaseCallbackPage';
import ForgotPasswordPage from './components/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/pages/auth/ResetPasswordPage';
import BillingSuccessPage from './components/pages/billing/BillingSuccessPage';
import BillingCancelPage from './components/pages/billing/BillingCancelPage';
import AdveroClientGetStartedPage from './components/pages/advero/AdveroClientGetStartedPage';
import AdveroAuditIntakePage from './components/pages/advero/AdveroAuditIntakePage';
import AdveroAuditAnalyzingPage from './components/pages/advero/AdveroAuditAnalyzingPage';
import AdveroAuditResultsPage from './components/pages/advero/AdveroAuditResultsPage';
import AdveroReportPreviewPage from './components/pages/advero/AdveroReportPreviewPage';
import AdveroClientLoginPage from './components/pages/advero/AdveroClientLoginPage';
import AdveroClientSignupPage from './components/pages/advero/AdveroClientSignupPage';
import AdveroVerifyEmailPage from './components/pages/advero/AdveroVerifyEmailPage';
import AdveroDashboardRoute from './components/pages/advero/dashboard/AdveroDashboardRoute';
import AdveroDashboardHomePage from './components/pages/advero/dashboard/AdveroDashboardHomePage';
import AdveroDashboardReportsPage from './components/pages/advero/dashboard/AdveroDashboardReportsPage';
import AdveroDashboardVisibilityPage from './components/pages/advero/dashboard/AdveroDashboardVisibilityPage';
import AdveroDashboardPlaceholderPage from './components/pages/advero/dashboard/AdveroDashboardPlaceholderPage';
import AdveroGoogleAdsPerformancePage from './components/pages/advero/dashboard/AdveroGoogleAdsPerformancePage';
import AdveroDashboardIntegrationsPage from './components/pages/advero/dashboard/AdveroDashboardIntegrationsPage';
import AdveroAdminRoute from './components/pages/advero/admin/AdveroAdminRoute';
import AdveroAdminOverviewPage from './components/pages/advero/admin/AdveroAdminOverviewPage';
import AdveroAdminWorkspacesPage from './components/pages/advero/admin/AdveroAdminWorkspacesPage';
import AdveroAdminAuditsPage from './components/pages/advero/admin/AdveroAdminAuditsPage';
import AdveroAdminSubscriptionsPage from './components/pages/advero/admin/AdveroAdminSubscriptionsPage';
import AdveroAdminFulfillmentPage from './components/pages/advero/admin/AdveroAdminFulfillmentPage';
import AdveroAdminUsersPage from './components/pages/advero/admin/AdveroAdminUsersPage';
import AdveroAdminPostsPage from './components/pages/advero/admin/AdveroAdminPostsPage';
import AdveroAdminPostEditorPage from './components/pages/advero/admin/AdveroAdminPostEditorPage';
import AdveroAdminSeoPage from './components/pages/advero/admin/AdveroAdminSeoPage';
import AdveroBlogLayout from './components/pages/advero/blog/AdveroBlogLayout';
import AdveroBlogListPage from './components/pages/advero/blog/AdveroBlogListPage';
import AdveroBlogPostPage from './components/pages/advero/blog/AdveroBlogPostPage';
import GrowthPricingPreviewPage from './components/pages/mock/GrowthPricingPreviewPage';

/** Marketing pages live as static HTML under `public/site/` (served at `/` and `/contact` on Vercel). */
function NavigateToStaticSite({ path }: { path: string }) {
  const href = path.startsWith('/') ? path : `/${path}`;
  useLayoutEffect(() => {
    window.location.replace(href);
  }, [href]);
  return null;
}

function RedirectToHomeSection({ hash }: { hash: string }) {
  const target = `/site/home.html${hash.startsWith('#') ? hash : `#${hash}`}`;
  useLayoutEffect(() => {
    window.location.replace(target);
  }, [target]);
  return null;
}

function BillingSuccessRoute() {
  const { lang } = useMarketplace();
  return <BillingSuccessPage lang={lang} onContinue={() => { window.location.href = '/advero/dashboard'; }} />;
}

function BillingCancelRoute() {
  const { lang } = useMarketplace();
  return (
    <BillingCancelPage
      lang={lang}
      onBack={() => { window.location.href = '/'; }}
      onRetry={() => { window.location.href = '/advero/get-started?step=4'; }}
    />
  );
}

const App: React.FC = () => {
  const location = useLocation();
  const isAdveroSpa =
    location.pathname.startsWith('/advero') ||
    location.pathname.startsWith('/blog') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/billing') ||
    location.pathname.startsWith('/brand-v2/growth-pricing');

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div
      className={
        isAdveroSpa
          ? 'min-h-screen w-full min-w-0 bg-[#334155] font-sans'
          : 'min-h-screen w-full min-w-0 bg-[#FAFAFA] font-sans'
      }
    >
      <Routes>
        {/* Fallback if SPA index.html is hit before Vercel rewrite (must not redirect to `/` — that loops). */}
        <Route path="/" element={<NavigateToStaticSite path="/site/home.html" />} />
        <Route path="/contact" element={<NavigateToStaticSite path="/site/contact.html" />} />
        <Route path="/pricing" element={<RedirectToHomeSection hash="#tiers" />} />
        <Route path="/plans" element={<RedirectToHomeSection hash="#tiers" />} />
        <Route path="/how-it-works" element={<RedirectToHomeSection hash="#how-we-work" />} />
        <Route path="/overview" element={<RedirectToHomeSection hash="#overview" />} />

        {/* Legacy preview URLs */}
        <Route path="/brand-v2/preview-advero-v3-design-system" element={<Navigate to="/" replace />} />
        <Route path="/brand-v2/preview-advero-v3-design-system.html" element={<Navigate to="/" replace />} />
        <Route path="/brand-v2/advero-contact.html" element={<Navigate to="/contact" replace />} />

        <Route path="/advero/audit" element={<AdveroAuditIntakePage />} />
        <Route path="/advero/audit/analyzing" element={<AdveroAuditAnalyzingPage />} />
        <Route path="/advero/audit/results" element={<AdveroAuditResultsPage />} />
        <Route path="/advero/get-started" element={<AdveroClientGetStartedPage />} />
        <Route path="/advero/reports/preview" element={<AdveroReportPreviewPage />} />
        <Route path="/advero/login" element={<AdveroClientLoginPage />} />
        <Route path="/advero/signup" element={<AdveroClientSignupPage />} />
        <Route path="/advero/verify-email" element={<AdveroVerifyEmailPage />} />
        <Route
          path="/verify-email"
          element={<Navigate to={`/advero/verify-email${location.search}`} replace />}
        />
        <Route path="/advero/dashboard" element={<AdveroDashboardRoute />}>
          <Route index element={<AdveroDashboardHomePage />} />
          <Route path="visibility" element={<AdveroDashboardVisibilityPage />} />
          <Route path="reports" element={<AdveroDashboardReportsPage />} />
          <Route
            path="calendar"
            element={
              <AdveroDashboardPlaceholderPage
                titleDa="Kalender"
                titleEn="Calendar"
                bodyDa="Møder og deadlines fra kampagner — kommer snart."
                bodyEn="Meetings and campaign deadlines — coming soon."
              />
            }
          />
          <Route path="campaigns" element={<AdveroGoogleAdsPerformancePage />} />
          <Route
            path="billing"
            element={
              <AdveroDashboardPlaceholderPage
                titleDa="Abonnement"
                titleEn="Billing"
                bodyDa="Administrer plan og betaling under /advero/get-started (trin 4)."
                bodyEn="Manage plan and payment at /advero/get-started (step 4)."
                actionHref="/advero/get-started?step=4"
                actionLabelDa="Gå til betaling"
                actionLabelEn="Go to billing"
              />
            }
          />
          <Route path="settings" element={<AdveroDashboardIntegrationsPage />} />
        </Route>

        <Route path="/advero/admin" element={<AdveroAdminRoute />}>
          <Route index element={<AdveroAdminOverviewPage />} />
          <Route path="workspaces" element={<AdveroAdminWorkspacesPage />} />
          <Route path="audits" element={<AdveroAdminAuditsPage />} />
          <Route path="subscriptions" element={<AdveroAdminSubscriptionsPage />} />
          <Route path="fulfillment" element={<AdveroAdminFulfillmentPage />} />
          <Route path="users" element={<AdveroAdminUsersPage />} />
          <Route path="content" element={<AdveroAdminPostsPage />} />
          <Route path="posts/new" element={<AdveroAdminPostEditorPage />} />
          <Route path="posts/:id" element={<AdveroAdminPostEditorPage />} />
          <Route path="seo" element={<AdveroAdminSeoPage />} />
        </Route>

        <Route path="/blog" element={<AdveroBlogLayout />}>
          <Route index element={<AdveroBlogListPage />} />
          <Route path=":slug" element={<AdveroBlogPostPage />} />
        </Route>

        <Route path="/auth/supabase/callback" element={<SupabaseCallbackPage lang="da" />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage lang="da" />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage lang="da" />} />
        <Route
          path="/signup"
          element={
            <SignupPage
              lang="da"
              onSuccess={() => { window.location.href = '/advero/dashboard'; }}
              onBack={() => { window.location.href = '/advero/login'; }}
            />
          }
        />

        <Route path="/billing/success" element={<BillingSuccessRoute />} />
        <Route path="/billing/cancel" element={<BillingCancelRoute />} />
        <Route path="/brand-v2/growth-pricing" element={<GrowthPricingPreviewPage />} />

        <Route path="/platform" element={<Navigate to="/" replace />} />
        <Route path="/browse" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/advero/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/advero/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
