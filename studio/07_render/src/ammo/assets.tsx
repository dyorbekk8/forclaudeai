import React from 'react';

export const OD = '#5E6338';
export type Band = {c: string; broken?: boolean};
export type AmmoItem = {key: string; name: string; short: string; body: string; bands: Band[]; meaning: string; ink?: string};

export const ITEMS: AmmoItem[] = [
  {key: 'od', name: 'OLIVE DRAB', short: 'OD', body: OD, bands: [], meaning: 'THE BASE COAT'},
  {key: 'yellow', name: 'YELLOW', short: 'YEL', body: OD, bands: [{c: '#F2C21B'}], meaning: 'HIGH EXPLOSIVE'},
  {key: 'brown', name: 'BROWN', short: 'BRN', body: OD, bands: [{c: '#7A4A24'}], meaning: 'LOW EXPLOSIVE'},
  {key: 'blue', name: 'LIGHT BLUE', short: 'BLU', body: '#86B6E6', bands: [], meaning: 'PRACTICE'},
  {key: 'green', name: 'LIGHT GREEN', short: 'GRN', body: '#A5CF84', bands: [], meaning: 'SMOKE'},
  {key: 'white', name: 'WHITE', short: 'WHT', body: '#F5F4EF', bands: [], meaning: 'ILLUMINATION'},
  {key: 'black', name: 'BLACK', short: 'BLK', body: '#1E1F22', bands: [], meaning: 'ARMOR DEFEATING'},
  {key: 'gray', name: 'GRAY', short: 'GRY', body: '#8F949B', bands: [{c: '#2F6B3A'}], meaning: 'CHEMICAL'},
];

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
};

/** Upright artillery projectile. bandP = 0..1 paint-on progress for the bands. */
export const Shell: React.FC<{body: string; bands?: Band[]; size?: number; bandP?: number; glow?: string; uid?: string}> = ({body, bands = [], size = 300, bandP = 1, glow, uid = 's'}) => {
  const id = `${uid}-${body.slice(1)}`;
  return (
    <svg width={size * 0.42} height={size} viewBox="0 0 84 200" style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 22px ${glow})` : 'drop-shadow(0 10px 14px rgba(0,0,0,0.18))'}}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(body, 0.72)} />
          <stop offset="0.35" stopColor={shade(body, 1.12)} />
          <stop offset="0.6" stopColor={body} />
          <stop offset="1" stopColor={shade(body, 0.62)} />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <path d="M 42 4 C 58 30 76 58 76 92 L 76 186 L 8 186 L 8 92 C 8 58 26 30 42 4 Z" />
        </clipPath>
      </defs>
      {/* fuze */}
      <path d="M 42 0 C 48 8 52 16 54 26 L 30 26 C 32 16 36 8 42 0 Z" fill="#B7B9BC" stroke="#16161A" strokeWidth="3" />
      <path d="M 42 4 C 58 30 76 58 76 92 L 76 186 L 8 186 L 8 92 C 8 58 26 30 42 4 Z" fill={`url(#g${id})`} stroke="#16161A" strokeWidth="4" />
      <g clipPath={`url(#c${id})`}>
        {bands.map((b, i) => {
          const y = 70 + i * 22;
          const w = 68 * bandP;
          return b.broken ? (
            Array.from({length: 5}).map((_, k) => <rect key={`${i}${k}`} x={8 + k * 14} y={y} width={Math.max(0, Math.min(8, w - k * 14))} height={14} fill={b.c} />)
          ) : (
            <rect key={i} x={8} y={y} width={w} height={14} fill={b.c} />
          );
        })}
      </g>
      {/* rotating band + base */}
      <rect x="5" y="160" width="74" height="12" rx="2" fill="#B86B3A" stroke="#16161A" strokeWidth="3" />
      <rect x="10" y="186" width="64" height="10" rx="2" fill={shade(body, 0.55)} stroke="#16161A" strokeWidth="3" />
    </svg>
  );
};

/** Horizontal general-purpose bomb (Mk 82 style), nose to the right. */
export const Bomb: React.FC<{body?: string; bands?: {c: string; x: number; w: number; p?: number}[]; width?: number; uid?: string}> = ({body = OD, bands = [], width = 1200, uid = 'b'}) => (
  <svg width={width} height={width * 0.25} viewBox="0 0 800 200" style={{overflow: 'visible', filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.18))'}}>
    <defs>
      <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(body, 0.7)} />
        <stop offset="0.3" stopColor={shade(body, 1.15)} />
        <stop offset="0.65" stopColor={body} />
        <stop offset="1" stopColor={shade(body, 0.6)} />
      </linearGradient>
      <clipPath id={`bc${uid}`}>
        <path d="M 130 60 L 560 52 C 680 52 770 80 790 100 C 770 120 680 148 560 148 L 130 140 Z" />
      </clipPath>
    </defs>
    {/* fins */}
    <path d="M 40 30 L 150 70 L 150 130 L 40 170 L 60 100 Z" fill={shade(body, 0.8)} stroke="#16161A" strokeWidth="4" />
    <path d="M 60 100 L 150 85 L 150 115 Z" fill={shade(body, 0.6)} stroke="#16161A" strokeWidth="3" />
    <path d="M 130 60 L 560 52 C 680 52 770 80 790 100 C 770 120 680 148 560 148 L 130 140 Z" fill={`url(#bg${uid})`} stroke="#16161A" strokeWidth="5" />
    <g clipPath={`url(#bc${uid})`}>
      {bands.map((b, i) => (
        <rect key={i} x={b.x} y={40} width={b.w} height={120 * (b.p ?? 1)} fill={b.c} />
      ))}
    </g>
    <rect x="330" y="44" width="40" height="10" fill="#16161A" />
    <rect x="430" y="42" width="40" height="10" fill="#16161A" />
  </svg>
);

/** Small-arms cartridge with a painted tip. */
export const Round: React.FC<{tip?: string; size?: number}> = ({tip = '#1E1F22', size = 220}) => (
  <svg width={size * 0.3} height={size} viewBox="0 0 30 100" style={{overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.18))'}}>
    <path d="M 15 0 C 21 10 23 22 23 34 L 7 34 C 7 22 9 10 15 0 Z" fill="#B87333" stroke="#16161A" strokeWidth="2" />
    <path d="M 15 0 C 18 5 19.5 9 20.5 13 L 9.5 13 C 10.5 9 12 5 15 0 Z" fill={tip} stroke="#16161A" strokeWidth="2" />
    <path d="M 6 34 L 24 34 L 24 92 L 6 92 Z" fill="#D9A93C" stroke="#16161A" strokeWidth="2" />
    <rect x="4" y="92" width="22" height="7" fill="#C49431" stroke="#16161A" strokeWidth="2" />
  </svg>
);
