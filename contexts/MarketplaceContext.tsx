import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Language } from '../types';

/** Language preference for Advero SPA routes (legacy export name kept for existing imports). */
interface MarketplaceContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('da');

  useEffect(() => {
    try {
      const saved =
        (localStorage.getItem('lang') as Language | null) ||
        (localStorage.getItem('advero.lang') as Language | null);
      if (saved === 'da' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
      localStorage.setItem('advero.lang', lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('advero:lang', { detail: { lang } }));
    }
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
