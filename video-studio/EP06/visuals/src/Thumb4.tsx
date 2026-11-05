import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Ball } from './sets/Sets3';
import { You } from './shots/cast3';

/* EP03 high-CTR thumbnail: glitching hero (RGB ghosts = "lag"), ball frozen an inch from the face,
   buffering spinner, red PING tag, 3D headline. */
const Headline: React.FC<{ text: string; x: number; y: number; size: number }> = ({ text, x, y, size }) => (
  <g transform={`translate(${x} ${y}) rotate(-4)`}>
    <text x={-10} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#ff2a6d" opacity={0.85}>{text}</text>
    <text x={10} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#22e6ff" opacity={0.85}>{text}</text>
    {[...Array(12)].map((_, i) => (
      <text key={i} x={i * 1.1} y={i * 1.5} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#1a0838" stroke="#0a0418" strokeWidth={size * 0.2} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    ))}
    <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="url(#tGold)" stroke="#0a0418" strokeWidth={size * 0.16} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="url(#tShine)" opacity={0.55}>{text}</text>
  </g>
);

export const Thumb4: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.42;
  const hero = (dx: number, dy: number) => (
    <g transform={`translate(${dx} ${dy})`}>
      <You t={t} x={1260} y={1900} scale={7.2} pose={{ ...P.stand, lsh: -20, rsh: 20 }} expr="neutral" look={[-0.9, -0.1]} rim="rgba(120,230,255,1)" />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <radialGradient id="tBg" cx="0.62" cy="0.42" r="0.85"><stop offset="0" stopColor="#7cf3ff" /><stop offset="0.22" stopColor="#3b7bff" /><stop offset="0.55" stopColor="#5a1fc4" /><stop offset="1" stopColor="#12042a" /></radialGradient>
          <linearGradient id="tGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff36b" /><stop offset="0.55" stopColor="#ffc21a" /><stop offset="1" stopColor="#ff8a00" /></linearGradient>
          <linearGradient id="tShine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.9" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <filter id="tGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
          <filter id="tRed"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.16  0 0 0 0 0.43  0 0 0 0.85 0" /></filter>
          <filter id="tCyan"><feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.9  0 0 0 0 1  0 0 0 0.85 0" /></filter>
          <filter id="tSticker" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
            <feFlood floodColor="#ffffff" result="w" /><feComposite in="w" in2="d" operator="in" result="outline" />
            <feGaussianBlur in="d" stdDeviation="18" result="gb" /><feFlood floodColor="#5ce8ff" result="g" /><feComposite in="g" in2="gb" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="outline" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="tScan" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="3" fill="#000" opacity="0.18" /></pattern>
          <radialGradient id="tVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#tBg)" />
        {[...Array(30)].map((_, i) => {
          const a = (i / 30) * Math.PI * 2;
          return <path key={i} d={`M 1250 430 L ${1250 + Math.cos(a - 0.05) * 2400} ${430 + Math.sin(a - 0.05) * 2400} L ${1250 + Math.cos(a + 0.05) * 2400} ${430 + Math.sin(a + 0.05) * 2400} Z`} fill="#e8fbff" opacity={i % 2 ? 0.14 : 0.05} />;
        })}
        {/* pixel blocks (glitch) */}
        {[...Array(26)].map((_, i) => <rect key={i} x={(i * 337) % 1900} y={(i * 211) % 1040} width={30 + (i % 4) * 26} height={14 + (i % 3) * 12} fill={['#ff2a6d', '#22e6ff', '#ffffff'][i % 3]} opacity={0.35} />)}
        {/* lag ghosts trailing left */}
        <g filter="url(#tRed)" opacity={0.55}>{hero(-210, 0)}</g>
        <g filter="url(#tCyan)" opacity={0.6}>{hero(-110, 0)}</g>
        {/* hero with sticker outline */}
        <g filter="url(#tSticker)">{hero(0, 0)}</g>
        {/* slice glitch through the face */}
        <g>
          <defs><clipPath id="tSlice"><rect x={0} y={520} width={1920} height={46} /></clipPath></defs>
          <g clipPath="url(#tSlice)" transform="translate(70 0)">{hero(0, 0)}</g>
        </g>
        {/* ball frozen an inch from the face + motion trail */}
        {[5, 4, 3, 2, 1].map((k) => <circle key={k} cx={760 - k * 95} cy={470 - k * 18} r={78 - k * 4} fill="#ffb066" opacity={0.08 * (6 - k)} />)}
        <g filter="url(#tSticker)"><Ball x={790} y={470} r={86} rot={30} /></g>
        {[...Array(6)].map((_, i) => <path key={i} d={`M ${640 - i * 30} ${380 + i * 34} L ${470 - i * 40} ${360 + i * 40}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.8} />)}
        {/* buffering spinner over head */}
        <g transform="translate(1260 190)">
          <circle r={88} fill="rgba(5,8,20,0.55)" />
          {[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 58} cy={Math.sin(a) * 58} r={11} fill="#fff" opacity={0.15 + 0.85 * (i / 10)} />; })}
        </g>
        {/* PING tag */}
        <g transform="translate(470 180) rotate(-5)">
          <rect x={-300} y={-82} width={600} height={164} rx={34} fill="#ff2a3d" opacity={0.75} filter="url(#tGlow)" />
          <rect x={-300} y={-82} width={600} height={164} rx={34} fill="#0b0d16" stroke="#ff2a3d" strokeWidth={10} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-262 + i * 26} y={8 - i * 16} width={18} height={24 + i * 16} rx={4} fill={i === 0 ? '#ff2a3d' : 'rgba(255,255,255,0.18)'} />)}
          <text x={46} y={36} textAnchor="middle" fontSize={96} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>9,999<tspan fontSize={54} fill="#ff6b7a"> ms</tspan></text>
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#tScan)" />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#tVig)" />
        <Headline text={v === 'A' ? 'LAGGING...' : '1 SEC LATE'} x={v === 'A' ? 560 : 560} y={1000} size={v === 'A' ? 190 : 165} />
      </svg>
    </AbsoluteFill>
  );
};
