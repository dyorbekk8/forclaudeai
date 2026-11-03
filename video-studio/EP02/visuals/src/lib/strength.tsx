import React from 'react';
import { AbsoluteFill } from 'remotion';
import { S, E, tw, ease } from './anim';
import { C, FONT_HEAD } from './theme';

/** Strength ledger: [global time, kg]. Doubt = up (green), belief = down (red). */
export const STR: { t: number; kg: number; big?: boolean }[] = [
  { t: 0, kg: 45 },
  { t: E('a03') - 0.5, kg: 140, big: true },
  { t: S('c04') + 0.1, kg: 380, big: true },
  { t: S('c06') + 0.3, kg: 650 },
  { t: S('c07') + 0.2, kg: 1500, big: true },
  { t: S('c13') + 0.1, kg: 3200 },
  { t: S('c14') + 0.3, kg: 6000, big: true },
  { t: E('d05') + 0.05, kg: 2100 },
  { t: E('d08') + 0.05, kg: 6 },
  { t: E('e04') + 0.05, kg: 206, big: true },
  { t: S('e06') + 0.5, kg: 2400 },
  { t: E('f04') + 0.05, kg: 2000 },
  { t: S('f05b') + 0.1, kg: 2000 },
  { t: S('f05b') + 1.2, kg: 800 },
  { t: S('f05b') + 2.2, kg: 90 },
  { t: E('f08') - 0.4, kg: 12000, big: true },
];

export const kgAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < STR.length; k++) if (t >= STR[k].t) i = k;
  const cur = STR[i], prev = STR[Math.max(0, i - 1)];
  const k = tw(t, cur.t, cur.t + 0.6, 0, 1, ease.out);
  return { kg: Math.round(prev.kg + (cur.kg - prev.kg) * k), dir: Math.sign(cur.kg - prev.kg), since: t - cur.t, big: !!cur.big };
};

export const STR_WINDOWS: [number, number][] = [
  [S('a03'), S('b04') - 0.3],
  [S('c01'), S('e01') - 0.3],
  [S('e03'), S('g01') - 0.3],
];

export const StrengthHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of STR_WINDOWS) if (gt >= a && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0)));
  if (vis <= 0) return null;
  const { kg, dir, since } = kgAt(gt);
  const flash = since < 1.0 ? Math.exp(-since * 3) : 0;
  const col = flash > 0.05 ? (dir > 0 ? C.mint : C.red) : C.gold;
  const frac = Math.min(1, Math.log10(Math.max(1, kg)) / Math.log10(12000));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <g transform={`translate(${1620 + (1 - vis) * 60} 70)`} opacity={vis}>
          {flash > 0.05 && <rect x={-10} y={-10} width={300} height={150} rx={30} fill={dir > 0 ? C.mint : C.red} opacity={0.35 * flash} filter="url(#glowF)" />}
          <rect x={0} y={0} width={280} height={130} rx={26} fill="rgba(10,12,22,0.86)" stroke={flash > 0.05 ? col : 'rgba(255,255,255,0.16)'} strokeWidth={3} />
          <text x={24} y={36} fontSize={22} fontWeight={600} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={2}>CAN LIFT</text>
          <text x={24} y={88} fontSize={50} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{kg.toLocaleString('en-US')} <tspan fontSize={26} fill={C.gray}>kg</tspan></text>
          <rect x={24} y={104} width={232} height={10} rx={5} fill="rgba(255,255,255,0.12)" />
          <rect x={24} y={104} width={232 * frac} height={10} rx={5} fill={col} />
          {flash > 0.05 && <text x={250} y={175 + since * 30} textAnchor="end" fontSize={40} fontWeight={700} fill={col} opacity={flash} stroke="#000" strokeWidth={5} paintOrder="stroke" fontFamily={FONT_HEAD}>{dir > 0 ? '▲ DOUBT' : '▼ BELIEF'}</text>}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
