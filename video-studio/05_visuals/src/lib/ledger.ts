import { S, E } from './anim';

/** Every lie = one "pop": time (global s) and the body age AFTER it. */
export const POPS: { t: number; age: number; soft?: boolean; who?: 'eli' | 'rosie' }[] = [
  { t: E('a03') - 0.42, age: 16 },
  { t: S('d04') + 0.02, age: 17 },
  { t: S('d06') - 0.05, age: 18 },
  { t: S('d08') - 0.05, age: 19 },
  { t: S('e17') + 0.02, age: 20, soft: true },
  { t: S('f02') + 0.02, age: 21, soft: true },
  { t: S('f03') + 0.02, age: 25, soft: true },
  { t: S('f04') + 0.02, age: 30, soft: true },
  { t: S('f05') + 0.02, age: 36, soft: true },
  { t: S('g01') + 0.02, age: 41 },
];

export const ageAt = (t: number) => {
  let a = 15;
  for (const p of POPS) if (t >= p.t) a = p.age;
  return a;
};
export const lastPop = (t: number) => {
  let r: (typeof POPS)[number] | null = null;
  for (const p of POPS) if (t >= p.t) r = p;
  return r;
};

/** windows (global s) where the BODY AGE HUD is visible */
export const HUD_WINDOWS: [number, number][] = [
  [E('a03') - 0.6, S('b01') - 0.2],
  [S('c01'), S('e11') - 0.3],
  [S('e14'), S('g06') - 0.3],
  [S('g12'), S('i01') - 0.3],
];
