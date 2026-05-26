import React from 'react';
import { Language } from '../../../types';

type AdveroLangToggleProps = {
  lang: Language;
  onChange: (lang: Language) => void;
  /** Compact variant for collapsed sidebar */
  compact?: boolean;
  className?: string;
};

function persistLang(next: Language) {
  try {
    localStorage.setItem('lang', next);
    localStorage.setItem('advero.lang', next);
  } catch {
    /* ignore */
  }
}

const AdveroLangToggle: React.FC<AdveroLangToggleProps> = ({
  lang,
  onChange,
  compact = false,
  className = '',
}) => {
  const isDa = lang === 'da';

  return (
    <div
      className={`advero-lang-toggle ${compact ? 'advero-lang-toggle--compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={isDa ? 'Sprog' : 'Language'}
    >
      <button
        type="button"
        aria-pressed={lang === 'da'}
        onClick={() => {
          onChange('da');
          persistLang('da');
        }}
      >
        DK
      </button>
      <div className="advero-lang-divider" aria-hidden />
      <button
        type="button"
        aria-pressed={lang === 'en'}
        onClick={() => {
          onChange('en');
          persistLang('en');
        }}
      >
        EN
      </button>
    </div>
  );
};

export default AdveroLangToggle;
