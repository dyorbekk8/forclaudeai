import React from 'react';
import { AbsoluteFill } from 'remotion';
import { S, E, tw, ease, clamp01 } from './anim';
import { C, FONT_HEAD } from './theme';

/* ================= LAG ledger (global time -> lag in ms) ================= */
export type LagEv = { t: number; ms: number; day?: number; mode?: 'up' | 'down' | 'neg'; dur?: number };
const YEAR = 33554432000;
export const LAG: LagEv[] = [
  { t: 0, ms: 1000, day: 1 },
  // b02 ladder tease
  { t: S('b02') + 0.1, ms: 1000, day: 1 },
  { t: S('b02') + 1.6, ms: 2000, day: 2 },
  { t: S('b02') + 2.9, ms: 4000, day: 3 },
  { t: S('b02') + 4.0, ms: 999999999, day: 99, dur: 1.4 },
  { t: S('c01'), ms: 1000, day: 1 },
  { t: S('d01') + 0.2, ms: 4000, day: 3 },
  { t: S('d03') + 0.2, ms: 16000, day: 5 },
  { t: S('e01') + 0.2, ms: 64000, day: 7 },
  { t: S('f01') + 0.2, ms: 512000, day: 10 },
  { t: S('g01') + 0.2, ms: 8192000, day: 14 },
  { t: S('h01') + 0.2, ms: 131072000, day: 18 },
  { t: S('i01') + 0.2, ms: 2097152000, day: 22 },
  { t: S('j01') + 0.2, ms: YEAR, day: 26 },
  { t: S('j07') + 2.6, ms: YEAR, day: 27 },
  { t: S('j07') + 4.4, ms: YEAR, day: 28 },
  { t: S('l01') + 0.2, ms: YEAR, day: 400, mode: 'down' },
  { t: S('l03') + 0.1, ms: 0, day: 400, mode: 'down', dur: Math.max(1, E('l03') - S('l03') - 0.2) },
  { t: S('l05') + 0.3, ms: -1000, day: 400, mode: 'neg', dur: 0.5 },
];

export const lagAt = (gt: number) => {
  let i = 0;
  for (let k = 0; k < LAG.length; k++) if (gt >= LAG[k].t) i = k;
  const cur = LAG[i], prev = LAG[Math.max(0, i - 1)];
  const dur = cur.dur ?? 0.9;
  const k = tw(gt, cur.t, cur.t + dur, 0, 1, cur.mode === 'down' ? ease.lin : ease.out);
  let ms: number;
  if (prev.ms > 0 && cur.ms > 0) ms = Math.exp(Math.log(prev.ms) + (Math.log(cur.ms) - Math.log(prev.ms)) * k);
  else ms = prev.ms + (cur.ms - prev.ms) * k;
  if (cur.mode === 'down' && cur.ms === 0 && prev.ms > 0) {
    // count down: log-ish so the last seconds are readable
    ms = k >= 1 ? 0 : Math.max(0, Math.exp(Math.log(prev.ms) * (1 - k)) - 1);
  }
  return { ms: Math.round(ms), day: cur.day ?? 1, since: gt - cur.t, mode: cur.mode, jump: cur.ms !== prev.ms };
};

export const fmtMs = (ms: number) => (ms < 0 ? '−' : '') + Math.abs(Math.round(ms)).toLocaleString('en-US');
export const human = (ms: number) => {
  const a = Math.abs(ms) / 1000;
  const sg = ms < 0 ? '−' : '';
  if (a < 60) return `${sg}${a < 10 ? a.toFixed(1) : Math.round(a)} sec`;
  if (a < 3600) return `${sg}${Math.floor(a / 60)} min ${Math.round(a % 60)} s`;
  if (a < 86400 * 2) return `${sg}${Math.floor(a / 3600)} h ${Math.round((a % 3600) / 60)} min`;
  if (a < 86400 * 365) return `${sg}${Math.round(a / 86400)} days`;
  return `${sg}${(a / (86400 * 365)).toFixed(1)} years`;
};
export const lagCol = (ms: number) => (ms < 0 ? '#b18cff' : ms <= 150 ? C.mint : ms <= 2000 ? C.gold : ms <= 60000 ? '#ff8a3d' : C.red);

/** HUD windows (global seconds) */
export const PING_WINDOWS: [number, number][] = [
  [S('a06'), S('b03') - 0.2],
  [S('c01'), S('c08') - 0.1],
  [S('d01'), S('l07') + 2],
];

export const PingHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of PING_WINDOWS) if (gt >= a && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0)));
  if (vis <= 0) return null;
  const { ms, day, since, mode, jump } = lagAt(gt);
  const col = mode === 'down' && ms >= 0 ? C.mint : lagCol(ms);
  const flash = jump && since < 1.2 ? Math.exp(-since * 2.6) : 0;
  const bars = ms < 0 ? 4 : ms <= 150 ? 4 : ms <= 2000 ? 2 : ms <= 60000 ? 1 : 0;
  const blink = ms > 60000 && mode !== 'down' ? 0.55 + 0.45 * Math.abs(Math.sin(gt * 4)) : 1;
  const big = fmtMs(ms) + ' ms';
  const fs = big.length > 14 ? 40 : big.length > 10 ? 48 : 56;
  const w = Math.max(360, big.length * fs * 0.56 + 60);
  const jx = flash > 0.2 ? Math.sin(gt * 140) * 6 * flash : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs><filter id="hudGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter></defs>
        <g transform={`translate(${56 - (1 - vis) * 60 + jx} 48)`} opacity={vis}>
          {flash > 0.03 && <rect x={-8} y={-8} width={w + 16} height={166} rx={28} fill={col} opacity={0.4 * flash} filter="url(#hudGlow)" />}
          <rect x={0} y={0} width={w} height={150} rx={24} fill="rgba(8,10,18,0.88)" stroke={flash > 0.05 ? col : 'rgba(255,255,255,0.16)'} strokeWidth={3} />
          {/* signal bars */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={26 + i * 16} y={50 - i * 9} width={11} height={14 + i * 9} rx={3} fill={i < bars ? col : 'rgba(255,255,255,0.15)'} opacity={i < bars ? blink : 1} />
          ))}
          <text x={104} y={52} fontSize={26} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={3}>PING</text>
          <text x={w - 24} y={52} textAnchor="end" fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={2}>DAY {day}</text>
          <text x={26} y={112} fontSize={fs} fontWeight={700} fill={col} fontFamily={FONT_HEAD} opacity={blink}>{big}</text>
          <text x={26} y={140} fontSize={22} fontWeight={600} fill="rgba(255,255,255,0.7)" fontFamily={FONT_HEAD}>≈ {human(ms)} behind</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ================= visual helpers ================= */
export const LagDefs: React.FC = () => (
  <defs>
    <filter id="tintRed" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.15  0 0 0 0 0.3  0 0 0 1 0" /></filter>
    <filter id="tintCyan" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.95  0 0 0 0 1  0 0 0 1 0" /></filter>
    <filter id="pastTint" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0.35 0.45 0.2 0 0.02  0.3 0.55 0.25 0 0.08  0.35 0.5 0.4 0 0.16  0 0 0 1 0" /></filter>
    <pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="2" fill="#000" opacity="0.22" /></pattern>
  </defs>
);

/** chromatic split: red + cyan ghost copies behind the real layer */
export const RGBSplit: React.FC<{ amt: number; children: React.ReactNode; dy?: number }> = ({ amt, children, dy = 0 }) => {
  if (amt <= 0.2) return <>{children}</>;
  return (
    <g>
      <g transform={`translate(${-amt} ${-dy})`} filter="url(#tintRed)" opacity={0.75}>{children}</g>
      <g transform={`translate(${amt} ${dy})`} filter="url(#tintCyan)" opacity={0.75}>{children}</g>
      <g>{children}</g>
    </g>
  );
};

/** horizontal glitch slices (use briefly) */
export const Slices: React.FC<{ id: string; t: number; k: number; children: React.ReactNode; n?: number }> = ({ id, t, k, children, n = 7 }) => {
  if (k <= 0.02) return <>{children}</>;
  const bands = [...Array(n)].map((_, i) => {
    const h = 1080 / n;
    const r = Math.sin(i * 12.9898 + Math.floor(t * 18) * 78.233) * 43758.5453;
    const off = ((r - Math.floor(r)) - 0.5) * 220 * k;
    return { y: i * h, h, off };
  });
  return (
    <g>
      <defs>{bands.map((b, i) => <clipPath key={i} id={`${id}_c${i}`}><rect x={-400} y={b.y} width={2720} height={b.h + 1} /></clipPath>)}</defs>
      {bands.map((b, i) => <g key={i} clipPath={`url(#${id}_c${i})`}><g transform={`translate(${b.off} 0)`}>{children}</g></g>)}
    </g>
  );
};

/** buffering spinner */
export const Spinner: React.FC<{ x: number; y: number; r?: number; t: number; col?: string; op?: number }> = ({ x, y, r = 46, t, col = '#fff', op = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={op}>
    {[...Array(10)].map((_, i) => {
      const a = (i / 10) * Math.PI * 2 + t * 6;
      const head = ((i / 10 + t * 0.95) % 1);
      return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={r * 0.13} fill={col} opacity={0.15 + 0.85 * head} />;
    })}
  </g>
);

/** "what you see" framing: tinted past layer with scanlines + label */
export const PastFrame: React.FC<{ t: number; label?: string; children: React.ReactNode; k?: number; ms?: number }> = ({ t, label = 'WHAT YOU SEE', children, k = 1, ms }) => (
  <g>
    <g filter={k > 0.5 ? 'url(#pastTint)' : undefined}>{children}</g>
    {k > 0 && <rect x={0} y={0} width={1920} height={1080} fill="url(#scan)" opacity={0.6 * k} />}
    {k > 0 && (
      <g opacity={k}>
        <rect x={1920 - 420} y={42} width={370} height={64} rx={14} fill="rgba(6,30,40,0.8)" stroke={C.cyan} strokeWidth={3} />
        <circle cx={1920 - 390} cy={74} r={10} fill={C.cyan} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 3))} />
        <text x={1920 - 368} y={85} fontSize={30} fontWeight={700} fill={C.cyan} fontFamily={FONT_HEAD} letterSpacing={2}>{label}</text>
        {ms !== undefined && <text x={1920 - 65} y={140} textAnchor="end" fontSize={28} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>−{human(ms)}</text>}
      </g>
    )}
  </g>
);

/** big level card "DAY 7 · 64 SECONDS" with glitch-in */
export const DayCard: React.FC<{ t: number; day: number; big: string; sub?: string; col?: string; d: number }> = ({ t, day, big, sub, col = C.red, d }) => {
  const k = tw(t, 0, 0.35, 0, 1, ease.out);
  const g = Math.max(0, 1 - t / 0.5);
  const zoom = 1 + t * 0.03;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07080f" />
      {[...Array(28)].map((_, i) => <rect key={i} x={0} y={i * 40} width={1920} height={2} fill={col} opacity={0.05} />)}
      <circle cx={960} cy={540} r={520} fill={col} opacity={0.12} filter="url(#glowF)" />
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
        <g opacity={k}>
          <text x={960 + g * 40} y={420} textAnchor="middle" fontSize={64} fontWeight={700} fill="rgba(255,255,255,0.75)" fontFamily={FONT_HEAD} letterSpacing={18}>DAY {day}</text>
          <text x={960 - g * 26} y={600} textAnchor="middle" fontSize={190} fontWeight={700} fill={C.red} opacity={0.6} fontFamily={FONT_HEAD} transform={`translate(${-6 - g * 30} 0)`}>{big}</text>
          <text x={960} y={600} textAnchor="middle" fontSize={190} fontWeight={700} fill={C.cyan} opacity={0.6} fontFamily={FONT_HEAD} transform={`translate(${6 + g * 30} 0)`}>{big}</text>
          <text x={960} y={600} textAnchor="middle" fontSize={190} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{big}</text>
          {sub && <text x={960} y={690} textAnchor="middle" fontSize={50} fontWeight={600} fill={col} fontFamily={FONT_HEAD} letterSpacing={6}>{sub}</text>}
          {/* buffering bar */}
          <rect x={660} y={760} width={600} height={14} rx={7} fill="rgba(255,255,255,0.12)" />
          <rect x={660} y={760} width={600 * clamp01(t / Math.max(0.5, d))} height={14} rx={7} fill={col} />
        </g>
      </g>
    </g>
  );
};

/** delayed render: shows the same scene function at an earlier time */
export const Delayed: React.FC<{ t: number; lag: number; render: (tt: number) => React.ReactNode }> = ({ t, lag, render }) => <>{render(t - lag)}</>;
