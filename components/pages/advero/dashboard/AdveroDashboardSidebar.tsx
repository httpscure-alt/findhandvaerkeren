import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Calendar,
  LineChart,
  Megaphone,
  CreditCard,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Sparkles,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Language } from '../../../../types';
import AdveroLangToggle from '../AdveroLangToggle';
import {
  isDashboardNavModuleEnabled,
  type DashboardNavModule,
  type WorkspaceEntitlements,
} from '../../../../lib/workspaceEntitlements';

const STORAGE_KEY = 'advero.dashboard.sidebarCollapsed';

export type AdveroDashboardNavItem = {
  path: string;
  icon: LucideIcon;
  labelDa: string;
  labelEn: string;
  badgeDa?: string;
  badgeEn?: string;
  /** When set, item is shown only if the package entitlement allows it. */
  module?: DashboardNavModule;
};

const NAV_ITEMS: AdveroDashboardNavItem[] = [
  { path: '/advero/dashboard', icon: LayoutDashboard, labelDa: 'Overblik', labelEn: 'Overview' },
  {
    path: '/advero/dashboard/visibility',
    icon: FileSearch,
    labelDa: 'SEO-synlighed',
    labelEn: 'SEO visibility',
    badgeDa: 'Ny',
    badgeEn: 'New',
    module: 'visibility',
  },
  {
    path: '/advero/dashboard/ai-visibility',
    icon: Sparkles,
    labelDa: 'AI-synlighed',
    labelEn: 'AI visibility',
    module: 'aiVisibility',
  },
  { path: '/advero/dashboard/calendar', icon: Calendar, labelDa: 'Kalender', labelEn: 'Calendar' },
  { path: '/advero/dashboard/reports', icon: LineChart, labelDa: 'Rapporter', labelEn: 'Reports' },
  {
    path: '/advero/dashboard/campaigns',
    icon: Megaphone,
    labelDa: 'Google Ads',
    labelEn: 'Google Ads',
    module: 'campaigns',
  },
];

const FOOTER_ITEMS: AdveroDashboardNavItem[] = [
  { path: '/advero/dashboard/billing', icon: CreditCard, labelDa: 'Abonnement', labelEn: 'Billing' },
  { path: '/advero/dashboard/settings', icon: Settings, labelDa: 'Indstillinger', labelEn: 'Settings' },
];

interface AdveroDashboardSidebarProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  workspaceName: string;
  workspaceInitial: string;
  onLogout: () => void;
  /** Link to /contact when user has no active subscription (no Crisp). */
  showContactSupport?: boolean;
  entitlements?: WorkspaceEntitlements;
  /** Override nav targets (e.g. `/advero/dev/dashboard-preview/growth`). */
  dashboardBasePath?: string;
}

function isActivePath(pathname: string, path: string): boolean {
  if (path === '/advero/dashboard') {
    return pathname === path || pathname === `${path}/`;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

const AdveroDashboardSidebar: React.FC<AdveroDashboardSidebarProps> = ({
  lang,
  onLangChange,
  workspaceName,
  workspaceInitial,
  onLogout,
  showContactSupport = false,
  entitlements,
  dashboardBasePath = '/advero/dashboard',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const toDashboardPath = (itemPath: string) =>
    itemPath.replace(/^\/advero\/dashboard/, dashboardBasePath);

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.module || !entitlements || isDashboardNavModuleEnabled(item.module, entitlements)
  );

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  const renderNavButton = (item: AdveroDashboardNavItem) => {
    const Icon = item.icon;
    const path = toDashboardPath(item.path);
    const active = isActivePath(location.pathname, path);
    const label = isDa ? item.labelDa : item.labelEn;

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => navigate(path)}
        title={collapsed ? label : undefined}
        className={`advero-dash-nav-item ${active ? 'advero-dash-nav-item--active' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon size={20} strokeWidth={1.75} aria-hidden />
        {!collapsed && (
          <>
            <span className="advero-dash-nav-label">{label}</span>
            {(item.badgeDa || item.badgeEn) ? (
              <span className="advero-dash-nav-badge">
                {isDa ? item.badgeDa : item.badgeEn}
              </span>
            ) : null}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`advero-dash-sidebar ${collapsed ? 'advero-dash-sidebar--collapsed' : ''}`}
      aria-label={isDa ? 'Primær navigation' : 'Primary navigation'}
    >
      <div className="advero-dash-sidebar-inner">
        <div className="advero-dash-sidebar-header">
          <button
            type="button"
            className="advero-dash-brand"
            onClick={() => navigate(dashboardBasePath)}
            aria-label="Advero"
          >
            {!collapsed ? (
              <img
                src="/brand/advero-logo-light.png"
                alt=""
                width={800}
                height={168}
                decoding="async"
                className="advero-logo-wordmark-light advero-dash-wordmark"
              />
            ) : (
              <span className="advero-dash-logo-mark" aria-hidden>
                <Sparkles size={18} strokeWidth={2} className="text-sky-200" />
              </span>
            )}
          </button>
          <button
            type="button"
            className="advero-dash-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={
              collapsed
                ? isDa
                  ? 'Udvid menu'
                  : 'Expand menu'
                : isDa
                  ? 'Skjul menu'
                  : 'Collapse menu'
            }
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        <button
          type="button"
          className="advero-dash-workspace"
          aria-label={isDa ? 'Vælg virksomhed' : 'Select workspace'}
          title={workspaceName}
        >
          <span className="advero-dash-workspace-avatar" aria-hidden>
            {workspaceInitial}
          </span>
          {!collapsed && (
            <>
              <span className="advero-dash-workspace-name">{workspaceName}</span>
              <ChevronsUpDown size={16} className="advero-dash-workspace-chevron" aria-hidden />
            </>
          )}
        </button>

        <nav className="advero-dash-nav">{visibleNavItems.map(renderNavButton)}</nav>

        <div className="advero-dash-nav-footer">
          <div className={`advero-dash-lang-wrap ${collapsed ? 'advero-dash-lang-wrap--collapsed' : ''}`}>
            <AdveroLangToggle lang={lang} onChange={onLangChange} compact={collapsed} />
          </div>
          {showContactSupport ? (
            <a
              href="/contact"
              className="advero-dash-nav-item"
              title={collapsed ? (isDa ? 'Kontakt support' : 'Contact support') : undefined}
            >
              <MessageCircle size={20} strokeWidth={1.75} aria-hidden />
              {!collapsed && (
                <span className="advero-dash-nav-label">
                  {isDa ? 'Kontakt support' : 'Contact support'}
                </span>
              )}
            </a>
          ) : null}
          {FOOTER_ITEMS.map(renderNavButton)}
          <button
            type="button"
            className="advero-dash-nav-item advero-dash-nav-item--logout"
            onClick={onLogout}
            title={collapsed ? (isDa ? 'Log ud' : 'Log out') : undefined}
          >
            <LogOut size={20} strokeWidth={1.75} aria-hidden />
            {!collapsed && (
              <span className="advero-dash-nav-label">{isDa ? 'Log ud' : 'Log out'}</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdveroDashboardSidebar;
