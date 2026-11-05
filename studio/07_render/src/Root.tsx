import {Composition} from 'remotion';
import {Smoke} from './Smoke';
import {Gallery} from './Gallery';
import {Main} from './Main';
import edl from './edl.json';
import {Thumb} from './Thumb';
import {ThumbCarrier} from './ThumbCarrier';
import {MainPrison} from './prison/MainPrison';
import {MainPotus} from './potus/MainPotus';
import {ThumbPotus} from './potus/ThumbPotus';
import potusEdl from './potus/edl.json';
import {ShortAmmo} from './short/ShortAmmo';
import ammoShorts from './short/ammo_edl.json';
import {ShortPrison} from './short/ShortPrison';
import shortEdl from './short/edl.json';
import {ThumbPrison} from './prison/ThumbPrison';
import prisonEdl from './prison/edl.json';
import {MainAmmo} from './ammo/MainAmmo';
import {MainAircraft} from './aircraft/MainAircraft';
import {ThumbAircraft} from './aircraft/Thumb';
import aircraftEdl from './aircraft/edl.json';
import {ThumbAmmo} from './ammo/ThumbAmmo';
import {ThumbAmmoB, ThumbCarrierB} from './ammo/ThumbB';
import ammoEdl from './ammo/edl.json';
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
    <Composition id="ThumbPrison" component={ThumbPrison} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ShortPrison" component={ShortPrison} durationInFrames={shortEdl.total} fps={30} width={1080} height={1920} />
    <Composition id="ThumbPotus" component={ThumbPotus} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="Potus" component={MainPotus} durationInFrames={potusEdl.total} fps={30} width={1920} height={1080} />
    {potusEdl.beats.map((b) => (
      <Composition key={`u-${b.id}`} id={`potus-${b.id}`} component={MainPotus} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
    {(['s1', 's2', 's3'] as const).map((k) => (
      <Composition key={`as-${k}`} id={`ShortAmmo-${k}`} component={ShortAmmo} defaultProps={{which: k}} durationInFrames={(ammoShorts as any)[k]?.total ?? 30} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="ThumbAmmoB" component={ThumbAmmoB} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ThumbCarrierB" component={ThumbCarrierB} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ThumbAmmo" component={ThumbAmmo} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ThumbAircraft" component={ThumbAircraft} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="Aircraft" component={MainAircraft} durationInFrames={aircraftEdl.total} fps={30} width={1920} height={1080} />
    <Composition id="Ammo" component={MainAmmo} durationInFrames={ammoEdl.total} fps={30} width={1920} height={1080} />
    <Composition id="Prison" component={MainPrison} durationInFrames={prisonEdl.total} fps={30} width={1920} height={1080} />
    {prisonEdl.beats.map((b) => (
      <Composition key={`p-${b.id}`} id={`prison-${b.id}`} component={MainPrison} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
    <Composition id="Armor" component={MainArmor} durationInFrames={armorEdl.total} fps={30} width={1920} height={1080} />
    {armorEdl.beats.map((b) => (
      <Composition key={`a-${b.id}`} id={`armor-${b.id}`} component={MainArmor} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
    {edl.beats.map((b) => (
      <Composition key={b.id} id={`beat-${b.id}`} component={Main} defaultProps={{only: b.id}} durationInFrames={b.dur} fps={30} width={1920} height={1080} />
    ))}
  </>
);
