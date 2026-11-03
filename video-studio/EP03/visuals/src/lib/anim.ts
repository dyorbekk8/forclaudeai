import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import timeline from '../data/timeline.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

type Line = { id: string; speaker: string; text: string; start: number; end: number };
const LINES: Record<string, Line> = Object.fromEntries((timeline.lines as Line[]).map((l) => [l.id, l]));
export const TOTAL_SECONDS: number = timeline.duration;

/** start time (s) of a VO line */
export const S = (id: string) => {
  const l = LINES[id];
  if (!l) throw new Error('unknown line ' + id);
  return l.start;
};
/** end time (s) of a VO line */
export const E = (id: string) => {
  const l = LINES[id];
  if (!l) throw new Error('unknown line ' + id);
  return l.end;
};

/** seconds since the start of the current Sequence */
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

export const ease = {
  io: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  lin: (x: number) => x,
};

/** clamp-interpolate t from [a,b] to [from,to] with easing */
export const tw = (t: number, a: number, b: number, from: number, to: number, e: (x: number) => number = ease.io) =>
  interpolate(t, [a, b], [from, to], { easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** keyframes: [[time, value], ...] eased per segment */
export const kf = (t: number, keys: [number, number][], e: (x: number) => number = ease.io) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return tw(t, t0, t1, v0, v1, e);
  }
  return keys[keys.length - 1][1];
};

/** damped spring pop: 0 -> 1 with a little overshoot, starting at t0 */
export const pop = (t: number, t0: number, dur = 0.45) => {
  const x = (t - t0) / dur;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-6 * x) * Math.cos(9 * x);
};

/** smooth noise (deterministic) */
export const wobble = (t: number, seed = 0, freq = 1) =>
  Math.sin(t * freq * 2.1 + seed) * 0.5 + Math.sin(t * freq * 3.7 + seed * 1.7) * 0.3 + Math.sin(t * freq * 5.3 + seed * 2.3) * 0.2;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
