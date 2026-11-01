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

// ---------- Cannabis leaf ----------
const LEAF_PIVOT = { x: 12, y: 17 } as const;

/**
 * One serrated, lance-shaped leaflet pointing straight up from the pivot.
 * Edges zig-zag (teeth) so it reads as a cannabis leaflet, not a generic leaf.
 */
function leafletPath(length: number, width: number): string {
  const steps = 9;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    // widest around 40% of the length, tapering to a sharp tip
    const profile = Math.sin(Math.PI * Math.pow(t, 0.85)) * width;
    const tooth = i % 2 === 0 ? 1 : 0.62;
    const half = profile * tooth;
    const y = LEAF_PIVOT.y - length * t;
    left.push(`${(LEAF_PIVOT.x - half).toFixed(2)} ${y.toFixed(2)}`);
    right.push(`${(LEAF_PIVOT.x + half).toFixed(2)} ${y.toFixed(2)}`);
  }
  const tip = `${LEAF_PIVOT.x} ${(LEAF_PIVOT.y - length).toFixed(2)}`;
  return `M${LEAF_PIVOT.x} ${LEAF_PIVOT.y} L${left.join(' L')} L${tip} L${right.reverse().join(' L')} Z`;
}

// [rotation°, length, half-width]
const LEAFLETS: readonly (readonly [number, number, number])[] = [
  [0, 15, 2.1],
  [-30, 13, 1.9],
  [30, 13, 1.9],
  [-62, 10, 1.6],
  [62, 10, 1.6],
  [-98, 6.2, 1.2],
  [98, 6.2, 1.2],
];
const LEAFLET_PATHS = LEAFLETS.map(([rot, len, w]) => ({ rot, d: leafletPath(len, w) }));

/** Cannabis leaf: 7 serrated leaflets fanning out from a short stem. */
export function JointIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      {LEAFLET_PATHS.map(({ rot, d }) => (
        <path key={rot} d={d} transform={`rotate(${rot} ${LEAF_PIVOT.x} ${LEAF_PIVOT.y})`} />
      ))}
      <path d="M12 17v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Cigar: fat diagonal body with rounded cap, gold band, grey ash, glowing tip. */
export function CigarIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" {...props}>
      <g transform="translate(12 13) scale(0.88) translate(-12 -12)">
      <g transform="rotate(-35 12 12)">
        {/* body */}
        <path d="M1.5 12c0-1.9 1.4-3.2 3.3-3.2H17.5v6.4H4.8C2.9 15.2 1.5 13.9 1.5 12z" fill="currentColor" />
        {/* wrapper highlight */}
        <path d="M5 10h12" stroke="#fde68a" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />
        {/* band */}
        <rect x="5.6" y="8.8" width="3.2" height="6.4" fill="#facc15" />
        <rect x="5.6" y="8.8" width="3.2" height="6.4" fill="none" stroke="#a16207" strokeWidth="0.5" />
        <circle cx="7.2" cy="12" r="1.1" fill="#b91c1c" />
        {/* ash + ember */}
        <rect x="17.5" y="8.8" width="2.6" height="6.4" fill="#a8a29e" />
        <rect x="20.1" y="9.2" width="1.9" height="5.6" rx="0.9" fill="#f97316" />
      </g>
      <path
        d="M22.4 4.6c-.9-.7.5-1.5-.2-2.4-.5-.6.2-1.1.1-1.6"
        stroke="#d6d3d1"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.75"
      />
      </g>
    </svg>
  );
}
