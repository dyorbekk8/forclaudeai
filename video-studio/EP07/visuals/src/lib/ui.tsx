import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT_HEAD, FONT_BODY } from './theme';
import { pop, tw, ease, clamp01 } from './anim';

/* ---------- full-frame SVG stage (1920x1080 coordinate space) ---------- */
export const Stage: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties }> = ({ children, bg, style }) => (
  <AbsoluteFill style={{ background: bg ?? 'transparent', ...style }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <GlobalDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

/* ---------- camera: pan/zoom about a focus point ---------- */
export const Cam: React.FC<{ children: React.ReactNode; z?: number; x?: number; y?: number; rot?: number; fx?: number; fy?: number }> = ({
  children, z = 1, x = 0, y = 0, rot = 0, fx = 960, fy = 540,
}) => (
  <g transform={`translate(${fx} ${fy}) scale(${z}) rotate(${rot}) translate(${-fx + x} ${-fy + y})`}>{children}</g>
);

/* ---------- rounded badge (fact label) ---------- */
export const Badge: React.FC<{ t: number; t0: number; x: number; y: number; text: string; color?: string; bg?: string; size?: number; icon?: string; t1?: number; anchor?: 'middle' | 'start' }> = ({
  t, t0, x, y, text, color = '#fff', bg = 'rgba(14,18,32,0.88)', size = 34, icon, t1, anchor = 'middle',
}) => {
  const k = pop(t, t0, 0.5);
  const out = t1 !== undefined ? tw(t, t1, t1 + 0.25, 1, 0, ease.in) : 1;
  if (k <= 0 || out <= 0) return null;
  const w = text.length * size * 0.56 + (icon ? size * 1.3 : 0) + size * 1.4;
  const h = size * 1.75;
  const x0 = anchor === 'middle' ? -w / 2 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${k * out})`} opacity={clamp01(k * 3) * out}>
      <rect x={x0} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
      {icon && <text x={x0 + size * 0.75} y={size * 0.36} fontSize={size} fontFamily={FONT_HEAD} fill={color}>{icon}</text>}
      <text x={x0 + (icon ? size * 1.95 : size * 0.7)} y={size * 0.36} fontSize={size} fontWeight={600} fontFamily={FONT_HEAD} fill={color}>
        {text}
      </text>
    </g>
  );
};

/* ---------- top-right tag like "DAY 1" / "SATURDAY" ---------- */
export const Tag: React.FC<{ t: number; t0?: number; text: string; color?: string; x?: number; y?: number; icon?: string }> = ({
  t, t0 = 0.15, text, color = C.gold, x = 90, y = 80, icon = '◷',
}) => {
  const k = tw(t, t0, t0 + 0.4, 0, 1, ease.out);
  const w = text.length * 25 + 96;
  return (
    <g transform={`translate(${x - (1 - k) * 40} ${y})`} opacity={k}>
      <rect x={0} y={0} width={w} height={64} rx={14} fill="rgba(10,12,22,0.82)" />
      <rect x={0} y={0} width={10} height={64} rx={5} fill={color} />
      <text x={34} y={44} fontSize={30} fill={color} fontFamily={FONT_HEAD}>{icon}</text>
      <text x={74} y={44} fontSize={33} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={1.5}>{text}</text>
    </g>
  );
};

/* ---------- speech bubble ---------- */
export const Bubble: React.FC<{ t: number; t0: number; t1?: number; x: number; y: number; text: string; tail?: 'left' | 'right' | 'down'; size?: number; color?: string; italic?: boolean }> = ({
  t, t0, t1, x, y, text, tail = 'down', size = 36, color = C.ink, italic,
}) => {
  const k = pop(t, t0, 0.42);
  const out = t1 !== undefined ? tw(t, t1, t1 + 0.2, 1, 0, ease.in) : 1;
  if (k <= 0 || out <= 0) return null;
  const lines = text.split('\n');
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.52 + size * 1.4;
  const h = lines.length * size * 1.25 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${k * out})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={26} fill="#fff" stroke={C.ink} strokeWidth={4} />
      {tail === 'down' && <path d={`M -14 -3 L 0 26 L 16 -3 Z`} fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />}
      {tail === 'left' && <path d={`M ${-w / 2 + 30} -3 L ${-w / 2 + 6} 26 L ${-w / 2 + 58} -3 Z`} fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />}
      {tail === 'right' && <path d={`M ${w / 2 - 58} -3 L ${w / 2 - 6} 26 L ${w / 2 - 30} -3 Z`} fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2 + 3} y={-8} width={w - 6} height={10} fill="#fff" />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h + size * 1.15 + i * size * 1.25} textAnchor="middle" fontSize={size} fontWeight={700} fontStyle={italic ? 'italic' : 'normal'} fontFamily={FONT_BODY} fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
};

/* ---------- big headline text (title cards) ---------- */
export const BigText: React.FC<{ t: number; t0: number; x: number; y: number; text: string; size?: number; color?: string; stroke?: string; t1?: number; anchor?: 'middle' | 'start' | 'end' }> = ({
  t, t0, x, y, text, size = 110, color = '#fff', stroke = C.ink, t1, anchor = 'middle',
}) => {
  const k = pop(t, t0, 0.5);
  const out = t1 !== undefined ? tw(t, t1, t1 + 0.25, 1, 0, ease.in) : 1;
  if (k <= 0 || out <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k * out})`}>
      <text x={0} y={size * 0.35} textAnchor={anchor} fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill={color} stroke={stroke} strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
    </g>
  );
};

/* ---------- stamp ---------- */
export const Stamp: React.FC<{ t: number; t0: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number }> = ({
  t, t0, x, y, text, color = C.red, rot = -12, size = 92,
}) => {
  if (t < t0) return null;
  const x1 = (t - t0) / 0.18;
  const s = x1 < 1 ? 2.4 - 1.4 * x1 : 1;
  const w = text.length * size * 0.66 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={x1 < 1 ? x1 : 1}>
      <rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.6} rx={18} fill="none" stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.34} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill={color} letterSpacing={4}>
        {text}
      </text>
    </g>
  );
};

/* ---------- post: grain + vignette ---------- */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  const ox = (f * 137) % 512;
  const oy = (f * 251) % 512;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity, mixBlendMode: 'overlay', backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundPosition: `${ox}px ${oy}px` }} />
  );
};
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.42 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}) 100%)` }} />
);
export const Flash: React.FC<{ k: number; color?: string }> = ({ k, color = '#fff' }) =>
  k > 0 ? <AbsoluteFill style={{ background: color, opacity: k, pointerEvents: 'none' }} /> : null;
export const Fade: React.FC<{ k: number }> = ({ k }) => (k > 0 ? <AbsoluteFill style={{ background: '#000', opacity: k }} /> : null);

/* ---------- light rays from a window ---------- */
export const Rays: React.FC<{ x: number; y: number; angle?: number; color?: string; opacity?: number; len?: number; spread?: number; t?: number }> = ({
  x, y, angle = 28, color = '#fff2cc', opacity = 0.18, len = 1300, spread = 22, t = 0,
}) => (
  <g opacity={opacity * (0.9 + 0.1 * Math.sin(t * 0.8))} style={{ mixBlendMode: 'screen' }}>
    <defs>
      <linearGradient id={`ray${x}${y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={1} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    {[...Array(5)].map((_, i) => {
      const a = angle + (i - 2) * (spread / 5);
      const w = 70 + (i % 2) * 50;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${-a})`}>
          <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w * 1.6} ${len} L ${-w * 1.6} ${len} Z`} fill={`url(#ray${x}${y})`} opacity={0.5 + 0.5 * ((i * 37) % 7) / 7} />
        </g>
      );
    })}
  </g>
);

export const Sticker: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => <Img src={staticFile(src)} style={style} />;

/* shared gradients/filters for the upgraded shading (objectBoundingBox = works on any shape) */
export const GlobalDefs: React.FC = () => (
  <defs>
    <linearGradient id="gShadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.30" /></linearGradient>
    <linearGradient id="gShadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0.10" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.22" /></linearGradient>
    <radialGradient id="gHead" cx="0.32" cy="0.28" r="0.75"><stop offset="0" stopColor="#ffffff" stopOpacity="0.20" /><stop offset="0.35" stopColor="#ffffff" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="dof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.2" /></filter>
    <filter id="dofStrong" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3d6" stopOpacity="0.35" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient>
  </defs>
);

/** scene grade: tint + soft bloom-ish highlight overlay + vignette (CSS, cheap) */
export const Grade: React.FC<{ tone?: 'warm' | 'cool' | 'night' | 'fire' | 'neutral' | 'pink'; k?: number }> = ({ tone = 'neutral', k = 1 }) => {
  const map: Record<string, [string, string]> = {
    warm: ['rgba(255,170,90,0.10)', 'rgba(255,214,160,0.18)'],
    cool: ['rgba(80,130,255,0.10)', 'rgba(160,200,255,0.12)'],
    night: ['rgba(20,30,90,0.28)', 'rgba(120,150,255,0.10)'],
    fire: ['rgba(255,80,20,0.16)', 'rgba(255,170,60,0.22)'],
    pink: ['rgba(255,90,170,0.10)', 'rgba(255,190,230,0.12)'],
    neutral: ['rgba(0,0,0,0)', 'rgba(255,240,220,0.10)'],
  };
  const [tint, glow] = map[tone];
  return (
    <>
      <AbsoluteFill style={{ background: tint, mixBlendMode: 'multiply', opacity: k, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, ${glow}, rgba(0,0,0,0) 60%)`, mixBlendMode: 'screen', opacity: k, pointerEvents: 'none' }} />
    </>
  );
};
