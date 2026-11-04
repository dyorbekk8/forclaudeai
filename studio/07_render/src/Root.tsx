import {Composition} from 'remotion';
import {Smoke} from './Smoke';
import {Gallery} from './Gallery';
import {Main} from './Main';
import edl from './edl.json';
import {Thumb} from './Thumb';
import {ThumbCarrier} from './ThumbCarrier';
import {MainArmor} from './armor/MainArmor';
import armorEdl from './armor/edl.json';
import {ThumbArmor, ThumbArmorB, ThumbArmorC} from './armor/ThumbArmor';

export const Root = () => (
  <>
    <Composition id="Smoke" component={Smoke} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="Gallery" component={Gallery} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ThumbCarrier" component={ThumbCarrier} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="Main" component={Main} durationInFrames={edl.total} fps={30} width={1920} height={1080} />
    <Composition id="ThumbArmor" component={ThumbArmor} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ThumbArmorB" component={ThumbArmorB} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ThumbArmorC" component={ThumbArmorC} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="Armor" component={MainArmor} durationInFrames={armorEdl.total} fps={30} width={1920} height={1080} />
    {armorEdl.beats.map((b) => (
      <Composition key={`a-${b.id}`} id={`armor-${b.id}`} component={MainArmor} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
    {edl.beats.map((b) => (
      <Composition key={b.id} id={`beat-${b.id}`} component={Main} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
  </>
);
