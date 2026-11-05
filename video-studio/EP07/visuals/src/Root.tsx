import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { Thumb4 } from './Thumb4';
import { Thumb5 } from './Thumb5';
import { Thumb7 } from './Thumb7';
import { Thumb8 } from './Thumb8';
import { Avatar, Banner } from './Brand';
import { TOTAL_SECONDS, FPS } from './lib/anim';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main as any} durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="Thumb4" component={Thumb4 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="Banner" component={Banner} durationInFrames={1} fps={30} width={2048} height={1152} />
    <Composition id="Thumb5" component={Thumb5 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Thumb7" component={Thumb7 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Thumb8" component={Thumb8 as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
  </>
);
