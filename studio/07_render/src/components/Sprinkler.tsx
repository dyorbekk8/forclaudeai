import React, {useId} from 'react';

export type BulbSpec = {
  liquid: string;
  /** 'standard' = 5 mm, 'quick' = 3 mm */
  response?: 'standard' | 'quick';
};

type Props = {
  bulb?: BulbSpec | null;
  /** fusible-link head instead of a glass bulb */
  fusible?: boolean;
  frameColor?: string | null;
  /** 0..1: liquid expansion — bubble shrinks to nothing at 1 */
  expansion?: number;
  /** bulb is gone (after shattering) */
  broken?: boolean;
  /** 0..1 glow around the bulb (heat) */
  glow?: number;
  size?: number;
  /** override bulb width in viewBox units (thumbnails) */
  bulbWidth?: number;
  style?: React.CSSProperties;
};

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa);
  const [r2, g2, b2] = ch(pb);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
};

/** Pendent sprinkler head, deflector down. viewBox 0 0 200 300. */
export const Sprinkler: React.FC<Props> = ({
  bulb = {liquid: '#E0312B'},
  fusible = false,
  frameColor = null,
  expansion = 0,
  broken = false,
  glow = 0,
  size = 300,
  bulbWidth,
  style,
}) => {
  const id = useId().replace(/:/g, '');
  const quick = bulb?.response === 'quick';
  const bw = bulbWidth ?? (quick ? 11 : 17);
  const top = 92;
  const bot = 206;
  const bubbleR = Math.max(0, (quick ? 3.2 : 4.6) * (1 - expansion));
  const liquid = bulb?.liquid ?? '#888888';
  const arm = frameColor ?? `url(#brass-${id})`;

  const bulbPath = `M ${100 - bw / 2} ${top + bw / 2}
    A ${bw / 2} ${bw / 2} 0 0 1 ${100 + bw / 2} ${top + bw / 2}
    L ${100 + bw / 2} ${bot - 16}
    Q ${100 + bw / 2} ${bot - 4} 101.6 ${bot}
    L 98.4 ${bot}
    Q ${100 - bw / 2} ${bot - 4} ${100 - bw / 2} ${bot - 16} Z`;

  return (
    <svg viewBox="0 0 200 300" width={size} height={size * 1.5} style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`brass-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7A5A1C" />
          <stop offset="0.28" stopColor="#E9C873" />
          <stop offset="0.5" stopColor="#C79B3E" />
          <stop offset="0.78" stopColor="#8E6A26" />
          <stop offset="1" stopColor="#5E4413" />
        </linearGradient>
        <linearGradient id={`brassV-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#E5C26C" />
          <stop offset="1" stopColor="#8A6522" />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={mix(liquid, '#000000', 0.35)} />
          <stop offset="0.35" stopColor={mix(liquid, '#ffffff', 0.15)} />
          <stop offset="0.6" stopColor={liquid} />
          <stop offset="1" stopColor={mix(liquid, '#000000', 0.45)} />
        </linearGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0" stopColor="#FF8A2A" stopOpacity={0.55 * glow} />
          <stop offset="0.5" stopColor="#FF5A1A" stopOpacity={0.22 * glow} />
          <stop offset="1" stopColor="#FF3A00" stopOpacity="0" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {glow > 0 && <ellipse cx="100" cy="150" rx="95" ry="110" fill={`url(#glow-${id})`} />}

      <g filter={`url(#shadow-${id})`}>
        {/* threaded nipple */}
        <rect x="80" y="0" width="40" height="40" rx="3" fill={`url(#brass-${id})`} />
        {[6, 13, 20, 27, 34].map((y) => (
          <line key={y} x1="80" x2="120" y1={y} y2={y + 3} stroke="#5E4413" strokeOpacity="0.55" strokeWidth="1.6" />
        ))}
        {/* hex wrench boss */}
        <path d="M 62 40 L 138 40 L 146 52 L 138 64 L 62 64 L 54 52 Z" fill={`url(#brass-${id})`} />
        <path d="M 62 40 L 138 40 L 146 52 L 54 52 Z" fill="#fff" opacity="0.12" />
        <line x1="78" x2="78" y1="40" y2="64" stroke="#5E4413" strokeOpacity="0.35" strokeWidth="1.5" />
        <line x1="122" x2="122" y1="40" y2="64" stroke="#5E4413" strokeOpacity="0.35" strokeWidth="1.5" />
        {/* orifice body */}
        <path d="M 70 64 L 130 64 L 124 82 L 76 82 Z" fill={`url(#brassV-${id})`} />

        {/* frame arms */}
        <path
          d="M 70 70 C 52 118, 60 186, 91 230 L 99 230 C 76 188, 70 124, 84 78 Z"
          fill={arm}
        />
        <path
          d="M 130 70 C 148 118, 140 186, 109 230 L 101 230 C 124 188, 130 124, 116 78 Z"
          fill={arm}
        />
        <path d="M 72 76 C 58 122, 64 184, 92 226" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />

        {/* cap / button */}
        <rect x={100 - bw / 2 - 5} y="82" width={bw + 10} height="9" rx="2" fill="#B9BCC2" />
        <rect x={100 - bw / 2 - 5} y="82" width={bw + 10} height="3" rx="1.5" fill="#fff" opacity="0.6" />

        {/* bulb or fusible link */}
        {!fusible && bulb && !broken && (
          <g>
            <path d={bulbPath} fill={`url(#glass-${id})`} />
            {bubbleR > 0.2 && (
              <circle cx={100 + bw * 0.08} cy={top + bw / 2 + 6} r={bubbleR} fill="#fff" opacity="0.85" />
            )}
            <path
              d={`M ${100 - bw / 2 + 3} ${top + bw / 2 + 2} L ${100 - bw / 2 + 3} ${bot - 22}`}
              stroke="#fff"
              strokeOpacity="0.7"
              strokeWidth={quick ? 1.6 : 2.6}
              strokeLinecap="round"
            />
            <path d={bulbPath} fill="none" stroke={mix(liquid, '#000000', 0.5)} strokeOpacity="0.5" strokeWidth="0.8" />
          </g>
        )}
        {fusible && !broken && (
          <g>
            <path d="M 88 96 L 112 96 L 104 150 L 96 150 Z" fill="#A9ADB4" />
            <rect x="84" y="150" width="32" height="30" rx="2" fill={frameColor ? '#C9CCD2' : '#B4B7BD'} />
            <rect x="84" y="150" width="32" height="6" fill="#fff" opacity="0.45" />
            <line x1="84" x2="116" y1="165" y2="165" stroke="#6E7279" strokeWidth="1.5" />
            <path d="M 96 180 L 104 180 L 102 206 L 98 206 Z" fill="#A9ADB4" />
          </g>
        )}

        {/* compression screw + boss */}
        <rect x="93" y="204" width="14" height="22" rx="2" fill={`url(#brassV-${id})`} />
        {[208, 213, 218].map((y) => (
          <line key={y} x1="93" x2="107" y1={y} y2={y + 1.5} stroke="#5E4413" strokeOpacity="0.5" strokeWidth="1" />
        ))}
        <rect x="86" y="226" width="28" height="9" rx="2" fill={`url(#brass-${id})`} />

        {/* deflector */}
        <ellipse cx="100" cy="242" rx="74" ry="11" fill={`url(#brass-${id})`} />
        <ellipse cx="100" cy="239" rx="74" ry="9" fill="#E9C873" opacity="0.55" />
        {Array.from({length: 13}).map((_, i) => {
          const x = 32 + i * 11.3;
          return <line key={i} x1={x} x2={x} y1="234" y2="250" stroke="#6B4E18" strokeOpacity="0.55" strokeWidth="2" />;
        })}
        <rect x="94" y="234" width="12" height="14" fill="#C79B3E" />
      </g>
    </svg>
  );
};
