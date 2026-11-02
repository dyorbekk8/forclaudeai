import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Kitchen, Hallway, Classroom, Dining, CareRoom, DataBG, Bathroom, BusDoor, Stairs, DMV, Ballroom, Armchair, Desk } from './sets/Sets';
import { Character, P } from './lib/Character';
import { C } from './lib/theme';
import { useT } from './lib/anim';
import { useFonts } from './lib/Fonts';
import { Grain, Vignette } from './lib/ui';
const SETS: Record<string, React.FC<any>> = { Kitchen, Hallway, Classroom, Dining, CareRoom, DataBG, Bathroom, BusDoor, Stairs, DMV, Ballroom };
export const SetTest: React.FC<{ which: string; v?: string }> = ({ which, v }) => {
  useFonts();
  const t = useT();
  const S = SETS[which];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <S t={t} v={v} jar="full" food="meatloaf" glass arch />
        {which === 'CareRoom' && <><Armchair x={760} /><Character t={t} x={700} y={812} scale={2.3} hair="grandpa" outfit={C.grandpa} cardigan glasses pose={P.sit} expr="soft" mouth="smile" /></>}
        {which === 'Kitchen' && <Character t={t} x={1350} y={830} scale={2.5} hair="eli" pose={P.stand} />}
        {which === 'Hallway' && <Character t={t} x={900} y={830} scale={2.6} hair="samcut" outfit={C.sam} pose={P.stand} facing={-1} expr="smug" mouth="smirk" />}
      </svg>
      <Vignette /><Grain />
    </AbsoluteFill>
  );
};
