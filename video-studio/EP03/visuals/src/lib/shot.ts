import { S, E, useT } from './anim';

/** Helper for shots: local time + line times relative to the shot start `o` (global s). */
export const useShot = (o: number) => {
  const t = useT();
  const s = (id: string) => S(id) - o;
  const e = (id: string) => E(id) - o;
  const talk = (id: string, pad = 0.02) => t >= s(id) - pad && t <= e(id) - 0.05;
  const between = (a: number, b: number) => t >= a && t < b;
  return { t, s, e, talk, between, gt: t + o };
};

export type ShotFC = React.FC<{ o: number; d: number }>;
