import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { useIsAdmin } from '../../../../hooks/useIsAdmin';
import '../advero-ds.css';
import './advero-blog.css';

const AdveroBlogLayout: React.FC = () => {
  const { lang, setLang } = useMarketplace();
  const isAdmin = useIsAdmin();
  const isDa = lang === 'da';

  return (
    <div className="advero-ds advero-blog-shell">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <header className="advero-blog-header">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="flex items-center" aria-label="Advero">
            <img
              src="/brand/advero-logo-light.png"
              alt=""
              className="h-9 w-auto object-contain"
              decoding="async"
            />
          </a>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/75">
            <a href="/#tiers" className="hover:text-white">
              {isDa ? 'Pakker' : 'Plans'}
            </a>
            <Link to="/blog" className="text-white">
              {isDa ? 'Indsigt' : 'Insights'}
            </Link>
            <a href="/contact" className="hover:text-white">
              {isDa ? 'Kontakt' : 'Contact'}
            </a>
            {isAdmin ? (
              <Link to="/advero/admin" className="text-sky-200 hover:text-white">
                {isDa ? 'CMS' : 'CMS'}
              </Link>
            ) : null}
            <div className="advero-lang-toggle" role="group" aria-label={isDa ? 'Sprog' : 'Language'}>
              <button
                type="button"
                aria-pressed={lang === 'da'}
                onClick={() => {
                  setLang('da');
                  try {
                    localStorage.setItem('advero.lang', 'da');
                  } catch {
                    /* ignore */
                  }
                }}
              >
                DK
              </button>
              <div className="advero-lang-divider" aria-hidden />
              <button
                type="button"
                aria-pressed={lang === 'en'}
                onClick={() => {
                  setLang('en');
                  try {
                    localStorage.setItem('advero.lang', 'en');
                  } catch {
                    /* ignore */
                  }
                }}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AdveroBlogLayout;
