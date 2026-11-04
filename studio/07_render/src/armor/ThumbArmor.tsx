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

/** B: dark, fewer & bigger objects, high contrast. */
export const ThumbArmorB = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 35% 40%, #2C3138 0%, #111316 70%)'}}>
    <div style={{position: 'absolute', left: 30, bottom: 30, display: 'flex', alignItems: 'flex-end', gap: 16}}>
      {[
        {l: 'II', v: 1},
        {l: 'IIIA', v: 2},
        {l: 'III', p: 'steel'},
        {l: 'IV', p: 'ceramic'},
      ].map((t: any, i) => (
        <div key={t.l} style={{width: 186, height: 360 + i * 80, background: '#C9CDD2', borderTop: '8px solid #F3EFE2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20}}>
          {'v' in t ? <Vest size={168} shade={t.v} /> : <Plate size={150} material={t.p} />}
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 74, color: '#fff', marginTop: 8}}>{t.l}</div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', right: 26, top: 26, width: 410, height: 668, border: `9px solid ${C.red}`, borderRadius: 14, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 34, boxShadow: '0 0 60px rgba(215,38,46,0.55)'}}>
      <Plate size={200} material="pe" />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 118, color: C.ink, lineHeight: 1}}>III+</div>
      <div style={{position: 'absolute', bottom: 40}}>
        <RedStamp text={'NOT\nOFFICIAL'} f={30} delay={0} size={84} rotate={-8} />
      </div>
    </div>
  </AbsoluteFill>
);

const Check = ({ok}: {ok: boolean}) => (
  <svg width={90} height={90} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill={ok ? '#2E9E4F' : C.red} />
    {ok ? <path d="M 10 21 L 17 28 L 30 13" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M 12 12 L 28 28 M 28 12 L 12 28" stroke="#fff" strokeWidth="5" strokeLinecap="round" />}
  </svg>
);

/** C: action read — what each level stops. */
export const ThumbArmorC = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    {[
      {l: 'IIIA', sub: 'PISTOL', ok: true, v: 2},
      {l: 'IIIA', sub: 'RIFLE', ok: false, v: 2},
      {l: 'IV', sub: 'AP RIFLE', ok: true, p: 'ceramic'},
    ].map((t: any, i) => (
      <div key={i} style={{position: 'absolute', left: 26 + i * 272, top: 26, width: 258, height: 668, background: '#F2F0EA', borderRadius: 12, border: `3px solid ${C.tileBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30}}>
        {'v' in t ? <Vest size={210} shade={t.v} /> : <Plate size={190} material={t.p} />}
        <div style={{marginTop: 18}}>
          <Check ok={t.ok} />
        </div>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 84, color: C.ink, lineHeight: 1, marginTop: 10}}>{t.l}</div>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 46, color: t.ok ? '#2E7D4F' : C.red}}>{t.sub}</div>
      </div>
    ))}
    <div style={{position: 'absolute', right: 26, top: 26, width: 400, height: 668, border: `9px solid ${C.red}`, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36}}>
      <Plate size={200} material="pe" />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 116, color: C.ink, lineHeight: 1}}>III+</div>
      <div style={{position: 'absolute', bottom: 40}}>
        <RedStamp text={'NOT\nOFFICIAL'} f={30} delay={0} size={84} rotate={-8} />
      </div>
    </div>
  </AbsoluteFill>
);
