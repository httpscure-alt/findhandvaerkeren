import React from 'react';
import type { WhitelabelTheme } from '../../../lib/adveroWhitelabelThemes';

type Props = {
  theme: WhitelabelTheme;
  /** `light` = white logo on gradient/dark bg; `dark` = dark logo on light bg */
  variant?: 'light' | 'dark';
  className?: string;
};

const WhitelabelWordmark: React.FC<Props> = ({ theme, variant = 'light', className = '' }) => {
  const src =
    variant === 'dark' && theme.logoUrlDark
      ? theme.logoUrlDark
      : theme.logoUrl;

  if (src) {
    return (
      <a href="#" className={`wl-wordmark ${className}`} onClick={(e) => e.preventDefault()}>
        <img src={src} alt={theme.name} className="wl-wordmark-img" />
      </a>
    );
  }

  return (
    <a href="#" className={`wl-wordmark ${className}`} onClick={(e) => e.preventDefault()}>
      <span className="wl-wordmark-mark">{theme.initials}</span>
      <span className="wl-wordmark-name">{theme.name}</span>
    </a>
  );
};

export default WhitelabelWordmark;
