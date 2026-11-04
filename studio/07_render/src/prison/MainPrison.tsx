import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {prog} from '../lib';
import {C} from '../theme';
import {Hand, Label, Paper} from '../components/ui';
import {TextSlide} from '../armor/scenes';
import {ADXCell, Florence, HUD, Hours23, HousingScene, Inmates, Ladder, Ninety, NoEscape, PerimeterScene, ScoreForm, ScoreScale, TwoWords, WalkAway} from './scenes';

const XF = 4;

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Ladder focus={-1} outro />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <div style={{background: 'rgba(246,245,241,0.94)', padding: '24px 50px', borderRadius: 16, opacity: prog(f, 4, 10)}}>
          <Label size={90}>HOW MANY POINTS WOULD YOU SCORE?</Label>
          <Hand size={60} color={C.red} style={{textAlign: 'center', marginTop: 8}}>
            tell me in the comments ↓
          </Hand>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const render = (scene: string, p: any): React.ReactNode => {
  const M: Record<string, React.FC<any>> = {Ladder, TextSlide, ScoreForm, ScoreScale, PerimeterScene, HousingScene, WalkAway, TwoWords, ADXCell, Hours23, Inmates, Ninety, Florence, NoEscape, Outro};
  const Comp = M[scene];
  if (!Comp) throw new Error(`no scene ${scene}`);
  return <Comp {...p} />;
};

const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number; seed: number}> = ({children, first, dur, seed}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const punch = first ? 1 : 1 + 0.04 * (1 - prog(f, 0, 6));
  return <AbsoluteFill style={{opacity: first ? 1 : prog(f, 0, XF), transform: `translateX(${(seed % 2 ? -1 : 1) * 10 * t}px) scale(${(1 + 0.03 * t) * punch})`}}>{children}</AbsoluteFill>;
};

type S = {id: string; beat: string; scene: string; props: any; from: number; dur: number; step: number};

export const MainPrison: React.FC<{only?: string}> = ({only}) => {
  const shots = (edl as any).shots as S[];
  const list = only ? shots.filter((s) => s.beat === only) : shots;
  const base = list.length ? list[0].from : 0;
  return (
    <Paper>
      {list.map((s, i) => (
        <Sequence key={s.id} from={s.from - base} durationInFrames={s.dur + XF} name={`${s.id} ${s.scene}`}>
          <Shot first={i === 0} dur={s.dur + XF} seed={i}>
            <Paper>{render(s.scene, s.props)}</Paper>
          </Shot>
        </Sequence>
      ))}
      {list.map((s) => (
        <Sequence key={`hud-${s.id}`} from={s.from - base} durationInFrames={s.dur} layout="none">
          <HUD step={s.step} />
        </Sequence>
      ))}
    </Paper>
  );
};
