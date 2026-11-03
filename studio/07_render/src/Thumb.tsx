import {AbsoluteFill} from 'remotion';
import {C, fonts} from './theme';
import {ITEMS} from './lib';
import {RedStamp, Spray} from './components/ui';
import {Sprinkler} from './components/Sprinkler';

const M = 26;
const G = 14;
const AW = 400;
const gridW = 1280 - 2 * M - AW - 20;
const TW = (gridW - 3 * G) / 4;
const TH = (720 - 2 * M - G) / 2;

const T: React.FC<{i: number}> = ({i}) => {
  const it = ITEMS[i];
  return (
    <div style={{width: TW, height: TH, background: `radial-gradient(circle at 50% 40%, ${it.key === 'black' ? '#55555E' : it.color}38 0%, #ffffff 62%)`, border: `2px solid ${C.tileBorder}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Sprinkler bulb={{liquid: it.color}} size={TW * 0.78} bulbWidth={30} />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: -4}}>{it.label}</div>
    </div>
  );
};

export const Thumb = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', left: M, top: M, display: 'grid', gridTemplateColumns: `repeat(4, ${TW}px)`, gap: G}}>
      {[0, 1, 2, 3].map((i) => (
        <T key={i} i={i} />
      ))}
    </div>
    <div style={{position: 'absolute', left: M + (TW + G) / 2, top: M + TH + G, display: 'grid', gridTemplateColumns: `repeat(3, ${TW}px)`, gap: G}}>
      {[4, 5, 6].map((i) => (
        <T key={i} i={i} />
      ))}
    </div>
    <div style={{position: 'absolute', right: M, top: M, width: AW, height: 720 - 2 * M, background: '#fff', border: `6px solid ${C.red}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <svg width={AW} height={720} style={{position: 'absolute', top: 0, left: 0}}>
        <Spray t={40} cx={AW / 2 - 6} cy={20 + 244 * 1.15} scale={1.5} seed="thumb" intensity={1.3} />
      </svg>
      <div style={{position: 'absolute', top: 20}}>
        <Sprinkler bulb={{liquid: '#D9262B'}} broken size={230} />
      </div>
      <div style={{position: 'absolute', bottom: 46}}>
        <RedStamp text={'ONLY ONE\nOPENS'} f={30} delay={0} size={74} rotate={-10} />
      </div>
    </div>
  </AbsoluteFill>
);
