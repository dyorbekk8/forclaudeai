import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {easeInOut, prog} from '../lib';
import {C} from '../theme';
import {Hand, Label, Paper} from '../components/ui';
import {Kinetic} from '../ammo/scenes';
import {Breakers, MCode, Code, Cross, HUD, Letters, Morph, SeriesRow, Story, Versus} from './scenes';

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
const M: Record<string, React.FC<any>> = {MCode, Breakers, Code, Cross, Kinetic, Letters, Morph, SeriesRow, Story, Versus, Outro};

/* Flow rules (studied from top channels): one continuous stage, no whole-frame zoom/blur/slide between
   ordinary shots — just a soft dissolve while the paper background, HUD and camera keep moving.
   Only a chapter change gets a "push-through": the outgoing frame drifts toward the viewer while the
   new chapter dissolves in. The camera drift is global (absolute frame), so it never resets per shot. */
const DISSOLVE = 10;
const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number; ev: number[]; chapterIn: boolean; pushOut: boolean}> = ({children, first, dur, ev, chapterIn, pushOut}) => {
  const f = useCurrentFrame();
  const inP = first ? 1 : prog(f, 0, DISSOLVE, easeInOut);
  const inScale = chapterIn ? 1.05 - 0.05 * inP : 1;
  const outP = pushOut ? prog(f, dur - DISSOLVE, DISSOLVE, easeInOut) : 0;
  let bump = 0;
  for (const e of ev || []) if (f >= e && f < e + 12) bump = Math.max(bump, 0.008 * Math.sin(((f - e) / 12) * Math.PI));
  return <AbsoluteFill style={{opacity: inP, transform: `scale(${inScale * (1 + 0.18 * outP) * (1 + bump)})`}}>{children}</AbsoluteFill>;
};

const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const s = 1.015 + 0.012 * Math.sin(f / 210);
  const x = 14 * Math.sin(f / 260);
  const y = 8 * Math.cos(f / 330);
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</AbsoluteFill>;
};

type S = {id: string; beat: string; scene: string; props: any; from: number; dur: number; step: number};
export const MainAircraft: React.FC<{only?: string}> = ({only}) => {
  const shots = (edl as any).shots as S[];
  const list = only ? shots.filter((s) => s.beat === only) : shots;
  const base = list.length ? list[0].from : 0;
  const sec = (b: string) => b[0];
  return (
    <Paper>
      <Camera>
      {list.map((s, i) => {
        const Comp = M[s.scene];
        if (!Comp) throw new Error(`no scene ${s.scene}`);
        const prev = list[i - 1];
        const next = list[i + 1];
        const chapterIn = !!prev && sec(prev.beat) !== sec(s.beat);
        const pushOut = !!next && sec(next.beat) !== sec(s.beat);
        return (
          <Sequence key={s.id} from={s.from - base} durationInFrames={s.dur + DISSOLVE} name={`${s.id} ${s.scene}`}>
            <Shot first={i === 0} dur={s.dur + DISSOLVE} ev={s.props.ev || []} chapterIn={chapterIn} pushOut={pushOut}>
              <Paper>
                <Comp {...s.props} />
              </Paper>
            </Shot>
          </Sequence>
        );
      })}
      </Camera>
      {list.map((s) => (
        <Sequence key={`hud-${s.id}`} from={s.from - base} durationInFrames={s.dur} layout="none">
          <HUD step={s.step} />
        </Sequence>
      ))}
    </Paper>
  );
};
