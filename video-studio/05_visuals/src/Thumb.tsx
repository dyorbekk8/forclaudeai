import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Character, P } from './lib/Character';
import { C, FONT_HEAD } from './lib/theme';
import { useFonts } from './lib/Fonts';

const TagArrow: React.FC<{ x: number; y: number; text: string; col: string }> = ({ x, y, text, col }) => {
  const w = text.length * 52 + 70;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={26} fill="#0d0f18" stroke={col} strokeWidth={8} />
      <path d="M -26 60 L 0 96 L 26 60 Z" fill={col} />
      <text x={0} y={30} textAnchor="middle" fontSize={88} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{text}</text>
    </g>
  );
};

/** YouTube thumbnail (render at 1920x1080, export 1280x720). variant A / B for testing */
export const Thumb: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.3;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <radialGradient id="tl" cx="0.3" cy="0.45" r="0.7"><stop offset="0" stopColor="#7ff0e0" /><stop offset="1" stopColor="#1b6f8a" /></radialGradient>
          <radialGradient id="tr" cx="0.7" cy="0.45" r="0.7"><stop offset="0" stopColor="#ffb07a" /><stop offset="1" stopColor="#9a1f3a" /></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#tl)" />
        <path d="M 1010 0 L 1920 0 L 1920 1080 L 870 1080 Z" fill="url(#tr)" />
        <path d="M 1010 0 L 870 1080" stroke="#fff" strokeWidth={14} />
        {/* rim glows */}
        <circle cx={500} cy={560} r={330} fill="#fff" opacity={0.18} filter="url(#glow)" />
        <circle cx={1440} cy={560} r={360} fill="#ffd25a" opacity={0.18} filter="url(#glow)" />
        {/* BEFORE: 15 */}
        <Character t={t} seed={1} x={470} y={1640} scale={6.5} hair="eli" age={15} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="shock" mouth="o" look={[0.6, -0.2]} rim="rgba(255,255,255,0.95)" />
        {/* AFTER: 41 */}
        <Character t={t} seed={1} x={1440} y={1640} scale={6.7} hair="eli" age={41} facing={-1} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="sad" mouth="frown" look={[0.5, 0.1]} rim="rgba(255,230,160,0.95)" sweat />
        <TagArrow x={470} y={110} text="AGE 15" col={C.mint} />
        <TagArrow x={1440} y={110} text="AGE 41" col={C.gold} />
        {/* arrow between */}
        <path d="M 760 640 Q 940 560 1110 640" stroke="#fff" strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M 1080 590 L 1140 655 L 1060 680 Z" fill="#fff" />
        {/* headline */}
        <g transform="translate(960 950) rotate(-3)">
          <text x={0} y={40} textAnchor="middle" fontSize={v === 'A' ? 190 : 170} fontWeight={700} fontFamily={FONT_HEAD} fill={v === 'A' ? '#fff' : C.gold} stroke="#0d0f18" strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">
            {v === 'A' ? 'ONE LIE.' : '1 LIE = +1 YR'}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** v2 thumbnail — cinematic mirror scene, muted palette (competitor style: Ifverse / Awaken) */
export const ThumbMirror: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.3;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4352" /><stop offset="1" stopColor="#1c212b" /></linearGradient>
          <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#f3c98b" stopOpacity="0.55" /><stop offset="1" stopColor="#f3c98b" stopOpacity="0" /></radialGradient>
          <radialGradient id="mirrorIn" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#8fa6b8" /><stop offset="1" stopColor="#3b4a5a" /></radialGradient>
          <clipPath id="mclip"><ellipse cx="1300" cy="500" rx="360" ry="440" /></clipPath>
          <filter id="soft"><feGaussianBlur stdDeviation="30" /></filter>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#wall)" />
        {[...Array(12)].map((_, i) => <rect key={i} x={i * 170} y={0} width={70} height={1080} fill="#fff" opacity={0.025} />)}
        <circle cx={1750} cy={180} r={520} fill="url(#lamp)" />
        <rect x={0} y={900} width={1920} height={180} fill="#151820" />
        {/* mirror */}
        <ellipse cx={1300} cy={500} rx={392} ry={472} fill="#7a5a3a" />
        <ellipse cx={1300} cy={500} rx={376} ry={456} fill="#5b4129" />
        <ellipse cx={1300} cy={500} rx={360} ry={440} fill="url(#mirrorIn)" />
        <g clipPath="url(#mclip)">
          <Character t={t} seed={1} x={1290} y={1560} scale={5.6} hair="eli" age={41} facing={-1} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="sad" mouth="frown" look={[0.4, 0]} rim="rgba(230,240,255,0.55)" />
          <path d="M 1040 160 L 1180 80 M 1020 260 L 1240 120" stroke="#fff" strokeWidth={22} strokeLinecap="round" opacity={0.12} />
        </g>
        {/* kid Eli in the foreground, looking at the mirror */}
        <Character t={t} seed={1} x={560} y={1640} scale={6.3} hair="eli" age={15} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="shock" mouth="o" look={[1, -0.1]} rim="rgba(243,201,139,0.85)" />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" />
        {/* tags */}
        <g transform="translate(560 120)">
          <rect x={-170} y={-52} width={340} height={104} rx={22} fill="#11141b" stroke="#9fd9c4" strokeWidth={6} />
          <text x={0} y={26} textAnchor="middle" fontSize={72} fontWeight={700} fill="#9fd9c4" fontFamily={FONT_HEAD}>AGE 15</text>
        </g>
        <g transform="translate(1300 120)">
          <rect x={-170} y={-52} width={340} height={104} rx={22} fill="#11141b" stroke="#e8c27a" strokeWidth={6} />
          <text x={0} y={26} textAnchor="middle" fontSize={72} fontWeight={700} fill="#e8c27a" fontFamily={FONT_HEAD}>AGE 41</text>
        </g>
        {/* headline */}
        <g transform="translate(960 975)">
          <text x={0} y={30} textAnchor="middle" fontSize={v === 'A' ? 170 : 150} fontWeight={700} fontFamily={FONT_HEAD} fill="#f6f1e8" stroke="#11141b" strokeWidth={28} paintOrder="stroke" strokeLinejoin="round">
            {v === 'A' ? 'ONE LIE.' : 'ONE LIE = +1 YEAR'}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- v3: competitor formula — split scene, blurred detailed sets, neon tags w/ arrows, big faces ---------- */
import { Kitchen } from './sets/Sets';
const NeonTag: React.FC<{ x: number; y: number; text: string; col: string; ax: number; ay: number }> = ({ x, y, text, col, ax, ay }) => {
  const w = text.length * 56 + 80;
  return (
    <g>
      <path d={`M ${x} ${y + 64} Q ${(x + ax) / 2 + 40} ${(y + ay) / 2} ${ax} ${ay}`} stroke={col} strokeWidth={14} fill="none" strokeLinecap="round" filter="url(#glowS)" />
      <path d={`M ${x} ${y + 64} Q ${(x + ax) / 2 + 40} ${(y + ay) / 2} ${ax} ${ay}`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-64} width={w} height={128} rx={30} fill={col} opacity={0.55} filter="url(#glowL)" />
        <rect x={-w / 2} y={-64} width={w} height={128} rx={30} fill="#0c0f16" stroke={col} strokeWidth={9} />
        <text x={0} y={32} textAnchor="middle" fontSize={92} fontWeight={700} fill={col} fontFamily={FONT_HEAD} filter="url(#glowS)">{text}</text>
        <text x={0} y={32} textAnchor="middle" fontSize={92} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} opacity={0.9}>{text}</text>
      </g>
    </g>
  );
};

export const ThumbPro: React.FC<{ v?: 'A' | 'B' }> = ({ v = 'A' }) => {
  useFonts();
  const t = 0.3;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <filter id="blurBG"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
          <filter id="glowL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000" floodOpacity="0.55" /></filter>
          <clipPath id="leftC"><path d="M 0 0 L 1010 0 L 900 1080 L 0 1080 Z" /></clipPath>
          <clipPath id="rightC"><path d="M 1010 0 L 1920 0 L 1920 1080 L 900 1080 Z" /></clipPath>
          <radialGradient id="warmLight" cx="0.25" cy="0.3" r="0.6"><stop offset="0" stopColor="#ffd49a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd49a" stopOpacity="0" /></radialGradient>
          <radialGradient id="coldLight" cx="0.75" cy="0.35" r="0.6"><stop offset="0" stopColor="#7fb8ff" stopOpacity="0.45" /><stop offset="1" stopColor="#7fb8ff" stopOpacity="0" /></radialGradient>
          <radialGradient id="vig3" cx="0.5" cy="0.5" r="0.72"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
          <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.75" /></linearGradient>
        </defs>
        {/* LEFT: morning kitchen, age 15 */}
        <g clipPath="url(#leftC)">
          <g filter="url(#blurBG)" transform="translate(-260 -40) scale(1.12)"><Kitchen t={t} v="morning" jar="full" /></g>
          <rect x={0} y={0} width={1920} height={1080} fill="url(#warmLight)" />
          <g filter="url(#shadow)">
            <Character t={t} seed={1} x={470} y={1720} scale={6.4} hair="eli" age={15} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="smug" mouth="smirk" look={[0.9, -0.1]} rim="rgba(255,226,170,1)" tilt={-6} />
          </g>
          {/* the lie */}
          <g transform="translate(215 395) rotate(-6)" filter="url(#shadow)">
            <rect x={-150} y={-70} width={300} height={120} rx={36} fill="#fff" />
            <path d="M 60 46 L 110 110 L 20 50 Z" fill="#fff" />
            <text x={0} y={18} textAnchor="middle" fontSize={64} fontWeight={700} fill="#1a1d26" fontFamily={FONT_HEAD}>"Yep."</text>
          </g>
        </g>
        {/* RIGHT: same kitchen at night, age 41 */}
        <g clipPath="url(#rightC)">
          <g filter="url(#blurBG)" transform="translate(-160 -40) scale(1.12)"><Kitchen t={t} v="night" jar="empty" /></g>
          <rect x={0} y={0} width={1920} height={1080} fill="#0b1630" opacity={0.35} />
          <rect x={0} y={0} width={1920} height={1080} fill="url(#coldLight)" />
          <g filter="url(#shadow)">
            <Character t={t} seed={1} x={1450} y={1700} scale={6.6} hair="eli" age={41} facing={-1} pose={{ ...P.stand, rsh: -6, rel: 4, lsh: -12, lel: 4 }} expr="shock" mouth="open" look={[0.6, -0.2]} rim="rgba(170,210,255,1)" sweat />
          </g>
          {/* falling gray hairs */}
          {[[1180, 330, 20], [1700, 260, -30], [1760, 470, 15], [1150, 520, -10]].map(([x, y, r], i) => (
            <path key={i} d={`M ${x} ${y} q 14 -24 0 -48 q -14 -24 4 -46`} stroke="#dfe6ee" strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${r} ${x} ${y})`} opacity={0.85} />
          ))}
        </g>
        {/* divider */}
        <path d="M 1010 0 L 900 1080" stroke="#fff" strokeWidth={16} />
        <path d="M 1010 0 L 900 1080" stroke="#fff" strokeWidth={40} opacity={0.35} filter="url(#glowS)" />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vig3)" />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#bottomFade)" />
        {/* neon tags with arrows to faces */}
        <NeonTag x={560} y={110} text="AGE 15" col="#4dffa6" ax={500} ay={300} />
        <NeonTag x={1430} y={110} text="AGE 41" col="#ff4d6a" ax={1420} ay={290} />
        {/* headline */}
        <g transform="translate(960 968) rotate(-2)">
          <text x={0} y={36} textAnchor="middle" fontSize={180} fontWeight={700} fontFamily={FONT_HEAD} fill="#000" opacity={0.5} filter="url(#glowL)">{v === 'A' ? 'ONE LIE.' : '1 LIE = +1 YEAR'}</text>
          <text x={0} y={36} textAnchor="middle" fontSize={v === 'A' ? 180 : 150} fontWeight={700} fontFamily={FONT_HEAD} stroke="#0c0f16" strokeWidth={30} paintOrder="stroke" strokeLinejoin="round" fill="#ffffff">
            {v === 'A' ? <>ONE <tspan fill="#ffd25a">LIE.</tspan></> : <>1 LIE = <tspan fill="#ffd25a">+1 YEAR</tspan></>}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
