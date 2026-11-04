import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {RedStamp} from '../components/ui';
import {ITEMS, Shell} from './assets';

const pick = ['yellow', 'brown', 'blue', 'green', 'white', 'black'].map((k) => ITEMS.find((i) => i.key === k)!);
const NAMES: Record<string, string> = {yellow: 'YELLOW', brown: 'BROWN', blue: 'BLUE', green: 'GREEN', white: 'WHITE', black: 'BLACK'};

export const ThumbAmmo = () => (
  <AbsoluteFill style={{background: '#F6F5F1'}}>
    {pick.map((it, i) => {
      const x = 22 + (i % 3) * 280;
      const y = 22 + Math.floor(i / 3) * 342;
      return (
        <div key={it.key} style={{position: 'absolute', left: x, top: y, width: 266, height: 328, background: '#fff', border: '3px solid #DEDCD6', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 42%, ${(it.bands[0]?.c ?? it.body)}40 0%, rgba(255,255,255,0) 62%)`}} />
          <Shell body={it.body} bands={it.bands} size={240} uid={`th${i}`} />
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 62, lineHeight: 1.05, color: C.ink}}>{NAMES[it.key]}</div>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 862, top: 22, width: 396, height: 676, background: '#fff', border: `10px solid ${C.red}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(47,107,58,0.22) 0%, rgba(255,255,255,0) 65%)'}} />
      <Shell body="#8F949B" bands={[{c: '#2F6B3A', broken: true}]} size={340} uid="thg" />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 96, lineHeight: 1, color: C.ink, marginTop: 4}}>GRAY</div>
      <div style={{position: 'absolute', bottom: 22}}>
        <RedStamp text={'NERVE\nAGENT'} f={40} delay={0} size={58} rotate={-6} />
      </div>
    </div>
  </AbsoluteFill>
);
