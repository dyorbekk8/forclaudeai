import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { Thumb4 } from './Thumb4';
import { Avatar, Banner } from './Brand';
import { TOTAL_SECONDS, FPS } from './lib/anim';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main as any} durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="Thumb4" component={Thumb4 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="Banner" component={Banner} durationInFrames={1} fps={30} width={2048} height={1152} />
  </>
);
