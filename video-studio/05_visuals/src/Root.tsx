import React from 'react';
import { Composition } from 'remotion';
import { Test } from './Test';
import { SetTest } from './SetTest';
import { Main } from './Main';
import { Thumb } from './Thumb';
import { TOTAL_SECONDS, FPS } from './lib/anim';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main as any} durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="Thumb" component={Thumb as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ v: 'A' }} />
    <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="SetTest" component={SetTest as any} durationInFrames={60} fps={30} width={1920} height={1080} defaultProps={{ which: 'Kitchen' }} />
  </>
);
