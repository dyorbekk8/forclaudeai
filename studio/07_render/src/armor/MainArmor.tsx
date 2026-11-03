import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {prog} from '../lib';
import {C} from '../theme';
import {Hand, Label, Paper} from '../components/ui';
import {ArmorCard, BulletTest, Clay, Davis, HUD, Ladder, Materials, NotExist, Rename, RenameTable, SixShots, SpeedBars, TextSlide} from './scenes';

const XF = 4;

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Ladder focus={-1} outro />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 170}}>
        <div style={{background: 'rgba(246,245,241,0.92)', padding: '24px 50px', borderRadius: 16, opacity: prog(f, 4, 10)}}>
          <Label size={90}>WHICH LEVEL WOULD YOU TRUST?</Label>
          <Hand size={60} color={C.red} style={{textAlign: 'center', marginTop: 8}}>
            tell me in the comments ↓
          </Hand>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const render = (scene: string, p: any): React.ReactNode => {
  switch (scene) {
    case 'Ladder':
      return <Ladder {...p} />;
    case 'TextSlide':
      return <TextSlide {...p} />;
    case 'ArmorCard':
      return <ArmorCard {...p} />;
    case 'BulletTest':
      return <BulletTest {...p} />;
    case 'SpeedBars':
      return <SpeedBars {...p} />;
    case 'Rename':
      return <Rename {...p} />;
    case 'Davis':
      return <Davis {...p} />;
    case 'Clay':
      return <Clay {...p} />;
    case 'Materials':
      return <Materials {...p} />;
    case 'SixShots':
      return <SixShots />;
    case 'NotExist':
      return <NotExist {...p} />;
    case 'RenameTable':
      return <RenameTable {...p} />;
    case 'Outro':
      return <Outro />;
    default:
      throw new Error(`no scene ${scene}`);
  }
};

const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number; seed: number}> = ({children, first, dur, seed}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const s = 1 + 0.03 * t;
  const x = (seed % 2 ? -1 : 1) * 10 * t;
  const punch = first ? 1 : 1 + 0.04 * (1 - prog(f, 0, 6));
  return <AbsoluteFill style={{opacity: first ? 1 : prog(f, 0, XF), transform: `translateX(${x}px) scale(${s * punch})`}}>{children}</AbsoluteFill>;
};

type S = {id: string; beat: string; scene: string; props: any; from: number; dur: number; step: number};

export const MainArmor: React.FC<{only?: string}> = ({only}) => {
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
