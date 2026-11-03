import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {RedStamp} from '../components/ui';
import {Plate, Vest} from './assets';

const tiles = [
  {l: 'IIA', v: 0},
  {l: 'II', v: 1},
  {l: 'IIIA', v: 2},
  {l: 'III', p: 'steel'},
  {l: 'IV', p: 'ceramic'},
] as const;

export const ThumbArmor = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', left: 24, bottom: 24, display: 'flex', alignItems: 'flex-end', gap: 12}}>
      {tiles.map((t, i) => (
        <div
          key={t.l}
          style={{
            width: 146,
            height: 300 + i * 72,
            background: '#F6F5F1',
            border: `2px solid ${C.tileBorder}`,
            borderTop: `8px solid ${C.ink}`,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 22,
          }}
        >
          {'v' in t ? <Vest size={130} shade={t.v} /> : <Plate size={118} material={t.p} />}
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 52, color: C.ink, marginTop: 12}}>{t.l}</div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', right: 24, top: 24, width: 400, height: 672, border: `7px solid ${C.red}`, borderRadius: 12, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40}}>
      <Plate size={210} material="pe" />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 100, color: C.ink, marginTop: 6}}>LEVEL III+</div>
      <div style={{position: 'absolute', bottom: 34}}>
        <RedStamp text={"DOESN'T\nEXIST"} f={30} delay={0} size={76} rotate={-8} />
      </div>
    </div>
  </AbsoluteFill>
);
