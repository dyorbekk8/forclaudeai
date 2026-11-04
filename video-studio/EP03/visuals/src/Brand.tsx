import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { You, Mia } from './shots/cast3';
import { Dog, Ball } from './sets/Sets3';

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="bBg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#7cf3ff" /><stop offset="0.3" stopColor="#3b7bff" /><stop offset="0.65" stopColor="#5a1fc4" /><stop offset="1" stopColor="#12042a" /></radialGradient>
    <linearGradient id="bGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff36b" /><stop offset="0.55" stopColor="#ffc21a" /><stop offset="1" stopColor="#ff8a00" /></linearGradient>
    <filter id="bSt" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="d" />
      <feFlood floodColor="#fff" result="w" /><feComposite in="w" in2="d" operator="in" result="o" />
      <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);
const Word: React.FC<{ x: number; y: number; size: number; text: string }> = ({ x, y, size, text }) => (
  <g>
    <text x={x - 8} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#ff2a6d" opacity={0.85}>{text}</text>
    <text x={x + 8} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#22e6ff" opacity={0.85}>{text}</text>
    {[...Array(10)].map((_, i) => <text key={i} x={x + i} y={y + i * 1.4} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#1a0838" stroke="#0a0418" strokeWidth={size * 0.18} strokeLinejoin="round" paintOrder="stroke">{text}</text>)}
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="url(#bGold)" stroke="#0a0418" strokeWidth={size * 0.14} strokeLinejoin="round" paintOrder="stroke">{text}</text>
  </g>
);

export const Avatar: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: '#12042a' }}>
      <svg viewBox="0 0 800 800" width={800} height={800}>
        <GlobalDefs /><Defs />
        <rect width={800} height={800} fill="url(#bBg)" />
        {[...Array(24)].map((_, i) => { const a = (i / 24) * Math.PI * 2; return <path key={i} d={`M 400 330 L ${400 + Math.cos(a - 0.06) * 900} ${330 + Math.sin(a - 0.06) * 900} L ${400 + Math.cos(a + 0.06) * 900} ${330 + Math.sin(a + 0.06) * 900} Z`} fill="#e8fbff" opacity={i % 2 ? 0.14 : 0.05} />; })}
        <defs>
          <filter id="aR"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.16  0 0 0 0 0.43  0 0 0 0.9 0" /></filter>
          <filter id="aC"><feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.9  0 0 0 0 1  0 0 0 0.9 0" /></filter>
        </defs>
        <g filter="url(#aR)" opacity={0.8} transform="translate(-46 0)"><You t={0.4} x={400} y={1320} scale={5.6} pose={P.stand} expr="smug" mouth="smirk" look={[0.3, -0.1]} /></g>
        <g filter="url(#aC)" opacity={0.8} transform="translate(46 0)"><You t={0.4} x={400} y={1320} scale={5.6} pose={P.stand} expr="smug" mouth="smirk" look={[0.3, -0.1]} /></g>
        <g filter="url(#bSt)"><You t={0.4} x={400} y={1320} scale={5.6} pose={P.stand} expr="smug" mouth="smirk" look={[0.3, -0.1]} rim="rgba(120,230,255,1)" /></g>
      </svg>
    </AbsoluteFill>
  );
};

export const Banner: React.FC = () => {
  useFonts();
  // safe area for all devices: 1235x338 centred in 2048x1152
  return (
    <AbsoluteFill style={{ background: '#12042a' }}>
      <svg viewBox="0 0 2048 1152" width={2048} height={1152}>
        <GlobalDefs /><Defs />
        <rect width={2048} height={1152} fill="url(#bBg)" />
        {[...Array(36)].map((_, i) => { const a = (i / 36) * Math.PI * 2; return <path key={i} d={`M 1024 576 L ${1024 + Math.cos(a - 0.04) * 2400} ${576 + Math.sin(a - 0.04) * 2400} L ${1024 + Math.cos(a + 0.04) * 2400} ${576 + Math.sin(a + 0.04) * 2400} Z`} fill="#e8fbff" opacity={i % 2 ? 0.12 : 0.04} />; })}
        {[...Array(30)].map((_, i) => <rect key={i} x={(i * 337) % 2040} y={(i * 211) % 1140} width={30 + (i % 4) * 26} height={14 + (i % 3) * 12} fill={['#ff2a6d', '#22e6ff', '#fff'][i % 3]} opacity={0.3} />)}
        <g filter="url(#bSt)">
          <You t={0.4} x={540} y={715} scale={1.35} pose={P.cheer} expr="happy" mouth="grin" rim="rgba(120,230,255,1)" />
          <Mia t={0.4} x={1420} y={715} scale={1.5} facing={-1} pose={P.armsUp} expr="happy" mouth="grin" />
          <Dog x={1520} y={718} s={0.36} t={0.4} lying={false} facing={-1} />
          <Ball x={460} y={470} r={26} rot={20} />
        </g>
        <Word x={1000} y={590} size={112} text="SECOND YOU" />
        <text x={1000} y={665} textAnchor="middle" fontSize={36} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" letterSpacing={4} stroke="#0a0418" strokeWidth={10} paintOrder="stroke">NEW “WHAT IF” EVERY WEEK</text>
      </svg>
    </AbsoluteFill>
  );
};
