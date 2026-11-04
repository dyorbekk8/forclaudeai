import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {RedStamp} from '../components/ui';


const Bldg: React.FC<{k: string}> = ({k}) => (
  <svg width={180} height={170} viewBox="0 0 180 170">
    <rect x="0" y="150" width="180" height="20" fill="#D8D2C2" />
    {k === 'camp' && <><rect x="14" y="104" width="8" height="46" fill="#7A5A3A" /><circle cx="18" cy="96" r="22" fill="#6E9E4F" /></>}
    <rect x="50" y="88" width="80" height="62" fill="#C9C3B5" stroke="#6B675E" strokeWidth="3" />
    {[0, 1, 2].map((i) => <rect key={i} x={60 + i * 24} y="102" width={k === 'camp' || k === 'low' ? 14 : 5} height={k === 'camp' || k === 'low' ? 16 : 30} fill="#3F454D" />)}
    {k !== 'camp' && [10, 26].map((x) => (
      <g key={x}>
        <rect x={x} y={k === 'low' ? 96 : 84} width={180 - 2 * x} height={k === 'low' ? 54 : 66} fill="none" stroke="#5A6068" strokeWidth="4" strokeDasharray="0" />
        <line x1={x} x2={180 - x} y1={k === 'low' ? 96 : 84} y2={k === 'low' ? 96 : 84} stroke="#5A6068" strokeWidth="5" />
        {Array.from({length: 7}).map((_, i) => <circle key={i} cx={x + 10 + i * ((160 - 2 * x) / 6)} cy={k === 'low' ? 88 : 76} r="7" fill="none" stroke="#7D838B" strokeWidth="2.5" />)}
      </g>
    ))}
    {(k === 'medium' || k === 'high') && [30, 70, 110, 150].map((x) => <circle key={x} cx={x} cy="140" r="6" fill="#D7262E" />)}
    {k === 'high' && <><rect x="0" y="40" width="22" height="110" fill="#A7A39A" stroke="#6B675E" strokeWidth="3" /><rect x="158" y="40" width="22" height="110" fill="#A7A39A" stroke="#6B675E" strokeWidth="3" /><rect x="-6" y="16" width="34" height="28" fill="#6B675E" /><rect x="152" y="16" width="34" height="28" fill="#6B675E" /><rect x="0" y="22" width="22" height="10" fill="#C7DCEB" /><rect x="158" y="22" width="22" height="10" fill="#C7DCEB" /></>}
  </svg>
);

const levels = [
  {l: 'MIN', k: 'camp', c: '#5E9E45'},
  {l: 'LOW', k: 'low', c: '#E3B23C'},
  {l: 'MED', k: 'medium', c: '#E07A2E'},
  {l: 'HIGH', k: 'high', c: '#D7262E'},
];

export const ThumbPrison = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', left: 20, bottom: 20, display: 'flex', alignItems: 'flex-end', gap: 10}}>
      {levels.map((t, i) => (
        <div key={t.l} style={{width: 192, height: 330 + i * 100, background: '#F2F0EA', borderRadius: 10, borderTop: `14px solid ${t.c}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26, overflow: 'hidden'}}>
          <Bldg k={t.k} />
          <div style={{marginTop: 4, background: t.c, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 64, padding: '2px 18px', borderRadius: 8}}>{t.l}</div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', right: 20, top: 20, width: 440, height: 680, borderRadius: 14, border: `10px solid ${C.red}`, background: '#2B2F36', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 34}}>
      <svg width={330} height={229} viewBox="0 0 360 250">
        <rect x="10" y="10" width="340" height="210" fill="#6B675E" />
        <rect x="26" y="26" width="308" height="178" fill="#CFCAC0" />
        <rect x="40" y="40" width="140" height="56" rx="6" fill="#A9A59B" stroke="#6B675E" strokeWidth="4" />
        <rect x="210" y="40" width="96" height="40" rx="4" fill="#A9A59B" stroke="#6B675E" strokeWidth="4" />
        <rect x="276" y="140" width="46" height="50" rx="6" fill="#BFC5CB" stroke="#6B675E" strokeWidth="4" />
        <rect x="172" y="10" width="12" height="16" fill="#9FD3F2" />
      </svg>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 140, color: '#fff', lineHeight: 1, marginTop: 6}}>ADX</div>
      <div style={{position: 'absolute', bottom: 30, background: '#fff', borderRadius: 12, padding: '6px 10px'}}>
        <RedStamp text={'23 HOURS\nALONE'} f={30} delay={0} size={70} rotate={-6} />
      </div>
    </div>
  </AbsoluteFill>
);
