import React from 'react';

export type BulletKind = '9mm' | '357' | '44' | '762' | '556' | '3006';

export const BULLETS: Record<BulletKind, {label: string; len: number; dia: number; tip?: string; nose: 'round' | 'flat' | 'spitzer'; caseLen: number}> = {
  '9mm': {label: '9MM', len: 15, dia: 9, nose: 'round', caseLen: 19},
  '357': {label: '.357 MAG', len: 16, dia: 9.1, nose: 'flat', caseLen: 33},
  '44': {label: '.44 MAG', len: 18, dia: 10.9, nose: 'flat', caseLen: 33},
  '762': {label: '7.62 NATO', len: 29, dia: 7.8, nose: 'spitzer', caseLen: 51},
  '556': {label: '5.56 GREEN TIP', len: 23, dia: 5.7, nose: 'spitzer', caseLen: 45, tip: '#2E9E4F'},
  '3006': {label: '.30-06 AP', len: 31, dia: 7.8, nose: 'spitzer', caseLen: 63, tip: '#1B1B1F'},
};

/** Cartridge side profile, pointing right. Scale: 1 mm = k px. */
export const Cartridge: React.FC<{kind: BulletKind; k?: number; projectileOnly?: boolean}> = ({kind, k = 6, projectileOnly}) => {
  const b = BULLETS[kind];
  const d = b.dia * k;
  const L = b.len * k;
  const C = projectileOnly ? 0 : b.caseLen * k;
  const W = C + L;
  const H = d * 1.35;
  const cy = H / 2;
  const r = d / 2;
  const nose =
    b.nose === 'round'
      ? `M ${C} ${cy - r} L ${C + L * 0.45} ${cy - r} Q ${C + L} ${cy - r} ${C + L} ${cy} Q ${C + L} ${cy + r} ${C + L * 0.45} ${cy + r} L ${C} ${cy + r} Z`
      : b.nose === 'flat'
        ? `M ${C} ${cy - r} L ${C + L * 0.55} ${cy - r} Q ${C + L * 0.9} ${cy - r * 0.8} ${C + L} ${cy - r * 0.45} L ${C + L} ${cy + r * 0.45} Q ${C + L * 0.9} ${cy + r * 0.8} ${C + L * 0.55} ${cy + r} L ${C} ${cy + r} Z`
        : `M ${C} ${cy - r} L ${C + L * 0.35} ${cy - r} Q ${C + L * 0.8} ${cy - r * 0.75} ${C + L} ${cy} Q ${C + L * 0.8} ${cy + r * 0.75} ${C + L * 0.35} ${cy + r} L ${C} ${cy + r} Z`;
  const tipX = C + L * 0.82;
  return (
    <svg width={W + 4} height={H} viewBox={`-2 0 ${W + 4} ${H}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`cu-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F0B27A" />
          <stop offset="0.45" stopColor="#C8743C" />
          <stop offset="1" stopColor="#7E3F17" />
        </linearGradient>
        <linearGradient id={`br-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F7DC8C" />
          <stop offset="0.5" stopColor="#C9A24A" />
          <stop offset="1" stopColor="#7A5A1C" />
        </linearGradient>
      </defs>
      {!projectileOnly && (
        <g>
          <rect x={0} y={cy - r * 1.18} width={C * 0.06} height={r * 2.36} rx={2} fill={`url(#br-${kind})`} />
          <rect x={C * 0.08} y={cy - r * 1.02} width={C * 0.04} height={r * 2.04} fill="#7A5A1C" />
          <path d={`M ${C * 0.12} ${cy - r * 1.12} L ${C * (b.nose === 'spitzer' ? 0.72 : 1)} ${cy - r * 1.12} ${b.nose === 'spitzer' ? `L ${C * 0.84} ${cy - r * 1.01} L ${C} ${cy - r * 1.01} L ${C} ${cy + r * 1.01} L ${C * 0.84} ${cy + r * 1.01}` : `L ${C} ${cy - r * 1.05} L ${C} ${cy + r * 1.05}`} L ${C * (b.nose === 'spitzer' ? 0.72 : 1)} ${cy + r * 1.12} L ${C * 0.12} ${cy + r * 1.12} Z`} fill={`url(#br-${kind})`} />
          <rect x={C * 0.12} y={cy - r * 1.12} width={C * 0.88} height={r * 0.35} fill="#fff" opacity={0.25} />
        </g>
      )}
      <path d={nose} fill={`url(#cu-${kind})`} />
      {b.tip && <path d={`M ${tipX} ${cy - r * 0.42} Q ${C + L * 0.95} ${cy - r * 0.2} ${C + L} ${cy} Q ${C + L * 0.95} ${cy + r * 0.2} ${tipX} ${cy + r * 0.42} Z`} fill={b.tip} />}
      <path d={`M ${C + 2} ${cy - r * 0.7} L ${C + L * 0.5} ${cy - r * 0.7}`} stroke="#fff" strokeOpacity={0.45} strokeWidth={Math.max(1.5, r * 0.18)} strokeLinecap="round" />
    </svg>
  );
};

/** Soft vest, front view. level shade 0..2 */
export const Vest: React.FC<{size?: number; shade?: number; dents?: {x: number; y: number}[]; label?: string}> = ({size = 420, shade = 0, dents = [], label}) => {
  const base = ['#4F5B66', '#3F4A55', '#2E3742'][Math.min(2, shade)];
  const id = `weave${shade}`;
  return (
    <svg viewBox="0 0 200 230" width={size} height={size * 1.15} style={{overflow: 'visible'}}>
      <defs>
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={base} />
          <path d="M 0 3 L 6 3 M 3 0 L 3 6" stroke="#000" strokeOpacity="0.18" strokeWidth="1" />
        </pattern>
        <filter id="vsh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#vsh)">
        <path d="M 52 10 L 82 10 Q 100 40 118 10 L 148 10 L 150 46 Q 170 58 178 78 L 178 210 Q 100 226 22 210 L 22 78 Q 30 58 50 46 Z" fill={`url(#${id})`} />
        <path d="M 52 10 L 82 10 Q 100 40 118 10 L 148 10 L 150 46 Q 170 58 178 78 L 178 210 Q 100 226 22 210 L 22 78 Q 30 58 50 46 Z" fill="none" stroke="#1E252C" strokeWidth="3" />
        <rect x="22" y="120" width="30" height="40" fill="#1E252C" opacity="0.55" />
        <rect x="148" y="120" width="30" height="40" fill="#1E252C" opacity="0.55" />
        <path d="M 58 16 L 76 16 M 124 16 L 142 16" stroke="#9AA4AE" strokeWidth="4" strokeLinecap="round" />
        {label && (
          <g>
            <rect x="66" y="92" width="68" height="26" rx="3" fill="#E8E6DF" />
            <text x="100" y="111" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize="20" fill="#16161A">
              {label}
            </text>
          </g>
        )}
        {dents.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="7" fill="#1A1F25" />
            <circle cx={d.x} cy={d.y} r="11" fill="none" stroke="#1A1F25" strokeOpacity="0.4" strokeWidth="2" />
            <circle cx={d.x - 1.5} cy={d.y - 1.5} r="3" fill="#C8743C" />
          </g>
        ))}
      </g>
    </svg>
  );
};

/** Hard plate, shooter's cut, front view. */
export const Plate: React.FC<{size?: number; material?: 'ceramic' | 'steel' | 'pe'; hits?: {x: number; y: number}[]; label?: string}> = ({size = 380, material = 'ceramic', hits = [], label}) => {
  const fill = {ceramic: '#3B3F45', steel: '#8A9099', pe: '#E9E7E1'}[material];
  const edge = {ceramic: '#1F2226', steel: '#5C626B', pe: '#B9B6AD'}[material];
  return (
    <svg viewBox="0 0 200 250" width={size} height={size * 1.25} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`pl-${material}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <filter id="psh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#psh)">
        <path d="M 40 6 L 160 6 L 194 40 L 194 236 Q 100 248 6 236 L 6 40 Z" fill={fill} stroke={edge} strokeWidth="4" />
        <path d="M 40 6 L 160 6 L 194 40 L 194 236 Q 100 248 6 236 L 6 40 Z" fill={`url(#pl-${material})`} />
        {label && (
          <text x="100" y="140" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize="34" fill={material === 'pe' ? '#16161A' : '#F6F5F1'}>
            {label}
          </text>
        )}
        {hits.map((h, i) => (
          <g key={i}>
            {Array.from({length: 7}).map((_, j) => {
              const a = (j / 7) * Math.PI * 2 + i;
              return <line key={j} x1={h.x} y1={h.y} x2={h.x + Math.cos(a) * 16} y2={h.y + Math.sin(a) * 16} stroke={material === 'pe' ? '#7A776F' : '#C9CDD3'} strokeWidth="1.5" />;
            })}
            <circle cx={h.x} cy={h.y} r="6" fill="#C8743C" stroke="#7E3F17" strokeWidth="2" />
          </g>
        ))}
      </g>
    </svg>
  );
};

/** Simple stick figure. */
export const Stick: React.FC<{size?: number; pose?: 'stand' | 'kneel' | 'shoot'; color?: string}> = ({size = 220, pose = 'stand', color = '#16161A'}) => {
  const p = {stroke: color, strokeWidth: 7, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg viewBox="0 0 100 160" width={size * 0.62} height={size}>
      <circle cx="50" cy="20" r="13" {...p} />
      <rect x="35" y="40" width="30" height="40" rx="6" fill="#4F5B66" />
      <line x1="50" y1="34" x2="50" y2="88" {...p} />
      {pose === 'kneel' ? (
        <path d="M 50 88 L 76 92 L 76 132 M 50 88 L 40 128 L 18 132" {...p} />
      ) : (
        <path d="M 50 88 L 34 150 M 50 88 L 66 150" {...p} />
      )}
      {pose === 'shoot' || pose === 'kneel' ? <path d="M 50 50 L 66 58 L 58 66 M 50 52 L 64 60" {...p} /> : <path d="M 50 50 L 30 80 M 50 50 L 70 80" {...p} />}
    </svg>
  );
};
