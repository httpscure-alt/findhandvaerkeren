import React from 'react';

type BrandLogoProps = {
  /** Full horizontal logo (default) or icon-only mark */
  variant?: 'full' | 'mark';
  className?: string;
  onClick?: () => void;
};

/**
 * Brand logo from `/public/brand/*.svg` (Vite serves as /brand/...).
 */
const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className = '', onClick }) => {
  const src = variant === 'mark' ? '/brand/logo-mark.svg' : '/brand/logo-full.svg';
  return (
    <img
      src={src}
      alt="Findhåndværkeren"
      width={variant === 'mark' ? 32 : undefined}
      height={32}
      className={`h-8 w-auto select-none transition-transform duration-200 active:scale-95 ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={onClick}
      loading="eager"
      decoding="async"
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      draggable={false}
    />
  );
};

export default BrandLogo;
