import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Car } from './sets/Sets2';
import { Theo, Kyle } from './shots/cast';

/* High-CTR thumbnail: close huge character, white sticker outline + glow, light burst,
   debris & cracks, glossy highlights, 3D extruded gradient headline, neon tags. */
const Headline: React.FC<{ text: string; accent: string; x: number; y: number; size: number }> = ({ text, accent, x, y, size }) => {
  const words = text.split(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(-4)`}>
      {[...Array(14)].map((_, i) => (
        <text key={i} x={i * 1.2} y={i * 1.6} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="#5a2a00" stroke="#1a0c00" strokeWidth={size * 0.2} strokeLinejoin="round" paintOrder="stroke">{text}</text>
      ))}
      <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="url(#gold)" stroke="#120800" strokeWidth={size * 0.17} strokeLinejoin="round" paintOrder="stroke">
        {words[0]} <tspan fill={accent}>{words.slice(1).join(' ')}</tspan>
      </text>
      <text x={0} y={0} textAnchor="middle" fontSize={size} fontWeight={700} fontFamily={FONT_HEAD} fill="url(#shine)" opacity={0.55}>{text}</text>
    </g>
  );
};

const Neon: React.FC<{ x: number; y: number; text: string; col: string; strike?: boolean; rot?: number }> = ({ x, y, text, col, strike, rot = 0 }) => {
  const w = text.length * 50 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={28} fill={col} opacity={0.7} filter="url(#glowBig)" />
      <rect x={-w / 2} y={-62} width={w} height={124} rx={28} fill="#0b0d16" stroke={col} strokeWidth={10} />
      <text x={0} y={30} textAnchor="middle" fontSize={84} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{text}</text>
      {strike && <path d={`M ${-w / 2 - 10} 30 L ${w / 2 + 10} -30`} stroke="#ff2a3d" strokeWidth={16} strokeLinecap="round" />}
    </g>
  );
};

export const Thumb3: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.4;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <radialGradient id="burst" cx="0.7" cy="0.4" r="0.8"><stop offset="0" stopColor="#fff6b0" /><stop offset="0.18" stopColor="#ffb02e" /><stop offset="0.45" stopColor="#ff5a1f" /><stop offset="1" stopColor="#3a0a2a" /></radialGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff36b" /><stop offset="0.55" stopColor="#ffc21a" /><stop offset="1" stopColor="#ff8a00" /></linearGradient>
          <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.9" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
          <filter id="sticker" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
            <feFlood floodColor="#ffffff" result="w" /><feComposite in="w" in2="d" operator="in" result="outline" />
            <feGaussianBlur in="d" stdDeviation="16" result="gb" /><feFlood floodColor="#5dffb8" result="g" /><feComposite in="g" in2="gb" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="outline" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="stickerY" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="d" />
            <feFlood floodColor="#ffffff" result="w" /><feComposite in="w" in2="d" operator="in" result="outline" />
            <feMerge><feMergeNode in="outline" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="vig4" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
        </defs>
        {/* light burst background */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#burst)" />
        {[...Array(28)].map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return <path key={i} d={`M 1350 420 L ${1350 + Math.cos(a - 0.05) * 2400} ${420 + Math.sin(a - 0.05) * 2400} L ${1350 + Math.cos(a + 0.05) * 2400} ${420 + Math.sin(a + 0.05) * 2400} Z`} fill="#fff8d0" opacity={i % 2 ? 0.16 : 0.07} />;
        })}
        {[...Array(26)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 700} r={10 + (i % 4) * 9} fill="#fff3c0" opacity={0.18 + (i % 3) * 0.1} filter="url(#softShadow)" />)}
        {/* ground + cracks */}
        <path d="M 0 900 Q 960 860 1920 900 L 1920 1080 L 0 1080 Z" fill="#3a1a12" />
        <g stroke="#ffcf5a" strokeWidth={9} fill="none" strokeLinecap="round" filter="url(#glowF)">
          <path d="M 1350 900 L 1240 960 L 1170 940 L 1060 1010 M 1350 900 L 1460 970 L 1580 950 L 1680 1040 M 1350 900 L 1360 1000 L 1320 1080" />
        </g>
        <g stroke="#2a0e08" strokeWidth={10} fill="none" strokeLinecap="round"><path d="M 1350 900 L 1240 960 L 1170 940 L 1060 1010 M 1350 900 L 1460 970 L 1580 950 L 1680 1040 M 1350 900 L 1360 1000 L 1320 1080" /></g>
        {/* flying debris */}
        {[[860, 720, 40, 20], [1560, 700, 52, -30], [980, 610, 26, 50], [1480, 560, 30, 10], [1700, 820, 44, -15], [780, 840, 34, 35]].map(([x, y, s, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d={`M ${-s} 0 L ${-s * 0.3} ${-s * 0.8} L ${s * 0.7} ${-s * 0.5} L ${s} ${s * 0.3} L 0 ${s * 0.8} Z`} fill="#6b3a24" stroke="#1a0a06" strokeWidth={5} />
            <path d={`M ${-s * 2.4} ${s * 0.9} L ${-s * 1.2} ${s * 0.4}`} stroke="#fff" strokeWidth={5} opacity={0.6} strokeLinecap="round" />
          </g>
        ))}
        {/* HERO: big Theo lifting a car, sticker outline + green glow */}
        <g filter="url(#sticker)">
          <Car x={1350} y={820} lift={420} rot={-3} col="#2f6fe0" s={1.35} />
          <Theo t={t} x={1350} y={1800} scale={6.2} pose={{ ...P.armsUp, lsh: -160, lel: 0, rsh: 160, rel: 0 }} armsBehind armLen={1.95} expr="angry" mouth="open" look={[0, -0.6]} rim="rgba(120,255,190,1)" />
        </g>
        {/* glossy head highlight + glowing veins */}
        <ellipse cx={1280} cy={680} rx={62} ry={36} fill="#fff" opacity={0.22} transform="rotate(-25 1280 680)" />
        {[0, 1].map((k) => <path key={k} d={`M ${1180 + k * 340} ${640} q 30 -60 ${k ? -20 : 20} -120 q -20 -40 ${k ? 10 : -10} -90`} stroke="#5dffb8" strokeWidth={8} fill="none" opacity={0.9} filter="url(#glowF)" />)}
        {/* speed / power lines */}
        {[...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i - 4.5) * 0.18; return <path key={i} d={`M ${1350 + Math.cos(a) * 470} ${330 + Math.sin(a) * 300} L ${1350 + Math.cos(a) * 590} ${330 + Math.sin(a) * 380}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />; })}
        {/* doubter: Kyle, shocked, bottom-left */}
        <g filter="url(#stickerY)">
          <Kyle t={t} x={400} y={1600} scale={5.0} pose={P.handsHead} expr="shock" mouth="open" sweat look={[1, -0.8]} rim="rgba(255,220,180,1)" />
        </g>
        {[[600, 440], [640, 520]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} q -16 26 0 40 q 16 -14 0 -40 Z`} fill="#7fd4ff" stroke="#fff" strokeWidth={4} />)}
        <text x={640} y={400} fontSize={110} fontWeight={700} fill="#fff" stroke="#120800" strokeWidth={14} paintOrder="stroke" fontFamily={FONT_HEAD}>!!</text>
        {/* doubt bubble */}
        <g transform="translate(360 170) rotate(-6) scale(0.9)">
          <rect x={-230} y={-80} width={460} height={160} rx={44} fill="#fff" stroke="#120800" strokeWidth={10} />
          <path d="M 40 74 L 110 150 L -10 76 Z" fill="#fff" stroke="#120800" strokeWidth={10} strokeLinejoin="round" />
          <rect x={-10} y={64} width={60} height={20} fill="#fff" />
          <text x={0} y={30} textAnchor="middle" fontSize={88} fontWeight={700} fill="#ff2a3d" fontFamily={FONT_HEAD}>YOU CAN'T</text>
        </g>
        {/* numbers */}
        <Neon x={880} y={150} text="6,000 kg" col="#3dffa0" rot={-4} />
        <Neon x={860} y={330} text="45 kg" col="#ff2a3d" strike rot={3} />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vig4)" />
        <Headline text={v === 'A' ? 'DOUBT ME.' : 'TOO STRONG?'} accent={v === 'A' ? '#ffffff' : '#7dffc4'} x={v === 'A' ? 600 : 640} y={1010} size={v === 'A' ? 180 : 150} />
      </svg>
    </AbsoluteFill>
  );
};
