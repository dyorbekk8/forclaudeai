import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { Thumb2 } from './Thumb2';
import { Thumb3 } from './Thumb3';
import { TOTAL_SECONDS, FPS } from './lib/anim';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main as any} durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="Thumb2" component={Thumb2 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Thumb3" component={Thumb3 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
  </>
);
