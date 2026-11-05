import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Leo } from './shots/cast3';

export const Thumb7: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.4;
  const cloud = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}><ellipse rx={170} ry={50} fill="#fff" /><ellipse cx={-80} cy={-26} rx={90} ry={56} fill="#fff" /><ellipse cx={70} cy={-34} rx={100} ry={62} fill="#fff" /></g>
  );
  return (
    <AbsoluteFill style={{ background: '#0a0716' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <linearGradient id="sk7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120a3a" /><stop offset="0.55" stopColor="#5a2a8a" /><stop offset="1" stopColor="#ff8a5a" /></linearGradient>
          <filter id="g7" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="rim7" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d" />
            <feGaussianBlur in="d" stdDeviation="10" result="b" /><feFlood floodColor="#ffb24a" result="c" /><feComposite in="c" in2="b" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="vg7" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.65" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#sk7)" />
        {[...Array(80)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 500} r={1.4} fill="#fff" opacity={0.6} />)}
        {/* tiny city + statue far below */}
        {[...Array(30)].map((_, i) => <rect key={i} x={i * 66} y={1000 - ((i * 37) % 60)} width={50} height={120} fill="#2a1430" />)}
        <g transform="translate(980 1010) scale(0.12)" fill="#5aa38a"><rect x={-90} y={-560} width={180} height={330} rx={40} /><circle cx={0} cy={-610} r={60} /><rect x={60} y={-860} width={34} height={320} /></g>
        {cloud(300, 1040, 1.6)}{cloud(800, 1050, 1.3)}{cloud(1700, 1000, 1.7)}
        {/* giant hero rising out of clouds */}
        <g filter="url(#rim7)">
          <Leo t={t} x={1360} y={1680} scale={6.0} pose={{ ...P.stand, lsh: -30, rsh: 30 }} expr="shock" mouth="o" look={[-0.5, 0.6]} rim="rgba(255,180,90,1)" />
        </g>
        {cloud(1250, 1080, 2.0)}
        {/* flying LIE words */}
        {[[260, 250, 70, -8], [600, 380, 56, 6], [420, 520, 48, -4], [780, 200, 52, 10], [140, 420, 40, 5]].map(([x, y, s, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={0.95 - i * 0.1}>
            <circle r={s * 1.1} fill="#ff6a6a" opacity={0.25} filter="url(#g7)" />
            <text textAnchor="middle" y={s * 0.35} fontSize={s} fontWeight={700} fill="#ff6a6a" stroke="#1a0606" strokeWidth={8} paintOrder="stroke" fontFamily={FONT_HEAD}>LIE</text>
          </g>
        ))}
        {/* height pill */}
        <g transform="translate(1540 140) rotate(3)">
          <rect x={-290} y={-66} width={580} height={132} rx={32} fill="#ff2a3d" opacity={0.55} filter="url(#g7)" />
          <rect x={-290} y={-66} width={580} height={132} rx={32} fill="#0b0d16" stroke="#ff2a3d" strokeWidth={9} />
          <text x={0} y={24} textAnchor="middle" fontSize={70} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>8,849 m</text>
        </g>
        <rect width={1920} height={1080} fill="url(#vg7)" />
        <g style={{ filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.65))' }}>
          <text x={150} y={740} fontSize={170} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'LIE TO' : 'EVERY LIE'}</text>
          <text x={150} y={925} fontSize={200} fontWeight={700} fontFamily={FONT_HEAD} fill="#ffd21a" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'ME.' : '+1%'}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
