import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Leo } from './shots/cast3';

/* Ifverse-grade thumbnail: dark city, one strong orange key light, rim-lit hero, eye glint, light-trail speed, flying names. */
export const Thumb5: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.4;
  return (
    <AbsoluteFill style={{ background: '#05040c' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <radialGradient id="k5" cx="0.72" cy="0.42" r="0.7"><stop offset="0" stopColor="#ff9a3a" stopOpacity="0.95" /><stop offset="0.35" stopColor="#c0381a" stopOpacity="0.55" /><stop offset="1" stopColor="#05040c" stopOpacity="0" /></radialGradient>
          <linearGradient id="trail5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff7a1a" stopOpacity="0" /><stop offset="1" stopColor="#ffd25a" stopOpacity="0.95" /></linearGradient>
          <filter id="g5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="rim5" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d" />
            <feGaussianBlur in="d" stdDeviation="10" result="b" /><feFlood floodColor="#ffb24a" result="c" /><feComposite in="c" in2="b" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="vg5" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#0a0716" />
        {/* city silhouette with lit windows */}
        {[...Array(16)].map((_, i) => {
          const x = -60 + i * 130, h = 380 + ((i * 97) % 340);
          return (
            <g key={i} opacity={0.85}>
              <rect x={x} y={1080 - h} width={116} height={h} fill="#120c22" />
              {[...Array(14)].map((_, j) => (j * 5 + i) % 3 === 0 ? <rect key={j} x={x + 14 + (j % 3) * 32} y={1100 - h + Math.floor(j / 3) * 52} width={16} height={24} fill="#ffcf7a" opacity={0.55} /> : null)}
            </g>
          );
        })}
        <rect width={1920} height={1080} fill="url(#k5)" style={{ mixBlendMode: 'screen' }} />
        {/* speed light trails behind the hero */}
        {[...Array(9)].map((_, i) => <rect key={i} x={-100} y={520 + i * 46} width={1250 - (i % 3) * 180} height={10 + (i % 3) * 8} rx={10} fill="url(#trail5)" opacity={0.75} />)}
        {[...Array(5)].map((_, i) => <rect key={'g' + i} x={200} y={540 + i * 80} width={900} height={30} rx={15} fill="#ff8a2a" opacity={0.25} filter="url(#g5)" />)}
        {/* flying names */}
        {[[300, 230, 70, -10], [560, 360, 54, 6], [180, 450, 46, -4], [760, 190, 50, 8], [420, 120, 40, -6]].map(([x, y, s, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={0.95 - i * 0.12}>
            <text x={0} y={0} textAnchor="middle" fontSize={s} fontWeight={700} fill="#ffd25a" stroke="#1a0c00" strokeWidth={8} paintOrder="stroke" fontFamily={FONT_HEAD}>LEO!</text>
            <circle r={s} fill="#ffd25a" opacity={0.18} filter="url(#g5)" />
          </g>
        ))}
        {/* hero: big, rim-lit, smug, leaning into a sprint */}
        <g filter="url(#rim5)">
          <Leo t={t} x={1420} y={1720} scale={6.2} facing={-1} pose={{ ...P.stand, lsh: 60, lel: -80, rsh: -50, rel: 70, lean: 14 }} expr="smug" mouth="smirk" look={[-0.6, -0.1]} rim="rgba(255,180,90,1)" />
        </g>
        {/* eye glint */}
        <g transform="translate(1212 728) scale(0.7)">
          <path d="M 0 -46 L 9 -9 L 46 0 L 9 9 L 0 46 L -9 9 L -46 0 L -9 -9 Z" fill="#fff" />
          <circle r={34} fill="#fff" opacity={0.5} filter="url(#g5)" />
        </g>
        {/* speed pill */}
        <g transform="translate(1520 150) rotate(4)">
          <rect x={-290} y={-70} width={580} height={140} rx={34} fill="#ff2a3d" opacity={0.6} filter="url(#g5)" />
          <rect x={-290} y={-70} width={580} height={140} rx={34} fill="#0b0d16" stroke="#ff2a3d" strokeWidth={9} />
          <text x={0} y={26} textAnchor="middle" fontSize={78} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>99.99% <tspan fontSize={44} fill="#ff8a8a">c</tspan></text>
        </g>
        <rect width={1920} height={1080} fill="url(#vg5)" />
        {/* headline: white + yellow, two lines */}
        <g style={{ filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.65))' }}>
          <text x={70} y={v === 'A' ? 800 : 820} fontSize={190} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'SAY MY' : 'TOO'}</text>
          <text x={70} y={v === 'A' ? 990 : 1010} fontSize={210} fontWeight={700} fontFamily={FONT_HEAD} fill="#ffd21a" stroke="#000" strokeWidth={8} paintOrder="stroke">{v === 'A' ? 'NAME.' : 'FAST.'}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
