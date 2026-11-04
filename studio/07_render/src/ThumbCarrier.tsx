import {AbsoluteFill} from 'remotion';
import {C, fonts} from './theme';
import {RedStamp} from './components/ui';

/** Flight-deck jersey + flotation vest + cranial, front view. viewBox 200x220. */
const Jersey: React.FC<{color: string; size: number; dark?: boolean}> = ({color, size, dark}) => {
  const shade = dark ? '#00000055' : '#00000033';
  return (
    <svg viewBox="0 0 200 230" width={size} height={size * 1.15}>
      <defs>
        <filter id="jsh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#jsh)">
        {/* cranial helmet */}
        <path d="M 72 40 Q 72 6 100 6 Q 128 6 128 40 L 128 50 L 72 50 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        <rect x="80" y="30" width="40" height="13" rx="5" fill="#1B1B1F" />
        <rect x="66" y="34" width="10" height="20" rx="4" fill="#1B1B1F" />
        <rect x="124" y="34" width="10" height="20" rx="4" fill="#1B1B1F" />
        {/* sleeves */}
        <path d="M 52 68 L 14 160 L 34 168 L 66 100 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        <path d="M 148 68 L 186 160 L 166 168 L 134 100 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        {/* body */}
        <path d="M 52 66 Q 100 52 148 66 L 152 222 Q 100 230 48 222 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        {/* flotation vest */}
        <path d="M 60 70 L 90 64 L 92 210 L 58 206 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        <path d="M 140 70 L 110 64 L 108 210 L 142 206 Z" fill={color} stroke="#1B1B1F" strokeWidth="3" />
        <path d="M 60 70 L 90 64 L 92 210 L 58 206 Z M 140 70 L 110 64 L 108 210 L 142 206 Z" fill={shade} />
        {/* reflective tape */}
        {[120, 160].map((y) => (
          <g key={y}>
            <rect x="59" y={y} width="32" height="9" fill="#E8EBEE" />
            <rect x="109" y={y} width="32" height="9" fill="#E8EBEE" />
          </g>
        ))}
        <rect x="18" y="140" width="22" height="8" transform="rotate(22 29 144)" fill="#E8EBEE" />
        <rect x="160" y="140" width="22" height="8" transform="rotate(-22 171 144)" fill="#E8EBEE" />
      </g>
    </svg>
  );
};

const tiles = [
  {c: '#F2C61F', l: 'YELLOW'},
  {c: '#2E9E4F', l: 'GREEN'},
  {c: '#D9262B', l: 'RED'},
  {c: '#2F6FD6', l: 'BLUE'},
  {c: '#7A5230', l: 'BROWN'},
  {c: '#F4F4F2', l: 'WHITE'},
];

export const ThumbCarrier = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', left: 22, top: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 268px)', gridTemplateRows: 'repeat(2, 330px)', gap: 12}}>
      {tiles.map((t) => (
        <div key={t.l} style={{background: `radial-gradient(circle at 50% 42%, ${t.c === '#F4F4F2' ? '#C9CDD2' : t.c}40 0%, #F6F5F1 65%)`, border: `2px solid ${C.tileBorder}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
          <Jersey color={t.c} size={226} />
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 52, color: C.ink, lineHeight: 1, marginTop: -6}}>{t.l}</div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', right: 22, top: 22, width: 420, height: 676, border: `9px solid ${C.red}`, borderRadius: 14, background: 'radial-gradient(circle at 50% 38%, #7A3FB855 0%, #ffffff 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30}}>
      <Jersey color="#7A3FB8" size={330} dark />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 92, color: C.ink, lineHeight: 1, marginTop: -10}}>PURPLE</div>
      <div style={{position: 'absolute', bottom: 34}}>
        <RedStamp text={'"GRAPES"'} f={30} delay={0} size={82} rotate={-8} />
      </div>
    </div>
  </AbsoluteFill>
);
