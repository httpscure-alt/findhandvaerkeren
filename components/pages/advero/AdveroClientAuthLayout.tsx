import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import './advero-ds.css';

type AdveroClientAuthLayoutProps = {
  children: React.ReactNode;
  /** e.g. `/advero/get-started?step=3` */
  backHref: string;
};

const AdveroClientAuthLayout: React.FC<AdveroClientAuthLayoutProps> = ({ children, backHref }) => {
  const { lang, setLang } = useMarketplace();
  const isDa = lang === 'da';

  return (
    <div className="advero-ds relative isolate min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <header className="advero-site-header">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-10 sm:py-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-5">
            <a href="/" className="advero-site-header-brand flex shrink-0 items-center" aria-label="Advero">
              <img
                src="/brand/advero-logo-light.png"
                alt=""
                width={800}
                height={168}
                decoding="async"
                className="advero-logo-wordmark-light object-contain object-left"
              />
            </a>
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {isDa ? 'Tilbage til opsætning' : 'Back to setup'}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
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
            <a href="/brand-v2/advero-contact.html" className="advero-btn-ghost hidden text-center sm:inline-flex">
              {isDa ? 'Kontakt' : 'Contact'}
            </a>
            <a
              href="/"
              className="advero-btn-slate-solid inline-flex shrink-0 items-center rounded-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-[14px]"
            >
              {isDa ? 'Til forsiden' : 'Back to home'}
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-[1] flex flex-col items-center px-4 py-10 sm:px-6 lg:px-10">{children}</div>
    </div>
  );
};

export default AdveroClientAuthLayout;
