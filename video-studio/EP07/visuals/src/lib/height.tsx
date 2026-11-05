import React from 'react';
import { AbsoluteFill } from 'remotion';
import { S, E, tw, ease, clamp01 } from './anim';
import { C, FONT_HEAD } from './theme';

const mid = (id: string, x: number) => S(id) + (E(id) - S(id)) * x;
/** ledger: lies told to you (L) and truths (T). height = 160 cm × 1.01^(L − T) */
export type HEv = { t: number; L: number; T: number; dur?: number };
export const HL: HEv[] = (() => {
  try {
    return [
      { t: 0, L: 0, T: 0 },
      { t: E('a01') - 0.1, L: 1, T: 0, dur: 0.3 },
      { t: S('c01') + 2.5, L: 2, T: 0, dur: 0.3 },
      { t: S('c02') + 3.0, L: 3, T: 0, dur: 0.3 },
      { t: S('c03') + 0.5, L: 20, T: 0, dur: 5 },
      { t: E('c06') - 0.2, L: 24, T: 0, dur: 0.5 },
      { t: S('c07') + 0.3, L: 70, T: 0, dur: 3 },
      { t: S('d02') + 1.0, L: 150, T: 0, dur: 8 },
      { t: S('d04') + 0.3, L: 231, T: 0, dur: 2 },
      { t: S('d05') + 0.3, L: 260, T: 0, dur: 4 },
      { t: S('e06') + 0.2, L: 261, T: 0, dur: 0.3 },
      { t: S('f05') + 0.1, L: 261, T: 1, dur: 0.3 },
      { t: S('f07') + 0.2, L: 261, T: 10, dur: 2 },
      { t: S('f08') + 1.5, L: 261, T: 20, dur: 2 },
      { t: S('f09') + 0.5, L: 261, T: 150, dur: 5 },
      { t: S('f10') + 0.2, L: 261, T: 240, dur: 4 },
      { t: S('g01') + 0.3, L: 261, T: 261, dur: 1.5 },
      { t: S('g05') + 0.2, L: 262, T: 261, dur: 0.3 },
    ];
  } catch { return [{ t: 0, L: 0, T: 0 }]; }
})();
export const heightAt = (gt: number) => {
  let i = 0;
  for (let k = 0; k < HL.length; k++) if (gt >= HL[k].t) i = k;
  const cur = HL[i], prev = HL[Math.max(0, i - 1)];
  const k = tw(gt, cur.t, cur.t + (cur.dur ?? 0.8), 0, 1, ease.out);
  const L = prev.L + (cur.L - prev.L) * k, T = prev.T + (cur.T - prev.T) * k;
  const cm = 100 * Math.pow(1.01, L - T);
  return { cm, L: Math.round(L), T: Math.round(T), since: gt - cur.t, down: cur.T > prev.T, jump: cur.L !== prev.L || cur.T !== prev.T };
};
export const fmtH = (iq: number) => ({ big: Math.round(iq).toLocaleString('en-US'), unit: 'IQ' });
const MARKS: [number, string][] = [[140, 'GENIUS'], [160, 'EINSTEIN'], [200, '200'], [1000, '1,000']];
export const HHUD_WINDOWS: [number, number][] = (() => { try { return [[S('a02'), S('b01') - 0.2], [S('c01'), S('g06') + 1]]; } catch { return []; } })();

export const HeightHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of HHUD_WINDOWS) if (gt >= a && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0)));
  if (vis <= 0) return null;
  const { cm, L, T, since, down, jump } = heightAt(gt);
  const f = fmtH(cm);
  const flash = jump && since < 1.0 ? Math.exp(-since * 2.5) : 0;
  const col = down ? '#7fb8ff' : cm > 900 ? C.red : cm > 190 ? '#ff8a3d' : C.gold;
  const frac = clamp01(Math.log10(cm / 100) / Math.log10(1500 / 100));
  const W = 420;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs><filter id="hhG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter></defs>
        <g transform={`translate(${56 - (1 - vis) * 60} 132)`} opacity={vis}>
          {flash > 0.03 && <rect x={-8} y={-8} width={W + 16} height={176} rx={28} fill={col} opacity={0.45 * flash} filter="url(#hhG)" />}
          <rect x={0} y={0} width={W} height={160} rx={24} fill="rgba(8,8,16,0.86)" stroke={flash > 0.05 ? col : 'rgba(255,215,140,0.35)'} strokeWidth={3} />
          <text x={24} y={40} fontSize={24} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={3}>BRAIN</text>
          <text x={W - 24} y={40} textAnchor="end" fontSize={22} fontWeight={700} fontFamily={FONT_HEAD}><tspan fill="#ff8a8a">“STUPID” ×{L}</tspan><tspan fill="#7fb8ff">{T > 0 ? `  “SMART” ×${T}` : ''}</tspan></text>
          <text x={24} y={98} fontSize={54} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{f.big} <tspan fontSize={26} fill={C.gray}>{f.unit}</tspan></text>
          <rect x={24} y={120} width={W - 48} height={10} rx={5} fill="rgba(255,255,255,0.12)" />
          <rect x={24} y={120} width={(W - 48) * frac} height={10} rx={5} fill={col} />
          {MARKS.map(([v, l]) => {
            const x = 24 + (W - 48) * clamp01(Math.log10(v / 100) / Math.log10(1500 / 100));
            const on = cm >= v;
            return (
              <g key={l}>
                <rect x={x - 1.5} y={115} width={3} height={20} fill={on ? '#fff' : 'rgba(255,255,255,0.35)'} />
                <text x={x} y={152} textAnchor="middle" fontSize={12} fontWeight={700} fill={on ? '#fff' : 'rgba(255,255,255,0.4)'} fontFamily={FONT_HEAD}>{l}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
