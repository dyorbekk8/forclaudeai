import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './theme';

export const ease = Easing.bezier(0.22, 0.8, 0.24, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.8, 0.2);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 over [start, start+len] frames, eased, clamped. */
export const prog = (f: number, start: number, len: number, e = ease) =>
  interpolate(f, [start, start + len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const pop = (f: number, delay = 0, damping = 13, mass = 0.7) =>
  spring({frame: f - delay, fps: FPS, config: {damping, mass, stiffness: 140}});

/** fade in at start and out at end of a beat */
export const beatFade = (f: number, dur: number, inF = 8, outF = 8) =>
  Math.min(prog(f, 0, inF), 1 - prog(f, dur - outF, outF, easeIn));

export const sec = (s: number) => Math.round(s * FPS);

export type Item = {
  key: string;
  label: string;
  color: string;
  temp: string;
  tempC: string;
  cls: string;
  response?: 'standard' | 'quick';
  fusible?: boolean;
  anchor?: boolean;
};

export const ITEMS: Item[] = [
  {key: 'orange', label: 'ORANGE', color: '#F07A1A', temp: '135°F', tempC: '57°C', cls: 'ORDINARY'},
  {key: 'red', label: 'RED', color: '#D9262B', temp: '155°F', tempC: '68°C', cls: 'ORDINARY'},
  {key: 'yellow', label: 'YELLOW', color: '#F2C61F', temp: '175°F', tempC: '79°C', cls: 'INTERMEDIATE'},
  {key: 'green', label: 'GREEN', color: '#2E9E4F', temp: '200°F', tempC: '93°C', cls: 'INTERMEDIATE'},
  {key: 'blue', label: 'BLUE', color: '#2F6FD6', temp: '286°F', tempC: '141°C', cls: 'HIGH'},
  {key: 'purple', label: 'PURPLE', color: '#7A3FB8', temp: '360°F', tempC: '182°C', cls: 'EXTRA HIGH'},
  {key: 'black', label: 'BLACK', color: '#1B1B1F', temp: '400°F+', tempC: '204°C+', cls: 'VERY EXTRA & ULTRA HIGH'},
  {key: 'thin', label: 'THIN BULB', color: '#D9262B', temp: '3 mm', tempC: 'vs 5 mm', cls: 'QUICK RESPONSE', response: 'quick'},
  {key: 'nobulb', label: 'NO BULB', color: '#9AA0A8', temp: 'SOLDER', tempC: 'melts', cls: 'FUSIBLE LINK', fusible: true},
  {key: 'one', label: 'ONE', color: '#D7262E', temp: '77%', tempC: '', cls: 'THE NUMBER THAT MATTERS', anchor: true},
];

export const itemByKey = (k: string) => {
  const it = ITEMS.find((i) => i.key === k);
  if (!it) throw new Error(`unknown item ${k}`);
  return it;
};
