import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {prog} from './lib';
import {C} from './theme';
import {Hand, Paper} from './components/ui';
import {GridIntroTitle, GridScene} from './scenes/Grid';
import {Hero} from './scenes/Hero';
import {BulbMacro, Burst, Gauge} from './scenes/Mechanism';
import {CTA, DeathBars, Hanger, MoneyBars, Patent, Quote, SaveMoney, StatRings, StoryCard} from './scenes/Story';
import {Boil, CeilingRow, ClassTable, Compare, FrameCode, Heater, IconRow, Race, RangeBar, SkylightAttic} from './scenes/Places';
import {itemByKey} from './lib';

const XF = 5;

const GridIntro = () => (
  <>
    <GridScene intro anchor="question" />
    <GridIntroTitle />
  </>
);

const GridOne = () => <GridScene checked={9} anchor="one" />;

const Outro = () => {
  const f = useCurrentFrame();
  return (
    <GridScene
      checked={9}
      anchor="stamp"
      stampAt={20}
      caption={
        <div style={{opacity: prog(f, 30, 12), transform: 'rotate(-1.5deg)'}}>
          <Hand size={70} color={C.ink}>
            ↑ What color is above you right now?
          </Hand>
        </div>
      }
    />
  );
};

const render = (scene: string, p: any): React.ReactNode => {
  switch (scene) {
    case 'StoryCard':
      return <StoryCard {...p} />;
    case 'MoneyBars':
      return <MoneyBars />;
    case 'Quote':
      return <Quote {...p} />;
    case 'GridIntro':
      return <GridIntro />;
    case 'Hero':
      return <Hero idx={p.idx} note={p.note} noteAt={p.noteAt} />;
    case 'BulbMacro':
      return <BulbMacro {...p} item={itemByKey(p.item)} />;
    case 'Burst':
      return <Burst item={itemByKey(p.item)} />;
    case 'Gauge':
      return <Gauge {...p} item={itemByKey(p.item)} />;
    case 'Hanger':
      return <Hanger />;
    case 'SkylightAttic':
      return <SkylightAttic item={p.item} />;
    case 'ClassTable':
      return <ClassTable />;
    case 'Boil':
      return <Boil />;
    case 'Heater':
      return <Heater />;
    case 'CTA':
      return <CTA />;
    case 'FrameCode':
      return <FrameCode />;
    case 'Compare':
      return <Compare {...p} />;
    case 'RangeBar':
      return <RangeBar />;
    case 'IconRow':
      return <IconRow />;
    case 'Race':
      return <Race />;
    case 'Patent':
      return <Patent />;
    case 'SaveMoney':
      return <SaveMoney />;
    case 'GridOne':
      return <GridOne />;
    case 'CeilingRow':
      return <CeilingRow {...p} />;
    case 'StatRings':
      return <StatRings />;
    case 'DeathBars':
      return <DeathBars />;
    case 'Outro':
      return <Outro />;
    default:
      throw new Error(`no scene ${scene}`);
  }
};

/** Cross-fade in + slow camera drift so no shot ever sits still. */
const Fader: React.FC<{children: React.ReactNode; first: boolean; dur: number; seed: number}> = ({children, first, dur, seed}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, dur));
  const dir = seed % 2 === 0 ? 1 : -1;
  const s = 1 + 0.035 * t;
  const x = dir * 14 * t;
  const y = -8 * t;
  return (
    <AbsoluteFill style={{opacity: first ? 1 : prog(f, 0, XF), transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: '50% 50%'}}>
      {children}
    </AbsoluteFill>
  );
};

export const Main: React.FC<{only?: string}> = ({only}) => (
  <Paper>
    {edl.beats
      .filter((b) => !only || b.id === only)
      .map((b, i) => (
        <Sequence key={b.id} from={only ? 0 : b.from} durationInFrames={b.dur + XF} name={`${b.id} ${b.scene}`}>
          <Fader first={i === 0 || !!only} dur={b.dur + XF} seed={i}>
            <Paper>{render(b.scene, b.props)}</Paper>
          </Fader>
        </Sequence>
      ))}
  </Paper>
);
