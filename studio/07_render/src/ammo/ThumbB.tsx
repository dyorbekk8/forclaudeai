import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {Bomb} from './assets';
import {Jersey} from '../ThumbCarrier';

const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; bg?: string}> = ({children, size, color = C.ink, bg}) => (
  <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: size, lineHeight: 0.95, color, background: bg, padding: bg ? '4px 22px' : 0, borderRadius: 10, display: 'inline-block'}}>{children}</div>
);

/** Ammo B: one huge bomb, two yellow stripes circled — "why two?" curiosity. */
export const ThumbAmmoB = () => (
  <AbsoluteFill style={{background: '#F6F5F1', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -140, top: 250, transform: 'rotate(-14deg)'}}>
      <Bomb bands={[{c: '#F2C21B', x: 600, w: 34}, {c: '#F2C21B', x: 650, w: 34}]} width={1500} uid="tb" />
    </div>
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      <ellipse cx={1045} cy={318} rx={135} ry={150} fill="none" stroke={C.red} strokeWidth={14} transform="rotate(-14 1045 318)" />
    </svg>
    <div style={{position: 'absolute', left: 60, top: 40}}>
      <Txt size={150}>2 STRIPES?</Txt>
    </div>
    <div style={{position: 'absolute', left: 60, bottom: 50}}>
      <Txt size={92} color="#fff" bg={C.red}>THIS ONE IS REAL</Txt>
    </div>
  </AbsoluteFill>
);

/** Carrier B: one huge purple jersey — "why grapes?" */
export const ThumbCarrierB = () => (
  <AbsoluteFill style={{background: '#F6F5F1', overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: 40, top: 30}}>
      <Jersey color="#7B3FB8" size={600} />
    </div>
    <div style={{position: 'absolute', left: 60, top: 120}}>
      <Txt size={160}>WHY</Txt>
      <div style={{height: 10}} />
      <Txt size={160} color="#fff" bg="#7B3FB8">"GRAPES"?</Txt>
    </div>
    <div style={{position: 'absolute', left: 60, bottom: 70, display: 'flex', gap: 18}}>
      {['#F2C21B', '#2E9E4F', '#D7262E', '#2F6FD1', '#7A4A24', '#FFFFFF'].map((c) => (
        <div key={c} style={{width: 62, height: 62, borderRadius: 12, background: c, border: '4px solid #16161A'}} />
      ))}
    </div>
  </AbsoluteFill>
);
