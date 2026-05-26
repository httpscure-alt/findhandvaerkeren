import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { ADVERO_ADMIN_NAV } from '../../../../lib/adveroAdminNav';
import '../advero-ds.css';
import './advero-admin.css';

const AdveroAdminLayout: React.FC = () => {
  const { lang } = useMarketplace();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const businessNav = ADVERO_ADMIN_NAV.filter((n) => n.section === 'business');
  const contentNav = ADVERO_ADMIN_NAV.filter((n) => n.section === 'content');

  const renderNav = (items: typeof ADVERO_ADMIN_NAV) =>
    items.map((item) => {
      const Icon = item.icon;
      const label = isDa ? item.labelDa : item.labelEn;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `advero-admin-nav-item ${isActive ? 'advero-admin-nav-item--active' : ''}`
          }
        >
          <Icon size={18} aria-hidden />
          {label}
        </NavLink>
      );
    });

  return (
    <div className="advero-ds advero-admin-shell min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <header className="advero-admin-header">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="advero-admin-brand-row">
            <a href="/" className="advero-site-header-brand" aria-label="Advero">
              <img
                src="/brand/advero-logo-light.png"
                alt=""
                width={800}
                height={168}
                decoding="async"
                className="advero-logo-wordmark-light object-contain object-left"
              />
            </a>
            <span className="advero-admin-badge">{isDa ? 'Internt' : 'Internal'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span>{user?.email}</span>
            <Link to="/blog" className="hover:text-white" target="_blank" rel="noreferrer">
              {isDa ? 'Se blog' : 'View blog'}
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-white"
              onClick={() => {
                logout();
                navigate('/advero/login');
              }}
            >
              <LogOut size={16} aria-hidden />
              {isDa ? 'Log ud' : 'Log out'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="advero-admin-sidebar">
          <p className="advero-admin-nav-section">{isDa ? 'Forretning' : 'Business'}</p>
          <nav className="flex flex-col gap-1">{renderNav(businessNav)}</nav>

          <p className="advero-admin-nav-section">{isDa ? 'Indhold' : 'Content'}</p>
          <nav className="flex flex-col gap-1">{renderNav(contentNav)}</nav>

          <Link to="/advero/admin/posts/new" className="advero-admin-new-btn mt-4">
            <FileText size={18} aria-hidden />
            {isDa ? 'Ny artikel' : 'New article'}
          </Link>
        </aside>
        <main className="advero-admin-main min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdveroAdminLayout;
