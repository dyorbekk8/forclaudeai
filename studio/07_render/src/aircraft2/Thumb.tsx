import {AbsoluteFill} from 'remotion';
import {fonts} from '../theme';
import {RedStamp} from '../components/ui';
import {Plane, Kind} from '../aircraft/assets';

const T: {l: string; n: string; k: Kind; c: string}[] = [
  {l: 'A', n: 'ATTACK', k: 'a10', c: '#2F6FB5'},
  {l: 'B', n: 'BOMBER', k: 'wing', c: '#B8860B'},
  {l: 'C', n: 'CARGO', k: 'cargo', c: '#2E8B57'},
  {l: 'K', n: 'TANKER', k: 'jumbo', c: '#7D4FB5'},
  {l: 'Q', n: 'DRONE', k: 'drone', c: '#B35A1F'},
  {l: 'V', n: 'VIP', k: 'tilt', c: '#1F7A8C'},
];
export const ThumbAircraftGrid = () => (
  <AbsoluteFill style={{background: '#F3EEE3'}}>
    {T.map((t, i) => (
      <div key={t.l} style={{position: 'absolute', left: 22 + (i % 3) * 280, top: 22 + Math.floor(i / 3) * 342, width: 266, height: 328, background: '#FBF8F2', border: '3px solid #D9D2C3', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 130, lineHeight: 0.9, color: t.c}}>{t.l}</div>
        <Plane kind={t.k} size={120} rotate={-90} color="#3E4550" />
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 52, color: '#1B1B1F'}}>{t.n}</div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 862, top: 22, width: 396, height: 676, background: '#FBF8F2', border: '10px solid #C0392B', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20}}>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 180, lineHeight: 0.9, color: '#C0392B'}}>F</div>
      <Plane kind="fighter" size={200} rotate={-90} color="#2E333B" />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 84, color: '#1B1B1F'}}>FIGHTER</div>
      <div style={{position: 'absolute', bottom: 22}}>
        <RedStamp text={'F-35?\nSHOULD BE F-24'} f={40} delay={0} size={46} rotate={-6} />
      </div>
    </div>
  </AbsoluteFill>
);
