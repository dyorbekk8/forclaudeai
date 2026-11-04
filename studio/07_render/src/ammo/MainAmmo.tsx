import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {prog} from '../lib';
import {C} from '../theme';
import {Hand, Label, Paper} from '../components/ui';
import {BombBands, BurnVsBlast, Chem, Fade, HUD, Hero, Illum, Kinetic, Lineup, Practice, Punch, Smoke, Tiers} from './scenes';

const XF = 5;

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Lineup focus={-1} labels ev={[0, 0, 0, 0, 0, 0, 0, 0]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 120}}>
        <div style={{background: 'rgba(246,245,241,0.95)', padding: '16px 46px', borderRadius: 16, opacity: prog(f, 4, 10)}}>
          <Label size={84}>WHICH STRIPE SURPRISED YOU?</Label>
          <Hand size={56} color={C.red} style={{textAlign: 'center', marginTop: 4}}>
            tell me in the comments ↓
          </Hand>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const M: Record<string, React.FC<any>> = {BombBands, BurnVsBlast, Chem, Fade, Hero, Illum, Kinetic, Lineup, Practice, Punch, Smoke, Tiers, Outro};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.06, mixBlendMode: 'multiply'}}>
        <filter id="pg">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#pg)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 65%, rgba(60,50,30,0.12) 100%)'}} />
    </AbsoluteFill>
  );
};

const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number; seed: number; ev: number[]; kind: string}> = ({children, first, dur, seed, ev, kind}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const inP = first ? 1 : prog(f, 0, XF + 1);
  const mode = kind === 'Lineup' ? 'fade' : seed % 3 === 0 ? 'slide' : 'zoom';
  const dir = seed % 2 ? -1 : 1;
  const inScale = mode === 'zoom' ? 1.12 - 0.12 * inP : 1;
  const inX = mode === 'slide' ? dir * 240 * (1 - inP) : 0;
  const blur = mode === 'fade' ? 0 : 12 * (1 - inP);
  let bump = 0;
  for (const e of ev || []) if (f >= e && f < e + 10) bump = Math.max(bump, 0.02 * (1 - (f - e) / 10));
  const drift = kind === 'Lineup' ? 1 : 1 + 0.035 * t;
  return (
    <AbsoluteFill style={{opacity: inP, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${inX + (kind === 'Lineup' ? 0 : dir * 12 * t)}px) scale(${inScale * drift * (1 + bump)})`}}>
      {children}
    </AbsoluteFill>
  );
};

type S = {id: string; beat: string; scene: string; props: any; from: number; dur: number; step: number};

export const MainAmmo: React.FC<{only?: string}> = ({only}) => {
  const shots = (edl as any).shots as S[];
  const list = only ? shots.filter((s) => s.beat === only) : shots;
  const base = list.length ? list[0].from : 0;
  return (
    <Paper>
      {list.map((s, i) => {
        const Comp = M[s.scene];
        if (!Comp) throw new Error(`no scene ${s.scene}`);
        return (
          <Sequence key={s.id} from={s.from - base} durationInFrames={s.dur + XF} name={`${s.id} ${s.scene}`}>
            <Shot first={i === 0} dur={s.dur + XF} seed={i} ev={s.props.ev || []} kind={s.scene}>
              <Paper>
                <Comp {...s.props} />
              </Paper>
            </Shot>
          </Sequence>
        );
      })}
      {list.map((s) => (
        <Sequence key={`hud-${s.id}`} from={s.from - base} durationInFrames={s.dur} layout="none">
          <HUD step={s.step} />
        </Sequence>
      ))}
      <Grain />
    </Paper>
  );
};
