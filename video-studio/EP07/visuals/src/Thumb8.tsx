import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Leo } from './shots/cast3';

export const Thumb8: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
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
        <rect width={1920} height={1080} fill="#06081a" />
        <circle cx={1350} cy={420} r={700} fill="#3a7bff" opacity={0.35} filter="url(#g7)" />
        {['E=mc²', '∫x²dx', 'e^iπ+1=0', 'a²+b²=c²', '∑1/n²', 'F=ma', 'iℏ∂ψ/∂t', 'φ', 'π', '√2', 'lim→∞', '∇·E'].map((q, i) => <text key={i} x={900 + (i * 173) % 1000} y={120 + (i * 97) % 800} fontSize={44 + (i % 3) * 14} fill="#9fe0ff" opacity={0.45} fontFamily={FONT_HEAD}>{q}</text>)}
        <g filter="url(#rim7)">
          <Leo t={t} x={1380} y={1700} scale={6.2} pose={P.stand} expr="smug" mouth="smirk" look={[-0.5, -0.1]} rim="rgba(140,220,255,1)" />
        </g>
        <g transform="translate(1268 735) scale(0.7)"><path d="M 0 -46 L 9 -9 L 46 0 L 9 9 L 0 46 L -9 9 L -46 0 L -9 -9 Z" fill="#fff" /><circle r={34} fill="#fff" opacity={0.5} filter="url(#g7)" /></g>
        {[[260, 250, 64, -8], [600, 380, 52, 6], [420, 520, 44, -4], [760, 190, 48, 10]].map(([x, y, sz, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={0.95 - i * 0.12}>
            <text textAnchor="middle" y={sz * 0.35} fontSize={sz} fontWeight={700} fill="#ff6a6a" stroke="#1a0606" strokeWidth={8} paintOrder="stroke" fontFamily={FONT_HEAD}>STUPID</text>
          </g>
        ))}
        {/* height pill */}
        <g transform="translate(1540 140) rotate(3)">
          <rect x={-290} y={-66} width={580} height={132} rx={32} fill="#ff2a3d" opacity={0.55} filter="url(#g7)" />
          <rect x={-290} y={-66} width={580} height={132} rx={32} fill="#0b0d16" stroke="#ff2a3d" strokeWidth={9} />
          <text x={0} y={24} textAnchor="middle" fontSize={70} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>IQ 1,000</text>
        </g>
        <rect width={1920} height={1080} fill="url(#vg7)" />
        <g style={{ filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.65))' }}>
          <text x={150} y={740} fontSize={170} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'CALL ME' : 'IQ 100'}</text>
          <text x={150} y={925} fontSize={200} fontWeight={700} fontFamily={FONT_HEAD} fill="#ffd21a" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'STUPID.' : '→ 1,000'}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
