import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {Plane} from './assets';

export const ThumbAircraft = () => (
  <AbsoluteFill style={{background: '#F6F5F1', overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: -60, top: -10}}>
      <Plane kind="fighter" size={760} rotate={-62} />
    </div>
    <div style={{position: 'absolute', left: 60, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <div style={{position: 'relative', display: 'inline-block'}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 250, lineHeight: 1, color: C.ink}}>F-35</div>
        <div style={{position: 'absolute', left: -10, top: '50%', height: 22, width: '108%', background: C.red, transform: 'rotate(-8deg)', borderRadius: 11}} />
      </div>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 230, lineHeight: 1, color: '#fff', background: C.red, padding: '0 24px', borderRadius: 14, display: 'inline-block', marginTop: 20}}>F-24?</div>
    </div>
  </AbsoluteFill>
);
