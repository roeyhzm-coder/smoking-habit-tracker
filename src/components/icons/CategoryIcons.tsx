import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  'aria-hidden': true,
} as const;

/** Cigarette: slim white stick, tan filter, glowing ember + thin smoke. */
export function CigaretteIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" {...props}>
      <rect x="2" y="13" width="16" height="4" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="2" y="13" width="5" height="4" rx="1" fill="#d97706" />
      <rect x="18" y="13" width="3" height="4" rx="0.8" fill="#f97316" />
      <path
        d="M20 10.5c-1.2-1.1.9-2.1-.2-3.4-.9-1 .6-2 .1-3.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

/** Cannabis leaf: 7 serrated-looking leaflets fanning from a stem. */
export function JointIcon(props: IconProps) {
  // [rotation, length, width] for each leaflet, pivoting at (12, 15)
  const leaflets: [number, number, number][] = [
    [0, 13, 2.3],
    [-32, 11.5, 2.1],
    [32, 11.5, 2.1],
    [-64, 9, 1.8],
    [64, 9, 1.8],
    [-100, 6, 1.4],
    [100, 6, 1.4],
  ];
  return (
    <svg {...base} fill="currentColor" {...props}>
      {leaflets.map(([rot, len, w]) => {
        const tip = 15 - len;
        const mid = 15 - len * 0.55;
        return (
          <path
            key={rot}
            transform={`rotate(${rot} 12 15)`}
            d={`M12 15 C ${12 - w} ${mid + 1.5} ${12 - w * 0.9} ${mid - 1.5} 12 ${tip} C ${12 + w * 0.9} ${mid - 1.5} ${12 + w} ${mid + 1.5} 12 15 Z`}
          />
        );
      })}
      <path d="M12 15v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Cigar: thick rounded body, decorative band, ash/ember tip and smoke. */
export function CigarIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" {...props}>
      <path d="M2.5 12.2c0-1.2 1-2.2 2.2-2.2H18v6H4.7c-1.2 0-2.2-1-2.2-2.2z" fill="currentColor" />
      <rect x="6" y="10" width="3" height="6" fill="#fbbf24" />
      <rect x="6.9" y="11.6" width="1.2" height="2.8" rx="0.4" fill="#b45309" />
      <rect x="18" y="10" width="2" height="6" fill="#a8a29e" />
      <rect x="20" y="10.3" width="1.6" height="5.4" rx="0.8" fill="#f97316" />
      <path
        d="M20.5 8c-1.3-1.2 1-2.3-.2-3.7-1-1.1.7-2.2.1-3.3"
        stroke="#d6d3d1"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
