import React from 'react';
import { AbsoluteFill } from 'remotion';
import { P } from './lib/Character';
import { GlobalDefs } from './lib/ui';
import { FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';
import { Gym, Driveway, Car } from './sets/Sets2';
import { Theo } from './shots/cast';

const NeonTag: React.FC<{ x: number; y: number; text: string; col: string; ax: number; ay: number }> = ({ x, y, text, col, ax, ay }) => {
  const w = text.length * 52 + 80;
  return (
    <g>
      <path d={`M ${x} ${y + 64} Q ${(x + ax) / 2 + 40} ${(y + ay) / 2} ${ax} ${ay}`} stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" filter="url(#glowF)" />
      <path d={`M ${x} ${y + 64} Q ${(x + ax) / 2 + 40} ${(y + ay) / 2} ${ax} ${ay}`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-64} width={w} height={128} rx={30} fill={col} opacity={0.55} filter="url(#glowF)" />
        <rect x={-w / 2} y={-64} width={w} height={128} rx={30} fill="#0c0f16" stroke={col} strokeWidth={9} />
        <text x={0} y={30} textAnchor="middle" fontSize={88} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{text}</text>
      </g>
    </g>
  );
};

export const Thumb2: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.4;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <GlobalDefs />
        <defs>
          <clipPath id="L"><path d="M 0 0 L 900 0 L 790 1080 L 0 1080 Z" /></clipPath>
          <clipPath id="R"><path d="M 900 0 L 1920 0 L 1920 1080 L 790 1080 Z" /></clipPath>
          <radialGradient id="aura" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4dffb0" stopOpacity="0.6" /><stop offset="1" stopColor="#4dffb0" stopOpacity="0" /></radialGradient>
          <radialGradient id="v3" cx="0.5" cy="0.5" r="0.72"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
          <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.75" /></linearGradient>
        </defs>
        <g clipPath="url(#L)">
          <g filter="url(#dofStrong)" transform="translate(-200 -60) scale(1.15)"><Gym t={t} bar={false} /></g>
          <rect x={0} y={0} width={1920} height={1080} fill="#1a2140" opacity={0.35} />
          {[[150, 250, -8], [620, 300, 6], [120, 560, 4], [640, 470, -5]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-150} y={-52} width={300} height={104} rx={30} fill="#fff" stroke="#111" strokeWidth={5} /><text x={0} y={22} textAnchor="middle" fontSize={56} fontWeight={700} fill="#e5483d" fontFamily={FONT_HEAD}>YOU CAN'T</text></g>
          ))}
          <Theo t={t} x={420} y={1500} scale={4.6} pose={P.hunch} expr="worried" mouth="frown" sweat look={[0.4, -0.6]} rim="rgba(160,190,255,0.9)" />
        </g>
        <g clipPath="url(#R)">
          <g filter="url(#dofStrong)" transform="translate(-100 -40) scale(1.1)"><Driveway t={t} /></g>
          <rect x={0} y={0} width={1920} height={1080} fill="#ff9e3a" opacity={0.12} />
          <circle cx={1400} cy={640} r={520} fill="url(#aura)" />
          <Car x={1400} y={905} lift={255} rot={-3} col="#5b7fb0" s={1.15} />
          <Theo t={t} x={1400} y={1420} scale={4.4} pose={P.armsUp} expr="smug" mouth="grin" look={[0, -1]} rim="rgba(77,255,176,1)" />
        </g>
        <path d="M 900 0 L 790 1080" stroke="#fff" strokeWidth={16} />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#v3)" />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bf)" />
        <NeonTag x={420} y={110} text="45 kg" col="#ff4d6a" ax={430} ay={330} />
        <NeonTag x={1640} y={150} text="6,000 kg" col="#4dffb0" ax={1560} ay={400} />
        <g transform="translate(960 975) rotate(-2)">
          <text x={0} y={36} textAnchor="middle" fontSize={190} fontWeight={700} fontFamily={FONT_HEAD} stroke="#0c0f16" strokeWidth={32} paintOrder="stroke" strokeLinejoin="round" fill="#fff">
            {v === 'A' ? <>DOUBT <tspan fill="#ffd25a">ME.</tspan></> : <>TOO <tspan fill="#4dffb0">STRONG?</tspan></>}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
