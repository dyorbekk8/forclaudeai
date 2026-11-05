import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {prog} from '../lib';
import {C} from '../theme';
import {Hand, Label, Paper} from '../components/ui';
import {Kinetic} from '../ammo/scenes';
import {Breakers, Code, Cross, HUD, Letters, Morph, SeriesRow, Story, Versus} from './scenes';

const XF = 5;
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Code code={['', 'M', '', 'Q', '9', 'A']} plane="drone" labels />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <div style={{background: 'rgba(246,245,241,0.95)', padding: '14px 44px', borderRadius: 16, opacity: prog(f, 4, 10)}}>
          <Label size={80}>WHICH NAME SHOULD I DECODE NEXT?</Label>
          <Hand size={54} color={C.red} style={{textAlign: 'center'}}>
            tell me in the comments ↓
          </Hand>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const M: Record<string, React.FC<any>> = {Breakers, Code, Cross, Kinetic, Letters, Morph, SeriesRow, Story, Versus, Outro};

const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number; seed: number; ev: number[]}> = ({children, first, dur, seed, ev}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const inP = first ? 1 : prog(f, 0, XF + 1);
  const mode = seed % 3 === 0 ? 'slide' : 'zoom';
  const dir = seed % 2 ? -1 : 1;
  const inScale = mode === 'zoom' ? 1.12 - 0.12 * inP : 1;
  const inX = mode === 'slide' ? dir * 240 * (1 - inP) : 0;
  const blur = 12 * (1 - inP);
  let bump = 0;
  for (const e of ev || []) if (f >= e && f < e + 10) bump = Math.max(bump, 0.02 * (1 - (f - e) / 10));
  return (
    <AbsoluteFill style={{opacity: inP, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${inX + dir * 12 * t}px) scale(${inScale * (1 + 0.035 * t) * (1 + bump)})`}}>
      {children}
    </AbsoluteFill>
  );
};

type S = {id: string; beat: string; scene: string; props: any; from: number; dur: number; step: number};
export const MainAircraft: React.FC<{only?: string}> = ({only}) => {
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
            <Shot first={i === 0} dur={s.dur + XF} seed={i} ev={s.props.ev || []}>
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
    </Paper>
  );
};
