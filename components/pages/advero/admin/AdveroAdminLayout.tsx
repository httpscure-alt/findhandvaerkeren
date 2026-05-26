import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FileText, LayoutGrid, LogOut, Search } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { useAuth } from '../../../../contexts/AuthContext';
import '../advero-ds.css';
import './advero-admin.css';

const AdveroAdminLayout: React.FC = () => {
  const { lang } = useMarketplace();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const nav = [
    { to: '/advero/admin', end: true, icon: LayoutGrid, label: isDa ? 'Artikler' : 'Articles' },
    { to: '/advero/admin/seo', end: false, icon: Search, label: isDa ? 'SEO-værktøjer' : 'SEO tools' },
  ];

  return (
    <div className="advero-ds advero-admin-shell min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <header className="advero-admin-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <a href="/" className="advero-admin-brand" aria-label="Advero">
              <img src="/brand/advero-logo-light.png" alt="" className="h-8 w-auto" />
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

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="advero-admin-sidebar">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
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
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
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
