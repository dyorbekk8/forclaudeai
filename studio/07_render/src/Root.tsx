import {Composition} from 'remotion';
import {Smoke} from './Smoke';
export const Root = () => (
  <Composition id="Smoke" component={Smoke} durationInFrames={60} fps={30} width={1920} height={1080} />
);
