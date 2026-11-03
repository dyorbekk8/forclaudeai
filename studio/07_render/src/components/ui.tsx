import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C, fonts} from '../theme';
import {Item, pop, prog} from '../lib';
import {Sprinkler} from './Sprinkler';

export const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(22,22,26,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(22,22,26,0.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,255,255,0) 55%, rgba(0,0,0,0.06) 100%)'}} />
    {children}
  </AbsoluteFill>
);

export const Label: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({
  children,
  size = 40,
  color = C.ink,
  weight = 800,
  style,
}) => (
  <div style={{fontFamily: fonts.label, fontWeight: weight, fontSize: size, color, letterSpacing: size * 0.01, lineHeight: 1, textTransform: 'uppercase', ...style}}>
    {children}
  </div>
);

export const Body: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 34, color = C.inkSoft, style}) => (
  <div style={{fontFamily: fonts.body, fontWeight: 500, fontSize: size, color, lineHeight: 1.3, ...style}}>{children}</div>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; fg?: string; size?: number}> = ({children, color = C.ink, fg = '#fff', size = 30}) => (
  <div
    style={{
      display: 'inline-block',
      background: color,
      color: fg,
      fontFamily: fonts.label,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: 2,
      padding: `${size * 0.22}px ${size * 0.55}px`,
      borderRadius: 6,
    }}
  >
    {children}
  </div>
);

/** Rubber stamp with code-generated ink texture. */
export const RedStamp: React.FC<{text: string; f: number; delay?: number; size?: number; rotate?: number; color?: string}> = ({
  text,
  f,
  delay = 0,
  size = 90,
  rotate = -10,
  color = C.red,
}) => {
  const s = pop(f, delay, 9, 0.6);
  const scale = 2.2 - 1.2 * s;
  const op = f < delay ? 0 : Math.min(1, (f - delay) / 3);
  const id = `stamp-${text.replace(/\W/g, '')}`;
  return (
    <div style={{transform: `rotate(${rotate}deg) scale(${scale})`, opacity: op, display: 'inline-block'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.3" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </svg>
      <div
        style={{
          filter: `url(#${id})`,
          border: `${size * 0.09}px solid ${color}`,
          borderRadius: size * 0.12,
          padding: `${size * 0.08}px ${size * 0.28}px`,
          color,
          fontFamily: fonts.label,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: size * 0.03,
          lineHeight: 1.05,
          whiteSpace: 'pre',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Hand: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 48, color = C.red, style}) => (
  <div style={{fontFamily: fonts.hand, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, ...style}}>{children}</div>
);

export const DateStamp: React.FC<{date: string; place: string; f: number; delay?: number; big?: boolean}> = ({date, place, f, delay = 0, big = false}) => {
  const p = prog(f, delay, 14);
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: big ? 52 : 40, color: C.red, letterSpacing: 3}}>{date}</div>
      <div style={{fontFamily: fonts.label, fontWeight: 700, fontSize: big ? 62 : 46, color: C.ink, marginTop: 6, letterSpacing: 1}}>{place}</div>
    </div>
  );
};

/** Counts a number up with grouping; prefix/suffix kept as-is. */
export const CountUp: React.FC<{to: number; f: number; start?: number; len?: number; prefix?: string; suffix?: string; style?: React.CSSProperties}> = ({
  to,
  f,
  start = 0,
  len = 24,
  prefix = '',
  suffix = '',
  style,
}) => {
  const v = Math.round(to * prog(f, start, len));
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {v.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

export const Tile: React.FC<{
  item: Item;
  w: number;
  h: number;
  state?: 'normal' | 'dim' | 'active' | 'done';
  showTemp?: boolean;
  appear?: number;
}> = ({item, w, h, state = 'normal', showTemp = true, appear = 1}) => {
  const dim = state === 'dim';
  return (
    <div
      style={{
        width: w,
        height: h,
        background: C.tile,
        border: `2px solid ${state === 'active' ? C.ink : C.tileBorder}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        opacity: (dim ? 0.38 : 1) * appear,
        transform: `scale(${0.85 + 0.15 * appear})`,
        boxShadow: state === 'active' ? '0 12px 30px rgba(0,0,0,0.12)' : 'none',
      }}
    >
      <Sprinkler
        bulb={item.fusible ? null : {liquid: item.color, response: item.response}}
        fusible={item.fusible}
        size={w * 0.62}
      />
      <Label size={w * 0.15} style={{marginTop: h * 0.02}}>
        {item.label}
      </Label>
      {showTemp && (
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: w * 0.075, color: C.inkSoft, marginTop: 6}}>{item.temp}</div>
      )}
      {state === 'done' && (
        <svg width={w * 0.2} height={w * 0.2} viewBox="0 0 40 40" style={{position: 'absolute', top: 10, right: 10}}>
          <circle cx="20" cy="20" r="18" fill={C.ink} />
          <path d="M 11 21 L 17 27 L 29 14" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

/** Deterministic glass shards + liquid droplets. t in frames since burst. */
export const Shatter: React.FC<{t: number; color: string; cx: number; cy: number; scale?: number; seed?: string}> = ({
  t,
  color,
  cx,
  cy,
  scale = 1,
  seed = 'shatter',
}) => {
  if (t < 0) return null;
  const shards = Array.from({length: 16}).map((_, i) => {
    const a = random(`${seed}-a${i}`) * Math.PI * 2;
    const v = (4 + random(`${seed}-v${i}`) * 9) * scale;
    const x = cx + Math.cos(a) * v * t;
    const y = cy + Math.sin(a) * v * t + 0.45 * scale * t * t;
    const rot = (random(`${seed}-r${i}`) - 0.5) * 40 * t;
    const sz = (5 + random(`${seed}-s${i}`) * 9) * scale;
    const op = Math.max(0, 1 - t / 22);
    return (
      <polygon
        key={i}
        points={`0,${-sz} ${sz * 0.6},${sz * 0.4} ${-sz * 0.5},${sz * 0.7}`}
        transform={`translate(${x} ${y}) rotate(${rot})`}
        fill={i % 3 === 0 ? '#ffffff' : color}
        fillOpacity={0.85 * op}
        stroke="#fff"
        strokeOpacity={0.7 * op}
        strokeWidth={0.8 * scale}
      />
    );
  });
  const drops = Array.from({length: 26}).map((_, i) => {
    const a = random(`${seed}-da${i}`) * Math.PI * 2;
    const v = (2 + random(`${seed}-dv${i}`) * 6) * scale;
    const x = cx + Math.cos(a) * v * t;
    const y = cy + Math.sin(a) * v * t + 0.6 * scale * t * t;
    const op = Math.max(0, 1 - t / 18);
    return <circle key={`d${i}`} cx={x} cy={y} r={(1.5 + random(`${seed}-dr${i}`) * 2.5) * scale} fill={color} opacity={op} />;
  });
  const flash = Math.max(0, 1 - t / 6);
  return (
    <g>
      <circle cx={cx} cy={cy} r={(10 + t * 6) * scale} fill="#fff" opacity={0.8 * flash} />
      {shards}
      {drops}
    </g>
  );
};

/** Umbrella water spray from a deflector at (cx, cy). t in frames since water started. */
export const Spray: React.FC<{t: number; cx: number; cy: number; scale?: number; seed?: string; intensity?: number}> = ({
  t,
  cx,
  cy,
  scale = 1,
  seed = 'spray',
  intensity = 1,
}) => {
  if (t < 0) return null;
  const n = Math.round(220 * intensity);
  const life = 26;
  const ramp = Math.min(1, t / 8);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const birth = (random(`${seed}-b${i}`) * life) | 0;
    const age = ((t + birth) % life) + random(`${seed}-j${i}`);
    if (t + birth < life && age > t) continue;
    const side = random(`${seed}-s${i}`) < 0.5 ? -1 : 1;
    const ang = (0.05 + random(`${seed}-a${i}`) * 1.25) * side;
    const sp = (9 + random(`${seed}-v${i}`) * 7) * scale;
    const vx = Math.sin(ang) * sp;
    const vy = Math.cos(ang) * sp * 0.35 + 1.5 * scale;
    const g = 0.55 * scale;
    const x = cx + vx * age;
    const y = cy + vy * age + g * age * age;
    const x2 = x - vx * 1.4;
    const y2 = y - (vy + g * age * 2) * 1.4;
    const op = ramp * Math.max(0, 1 - age / life) * 0.9;
    els.push(
      <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke={i % 4 === 0 ? '#BFE2FA' : C.water} strokeOpacity={op} strokeWidth={(1.6 + (i % 3)) * scale} strokeLinecap="round" />,
    );
  }
  return <g>{els}</g>;
};

/** Simple line icons, 100×100 viewBox, ink stroke. */
export const Icon: React.FC<{name: 'hotel' | 'hanger' | 'club' | 'piano' | 'sun' | 'heater' | 'oven' | 'factory' | 'office' | 'school' | 'pot' | 'smoke' | 'fire'; size?: number; color?: string}> = ({
  name,
  size = 120,
  color = C.ink,
}) => {
  const p = {stroke: color, strokeWidth: 4.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const shapes: Record<string, React.ReactNode> = {
    hotel: (
      <g {...p}>
        <rect x="22" y="10" width="56" height="84" />
        {[22, 36, 50, 64].map((y) => [32, 46, 60].map((x) => <rect key={`${x}${y}`} x={x} y={y} width="8" height="8" />))}
        <rect x="42" y="78" width="16" height="16" />
      </g>
    ),
    hanger: (
      <g {...p}>
        <path d="M 50 22 a 7 7 0 1 1 7 7 L 50 36" />
        <path d="M 50 36 L 12 66 L 88 66 Z" />
      </g>
    ),
    club: (
      <g {...p}>
        <path d="M 10 92 L 10 40 L 50 16 L 90 40 L 90 92 Z" />
        <path d="M 30 92 L 30 60 L 70 60 L 70 92" />
        <path d="M 42 36 L 50 28 L 58 36" />
      </g>
    ),
    piano: (
      <g {...p}>
        <rect x="10" y="30" width="80" height="44" rx="3" />
        {[20, 30, 40, 50, 60, 70, 80].map((x) => <line key={x} x1={x} y1="52" x2={x} y2="74" />)}
        <line x1="10" y1="52" x2="90" y2="52" />
        <line x1="18" y1="74" x2="18" y2="92" />
        <line x1="82" y1="74" x2="82" y2="92" />
      </g>
    ),
    sun: (
      <g {...p}>
        <circle cx="50" cy="50" r="17" />
        {Array.from({length: 8}).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={50 + Math.cos(a) * 27} y1={50 + Math.sin(a) * 27} x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} />;
        })}
      </g>
    ),
    heater: (
      <g {...p}>
        <rect x="16" y="40" width="68" height="44" rx="4" />
        {[26, 38, 50, 62, 74].map((x) => <line key={x} x1={x} y1="48" x2={x} y2="76" />)}
        <path d="M 30 32 q 5 -8 0 -16 M 50 32 q 5 -8 0 -16 M 70 32 q 5 -8 0 -16" />
      </g>
    ),
    oven: (
      <g {...p}>
        <rect x="14" y="14" width="72" height="74" rx="4" />
        <rect x="24" y="36" width="52" height="40" rx="3" />
        {[28, 42, 56, 70].map((x) => <circle key={x} cx={x} cy="25" r="3" />)}
      </g>
    ),
    factory: (
      <g {...p}>
        <path d="M 8 90 L 8 50 L 32 36 L 32 50 L 56 36 L 56 50 L 80 36 L 80 14 L 92 14 L 92 90 Z" />
        <rect x="18" y="64" width="10" height="10" />
        <rect x="42" y="64" width="10" height="10" />
        <rect x="66" y="64" width="10" height="10" />
      </g>
    ),
    office: (
      <g {...p}>
        <rect x="14" y="12" width="44" height="80" />
        <rect x="58" y="40" width="30" height="52" />
        {[24, 38, 52, 66].map((y) => <line key={y} x1="24" y1={y} x2="48" y2={y} />)}
      </g>
    ),
    school: (
      <g {...p}>
        <path d="M 10 46 L 50 22 L 90 46" />
        <rect x="18" y="46" width="64" height="44" />
        <rect x="42" y="64" width="16" height="26" />
        <line x1="50" y1="22" x2="50" y2="8" />
        <path d="M 50 8 L 64 12 L 50 16" />
      </g>
    ),
    pot: (
      <g {...p}>
        <path d="M 18 40 L 82 40 L 76 88 L 24 88 Z" />
        <line x1="8" y1="40" x2="92" y2="40" />
        <path d="M 34 30 q 4 -8 0 -16 M 50 30 q 4 -8 0 -16 M 66 30 q 4 -8 0 -16" />
      </g>
    ),
    smoke: (
      <g {...p}>
        <path d="M 20 80 c -12 0 -12 -18 0 -18 c 0 -14 20 -14 22 -4 c 6 -10 24 -6 22 6 c 12 0 12 16 0 16 Z" />
      </g>
    ),
    fire: (
      <g fill={C.heat}>
        <path d="M 50 92 C 22 92 16 66 30 48 C 32 60 40 62 42 56 C 36 36 46 18 60 8 C 58 26 78 36 78 60 C 78 80 66 92 50 92 Z" />
        <path d="M 50 92 C 38 92 36 80 42 70 C 46 76 50 74 50 68 C 58 74 62 80 60 86 C 58 90 54 92 50 92 Z" fill="#FFD23F" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {shapes[name]}
    </svg>
  );
};
