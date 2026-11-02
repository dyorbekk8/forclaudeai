import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Character, P, walkPose } from './lib/Character';
import { C } from './lib/theme';
import { useT } from './lib/anim';
export const Test: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#f3d9b5,#e9b98a)' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <rect x={0} y={760} width={1920} height={320} fill="#b98a62" />
        <Character t={t} x={180} y={800} scale={2} hair="eli" age={15} expr="neutral" pose={P.stand} />
        <Character t={t} x={420} y={800} scale={2} hair="eli" age={19} expr="shock" mouth="open" pose={P.handsHead} />
        <Character t={t} x={660} y={800} scale={2} hair="eli" age={30} expr="worried" sweat pose={P.shrug} />
        <Character t={t} x={900} y={800} scale={2} hair="eli" age={41} expr="sad" tears={0.8} pose={P.hunch} />
        <Character t={t} x={1130} y={800} scale={2} hair="mom" outfit={C.mom} expr="worried" mouth="frown" pose={P.chin} dress facing={-1} />
        <Character t={t} x={1340} y={800} scale={2} hair="grandpa" outfit={C.grandpa} cardigan glasses expr="soft" mouth="smile" pose={P.sit} cane facing={-1} />
        <Character t={t} x={1560} y={800} scale={2} hair="samcut" outfit={C.sam} expr="smug" mouth="smirk" pose={P.point} facing={-1} />
        <Character t={t} x={1760} y={800} scale={1.4} hair="nora" outfit={C.nora} dress expr="happy" mouth="grin" pose={walkPose(0.2)} facing={-1} blush />
      </svg>
    </AbsoluteFill>
  );
};
