import React, { useId } from 'react';

type AdveroHomeSparklineProps = {
  points?: number[];
  className?: string;
  animate?: boolean;
};

const DEFAULT_POINTS = [42, 48, 45, 52, 58, 55, 62, 68, 64, 72, 78];

/** Soft animated sparkline for dashboard overview panels */
const AdveroHomeSparkline: React.FC<AdveroHomeSparklineProps> = ({
  points = DEFAULT_POINTS,
  className = '',
  animate = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const w = 320;
  const h = 88;
  const pad = 8;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (p - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const lineD = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const areaD = `${lineD} L ${coords[coords.length - 1][0]} ${h} L ${coords[0][0]} ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`advero-home-sparkline ${className}`.trim()}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(125, 211, 252)" />
          <stop offset="100%" stopColor="rgb(167, 139, 250)" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid}-fill)`} className="advero-home-sparkline-area" />
      <path
        d={lineD}
        fill="none"
        stroke={`url(#${uid}-stroke)`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'advero-home-sparkline-line' : undefined}
      />
    </svg>
  );
};

export default AdveroHomeSparkline;
