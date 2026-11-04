import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {RedStamp} from '../components/ui';

const NAVY = '#1F2A44';
const rings = [
  {r: 330, l: '60 NM SKY'},
  {r: 270, l: 'SNIPERS'},
  {r: 210, l: 'MOTORCADE'},
  {r: 150, l: 'THE BEAST'},
];

export const ThumbPotus = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <svg width={800} height={720} style={{position: 'absolute', left: 10, top: 0}}>
      {rings.map((g, i) => (
        <circle key={g.l} cx={400} cy={360} r={g.r} fill={i % 2 ? '#F2F0EA' : '#FBE3E4'} stroke={i % 2 ? NAVY : C.red} strokeWidth={10} strokeDasharray={i === 0 ? '30 16' : undefined} />
      ))}
      <circle cx={400} cy={360} r={92} fill={NAVY} />
      <text x={400} y={384} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={72} fill="#fff">
        POTUS
      </text>
      {rings.map((g, i) => (
        <g key={`l${i}`}>
          <rect x={400 - g.l.length * 13} y={360 - g.r - 26} width={g.l.length * 26} height={52} rx={8} fill={i % 2 ? NAVY : C.red} />
          <text x={400} y={360 - g.r + 14} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={42} fill="#fff">
            {g.l}
          </text>
        </g>
      ))}
    </svg>
    <div style={{position: 'absolute', right: 22, top: 22, width: 430, height: 676, border: `10px solid ${C.red}`, borderRadius: 14, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30}}>
      <svg width={330} height={385} viewBox="0 0 120 140">
        <circle cx="86" cy="22" r="11" fill={NAVY} />
        <path d="M 86 34 L 86 84 M 86 50 L 104 72 M 86 50 L 70 72 M 86 84 L 74 130 M 86 84 L 98 130" stroke={NAVY} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="46" cy="22" r="12" fill="none" stroke={C.red} strokeWidth="7" />
        <path d="M 46 35 L 46 86 M 46 50 L 4 38 M 46 50 L 92 38 M 46 86 L 30 132 M 46 86 L 62 132" stroke={C.red} strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
      <div style={{position: 'absolute', bottom: 28}}>
        <RedStamp text={'THE LAST\nLAYER'} f={30} delay={0} size={74} rotate={-6} />
      </div>
    </div>
  </AbsoluteFill>
);
