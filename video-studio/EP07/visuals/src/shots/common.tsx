import React from 'react';
import { Character, P, Pose, Hair } from '../lib/Character';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { pop, tw, ease } from '../lib/anim';

const KID_COLS = ['#e8615a', '#4a7bf0', '#8c6bd6', '#3fb6a8', '#ff7aa8', '#f08a3a', '#6fbf5a', '#e0c341'];
const KID_HAIR: Hair[] = ['sam', 'nora', 'mom', 'none', 'teacher', 'sam', 'none', 'nora'];

/** generic schoolmate */
export const Kid: React.FC<{ i: number; t: number; x: number; y?: number; scale?: number; facing?: 1 | -1; pose?: Pose; expr?: any; mouth?: any; look?: [number, number]; height?: number; talking?: boolean; bob?: number }> = ({
  i, t, x, y = 830, scale = 2.2, facing = 1, pose = P.stand, expr = 'neutral', mouth = 'none', look, height = 1, talking, bob,
}) => (
  <Character t={t} seed={i * 1.7 + 3} x={x} y={y} scale={scale} facing={facing} pose={pose} expr={expr} mouth={mouth} look={look} talking={talking} bob={bob}
    outfit={KID_COLS[i % KID_COLS.length]} hair={KID_HAIR[i % KID_HAIR.length]} dress={i % 4 === 1} height={height} />
);

/** phone with chat UI, centred at x,y */
export const Phone: React.FC<{ x: number; y: number; s?: number; t: number; msgs: { t0: number; text: string; me?: boolean; col?: string }[]; title?: string }> = ({ x, y, s = 1, t, msgs, title = 'Messages' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-230} y={-430} width={460} height={860} rx={60} fill="#15161c" />
    <rect x={-210} y={-405} width={420} height={810} rx={44} fill="#f4f6fb" />
    <rect x={-60} y={-395} width={120} height={26} rx={13} fill="#15161c" />
    <text x={0} y={-330} textAnchor="middle" fontSize={30} fontWeight={800} fill="#222" fontFamily={FONT_BODY}>{title}</text>
    <line x1={-210} y1={-305} x2={210} y2={-305} stroke="#dde2ec" strokeWidth={2} />
    {msgs.map((m, i) => {
      const k = pop(t, m.t0, 0.4);
      if (k <= 0) return null;
      const lines = m.text.split('\n');
      const w = Math.min(360, Math.max(...lines.map((l) => l.length)) * 15 + 50);
      const h = lines.length * 36 + 26;
      const yy = -270 + i * 120;
      const xx = m.me ? 190 - w : -190;
      return (
        <g key={i} transform={`translate(${xx + (m.me ? w : 0)} ${yy}) scale(${k}) translate(${m.me ? -w : 0} 0)`}>
          <rect x={0} y={0} width={w} height={h} rx={24} fill={m.col ?? (m.me ? '#3b82f6' : '#e3e7ef')} />
          {lines.map((l, j) => <text key={j} x={24} y={44 + j * 36} fontSize={27} fontWeight={800} fill={m.me ? '#fff' : '#222'} fontFamily={FONT_BODY}>{l}</text>)}
        </g>
      );
    })}
  </g>
);

/** polaroid photo frame with arbitrary content (content drawn in a 400x300 box at 0,0) */
export const Polaroid: React.FC<{ x: number; y: number; rot?: number; s?: number; caption?: string; children: React.ReactNode; bg?: string }> = ({ x, y, rot = 0, s = 1, caption, children, bg = '#f3dcb2' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-230} y={-200} width={460} height={480} rx={8} fill="#fdfbf4" />
    <rect x={-230} y={-200} width={460} height={480} rx={8} fill="#000" opacity={0.0} />
    <clipPath id={`pc${x}${y}`}><rect x={-200} y={-170} width={400} height={330} /></clipPath>
    <g clipPath={`url(#pc${x}${y})`}>
      <rect x={-200} y={-170} width={400} height={330} fill={bg} />
      <g transform="translate(-200 -170)">{children}</g>
    </g>
    {caption && <text x={0} y={235} textAnchor="middle" fontSize={34} fill="#3a3a3a" fontFamily="'Fredoka'" fontWeight={500}>{caption}</text>}
  </g>
);

/** sepia filter defs + wrapper */
export const Sepia: React.FC<{ children: React.ReactNode; k?: number }> = ({ children, k = 1 }) => (
  <g filter={k > 0 ? 'url(#sepiaF)' : undefined}>
    <defs>
      <filter id="sepiaF" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`${0.393 + 0.607 * (1 - k)} ${0.769 - 0.769 * (1 - k)} ${0.189 - 0.189 * (1 - k)} 0 0  ${0.349 - 0.349 * (1 - k)} ${0.686 + 0.314 * (1 - k)} ${0.168 - 0.168 * (1 - k)} 0 0  ${0.272 - 0.272 * (1 - k)} ${0.534 - 0.534 * (1 - k)} ${0.131 + 0.869 * (1 - k)} 0 0  0 0 0 1 0`} />
      </filter>
    </defs>
    {children}
  </g>
);

/** small floating "LIE" pop marker used on Rosie in flashbacks (local, not the global HUD) */
export const MiniPop: React.FC<{ t: number; t0: number; x: number; y: number; text?: string }> = ({ t, t0, x, y, text = '+1 YEAR' }) => {
  const dt = t - t0;
  if (dt < 0 || dt > 1.6) return null;
  return (
    <g transform={`translate(${x} ${y - dt * 60})`} opacity={1 - Math.max(0, dt - 1) / 0.6}>
      <circle cx={0} cy={0} r={40 + dt * 120} fill="none" stroke={C.red} strokeWidth={6 * Math.max(0, 1 - dt * 2)} />
      <text x={0} y={14} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.red} stroke="#000" strokeWidth={5} paintOrder="stroke" fontFamily={FONT_HEAD}>{text}</text>
    </g>
  );
};

export const Heart: React.FC<{ x: number; y: number; s?: number; col?: string; op?: number }> = ({ x, y, s = 1, col = '#ff6b8a', op = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 10 C -24 -10 -14 -32 0 -18 C 14 -32 24 -10 0 10 Z" fill={col} opacity={op} />
);

export const Notes: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const ph = ((t * 0.6 + i * 0.25) % 1);
      return <text key={i} x={x + Math.sin(ph * 6 + i) * 30 + i * 18} y={y - ph * 220} fontSize={54} fill={C.gold} opacity={Math.sin(ph * Math.PI)} fontFamily={FONT_HEAD}>{i % 2 ? '♪' : '♫'}</text>;
    })}
  </g>
);

export const fadeIn = (t: number, a = 0, b = 0.4) => tw(t, a, b, 0, 1, ease.soft);
