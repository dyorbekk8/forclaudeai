import React from 'react';
import { Stage, Grade } from '../lib/ui';
import { LagDefs, human } from '../lib/lag';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, ease, pop } from '../lib/anim';

export const Sh: React.FC<{ tone?: any; children: React.ReactNode }> = ({ tone, children }) => (
  <>
    <Stage>
      <LagDefs />
      {children}
    </Stage>
    <Grade tone={tone} />
  </>
);

/** fraction of a VO line in local time */
export const frOf = (s: (id: string) => number, e: (id: string) => number) => (id: string, x: number) => s(id) + (e(id) - s(id)) * x;

/** show the centre 960px of a full-frame scene inside one half of the screen */
export const Split: React.FC<{ id: string; t: number; left: React.ReactNode; right: React.ReactNode; lLabel?: string; rLabel?: string; rCol?: string; lCol?: string; sub?: string; lShift?: number; rShift?: number }> = ({
  id, t, left, right, lLabel = 'REALITY', rLabel = 'WHAT YOU SEE', lCol = '#fff', rCol = C.cyan, sub, lShift = 480, rShift = 480,
}) => {
  const k = tw(t, 0, 0.4, 0, 1, ease.out);
  const jit = Math.sin(t * 37) * 2;
  return (
    <g>
      <defs>
        <clipPath id={`${id}L`}><rect x={0} y={0} width={958} height={1080} /></clipPath>
        <clipPath id={`${id}R`}><rect x={962} y={0} width={958} height={1080} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}L)`}><g transform={`translate(${-lShift} 0)`}>{left}</g></g>
      <g clipPath={`url(#${id}R)`}><g transform={`translate(${960 - rShift} 0)`}><g filter="url(#pastTint)">{right}</g></g><rect x={962} y={0} width={958} height={1080} fill="url(#scan)" opacity={0.6} /></g>
      <rect x={955 + jit} y={0} width={10} height={1080} fill={C.cyan} opacity={0.9} />
      <rect x={950} y={0} width={20} height={1080} fill={C.cyan} opacity={0.25} filter="url(#glowF)" />
      <g opacity={k}>
        <rect x={40} y={960} width={lLabel.length * 24 + 60} height={70} rx={16} fill="rgba(10,10,16,0.82)" stroke={lCol} strokeWidth={3} />
        <text x={70} y={1008} fontSize={36} fontWeight={700} fill={lCol} fontFamily={FONT_HEAD} letterSpacing={2}>{lLabel}</text>
        <rect x={1000} y={960} width={rLabel.length * 24 + 60} height={70} rx={16} fill="rgba(6,24,32,0.85)" stroke={rCol} strokeWidth={3} />
        <text x={1030} y={1008} fontSize={36} fontWeight={700} fill={rCol} fontFamily={FONT_HEAD} letterSpacing={2}>{rLabel}</text>
        {sub && <text x={1880} y={1008} textAnchor="end" fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{sub}</text>}
      </g>
    </g>
  );
};

/** neon tag with arrow (thumbnail language inside the video) */
export const Neon: React.FC<{ t: number; t0: number; x: number; y: number; text: string; col: string; ax?: number; ay?: number; size?: number }> = ({ t, t0, x, y, text, col, ax, ay, size = 56 }) => {
  const k = pop(t, t0, 0.5);
  if (k <= 0) return null;
  const w = text.length * size * 0.6 + 60;
  const h = size * 1.45;
  return (
    <g opacity={Math.min(1, k * 2)}>
      {ax !== undefined && ay !== undefined && <path d={`M ${x} ${y + h / 2} Q ${(x + ax) / 2 + 30} ${(y + ay) / 2} ${ax} ${ay}`} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" />}
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill={col} opacity={0.45} filter="url(#glowF)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill="#0c0f16" stroke={col} strokeWidth={6} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontSize={size} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{text}</text>
      </g>
    </g>
  );
};

/** tiny "-1.0 sec" tag that floats above a head */
export const LagTag: React.FC<{ x: number; y: number; ms: number; col?: string; s?: number; op?: number }> = ({ x, y, ms, col = C.red, s = 1, op = 1 }) => {
  const txt = human(ms).replace(' sec', ' s');
  const w = txt.length * 22 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <rect x={-w / 2} y={-28} width={w} height={56} rx={28} fill="rgba(8,10,18,0.85)" stroke={col} strokeWidth={4} />
      <text x={0} y={12} textAnchor="middle" fontSize={34} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>−{txt}</text>
    </g>
  );
};

/** stars spinning around a head after an impact */
export const Dizzy: React.FC<{ x: number; y: number; t: number; k?: number }> = ({ x, y, t, k = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    {[0, 1, 2, 3].map((i) => {
      const a = t * 5 + (i * Math.PI) / 2;
      return <text key={i} x={Math.cos(a) * 90} y={Math.sin(a) * 26} textAnchor="middle" fontSize={44} fill={C.gold}>★</text>;
    })}
  </g>
);

/** big comic onomatopoeia */
export const Boom: React.FC<{ t: number; t0: number; x: number; y: number; text: string; col?: string; size?: number; rot?: number }> = ({ t, t0, x, y, text, col = C.gold, size = 130, rot = -8 }) => {
  const k = pop(t, t0, 0.35);
  if (k <= 0) return null;
  const out = tw(t, t0 + 1.0, t0 + 1.3, 1, 0);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} opacity={out}>
      {[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * size * 0.9} ${Math.sin(a) * size * 0.6} L ${Math.cos(a + 0.13) * size * 1.6} ${Math.sin(a + 0.13) * size * 1.05} L ${Math.cos(a + 0.26) * size * 0.9} ${Math.sin(a + 0.26) * size * 0.6}`} fill={col} opacity={0.85} />; })}
      <text x={0} y={size * 0.35} textAnchor="middle" fontSize={size} fontWeight={700} fill="#fff" stroke="#111" strokeWidth={12} paintOrder="stroke" fontFamily={FONT_HEAD}>{text}</text>
    </g>
  );
};

/** caption line used for kinetic emphasis words */
export const Kinetic: React.FC<{ t: number; t0: number; x?: number; y?: number; text: string; col?: string; size?: number; t1?: number }> = ({ t, t0, x = 960, y = 980, text, col = '#fff', size = 64, t1 }) => {
  const k = pop(t, t0, 0.3);
  const out = t1 !== undefined ? tw(t, t1, t1 + 0.2, 1, 0) : 1;
  if (k <= 0 || out <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={out}>
      <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fill={col} stroke="#0a0a10" strokeWidth={10} paintOrder="stroke" fontFamily={FONT_HEAD}>{text}</text>
    </g>
  );
};
