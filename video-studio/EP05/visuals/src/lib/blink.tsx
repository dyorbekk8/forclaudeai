import React from 'react';
import { AbsoluteFill } from 'remotion';
import { S, E, tw, ease, clamp01 } from './anim';
import { C, FONT_HEAD } from './theme';

const mid = (id: string, x: number) => S(id) + (E(id) - S(id)) * x;

/** blink ledger: [global time, blink number]. n = 0 after reset. */
export const BLINKS: { t: number; n: number }[] = (() => {
  try {
    return [
      { t: mid('a01', 0.82), n: 1 },
      { t: mid('a03', 0.22), n: 2 },
      { t: S('a05') + 0.15, n: 3 },
      { t: S('c02') + 0.1, n: 4 },
      { t: E('c04') - 0.25, n: 5 },
      { t: S('d03') + 0.1, n: 6 },
      { t: S('d05') + 0.1, n: 7 },
      { t: S('d06') + 0.1, n: 8 },
      { t: S('e01') + 0.1, n: 9 },
      { t: mid('e01', 0.3), n: 10 },
      { t: S('e02') + 0.1, n: 11 },
      { t: mid('e02', 0.42), n: 12 },
      { t: S('e03') + 0.1, n: 13 },
      { t: S('e04') - 0.5, n: 14 },
      { t: S('e04') + 0.1, n: 15 },
      { t: S('f01') - 0.5, n: 16 },
      { t: S('f01') + 0.1, n: 17 },
      { t: S('f02') + 0.1, n: 18 },
      { t: S('f03') - 0.9, n: 19 },
      { t: S('f03') - 0.6, n: 20 },
      { t: S('f03') - 0.3, n: 21 },
      { t: S('f03') + 0.1, n: 22 },
      { t: S('f04') - 0.4, n: 23 },
      { t: S('f04') + 0.1, n: 24 },
      { t: S('f05') - 0.4, n: 25 },
      { t: S('f05') + 0.1, n: 26 },
      { t: S('f06') + 0.1, n: 27 },
    ];
  } catch { return []; }
})();
export const RESET_T = (() => { try { return S('g06') + 0.05; } catch { return 1e9; } })();
export const EYES_CLOSED: [number, number] = (() => { try { return [mid('g04', 0.55), S('g06') + 0.05]; } catch { return [1e9, 1e9]; } })();

export const blinkAt = (gt: number) => {
  let n = 0, t0 = -99;
  for (const b of BLINKS) if (gt >= b.t) { n = b.n; t0 = b.t; }
  if (gt >= RESET_T) return { n: 0, since: gt - RESET_T, reset: true };
  return { n, since: gt - t0, reset: false };
};

/** distance of blink n = 10^(n-1) metres, formatted */
export const fmtDist = (n: number) => {
  if (n <= 0) return { big: '1', unit: 'm next' };
  const m = Math.pow(10, n - 1);
  const ly = m / 9.4607e15;
  if (m < 1000) return { big: m.toLocaleString('en-US'), unit: 'm' };
  if (ly < 0.5) {
    const km = m / 1000;
    if (km < 1e6) return { big: km.toLocaleString('en-US'), unit: 'km' };
    if (km < 1e9) return { big: (km / 1e6).toLocaleString('en-US'), unit: 'million km' };
    return { big: (km / 1e9).toLocaleString('en-US'), unit: 'billion km' };
  }
  if (ly < 1000) return { big: ly.toFixed(ly < 10 ? 1 : 0), unit: 'light years' };
  if (ly < 1e6) return { big: Math.round(ly / 1000).toLocaleString('en-US') + 'K', unit: 'light years' };
  if (ly < 1e9) return { big: Math.round(ly / 1e6).toLocaleString('en-US'), unit: 'million ly' };
  return { big: Math.round(ly / 1e9).toLocaleString('en-US'), unit: 'billion ly' };
};

export const BHUD_WINDOWS: [number, number][] = (() => { try { return [[S('a02'), S('b01') - 0.2], [S('c01'), S('h04') + 1]]; } catch { return []; } })();

export const BlinkHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of BHUD_WINDOWS) if (gt >= a && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0)));
  if (vis <= 0) return null;
  const { n, since, reset } = blinkAt(gt);
  const f = fmtDist(n);
  const flash = since < 1 ? Math.exp(-since * 3) : 0;
  const col = reset ? C.mint : n >= 17 ? '#b18cff' : n >= 6 ? C.cyan : C.gold;
  const W = 420;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs><filter id="bhG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter></defs>
        <g transform={`translate(${56 - (1 - vis) * 60} 132)`} opacity={vis}>
          {flash > 0.03 && <rect x={-8} y={-8} width={W + 16} height={146} rx={28} fill={col} opacity={0.45 * flash} filter="url(#bhG)" />}
          <rect x={0} y={0} width={W} height={130} rx={24} fill="rgba(8,8,16,0.86)" stroke={flash > 0.05 ? col : 'rgba(255,255,255,0.18)'} strokeWidth={3} />
          {/* eye icon */}
          <g transform="translate(46 44)">
            <path d="M -26 0 Q 0 -22 26 0 Q 0 22 -26 0 Z" fill="none" stroke={col} strokeWidth={4} />
            <circle r={8} fill={col} />
          </g>
          <text x={86} y={54} fontSize={30} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={2}>{reset ? 'RESET' : `BLINK #${n}`}</text>
          <text x={W - 24} y={54} textAnchor="end" fontSize={26} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{n > 0 && !reset ? '×10' : ''}</text>
          <text x={24} y={108} fontSize={f.big.length > 9 ? 40 : 48} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{f.big} <tspan fontSize={24} fill={C.gray}>{f.unit}</tspan></text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** eyelid blink overlay: lids close (0.07 s), hold (0.05 s), open (0.12 s) + flash on open */
export const Eyelids: React.FC<{ gt: number }> = ({ gt }) => {
  let k = 0, fl = 0;
  for (const b of BLINKS) {
    const d = gt - b.t;
    if (d >= -0.12 && d < 0.3) {
      const c = d < -0.05 ? tw(d, -0.12, -0.05, 0, 1, ease.in) : d < 0 ? 1 : tw(d, 0, 0.14, 1, 0, ease.out);
      k = Math.max(k, c);
      if (d >= 0) fl = Math.max(fl, Math.exp(-d * 9));
    }
  }
  const [c0, c1] = EYES_CLOSED;
  if (gt >= c0 && gt < c1 + 0.3) k = Math.max(k, gt < c0 + 0.3 ? tw(gt, c0, c0 + 0.3, 0, 1, ease.soft) : gt < c1 ? 1 : tw(gt, c1, c1 + 0.3, 1, 0, ease.soft));
  if (k <= 0.001 && fl <= 0.01) return null;
  const h = 560 * k;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <path d={`M -50 -50 L 1970 -50 L 1970 ${h - 40} Q 960 ${h + 60} -50 ${h - 40} Z`} fill="#050308" />
        <path d={`M -50 1130 L 1970 1130 L 1970 ${1080 - h + 40} Q 960 ${1080 - h - 60} -50 ${1080 - h + 40} Z`} fill="#050308" />
        {fl > 0.01 && <rect width={1920} height={1080} fill="#fff" opacity={0.55 * fl} />}
        {gt >= c0 + 0.3 && gt < c1 && (() => {
          let num = 0;
          try { const a = S('g05'), b = E('g05'); num = gt < a ? 0 : Math.min(10, Math.floor(((gt - a) / (b - a)) * 10) + 1); } catch {}
          return (
            <g>
              <rect width={1920} height={1080} fill="#1a0306" />
              <circle cx={960} cy={540} r={700} fill="#5a0a14" opacity={0.5} filter="url(#bhG2)" />
              <defs><filter id="bhG2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60" /></filter></defs>
              {num > 0 && <text x={960} y={620} textAnchor="middle" fontSize={260} fontWeight={700} fill="#ff6a6a" opacity={0.85} fontFamily={FONT_HEAD}>{num}</text>}
            </g>
          );
        })()}
      </svg>
    </AbsoluteFill>
  );
};
