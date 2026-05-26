import React from 'react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';

type ActiveNav = 'blog' | null;

const COPY = {
  da: {
    homeAria: 'Advero forside',
    overview: 'Sådan arbejder vi',
    howWeWork: 'I praksis',
    plans: 'Pakker',
    insights: 'Indsigt',
    contact: 'Kontakt',
    getStartedNav: 'Kom i gang',
    login: 'Log ind',
    getStarted: 'Kom i gang',
    lang: 'Sprog',
  },
  en: {
    homeAria: 'Advero home',
    overview: 'How we work',
    howWeWork: 'In practice',
    plans: 'Plans',
    insights: 'Insights',
    contact: 'Contact',
    getStartedNav: 'Get started',
    login: 'Log in',
    getStarted: 'Get started',
    lang: 'Language',
  },
} as const;

type Props = {
  activeNav?: ActiveNav;
};

const AdveroMarketingHeader: React.FC<Props> = ({ activeNav = null }) => {
  const { lang, setLang } = useMarketplace();
  const isDa = lang === 'da';
  const t = COPY[isDa ? 'da' : 'en'];

  const setLanguage = (next: 'da' | 'en') => {
    setLang(next);
    try {
      localStorage.setItem('advero.lang', next);
    } catch {
      /* ignore */
    }
  };

  const pillClass = (active: boolean) =>
    `advero-nav-pill${active ? ' advero-nav-pill--active' : ''}`;

  return (
    <header className="advero-site-header advero-marketing-header shrink-0">
      <div className="advero-marketing-header-inner mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-10 sm:py-5 lg:flex-nowrap">
        <div className="order-1 flex min-w-0 shrink-0 items-center lg:order-none lg:min-w-0 lg:flex-1">
          <a id="brand-home-link" href="/" className="advero-site-header-brand" aria-label={t.homeAria}>
            <img
              src="/brand/advero-logo-light.png"
              alt=""
              width={800}
              height={168}
              decoding="async"
              className="advero-logo-wordmark-light object-contain object-left"
            />
          </a>
        </div>

        <nav
          className="order-3 flex flex-1 basis-full justify-center lg:order-none lg:basis-auto"
          aria-label={isDa ? 'Primær navigation' : 'Primary navigation'}
        >
          <div className="advero-nav-tray">
            <a href="/overview" className={pillClass(false)}>
              {t.overview}
            </a>
            <a href="/how-it-works" className={pillClass(false)}>
              {t.howWeWork}
            </a>
            <a href="/pricing" className={pillClass(false)}>
              {t.plans}
            </a>
            {activeNav === 'blog' ? (
              <span className={pillClass(true)} aria-current="page">
                {t.insights}
              </span>
            ) : (
              <a href="/blog" className={pillClass(false)}>
                {t.insights}
              </a>
            )}
            <a href="/contact" className={pillClass(false)}>
              {t.contact}
            </a>
            <a href="/advero/audit" className={pillClass(false)}>
              {t.getStartedNav}
            </a>
          </div>
        </nav>

        <div className="order-2 flex flex-1 items-center justify-end gap-3 lg:order-none lg:min-w-[14rem]">
          <div className="advero-lang-toggle" role="group" aria-label={t.lang}>
            <button type="button" aria-pressed={lang === 'da'} onClick={() => setLanguage('da')}>
              DK
            </button>
            <div className="advero-lang-divider" aria-hidden />
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLanguage('en')}>
              EN
            </button>
          </div>
          <a href="/advero/login" className="advero-marketing-login">
            {t.login}
          </a>
          <a href="/advero/audit" className="advero-btn-slate-solid advero-marketing-cta">
            {t.getStarted}
          </a>
        </div>
      </div>
    </header>
  );
};

export default AdveroMarketingHeader;
