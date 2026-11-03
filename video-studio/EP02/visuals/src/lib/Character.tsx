import React from 'react';
import { C } from './theme';

/* ------------------------------------------------------------------
   Stick-figure rig. Origin = between the feet (y = 0 is the floor).
   Faces RIGHT by default; facing=-1 mirrors. Units ~ px at scale 1
   (full height ≈ 205). Angles in degrees: 0 = limb hanging straight
   down, positive = swung forward (toward the facing direction).
------------------------------------------------------------------- */

export type Pose = {
  lsh: number; lel: number; rsh: number; rel: number; // back arm (l) / front arm (r)
  lhip: number; lkn: number; rhip: number; rkn: number; // back leg / front leg
  lean?: number; // torso lean deg (+ forward)
  sit?: number; // 0..1  lowers hips for a chair
};

export const P: Record<string, Pose> = {
  stand: { lsh: -6, lel: 8, rsh: 6, rel: 10, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  relaxed: { lsh: -10, lel: 20, rsh: 10, rel: 25, lhip: -4, lkn: 2, rhip: 4, rkn: 2 },
  pockets: { lsh: -14, lel: 70, rsh: 14, rel: 70, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  wave: { lsh: -8, lel: 10, rsh: 150, rel: 25, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  point: { lsh: -8, lel: 10, rsh: 88, rel: 0, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  shrug: { lsh: -30, lel: -120, rsh: 30, rel: 120, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  handsHead: { lsh: -170, lel: 30, rsh: 170, rel: -30, lhip: -4, lkn: 0, rhip: 4, rkn: 0 },
  chin: { lsh: -8, lel: 10, rsh: 20, rel: 145, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  phone: { lsh: -8, lel: 10, rsh: 15, rel: 160, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  hold: { lsh: 30, lel: 60, rsh: 40, rel: 60, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  reach: { lsh: -8, lel: 10, rsh: 70, rel: 15, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  hug: { lsh: 75, lel: 70, rsh: 80, rel: 70, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  sit: { lsh: 25, lel: 55, rsh: 30, rel: 60, lhip: 88, lkn: -88, rhip: 92, rkn: -90, sit: 1 },
  sitTable: { lsh: 55, lel: 40, rsh: 60, rel: 40, lhip: 88, lkn: -88, rhip: 92, rkn: -90, sit: 1 },
  sitSlump: { lsh: 10, lel: 30, rsh: 15, rel: 35, lhip: 85, lkn: -80, rhip: 90, rkn: -84, sit: 1, lean: 10 },
  facepalm: { lsh: -8, lel: 10, rsh: 25, rel: 150, lhip: -3, lkn: 0, rhip: 3, rkn: 0, lean: 8 },
  armsUp: { lsh: -150, lel: 0, rsh: 150, rel: 0, lhip: -5, lkn: 0, rhip: 5, rkn: 0 },
  give: { lsh: -8, lel: 10, rsh: 55, rel: 30, lhip: -3, lkn: 0, rhip: 3, rkn: 0 },
  cheer: { lsh: 165, lel: 10, rsh: 165, rel: 10, lhip: -6, lkn: 0, rhip: 6, rkn: 0 },
  hunch: { lsh: 4, lel: 20, rsh: 10, rel: 25, lhip: 2, lkn: 6, rhip: 8, rkn: 6, lean: 10 },
};

export const mixPose = (a: Pose, b: Pose, x: number): Pose => {
  const m = (k: keyof Pose) => ((a[k] ?? 0) as number) + (((b[k] ?? 0) as number) - ((a[k] ?? 0) as number)) * x;
  return {
    lsh: m('lsh'), lel: m('lel'), rsh: m('rsh'), rel: m('rel'),
    lhip: m('lhip'), lkn: m('lkn'), rhip: m('rhip'), rkn: m('rkn'), lean: m('lean'), sit: m('sit'),
  };
};

/** walk cycle pose for phase (cycles) */
export const walkPose = (phase: number, amp = 1): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  return {
    lsh: 26 * s * amp, lel: 18 + 10 * Math.max(0, s), rsh: -26 * s * amp, rel: 18 + 10 * Math.max(0, -s),
    lhip: -24 * s * amp, lkn: 34 * Math.max(0, c) * amp, rhip: 24 * s * amp, rkn: 34 * Math.max(0, -c) * amp,
    lean: 3,
  };
};

export type Expr = 'neutral' | 'happy' | 'sad' | 'shock' | 'worried' | 'smug' | 'closed' | 'squint' | 'angry' | 'soft';
export type Mouth = 'none' | 'smile' | 'grin' | 'open' | 'frown' | 'o' | 'flat' | 'smirk';
export type Hair = 'eli' | 'mom' | 'grandpa' | 'sam' | 'samcut' | 'nora' | 'rosie' | 'teacher' | 'none';

export type CharProps = {
  x?: number; y?: number; scale?: number; facing?: 1 | -1;
  pose?: Pose; expr?: Expr; mouth?: Mouth; talking?: boolean;
  t: number; // seconds (for blink / talk / breathe)
  seed?: number;
  look?: [number, number]; // pupils -1..1
  tilt?: number; // head tilt deg
  outfit?: string; outfitShade?: string; pants?: string; shoe?: string;
  hair?: Hair; age?: number; // Eli ages 15..41+
  height?: number; // body scale multiplier (kids < 1)
  rim?: string; // rim-light colour
  shadowLen?: number;
  glasses?: boolean; cane?: boolean; tears?: number; sweat?: boolean; blush?: boolean;
  cardigan?: boolean; dress?: boolean; bob?: number; // vertical bob px
  headScale?: number;
  opacity?: number;
  grayHair?: number; // 0..1 override
};

const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a: number, len: number): [number, number] => [x + Math.sin(rad(a)) * len, y + Math.cos(rad(a)) * len];

export const Character: React.FC<CharProps> = (p) => {
  const {
    x = 0, y = 0, scale = 1, facing = 1, pose = P.stand, expr = 'neutral', mouth = 'none', talking = false, t,
    seed = 0, look = [0.25, 0], tilt = 0, outfit = C.hoodie, outfitShade, pants = C.pants, shoe = '#f4f4f4',
    hair = 'none', age = 15, height = 1, rim = 'rgba(255,214,150,0.55)', glasses, cane, tears = 0, sweat, blush,
    cardigan, dress, bob = 0, headScale = 1, opacity = 1, shadowLen = 1,
  } = p;

  const shade = outfitShade ?? shadeOf(outfit);
  // ageing for Eli
  const ageK = Math.max(0, Math.min(1, (age - 15) / 26)); // 0 at 15, 1 at 41
  const grow = hair === 'eli' ? 0.95 + 0.05 * Math.min(1, (age - 15) / 3) : 1;
  const hunch = hair === 'eli' ? Math.max(0, (age - 33) / 8) * 6 : 0;
  const gray = p.grayHair ?? (hair === 'eli' ? Math.max(0, (age - 33) / 8) : hair === 'grandpa' || hair === 'rosie' ? 1 : 0);

  const sitK = pose.sit ?? 0;
  const breathe = Math.sin(t * 2.2 + seed) * 1.2;
  const lean = (pose.lean ?? 0) + hunch;

  // skeleton
  const thigh = 40, shin = 40, upper = 31, fore = 29;
  const hipY = -80 + sitK * 34 + bob;
  const hipX = 0;
  const shY = hipY - 58 - breathe * 0.3;
  const shX = hipX + Math.sin(rad(lean)) * 58;
  const headX = shX + Math.sin(rad(lean)) * 30 + hunch * 0.6;
  const headY = shY - 36 - breathe * 0.4;

  // legs
  const lk = limb(hipX - 4, hipY, pose.lhip, thigh);
  const lf = limb(lk[0], lk[1], pose.lhip + pose.lkn, shin);
  const rk = limb(hipX + 4, hipY, pose.rhip, thigh);
  const rf = limb(rk[0], rk[1], pose.rhip + pose.rkn, shin);
  // arms (shoulders)
  const lsP: [number, number] = [shX - 13, shY + 6];
  const rsP: [number, number] = [shX + 13, shY + 6];
  const le = limb(lsP[0], lsP[1], pose.lsh, upper);
  const lh = limb(le[0], le[1], pose.lsh + pose.lel, fore);
  const re = limb(rsP[0], rsP[1], pose.rsh, upper);
  const rh = limb(re[0], re[1], pose.rsh + pose.rel, fore);

  // blink
  const period = 3.1 + (seed % 5) * 0.37;
  const ph = ((t + seed * 0.71) % period) / period;
  const blinking = ph > 0.955;

  const R = 31 * headScale;
  const armLow = re[1] > headY + R * 1.05 && rh[1] > headY + R * 1.05;
  const torso = `M ${shX - 22} ${shY + 2} Q ${shX - 25} ${shY - 6} ${shX - 10} ${shY - 8} L ${shX + 10} ${shY - 8} Q ${shX + 25} ${shY - 6} ${shX + 22} ${shY + 2}
    L ${hipX + 21} ${hipY + 4} Q ${hipX + 21} ${hipY + 10} ${hipX + 14} ${hipY + 10} L ${hipX - 14} ${hipY + 10} Q ${hipX - 21} ${hipY + 10} ${hipX - 21} ${hipY + 4} Z`;
  const skirt = `M ${hipX - 20} ${hipY - 6} L ${hipX + 20} ${hipY - 6} L ${hipX + 30 + sitK * 18} ${hipY + 34 - sitK * 20} L ${hipX - 30} ${hipY + 34 - sitK * 20} Z`;

  const legStroke = (a: [number, number], k: [number, number], f: [number, number], col: string) => (
    <path d={`M ${a[0]} ${a[1]} L ${k[0]} ${k[1]} L ${f[0]} ${f[1]}`} stroke={col} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
  const shoeEl = (f: [number, number], key: string) => (
    <g key={key}>
      <ellipse cx={f[0] + 8} cy={f[1] + 1} rx={13} ry={7} fill={shoe} />
      <rect x={f[0] - 5} y={f[1] + 3} width={27} height={4} rx={2} fill={C.ink} opacity={0.35} />
    </g>
  );
  const armEl = (s: [number, number], e: [number, number], h: [number, number], col: string, key: string) => (
    <g key={key}>
      <path d={`M ${s[0]} ${s[1]} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`} stroke={col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={h[0]} cy={h[1]} r={7.5} fill={C.ink} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing * grow * height} ${scale * grow * height})`} opacity={opacity}>
      {/* soft contact + cast shadow (light from upper-left) */}
      <g filter="url(#softShadow)" opacity={1 - sitK * 0.5}>
        <ellipse cx={sitK > 0.5 ? 10 : 4} cy={2} rx={46} ry={9} fill="#000" opacity={0.38} />
        <path d={`M -24 2 L 26 2 L ${150 * shadowLen} ${-18 * shadowLen} L ${105 * shadowLen} ${-26 * shadowLen} Z`} fill="#000" opacity={0.16 * shadowLen} />
      </g>
      {cane && (
        <g>
          <path d={`M ${rh[0] + 4} ${rh[1]} L ${rh[0] + 10} 0`} stroke="#5a3b28" strokeWidth={6} strokeLinecap="round" />
          <path d={`M ${rh[0] - 6} ${rh[1] - 4} Q ${rh[0] + 2} ${rh[1] - 14} ${rh[0] + 6} ${rh[1]}`} stroke="#5a3b28" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* back arm + back leg */}
      {legStroke([hipX - 4, hipY], lk, lf, darken(pants, 0.25))}
      {shoeEl(lf, 'ls')}
      {armEl(lsP, le, lh, shade, 'la')}
      {/* front leg */}
      {legStroke([hipX + 4, hipY], rk, rf, pants)}
      {shoeEl(rf, 'rs')}
      {/* torso */}
      <g>
        {dress && <path d={skirt} fill={outfit} />}
        <path d={torso} fill={outfit} stroke={rim} strokeWidth={2} />
        <path d={torso} fill="url(#gShadeV)" />
        <path d={torso} fill="url(#gShadeH)" />
        <ellipse cx={headX} cy={shY + 4} rx={24} ry={9} fill="#000" opacity={0.22} filter="url(#softShadow)" />
        {/* hoodie details */}
        {!cardigan && !dress && (
          <>
            <path d={`M ${shX - 9} ${shY - 6} Q ${shX} ${shY + 6} ${shX + 9} ${shY - 6}`} stroke={shade} strokeWidth={4} fill="none" />
            <path d={`M ${shX - 3} ${shY + 2} L ${shX - 5} ${shY + 18} M ${shX + 3} ${shY + 2} L ${shX + 5} ${shY + 18}`} stroke="#ffffff" strokeOpacity={0.8} strokeWidth={2} strokeLinecap="round" />
            <path d={`M ${hipX - 14} ${hipY - 14} L ${hipX + 14} ${hipY - 14}`} stroke={shade} strokeWidth={3} strokeLinecap="round" />
          </>
        )}
        {cardigan && (
          <>
            <path d={`M ${shX} ${shY - 6} L ${hipX} ${hipY + 9}`} stroke={shade} strokeWidth={3} />
            {[0.3, 0.55, 0.8].map((k) => (
              <circle key={k} cx={shX + (hipX - shX) * k + 3} cy={shY + (hipY - shY) * k} r={2.2} fill="#f1e2c8" />
            ))}
          </>
        )}
      </g>
      {armLow && armEl(rsP, re, rh, outfit, 'ra')}
      {/* head */}
      <g transform={`rotate(${tilt + lean * 0.4} ${headX} ${headY + R})`}>
        <HairBack hair={hair} x={headX} y={headY} R={R} gray={gray} />
        {(hair === 'eli' || hair === 'none' || hair === 'samcut' || hair === 'sam') && !cardigan && !dress && (
          // hood behind the neck
          <path d={`M ${headX - R * 0.9} ${headY + R * 0.55} Q ${headX - R * 1.15} ${headY + R * 1.25} ${headX} ${headY + R * 1.25} Q ${headX + R * 0.9} ${headY + R * 1.25} ${headX + R * 0.85} ${headY + R * 0.6}`} fill={shade} />
        )}
        <circle cx={headX} cy={headY} r={R} fill={C.ink} stroke={rim} strokeWidth={2.2} />
        <circle cx={headX} cy={headY} r={R} fill="url(#gHead)" />
        {/* beard (Eli ageing) */}
        {hair === 'eli' && age >= 17 && <Beard x={headX} y={headY} R={R} k={Math.min(1, (age - 17) / 10)} gray={gray} />}
        <HairFront hair={hair} x={headX} y={headY} R={R} gray={gray} />
        <Face x={headX + 5 * headScale} y={headY + 2} s={headScale} expr={blinking && expr !== 'happy' && expr !== 'closed' ? 'closed' : expr} mouth={mouth} talking={talking} t={t} look={look} glasses={glasses} tears={tears} sweat={sweat} blush={blush} wrinkles={hair === 'eli' ? Math.max(0, (age - 28) / 10) : hair === 'grandpa' ? 1 : 0} />
      </g>
      {/* front arm (drawn last, over torso) unless it hangs low (then it goes under the head/beard) */}
      {!armLow && armEl(rsP, re, rh, outfit, 'ra')}
    </g>
  );
};

/* ---------------- face ---------------- */
const Face: React.FC<{
  x: number; y: number; s: number; expr: Expr; mouth: Mouth; talking: boolean; t: number; look: [number, number];
  glasses?: boolean; tears: number; sweat?: boolean; blush?: boolean; wrinkles: number;
}> = ({ x, y, s, expr, mouth, talking, t, look, glasses, tears, sweat, blush, wrinkles }) => {
  const ex = 11.5 * s;
  const ey = -3 * s;
  let rx = 7.6 * s, ry = 10 * s, pr = 3.8 * s;
  if (expr === 'shock') { rx = 9.5 * s; ry = 12.5 * s; pr = 2.6 * s; }
  if (expr === 'worried') { pr = 3 * s; }
  const px = look[0] * 3.2 * s, py = look[1] * 3.6 * s;
  const eyes = [-1, 1].map((side) => {
    const cx = x + side * ex;
    const cy = y + ey;
    if (expr === 'closed') return <path key={side} d={`M ${cx - rx} ${cy + 1} Q ${cx} ${cy + 5 * s} ${cx + rx} ${cy + 1}`} stroke="#fff" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
    if (expr === 'happy') return <path key={side} d={`M ${cx - rx} ${cy + 3} Q ${cx} ${cy - 9 * s} ${cx + rx} ${cy + 3}`} stroke="#fff" strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />;
    if (expr === 'squint') return <path key={side} d={`M ${cx - rx} ${cy} L ${cx + rx} ${cy}`} stroke="#fff" strokeWidth={3 * s} strokeLinecap="round" />;
    // open eye
    const lidTop = expr === 'smug' ? 0.45 : expr === 'sad' ? 0.25 : expr === 'angry' ? 0.3 : expr === 'soft' ? 0.3 : 0;
    const inner = side === -1 ? 1 : -1; // inner side direction
    return (
      <g key={side}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
        <circle cx={cx + px} cy={cy + py + (expr === 'sad' ? 2 : 0)} r={pr} fill={C.ink} />
        <circle cx={cx + px + pr * 0.35} cy={cy + py - pr * 0.4} r={pr * 0.32} fill="#fff" />
        {lidTop > 0 && (
          <path
            d={expr === 'sad' || expr === 'soft'
              ? `M ${cx - rx - 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry + ry * 2 * lidTop + (inner === 1 ? -4 : 7) * s} L ${cx - rx - 2} ${cy - ry + ry * 2 * lidTop + (inner === 1 ? 7 : -4) * s} Z`
              : expr === 'angry'
                ? `M ${cx - rx - 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry + ry * 2 * lidTop + (inner === 1 ? -3 : 8) * s} L ${cx - rx - 2} ${cy - ry + ry * 2 * lidTop + (inner === 1 ? 8 : -3) * s} Z`
                : `M ${cx - rx - 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry + ry * 2 * lidTop} L ${cx - rx - 2} ${cy - ry + ry * 2 * lidTop} Z`}
            fill={C.ink}
          />
        )}
      </g>
    );
  });
  // brows
  let brows: React.ReactNode = null;
  const by = y + ey - ry - 6 * s;
  if (expr === 'worried' || expr === 'sad') {
    brows = [-1, 1].map((side) => (
      <path key={side} d={`M ${x + side * (ex + 7 * s)} ${by + 3 * s} L ${x + side * (ex - 6 * s)} ${by - 4 * s}`} stroke="#fff" strokeWidth={2.6 * s} strokeLinecap="round" />
    ));
  } else if (expr === 'angry') {
    brows = [-1, 1].map((side) => (
      <path key={side} d={`M ${x + side * (ex + 7 * s)} ${by - 3 * s} L ${x + side * (ex - 6 * s)} ${by + 4 * s}`} stroke="#fff" strokeWidth={2.8 * s} strokeLinecap="round" />
    ));
  } else if (expr === 'smug') {
    brows = <path d={`M ${x + ex - 7 * s} ${by - 5 * s} Q ${x + ex} ${by - 9 * s} ${x + ex + 7 * s} ${by - 5 * s}`} stroke="#fff" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
  } else if (expr === 'shock') {
    brows = [-1, 1].map((side) => (
      <path key={side} d={`M ${x + side * (ex - 6 * s)} ${by - 6 * s} Q ${x + side * ex} ${by - 10 * s} ${x + side * (ex + 6 * s)} ${by - 6 * s}`} stroke="#fff" strokeWidth={2.4 * s} fill="none" strokeLinecap="round" />
    ));
  }
  // mouth
  const my = y + 17 * s;
  let m: Mouth = mouth;
  let open = 0;
  if (talking) {
    open = Math.max(0, Math.sin(t * 17) * 0.6 + Math.sin(t * 11.3) * 0.4);
    m = open > 0.25 ? 'open' : 'flat';
  }
  let mouthEl: React.ReactNode = null;
  if (m === 'smile') mouthEl = <path d={`M ${x - 8 * s} ${my - 2} Q ${x} ${my + 6 * s} ${x + 8 * s} ${my - 2}`} stroke="#fff" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
  if (m === 'grin') mouthEl = <path d={`M ${x - 10 * s} ${my - 3} Q ${x} ${my + 12 * s} ${x + 10 * s} ${my - 3} Z`} fill="#fff" />;
  if (m === 'open') mouthEl = <ellipse cx={x} cy={my + 1} rx={6 * s} ry={(talking ? 2 + open * 5 : 6) * s} fill="#fff" />;
  if (m === 'o') mouthEl = <ellipse cx={x} cy={my + 2} rx={4.5 * s} ry={6 * s} fill="#fff" />;
  if (m === 'frown') mouthEl = <path d={`M ${x - 7 * s} ${my + 4} Q ${x} ${my - 3 * s} ${x + 7 * s} ${my + 4}`} stroke="#fff" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
  if (m === 'flat') mouthEl = <path d={`M ${x - 5 * s} ${my + 1} L ${x + 5 * s} ${my + 1}`} stroke="#fff" strokeWidth={2.4 * s} strokeLinecap="round" />;
  if (m === 'smirk') mouthEl = <path d={`M ${x - 6 * s} ${my + 2} Q ${x + 3 * s} ${my + 4 * s} ${x + 9 * s} ${my - 3 * s}`} stroke="#fff" strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;

  return (
    <g>
      {eyes}
      {brows}
      {mouthEl}
      {wrinkles > 0 && [-1, 1].map((side) => (
        <g key={side} opacity={Math.min(1, wrinkles) * 0.55}>
          <path d={`M ${x + side * (ex + rx + 3 * s)} ${y + ey - 2 * s} l ${side * 5 * s} ${-3 * s} M ${x + side * (ex + rx + 3 * s)} ${y + ey + 2 * s} l ${side * 5 * s} ${2 * s}`} stroke="#8a8f99" strokeWidth={1.6 * s} strokeLinecap="round" />
        </g>
      ))}
      {glasses && (
        <g stroke="#e9eef5" strokeWidth={2.2 * s} fill="none">
          <circle cx={x - ex} cy={y + ey} r={11.5 * s} />
          <circle cx={x + ex} cy={y + ey} r={11.5 * s} />
          <path d={`M ${x - ex + 11.5 * s} ${y + ey} L ${x + ex - 11.5 * s} ${y + ey}`} />
        </g>
      )}
      {blush && [-1, 1].map((side) => <ellipse key={side} cx={x + side * (ex + 2 * s)} cy={y + 10 * s} rx={5 * s} ry={2.6 * s} fill="#ff7a9a" opacity={0.75} />)}
      {tears > 0 && [-1, 1].map((side) => (
        <path key={side} d={`M ${x + side * ex} ${y + ey + ry * 0.7} q ${side * 1.5} ${10 * tears} 0 ${22 * tears}`} stroke="#7fd4ff" strokeWidth={3.2 * s} strokeLinecap="round" fill="none" opacity={0.95} />
      ))}
      {sweat && <path d={`M ${x + 28 * s} ${y - 20 * s} q -6 9 0 13 q 6 -4 0 -13 Z`} fill="#7fd4ff" />}
    </g>
  );
};

/* ---------------- hair & beard ---------------- */
const HairBack: React.FC<{ hair: Hair; x: number; y: number; R: number; gray: number }> = ({ hair, x, y, R, gray }) => {
  if (hair === 'mom') return <g><circle cx={x - R * 0.75} cy={y - R * 0.75} r={R * 0.42} fill={C.ink} /><path d={`M ${x - R} ${y} Q ${x - R * 1.2} ${y + R * 1.1} ${x - R * 0.4} ${y + R * 0.95}`} fill={C.ink} /></g>;
  if (hair === 'nora') return <g fill={C.ink}><circle cx={x - R * 1.05} cy={y - R * 0.2} r={R * 0.36} /><circle cx={x + R * 1.05} cy={y - R * 0.2} r={R * 0.36} /></g>;
  if (hair === 'rosie') return <g fill={mixCol('#2a2a2a', '#e8e8ee', gray)}>{[[-0.8, -0.6], [-0.2, -0.95], [0.5, -0.85], [0.95, -0.3], [-1.0, 0.1]].map(([a, b], i) => <circle key={i} cx={x + a * R} cy={y + b * R} r={R * 0.42} />)}</g>;
  if (hair === 'teacher') return <path d={`M ${x - R * 1.05} ${y - R * 0.1} Q ${x - R * 1.2} ${y + R * 1.4} ${x - R * 0.2} ${y + R * 1.2} L ${x + R * 0.9} ${y + R * 0.5} Q ${x + R * 1.1} ${y - R * 1.2} ${x} ${y - R * 1.05} Z`} fill={C.ink} />;
  return null;
};

const HairFront: React.FC<{ hair: Hair; x: number; y: number; R: number; gray: number }> = ({ hair, x, y, R, gray }) => {
  if (hair === 'eli') {
    const col = C.ink;
    return (
      <g>
        <path d={`M ${x - R * 0.95} ${y - R * 0.35} Q ${x - R * 0.9} ${y - R * 1.25} ${x - R * 0.1} ${y - R * 1.12} L ${x - R * 0.25} ${y - R * 1.42} L ${x + R * 0.25} ${y - R * 1.12} L ${x + R * 0.35} ${y - R * 1.4} L ${x + R * 0.62} ${y - R * 0.98} Q ${x + R * 1.05} ${y - R * 0.95} ${x + R * 0.98} ${y - R * 0.35} Q ${x} ${y - R * 0.8} ${x - R * 0.95} ${y - R * 0.35} Z`} fill={col} />
        {gray > 0 && (
          <g opacity={Math.min(1, gray)}>
            <path d={`M ${x - R * 0.7} ${y - R * 0.75} Q ${x - R * 0.3} ${y - R * 1.15} ${x + R * 0.2} ${y - R * 1.05}`} stroke="#c9d0da" strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d={`M ${x - R * 0.9} ${y - R * 0.45} Q ${x - R * 0.85} ${y - R * 0.7} ${x - R * 0.65} ${y - R * 0.85}`} stroke="#c9d0da" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={Math.max(0, gray - 0.4) * 1.6} />
            <path d={`M ${x + R * 0.35} ${y - R * 1.08} Q ${x + R * 0.7} ${y - R * 0.95} ${x + R * 0.85} ${y - R * 0.6}`} stroke="#c9d0da" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={Math.max(0, gray - 0.6) * 2.5} />
          </g>
        )}
      </g>
    );
  }
  if (hair === 'mom') return <path d={`M ${x - R * 0.98} ${y - R * 0.1} Q ${x - R * 0.8} ${y - R * 1.15} ${x + R * 0.3} ${y - R * 1.02} Q ${x + R * 0.95} ${y - R * 0.8} ${x + R * 0.95} ${y - R * 0.25} Q ${x + R * 0.2} ${y - R * 0.95} ${x - R * 0.6} ${y - R * 0.3} Z`} fill="#2a1d18" />;
  if (hair === 'grandpa') {
    return (
      <g fill="#eef1f5">
        <path d={`M ${x - R * 1.02} ${y - R * 0.05} q ${-R * 0.25} ${-R * 0.45} ${R * 0.08} ${-R * 0.62} q ${-R * 0.05} ${R * 0.35} ${R * 0.12} ${R * 0.42} Z`} />
        <path d={`M ${x + R * 1.0} ${y - R * 0.05} q ${R * 0.25} ${-R * 0.45} ${-R * 0.08} ${-R * 0.62} q ${R * 0.05} ${R * 0.35} ${-R * 0.12} ${R * 0.42} Z`} />
        <path d={`M ${x - R * 0.7} ${y + R * 0.62} Q ${x} ${y + R * 0.95} ${x + R * 0.7} ${y + R * 0.62} Q ${x} ${y + R * 0.75} ${x - R * 0.7} ${y + R * 0.62} Z`} opacity={0.9} />
      </g>
    );
  }
  if (hair === 'sam') return <g fill={C.ink}>{[-0.8, -0.4, 0, 0.4, 0.8].map((a, i) => <circle key={i} cx={x + a * R} cy={y - R * 0.95 + Math.abs(a) * R * 0.3} r={R * 0.34} />)}</g>;
  if (hair === 'samcut') {
    // the infamous haircut: a perfectly flat, tall block with a zig-zag
    return (
      <g>
        <path d={`M ${x - R * 0.9} ${y - R * 0.45} L ${x - R * 0.85} ${y - R * 1.75} L ${x + R * 0.85} ${y - R * 1.75} L ${x + R * 0.9} ${y - R * 0.45} Z`} fill={C.ink} />
        <path d={`M ${x - R * 0.7} ${y - R * 1.3} l ${R * 0.28} ${-R * 0.18} l ${R * 0.28} ${R * 0.18} l ${R * 0.28} ${-R * 0.18} l ${R * 0.28} ${R * 0.18} l ${R * 0.28} ${-R * 0.18}`} stroke="#ffd25a" strokeWidth={3} fill="none" strokeLinejoin="round" />
      </g>
    );
  }
  if (hair === 'nora') return <path d={`M ${x - R * 0.95} ${y - R * 0.2} Q ${x - R * 0.7} ${y - R * 1.1} ${x + R * 0.2} ${y - R * 1.0} Q ${x + R * 0.95} ${y - R * 0.9} ${x + R * 0.95} ${y - R * 0.2} Q ${x + R * 0.1} ${y - R * 0.7} ${x - R * 0.95} ${y - R * 0.2} Z`} fill={C.ink} />;
  if (hair === 'teacher') return <path d={`M ${x - R} ${y - R * 0.2} Q ${x - R * 0.6} ${y - R * 1.2} ${x + R * 0.5} ${y - R} Q ${x + R} ${y - R * 0.7} ${x + R * 0.98} ${y - R * 0.1} Q ${x} ${y - R * 0.8} ${x - R} ${y - R * 0.2} Z`} fill="#3a2a22" />;
  return null;
};

const Beard: React.FC<{ x: number; y: number; R: number; k: number; gray: number }> = ({ x, y, R, k, gray }) => {
  // k 0..1 : stubble -> full beard, drawn as a charcoal jaw-silhouette with texture
  const drop = R * (0.18 + 0.5 * k);
  const col = mixCol('#2c2c34', '#6f7683', gray * 0.8);
  return (
    <g>
      <path d={`M ${x - R * 0.92} ${y + R * 0.25} Q ${x - R * 0.7} ${y + R + drop} ${x + R * 0.05} ${y + R + drop} Q ${x + R * 0.85} ${y + R + drop * 0.9} ${x + R * 0.95} ${y + R * 0.25} Q ${x + R * 0.6} ${y + R * 0.95} ${x} ${y + R * 0.95} Q ${x - R * 0.6} ${y + R * 0.95} ${x - R * 0.92} ${y + R * 0.25} Z`} fill={col} opacity={0.55 + 0.45 * k} />
      {[...Array(9)].map((_, i) => {
        const a = -0.8 + i * 0.2;
        return <circle key={i} cx={x + a * R * 0.95} cy={y + R * (0.75 + 0.12 * (1 - a * a)) + drop * 0.4} r={1.4} fill="#7b8291" opacity={0.6} />;
      })}
    </g>
  );
};

/* ---------------- colour utils ---------------- */
function hex(c: string) {
  const v = c.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
export function mixCol(a: string, b: string, x: number) {
  const A = hex(a), B = hex(b);
  const m = A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, x))));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}
export function darken(c: string, k: number) {
  if (!c.startsWith('#')) return c;
  return mixCol(c, '#000000', k);
}
export function shadeOf(c: string) {
  return c.startsWith('#') ? mixCol(c, '#000000', 0.2) : c;
}
