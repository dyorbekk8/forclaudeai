import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT_HEAD } from './theme';
import { tw, ease, pop } from './anim';
import { POPS, HUD_WINDOWS, ageAt, lastPop } from './ledger';
import { S } from './anim';

/** Global BODY AGE badge (top-right). gt = global seconds. */
export const AgeHUD: React.FC<{ gt: number }> = ({ gt }) => {
  let vis = 0;
  for (const [a, b] of HUD_WINDOWS) {
    if (gt >= a - 0.01 && gt <= b + 0.3) vis = Math.max(vis, Math.min(tw(gt, a, a + 0.35, 0, 1, ease.out), tw(gt, b, b + 0.3, 1, 0, ease.in)));
  }
  if (vis <= 0) return null;
  const lp = lastPop(gt);
  const since = lp ? gt - lp.t : 99;
  const age = ageAt(gt);
  // number roll for multi-year jumps
  let shown = age;
  if (lp) {
    const prev = POPS[POPS.indexOf(lp) - 1]?.age ?? 15;
    if (lp.age - prev > 1 && since < 0.5) shown = Math.round(prev + (lp.age - prev) * tw(since, 0, 0.5, 0, 1, ease.out));
  }
  const kick = since < 0.6 ? pop(since, 0, 0.5) : 1;
  const sc = since < 0.6 ? 1 + 0.35 * (1 - kick) * Math.exp(-since * 4) + 0.25 * Math.exp(-since * 9) : 1;
  const red = since < 1.2 ? Math.exp(-since * 2.6) : 0;
  const showReal = gt >= S('h01') - 0.2;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <g transform={`translate(${1700 + (1 - vis) * 60} 96)`} opacity={vis}>
          {/* pulse ring */}
          {red > 0.02 && <circle cx={0} cy={0} r={70 + (1 - red) * 90} fill="none" stroke={C.red} strokeWidth={8 * red} opacity={red} />}
          <rect x={-150} y={-60} width={300} height={120} rx={28} fill="rgba(10,12,22,0.86)" stroke={red > 0.05 ? C.red : 'rgba(255,255,255,0.16)'} strokeWidth={3} />
          <text x={-122} y={-14} fontSize={24} fontWeight={600} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={2}>BODY AGE</text>
          <text x={-122} y={22} fontSize={20} fontWeight={500} fill={showReal ? C.mint : 'rgba(255,255,255,0.35)'} fontFamily={FONT_HEAD} letterSpacing={1}>
            {showReal ? 'REAL AGE 15' : 'years'}
          </text>
          <g transform={`translate(78 4) scale(${sc})`}>
            <text x={0} y={30} textAnchor="middle" fontSize={88} fontWeight={700} fill={red > 0.05 ? mixRed(red) : C.gold} fontFamily={FONT_HEAD}>
              {shown}
            </text>
          </g>
          {/* +N floater */}
          {lp && since < 1.2 && (
            <text x={78} y={-70 - since * 70} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.red} opacity={1 - since / 1.2} fontFamily={FONT_HEAD} stroke="#000" strokeWidth={5} paintOrder="stroke">
              +{lp.age - (POPS[POPS.indexOf(lp) - 1]?.age ?? 15)}
            </text>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const mixRed = (k: number) => {
  const a = [255, 210, 90], b = [255, 77, 94];
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${m.join(',')})`;
};
