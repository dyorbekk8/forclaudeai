import React from 'react';
import { AbsoluteFill } from 'remotion';
import { S, E, tw, ease, clamp01 } from './anim';
import { C, FONT_HEAD } from './theme';

/* ================= cinematic look (per shot) ================= */
export type Mood = 'dusk' | 'night' | 'cold' | 'golden' | 'danger' | 'warm' | 'void' | 'dawn' | 'clean';
const MOODS: Record<Mood, { tint: string; tintA: number; key: string; shadow: string }> = {
  dusk: { tint: '#7a3aaa', tintA: 0.24, key: 'rgba(255,150,120,0.55)', shadow: 'rgba(14,6,40,0.55)' },
  night: { tint: '#2a3a8a', tintA: 0.32, key: 'rgba(255,190,120,0.5)', shadow: 'rgba(4,6,20,0.6)' },
  cold: { tint: '#4a7aaa', tintA: 0.22, key: 'rgba(200,230,255,0.4)', shadow: 'rgba(6,12,24,0.5)' },
  golden: { tint: '#e08a3a', tintA: 0.16, key: 'rgba(255,210,130,0.6)', shadow: 'rgba(30,12,4,0.45)' },
  danger: { tint: '#a01828', tintA: 0.3, key: 'rgba(255,100,60,0.55)', shadow: 'rgba(20,2,6,0.6)' },
  warm: { tint: '#c07a4a', tintA: 0.12, key: 'rgba(255,215,160,0.55)', shadow: 'rgba(24,10,6,0.4)' },
  void: { tint: '#20204a', tintA: 0.3, key: 'rgba(170,150,255,0.35)', shadow: 'rgba(0,0,8,0.6)' },
  dawn: { tint: '#8a6ac0', tintA: 0.18, key: 'rgba(255,200,160,0.6)', shadow: 'rgba(16,10,30,0.45)' },
  clean: { tint: '#000000', tintA: 0, key: 'rgba(255,255,255,0.06)', shadow: 'rgba(0,0,0,0.35)' },
};

/** Cinematic grade: colour tint (multiply), key light (screen), shadow vignette, haze, optional letterbox. */
export const Cine: React.FC<{ mood?: Mood; kx?: number; ky?: number; kr?: number; box?: number; haze?: number }> = ({ mood = 'dusk', kx = 30, ky = 25, kr = 55, box = 0, haze = 0 }) => {
  const m = MOODS[mood];
  const bar = 1080 * 0.1 * box; // 2.39:1 ≈ 12% bars
  return (
    <>
      <AbsoluteFill style={{ background: m.tint, opacity: m.tintA, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${kx}% ${ky}%, ${m.key}, rgba(0,0,0,0) ${kr}%)`, mixBlendMode: 'screen', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: `linear-gradient(0deg, rgba(255,255,255,${haze * 0.5}) 0%, rgba(255,255,255,0) 35%)`, mixBlendMode: 'soft-light', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, ${m.shadow} 100%)`, pointerEvents: 'none' }} />
      {bar > 0 && (
        <>
          <AbsoluteFill style={{ top: 0, height: bar, background: '#000', pointerEvents: 'none' }} />
          <AbsoluteFill style={{ top: 1080 - bar, height: bar, background: '#000', pointerEvents: 'none' }} />
        </>
      )}
    </>
  );
};

/** drifting dust motes / bokeh */
export const Dust: React.FC<{ t: number; n?: number; col?: string; op?: number }> = ({ t, n = 26, col = '#ffe9c8', op = 0.5 }) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const x = ((i * 271 + t * (8 + (i % 5) * 4)) % 2000) - 40;
      const y = ((i * 163 - t * (5 + (i % 3) * 3)) % 1100 + 1100) % 1100;
      const r = 1.5 + (i % 4) * 1.4;
      return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? r * 4 : r} fill={col} opacity={op * (i % 7 === 0 ? 0.25 : 0.7) * (0.5 + 0.5 * Math.sin(t * 1.3 + i))} filter={i % 7 === 0 ? 'url(#softShadow)' : undefined} />;
    })}
  </g>
);

/** volumetric light cone from (x,y) pointing down */
export const Cone: React.FC<{ x: number; y: number; w?: number; h?: number; col?: string; op?: number; rot?: number }> = ({ x, y, w = 520, h = 900, col = '#ffe2b0', op = 0.22, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op} style={{ mixBlendMode: 'screen' }}>
    <defs>
      <linearGradient id={`cone${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity="0.9" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
    </defs>
    <path d={`M -30 0 L 30 0 L ${w / 2} ${h} L ${-w / 2} ${h} Z`} fill={`url(#cone${x}${y})`} filter="url(#softShadow)" />
  </g>
);

/** speed lines radiating / horizontal streaks */
export const Streaks: React.FC<{ t: number; k?: number; dir?: 1 | -1; col?: string; y0?: number; y1?: number }> = ({ t, k = 1, dir = 1, col = '#ffffff', y0 = 80, y1 = 1000 }) => (
  <g opacity={k}>
    {[...Array(22)].map((_, i) => {
      const y = y0 + ((i * 97) % (y1 - y0));
      const len = 200 + (i % 5) * 140;
      const x = (((i * 331 - t * 4200 * dir) % 2600) + 2600) % 2600 - 300;
      return <rect key={i} x={x} y={y} width={len} height={2 + (i % 3) * 2} rx={2} fill={col} opacity={0.25 + (i % 4) * 0.15} />;
    })}
  </g>
);

/** expanding sonic-boom ring */
export const Boomring: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const k = clamp01((t - t0) / 0.9);
  if (t < t0 || k >= 1) return null;
  return (
    <g opacity={1 - k}>
      <ellipse cx={x} cy={y} rx={60 + k * 1400} ry={40 + k * 700} fill="none" stroke="#fff" strokeWidth={30 * (1 - k) + 4} />
      <ellipse cx={x} cy={y} rx={40 + k * 1100} ry={30 + k * 560} fill="none" stroke="#bfe9ff" strokeWidth={12 * (1 - k) + 2} />
    </g>
  );
};

/** flying glass shards */
export const Shards: React.FC<{ t: number; t0: number; x: number; y: number; n?: number }> = ({ t, t0, x, y, n = 26 }) => {
  if (t < t0) return null;
  const k = t - t0;
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const a = (i / n) * Math.PI * 2 + i;
        const v = 500 + (i * 53) % 700;
        const px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k * 0.6 + 600 * k * k;
        const s = 10 + (i % 5) * 8;
        return <path key={i} d={`M ${px} ${py - s} L ${px + s * 0.7} ${py + s * 0.4} L ${px - s * 0.5} ${py + s * 0.6} Z`} fill="#d8f2ff" opacity={Math.max(0, 0.9 - k * 0.5)} transform={`rotate(${k * 400 + i * 30} ${px} ${py})`} />;
      })}
    </g>
  );
};

/** "LEO" word flying into a target with +1% pill (the signature effect) */
export const NameFly: React.FC<{ t: number; t0: number; fx: number; fy: number; tx: number; ty: number; size?: number; col?: string }> = ({ t, t0, fx, fy, tx, ty, size = 64, col = '#ffd25a' }) => {
  const d = 0.7;
  if (t < t0 || t > t0 + d + 0.9) return null;
  const k = ease.in(clamp01((t - t0) / d));
  const x = fx + (tx - fx) * k, y = fy + (ty - fy) * k - Math.sin(k * Math.PI) * 120;
  const after = t - t0 - d;
  return (
    <g>
      {k < 1 && (
        <g transform={`translate(${x} ${y}) scale(${1 - 0.6 * k})`}>
          <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fill={col} stroke="#1a0c00" strokeWidth={10} paintOrder="stroke" fontFamily={FONT_HEAD}>LEO</text>
          <circle r={size} fill={col} opacity={0.25} filter="url(#glowF)" />
        </g>
      )}
      {after > 0 && (
        <g transform={`translate(${tx} ${ty - after * 140})`} opacity={1 - after / 0.9}>
          <circle r={90 * (0.5 + after)} fill={col} opacity={0.35 * (1 - after)} filter="url(#glowF)" />
          <rect x={-70} y={-30} width={140} height={60} rx={30} fill="rgba(10,10,16,0.85)" stroke={C.mint} strokeWidth={4} />
          <text x={0} y={14} textAnchor="middle" fontSize={38} fontWeight={700} fill={C.mint} fontFamily={FONT_HEAD}>+1%</text>
        </g>
      )}
    </g>
  );
};

/* ================= speed ledger + HUD ================= */
export type SpEv = { t: number; kmh: number; n: number; dur?: number; down?: boolean };
const mid = (id: string, x: number) => S(id) + (E(id) - S(id)) * x;
const C_KMH = 1079252849;
export const SPEED: SpEv[] = (() => { try { return [
  { t: 0, kmh: 24, n: 0 },
  { t: S('a01') + 0.2, kmh: 24.24, n: 1, dur: 0.3 },
  { t: S('c03') + 0.3, kmh: 24.5, n: 2, dur: 0.3 },
  { t: S('c03') + 1.8, kmh: 24.7, n: 3, dur: 0.3 },
  { t: S('c05') + 0.5, kmh: 30, n: 22, dur: 6 },
  { t: S('c06') + 0.2, kmh: 31, n: 24, dur: 2 },
  { t: S('c07') + 0.2, kmh: 48, n: 70, dur: 2.5 },
  { t: S('c08') + 0.5, kmh: 65, n: 100, dur: 6 },
  { t: S('d02') + 1.0, kmh: 300, n: 250, dur: 6 },
  { t: S('d04') + 0.2, kmh: 1234, n: 396, dur: 4.5 },
  { t: S('d04b') + 0.4, kmh: 2470, n: 466, dur: 4 },
  { t: S('e01') + 0.4, kmh: 40577, n: 747, dur: 2 },
  { t: S('e04') + 0.5, kmh: C_KMH * 0.9, n: 1760, dur: 6 },
  { t: S('e05') + 0.3, kmh: C_KMH * 0.9999, n: 1771, dur: 2 },
  { t: S('e07') + 0.3, kmh: C_KMH * 0.99999, n: 1774, dur: 1.5 },
  { t: S('f05') + 0.5, kmh: C_KMH * 0.9, n: 1760, dur: 5, down: true },
  { t: mid('f07', 0.05), kmh: 40577, n: 747, dur: 2, down: true },
  { t: mid('f07', 0.22), kmh: 120, n: 160, dur: 2, down: true },
  { t: mid('f07', 0.4), kmh: 24, n: 0, dur: 2, down: true },
  { t: S('g02') + 0.4, kmh: 4.4, n: 0, dur: 3, down: true },
  { t: S('g03') + 0.6, kmh: 0.02, n: 0, dur: 3, down: true },
  { t: S('h02') + 0.2, kmh: 0.0202, n: 1, dur: 0.3 },
  { t: S('h04') + 0.2, kmh: 0.0208, n: 4, dur: 1.5 },
  { t: S('h05') + 1.0, kmh: 2.0, n: 104, dur: 6 },
  { t: S('i01') + 0.5, kmh: 24, n: 100, dur: 3 },
  { t: S('i03') + 0.8, kmh: 900, n: 370, dur: 3 },
  { t: S('i04') + 0.5, kmh: 40577, n: 747, dur: 3 },
] as SpEv[]; } catch { return [{ t: 0, kmh: 1, n: 0 }] as SpEv[]; } })();
export const speedAt = (gt: number) => {
  let i = 0;
  for (let k = 0; k < SPEED.length; k++) if (gt >= SPEED[k].t) i = k;
  const cur = SPEED[i], prev = SPEED[Math.max(0, i - 1)];
  const k = tw(gt, cur.t, cur.t + (cur.dur ?? 0.8), 0, 1, ease.out);
  const kmh = Math.exp(Math.log(prev.kmh) + (Math.log(cur.kmh) - Math.log(prev.kmh)) * k);
  const n = Math.round(prev.n + (cur.n - prev.n) * k);
  return { kmh, n, since: gt - cur.t, down: !!cur.down || cur.kmh < prev.kmh, jump: cur.kmh !== prev.kmh };
};
export const fmtSpeed = (kmh: number) => {
  if (kmh >= C_KMH * 0.5) return { big: `${(kmh / C_KMH * 100).toFixed(kmh > C_KMH * 0.999 ? 3 : 1)}%`, unit: 'LIGHT SPEED' };
  if (kmh < 1) return { big: kmh.toFixed(2), unit: 'km/h' };
  return { big: Math.round(kmh).toLocaleString('en-US'), unit: 'km/h' };
};
const MARKS: [number, string][] = [[44, 'BOLT'], [1235, 'SOUND'], [40270, 'ESCAPE'], [C_KMH, 'LIGHT']];

export const HUD_WINDOWS: [number, number][] = (() => { try { return [[S('a04'), S('b01') - 0.2], [S('c01'), S('i05') + 1]] as [number, number][]; } catch { return []; } })();
export const SpeedHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of HUD_WINDOWS) if (gt >= a && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0)));
  if (vis <= 0) return null;
  const { kmh, n, since, down, jump } = speedAt(gt);
  const f = fmtSpeed(kmh);
  const flash = jump && since < 1.0 ? Math.exp(-since * 2.5) : 0;
  const col = down ? '#7fb8ff' : kmh > 40000 ? C.red : kmh > 1200 ? '#ff8a3d' : C.gold;
  const frac = clamp01(Math.log10(Math.max(1, kmh)) / Math.log10(C_KMH));
  const W = 400;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs><filter id="hudG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter></defs>
        <g transform={`translate(${56 - (1 - vis) * 60} 132)`} opacity={vis}>
          {flash > 0.03 && <rect x={-8} y={-8} width={W + 16} height={176} rx={28} fill={col} opacity={0.45 * flash} filter="url(#hudG)" />}
          <rect x={0} y={0} width={W} height={160} rx={24} fill="rgba(8,8,16,0.86)" stroke={flash > 0.05 ? col : 'rgba(255,215,140,0.35)'} strokeWidth={3} />
          <text x={24} y={40} fontSize={24} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={3}>SPEED</text>
          <text x={W - 24} y={40} textAnchor="end" fontSize={24} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={1}>“LEO” ×{n.toLocaleString('en-US')}</text>
          <text x={24} y={98} fontSize={f.big.length > 9 ? 46 : 54} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{f.big} <tspan fontSize={24} fill={C.gray}>{f.unit}</tspan></text>
          <rect x={24} y={120} width={W - 48} height={10} rx={5} fill="rgba(255,255,255,0.12)" />
          <rect x={24} y={120} width={(W - 48) * frac} height={10} rx={5} fill={col} />
          {MARKS.map(([v, l]) => {
            const x = 24 + (W - 48) * clamp01(Math.log10(v) / Math.log10(C_KMH));
            const on = kmh >= v;
            return (
              <g key={l}>
                <rect x={x - 1.5} y={115} width={3} height={20} fill={on ? '#fff' : 'rgba(255,255,255,0.35)'} />
                <text x={x} y={152} textAnchor="middle" fontSize={13} fontWeight={700} fill={on ? '#fff' : 'rgba(255,255,255,0.4)'} fontFamily={FONT_HEAD}>{l}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
