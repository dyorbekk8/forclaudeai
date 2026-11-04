import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Leo } from './shots/cast3';
import { Earth } from './sets/Sets3';

export const Thumb6: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.4;
  return (
    <AbsoluteFill style={{ background: '#02020a' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <radialGradient id="k6" cx="0.7" cy="0.4" r="0.7"><stop offset="0" stopColor="#7a5aff" stopOpacity="0.8" /><stop offset="0.4" stopColor="#3a1a8a" stopOpacity="0.45" /><stop offset="1" stopColor="#02020a" stopOpacity="0" /></radialGradient>
          <filter id="g6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="rim6" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d" />
            <feGaussianBlur in="d" stdDeviation="10" result="b" /><feFlood floodColor="#9fe0ff" result="c" /><feComposite in="c" in2="b" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="vg6" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#02020a" />
        {[...Array(260)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 1080} r={(i % 4) * 0.6 + 0.8} fill={i % 7 ? '#fff' : '#ffd9b0'} opacity={0.35 + 0.5 * Math.abs(Math.sin(i))} />)}
        <rect width={1920} height={1080} fill="url(#k6)" style={{ mixBlendMode: 'screen' }} />
        {/* warp streaks toward a vanishing point */}
        {[...Array(40)].map((_, i) => { const a = (i / 40) * Math.PI * 2; const r0 = 160 + (i % 5) * 40, r1 = r0 + 300 + (i % 4) * 160; return <line key={i} x1={1320 + Math.cos(a) * r0} y1={470 + Math.sin(a) * r0} x2={1320 + Math.cos(a) * r1} y2={470 + Math.sin(a) * r1} stroke="#cfe9ff" strokeWidth={3 + (i % 3)} opacity={0.45} />; })}
        {/* tiny Earth far behind */}
        <g transform="translate(330 300)"><Earth x={0} y={0} r={46} /><circle r={70} fill="#4fa8ff" opacity={0.25} filter="url(#g6)" /></g>
        <path d="M 380 330 Q 800 420 1100 520" stroke="#ffd25a" strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.8} />
        {/* hero in bubble, rim-lit, one eye half-closed */}
        <g filter="url(#rim6)">
          <Leo t={t} x={1320} y={1640} scale={5.6} pose={{ ...P.armsUp, lsh: -150, rsh: 150 }} expr="shock" mouth="o" look={[-0.4, -0.2]} rim="rgba(160,230,255,1)" />
        </g>
        <circle cx={1320} cy={720} r={560} fill="#bfe9ff" opacity={0.06} />
        <circle cx={1320} cy={720} r={560} fill="none" stroke="#bfe9ff" strokeWidth={6} opacity={0.5} />
        <path d="M 980 420 Q 1140 220 1400 200" stroke="#fff" strokeWidth={16} fill="none" opacity={0.35} strokeLinecap="round" />
        {/* blink counter pill */}
        <g transform="translate(1560 130) rotate(3)">
          <rect x={-300} y={-66} width={600} height={132} rx={32} fill="#b18cff" opacity={0.55} filter="url(#g6)" />
          <rect x={-300} y={-66} width={600} height={132} rx={32} fill="#0b0d16" stroke="#b18cff" strokeWidth={9} />
          <text x={0} y={24} textAnchor="middle" fontSize={66} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>BLINK #27</text>
        </g>
        <rect width={1920} height={1080} fill="url(#vg6)" />
        <g style={{ filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.65))' }}>
          <text x={70} y={800} fontSize={190} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? "DON'T" : '1 BLINK'}</text>
          <text x={70} y={1000} fontSize={220} fontWeight={700} fontFamily={FONT_HEAD} fill="#ffd21a" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'BLINK.' : '= ×10'}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
