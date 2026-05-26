import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMarketplace } from '../contexts/MarketplaceContext';
import type { Language } from '../types';

/** Advero product routes default to Danish (da-DK) copy. */
export function isAdveroProductPath(pathname: string): boolean {
  return pathname.startsWith('/advero');
}

/**
 * Language for Advero SPA: defaults to Danish on /advero/* and keeps UI consistent.
 * English is only used when the user explicitly toggles EN on pages that expose the switch.
 */
export function useAdveroLang() {
  const { lang, setLang } = useMarketplace();
  const { pathname } = useLocation();
  const onAdvero = isAdveroProductPath(pathname);

  useEffect(() => {
    if (!onAdvero) return;
    try {
      const saved = localStorage.getItem('advero.lang') as Language | null;
      if (saved !== 'en' && lang !== 'da') {
        setLang('da');
      }
    } catch {
      if (lang !== 'da') setLang('da');
    }
  }, [onAdvero, lang, setLang]);

  const isDa = onAdvero ? lang !== 'en' : lang === 'da';
  return { isDa, lang: (isDa ? 'da' : 'en') as Language, setLang, onAdvero };
}
