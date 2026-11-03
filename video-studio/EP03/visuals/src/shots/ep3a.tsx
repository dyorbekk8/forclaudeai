import React from 'react';
import { Cam, Badge, BigText, Bubble, Tag, Stamp } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, Hallway, DataBG, Backdrop, Classroom, Stairs, Dining } from '../sets/Sets';
import { Street } from '../sets/Sets2';
import { Court, Ball, Truck, Space, Earth, Moon, Sun, Hospital, MirrorFrame, ViralPhone, Living, KidRoom } from '../sets/Sets3';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Person } from './dataviz';
import { Kid } from './common';
import { You, Mia, Jake, Mom, Dad, Doc, COL } from './cast3';
import { Sh, Split, Neon, LagTag, Dizzy, Boom, Kinetic, frOf } from './kit3';
import { DayCard, Spinner, RGBSplit, PastFrame, Slices, human } from '../lib/lag';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };

/* ================= A — cold open ================= */
/* court scene as a pure function of time so it can be shown "late" */
const courtScene = (tt: number, hitAt: number, camZ = 1) => {
  const throwT = hitAt - 0.7;
  const flyK = clamp01((tt - throwT) / 0.7);
  const hit = tt >= hitAt;
  const bx = hit ? 840 + (tt - hitAt) * 260 : 1450 - flyK * 610;
  const by = hit ? 520 + (tt - hitAt) * (tt - hitAt) * 900 - (tt - hitAt) * 300 : 560 - Math.sin(flyK * Math.PI) * 140;
  return (
    <Cam z={camZ} fx={900} fy={560}>
      <Court t={tt} />
      <Jake t={tt} x={1520} scale={2.4} facing={-1} pose={tt < throwT ? P.hold : tt < throwT + 0.4 ? P.reach : P.relaxed} expr={hit ? 'shock' : 'happy'} mouth={hit ? 'open' : 'grin'} look={[0.9, 0.1]} />
      <You t={tt} x={760} scale={2.4} pose={hit ? mixPose(P.stand, P.handsHead, clamp01((tt - hitAt - 0.2) * 3)) : P.relaxed} expr={hit ? 'shock' : 'neutral'} tilt={hit ? -10 : 0} look={[-0.6, 0]} />
      <Ball x={bx} y={by} r={34} rot={tt * 400} />
    </Cam>
  );
};

export const A1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const hitAt = 0.55;
  const sh = t > hitAt && t < hitAt + 0.4 ? Math.sin(t * 120) * 18 * (1 - (t - hitAt) / 0.4) : 0;
  return (
    <Sh tone="warm">
      <g transform={`translate(${sh} ${sh * 0.6})`}>
        <Cam z={tw(t, 0, d, 1.55, 1.7)} fx={800} fy={470}>
          <Court t={t} hoop={false} />
          <You t={t} x={760} scale={2.4} pose={t > hitAt + 0.15 ? P.facepalm : P.relaxed} expr={t > hitAt ? 'closed' : 'neutral'} tilt={t > hitAt ? -14 : 0} look={[-0.7, 0]} />
          {t < hitAt + 0.02 && <Ball x={1300 - (t / hitAt) * 470} y={430 + (t / hitAt) * 30} r={34} rot={t * 500} />}
          {t >= hitAt && <Ball x={840 + (t - hitAt) * 500} y={470 - (t - hitAt) * 300 + (t - hitAt) ** 2 * 900} r={34} rot={t * 500} />}
          {t > hitAt + 0.2 && <Dizzy x={770} y={350} t={t} />}
        </Cam>
        <Boom t={t} t0={hitAt} x={1180} y={300} text="BONK!" />
      </g>
    </Sh>
  );
};

export const A2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const lagS = 1.0;
  return (
    <Sh tone="warm">
      <PastFrame t={t} label="WHAT YOU SEE" ms={1000}>
        <RGBSplit amt={6}>{courtScene(t - lagS + 0.3, 1.1)}</RGBSplit>
      </PastFrame>
      <Kinetic t={t} t0={fr2(t, d, 0.55)} text="...NOW you see it." y={990} />
    </Sh>
  );
};
const fr2 = (_t: number, d: number, x: number) => d * x;

export const A3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const hitAt = fr('a03', 0.35);
  return (
    <Sh tone="warm">
      <Split id="a3" t={t} left={courtScene(t, hitAt, 1)} right={courtScene(t - 1, hitAt, 1)} lShift={600} rShift={600} sub="−1.0 s" />
    </Sh>
  );
};

export const A4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.05, 1.12)} fx={1100} fy={520}>
        <Court t={t} px={-120} />
        <Mia t={t} x={1150} scale={3.6} y={980} facing={-1} pose={P.shrug} expr="worried" mouth={talk('a04') ? 'open' : 'flat'} talking={talk('a04')} look={[-0.8, -0.2]} />
        <You t={t} x={560} scale={3.4} y={1060} pose={P.facepalm} expr="closed" tilt={-10} />
      </Cam>
    </Sh>
  );
};

export const A5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  // pupils catch up with a lag: they "snap" every 0.5 s
  const step = Math.floor(t / 0.55);
  const look: [number, number] = [Math.sin(step * 2.1) * 0.8, Math.cos(step * 1.3) * 0.4];
  return (
    <Sh tone="warm">
      <Backdrop a="#ffcf9a" b="#c4624a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={430}>
        <RGBSplit amt={4 + 4 * Math.abs(Math.sin(t * 3))}>
          <You t={t} x={960} y={1700} scale={6.4} pose={P.stand} expr="worried" look={look} />
        </RGBSplit>
        {/* nose bleed */}
        <path d="M 975 700 q 4 22 -2 44" stroke="#d7263d" strokeWidth={10} strokeLinecap="round" fill="none" opacity={tw(t, 0.3, 0.8, 0, 1)} />
        <Spinner x={960} y={180} t={t} r={50} op={tw(t, 1.2, 1.6, 0, 1)} />
      </Cam>
    </Sh>
  );
};

export const A6: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const gk = t > fr('a06', 0.62) && t < fr('a06', 0.62) + 0.45 ? 1 : 0;
  return (
    <Sh tone="cool">
      <Backdrop a="#141a33" b="#05060c" />
      <Slices id="a6" t={t} k={gk}>
        <Cam z={tw(t, 0, d, 1.0, 1.08)}>
          <You t={t} x={960} y={930} scale={3.0} pose={P.stand} expr="worried" look={[0, -0.3]} rim="rgba(79,216,255,0.8)" />
          <Spinner x={960} y={300} t={t} r={60} col={C.cyan} />
        </Cam>
        <BigText t={t} t0={fr('a06', 0.6)} x={960} y={190} text="YOUR LIFE HAS LAG" size={100} color="#fff" stroke={C.red} />
      </Slices>
    </Sh>
  );
};

export const A7: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const vals = ['1 s', '2 s', '4 s', '8 s', '16 s', '32 s', '64 s'];
  return (
    <Sh tone="cool">
      <DataBG t={t + o} tint={C.red} />
      <BigText t={t} t0={0.1} x={960} y={190} text="EVERY DAY: ×2" size={92} color={C.red} />
      {vals.map((v, i) => {
        const t0 = 0.4 + i * 0.22;
        const k = pop(t, t0, 0.35);
        const h = 26 * Math.pow(2, i * 0.72);
        return (
          <g key={i} opacity={clamp01(k * 2)}>
            <rect x={300 + i * 200} y={900 - h * k} width={140} height={h * k} rx={14} fill={i < 3 ? C.gold : C.red} />
            <text x={370 + i * 200} y={950} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{v}</text>
          </g>
        );
      })}
    </Sh>
  );
};

/* ================= B — rule + science ================= */
const walker = (tt: number) => {
  const x = 300 + tt * 150;
  return <You t={tt} x={x} scale={2.6} pose={walkPose(tt * 1.4)} expr="neutral" look={[1, 0]} />;
};
export const B1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const lag = 0.9;
  const tagK = tw(t, fr('b01', 0.55), fr('b01', 0.62), 0, 1);
  const x = 300 + t * 150;
  return (
    <Sh tone="cool">
      <DataBG t={t + o} />
      <BigText t={t} t0={0.2} x={960} y={170} text="THE RULE" size={88} color={C.gold} stroke={C.navy} />
      <line x1={0} y1={842} x2={1920} y2={842} stroke="#8fa3c8" strokeWidth={4} opacity={0.5} />
      {/* ghost trail = senses */}
      {[3, 2, 1].map((g) => (
        <g key={g} opacity={0.22 + 0.12 * (3 - g)} filter="url(#tintCyan)">{walker(Math.max(0, t - lag * g * 0.6))}</g>
      ))}
      {walker(t)}
      <g opacity={tagK}>
        <Badge t={t} t0={fr('b01', 0.55)} x={x + 40} y={330} text="BODY: NOW" size={36} color="#fff" icon="●" />
        <Badge t={t} t0={fr('b01', 0.75)} x={x - 360} y={420} text="EYES · EARS · TOUCH: PAST" size={32} color={C.cyan} />
      </g>
    </Sh>
  );
};

export const B2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const days = [['DAY 1', '1 s', 0.05], ['DAY 2', '2 s', 0.3], ['DAY 3', '4 s', 0.5]] as const;
  const inf = fr('b02', 0.72);
  return (
    <Sh tone="cool">
      <DataBG t={t + o} tint={C.red} />
      {days.map(([dl, v, x], i) => {
        const t0 = fr('b02', x);
        const k = pop(t, t0, 0.4);
        const w = 140 * Math.pow(2, i);
        return (
          <g key={i} opacity={clamp01(k * 2)}>
            <text x={260} y={330 + i * 170} fontSize={56} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{dl}</text>
            <rect x={560} y={285 + i * 170} width={w * k} height={64} rx={18} fill={C.gold} />
            <text x={580 + w * k} y={335 + i * 170} fontSize={50} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>{v}</text>
          </g>
        );
      })}
      {t > inf && (
        <g>
          <rect x={560} y={795} width={tw(t, inf, inf + 0.8, 0, 1800, ease.in)} height={64} rx={18} fill={C.red} />
          <text x={260} y={840} fontSize={56} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>DAY ∞</text>
        </g>
      )}
    </Sh>
  );
};

export const B3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="cool">
      <Backdrop a="#22305c" b="#0a0f22" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)}>
        <You t={t} x={960} y={1300} scale={4.6} pose={P.chin} expr="squint" mouth="flat" look={[0.4, -0.6]} />
      </Cam>
      <Neon t={t} t0={0.6} x={960} y={200} text="ALREADY LAGGING?" col={C.cyan} size={64} />
    </Sh>
  );
};

export const B4a: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const sig = tw(t, 0.8, 3.0, 0, 1, ease.soft);
  return (
    <Sh tone="cool">
      <DataBG t={t + o} />
      {/* eye */}
      <g transform="translate(420 540)">
        <ellipse rx={150} ry={95} fill="#fff" />
        <circle r={62} fill="#4a7bf0" />
        <circle r={30} fill="#111" />
        <circle cx={-18} cy={-18} r={12} fill="#fff" />
      </g>
      {/* brain */}
      <g transform="translate(1500 520)">
        <ellipse rx={230} ry={170} fill="#ff9fb5" />
        {[...Array(6)].map((_, i) => <path key={i} d={`M ${-180 + i * 60} -120 q 30 60 0 120 t 0 120`} stroke="#d96b86" strokeWidth={10} fill="none" />)}
        <circle r={250} fill="#ff9fb5" opacity={0.25 * sig} filter="url(#glowF)" />
      </g>
      <path d="M 580 540 C 860 380 1060 700 1280 520" stroke="#8fa3c8" strokeWidth={10} fill="none" strokeDasharray="20 16" />
      <circle cx={580 + (1280 - 580) * sig} cy={540 + Math.sin(sig * Math.PI * 1.6) * -110} r={22} fill={C.gold} />
      <circle cx={580 + (1280 - 580) * sig} cy={540 + Math.sin(sig * Math.PI * 1.6) * -110} r={60} fill={C.gold} opacity={0.4} filter="url(#glowF)" />
      <Badge t={t} t0={2.4} x={960} y={830} text="≈ 0.1 second delay" size={50} color={C.gold} icon="⏱" />
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Visual processing latency ~80–100 ms (neuroscience estimates)</text>
    </Sh>
  );
};

export const B4b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const youK = tw(t, d * 0.55, d * 0.7, 0, 1);
  return (
    <Sh tone="cool">
      <DataBG t={t + o} />
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        {[...Array(14)].map((_, i) => {
          const x = 180 + (i % 7) * 260, y = 430 + Math.floor(i / 7) * 330;
          const me = i === 10;
          return (
            <g key={i}>
              <Person x={x} y={y} s={1.7} col={me ? COL.you : '#5f7ab8'} glow={me ? youK : 0} />
              <LagTag x={x} y={y - 150} ms={me ? 100 + 900 * youK : 100} col={me && youK > 0.5 ? C.red : C.mint} s={me ? 0.9 + 0.3 * youK : 0.75} />
            </g>
          );
        })}
      </Cam>
      <BigText t={t} t0={d * 0.72} x={960} y={150} text="YOU: 10× WORSE" size={80} color={C.red} />
    </Sh>
  );
};

/* ================= C — day 1 ================= */
export const DayShot = (day: number, big: string, sub?: string): ShotFC => ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh>
      <DayCard t={t} d={d} day={day} big={big} sub={sub} />
    </Sh>
  );
};

export const C2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const jakeUp = tw(t, 0.1, 0.4, 0, 1);
  const youUp = tw(t, 1.1, 1.35, 0, 1);
  const jakeX = kf(t, [[0, 1150], [0.9, 1150], [2.0, 1700]]);
  return (
    <Sh tone="warm">
      <Cam z={1.05}>
        <Hallway t={t} />
        <Jake t={t} x={jakeX} scale={2.5} facing={t > 0.9 ? 1 : -1} pose={t > 0.9 ? walkPose(t * 1.6) : mixPose(P.stand, P.wave, jakeUp)} expr={t > 0.9 ? 'neutral' : 'happy'} mouth={t > 0.9 ? 'flat' : 'grin'} />
        <You t={t} x={800} scale={2.5} pose={mixPose(P.stand, P.wave, youUp)} expr={t > 1.4 ? 'worried' : 'happy'} mouth={t > 1.4 ? 'flat' : 'grin'} look={[1, 0]} />
      </Cam>
      {t > 1.35 && <Kinetic t={t} t0={1.35} text="*whoosh*" y={330} x={1000} col={C.cyan} size={60} />}
    </Sh>
  );
};

export const C3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const half = fr('c03', 0.5);
  const laughOthers = t < half - 1.2;
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Classroom t={t} board="Q: 7 × 8 = ?" />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 1} t={t} x={360 + i * 260} y={900} scale={2.3} pose={laughOthers ? P.cheer : P.stand} expr={laughOthers ? 'happy' : 'neutral'} mouth={laughOthers ? 'grin' : 'none'} look={[1, 0]} />)}
        <You t={t} x={1420} y={900} scale={2.4} pose={t > half + 1.2 ? P.wave : P.stand} expr={t < half && !laughOthers ? 'happy' : 'neutral'} mouth={t < half && !laughOthers ? 'grin' : 'flat'} />
      </Cam>
      {laughOthers && [0, 1, 2].map((i) => <Kinetic key={i} t={t} t0={0.15 + i * 0.1} x={360 + i * 260} y={560 - (i % 2) * 40} text="HA HA" col={C.gold} size={50} />)}
      {t > half - 1.2 && t < half && <Kinetic t={t} t0={half - 1.2} x={1420} y={520} text="HA... HA?" col={C.gold} size={56} />}
      {t > half && <Bubble t={t} t0={half} x={620} y={420} text="56!" tail="down" size={44} />}
      {t > half + 1.2 && <Bubble t={t} t0={half + 1.2} x={1350} y={420} text="...56?" tail="down" size={44} />}
      {t > half + 1.8 && <Kinetic t={t} t0={half + 1.8} x={960} y={990} text="(already answered)" col={C.gray} size={46} />}
    </Sh>
  );
};

export const C4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fx={800} fy={600}>
        <Living t={t} />
        <Mia t={t} x={760} scale={3.0} pose={P.chin} expr="squint" mouth="smirk" look={[1, -0.2]} />
        <You t={t} x={1340} scale={2.6} facing={-1} pose={P.stand} expr="neutral" look={[-0.4, 0]} />
      </Cam>
      <g transform="translate(760 330)" opacity={tw(t, 1.2, 1.5, 0, 1)}>
        <circle r={50} fill="#ffe066" />
        <circle r={110} fill="#ffe066" opacity={0.3} filter="url(#glowF)" />
        <rect x={-18} y={46} width={36} height={24} rx={6} fill="#9aa3b5" />
      </g>
      <Badge t={t} t0={0.5} x={1560} y={160} text="⏱ 4:59" size={44} color={C.gold} />
    </Sh>
  );
};

export const C5: ShotFC = ({ o, d }) => {
  const { t, talk, fr } = useF(o);
  const thr = fr('c05', 0.7);
  const fly = clamp01((t - thr) / 0.6);
  return (
    <Sh tone="warm">
      <Cam z={1.04}>
        <Living t={t} />
        <Mia t={t} x={500} scale={2.5} pose={t < thr ? P.hold : P.reach} expr="smug" mouth={talk('c05') ? 'grin' : 'smirk'} talking={talk('c05')} />
        <You t={t} x={1420} scale={2.6} facing={-1} pose={P.stand} expr="neutral" look={[-1, 0]} />
        {t >= thr && <g transform={`translate(${560 + fly * 780} ${560 - Math.sin(fly * Math.PI) * 120}) rotate(${t * 300})`}><rect x={-60} y={-40} width={120} height={80} rx={26} fill="#ff7aa8" /><rect x={-60} y={-40} width={120} height={80} rx={26} fill="url(#gShadeV)" /></g>}
        {t < thr && <g transform="translate(560 600)"><rect x={-60} y={-40} width={120} height={80} rx={26} fill="#ff7aa8" /></g>}
      </Cam>
    </Sh>
  );
};

export const C6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const handsUp = tw(t, 0.75, 1.0, 0, 1);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.3, 1.4)} fx={1300} fy={560}>
        <Living t={t} />
        <You t={t} x={1420} scale={2.6} facing={-1} pose={mixPose(P.stand, P.armsUp, handsUp)} expr={t < 0.75 ? 'closed' : 'shock'} tilt={t < 0.75 ? 12 : 0} />
        <g transform={`translate(${1380 + t * 200} ${560 + t * 260}) rotate(${40 + t * 200})`}><rect x={-60} y={-40} width={120} height={80} rx={26} fill="#ff7aa8" /></g>
      </Cam>
      <Boom t={t} t0={0.02} x={1100} y={300} text="FWUMP" col="#ff7aa8" size={100} />
      <Kinetic t={t} t0={1.0} x={1300} y={240} text="(catch!)" col={C.cyan} size={54} />
    </Sh>
  );
};

/* c07 montage */
export const C7a: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const spoon = tw(t, 0.2, 0.7, 0, 1);
  const splash = t > 0.9;
  return (
    <Sh tone="warm">
      <Cam z={1.15} fy={560}>
        <Dining t={t} food="none" />
        <You t={t} x={960} y={1000} scale={3.0} pose={P.sitTable} expr={splash ? 'shock' : 'neutral'} look={[0, 0.6]} />
        <ellipse cx={960} cy={760} rx={150} ry={34} fill="#fff" />
        <ellipse cx={960} cy={752} rx={120} ry={24} fill="#f2a93b" />
        {splash && [...Array(10)].map((_, i) => { const k = tw(t, 0.9, 1.4, 0, 1); return <circle key={i} cx={960 + Math.cos(i * 0.7) * 220 * k} cy={720 - Math.abs(Math.sin(i * 0.7)) * 260 * k + k * k * 200} r={14} fill="#f2a93b" opacity={1 - k * 0.6} />; })}
        <rect x={1060 - spoon * 60} y={600 + spoon * 60} width={14} height={120} rx={6} fill="#c8cdd6" transform={`rotate(${30 - spoon * 30} 1060 660)`} />
      </Cam>
      <Kinetic t={t} t0={0.1} x={960} y={160} text="SOUP?" col={C.gold} size={90} />
    </Sh>
  );
};
export const C7b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const fall = tw(t, 0.6, 1.0, 0, 1, ease.in);
  return (
    <Sh tone="warm">
      <Cam z={1.0}>
        <Stairs t={t} />
        <g transform={`translate(${780 + fall * 120} ${440 + fall * 320}) rotate(${fall * 70})`}>
          <You t={t} x={0} y={0} scale={2.1} pose={fall > 0 ? P.armsUp : walkPose(t * 1.5)} expr={fall > 0 ? 'shock' : 'neutral'} mouth={fall > 0 ? 'o' : 'none'} />
        </g>
      </Cam>
      <Kinetic t={t} t0={0.1} x={960} y={160} text="STAIRS?" col={C.gold} size={90} />
    </Sh>
  );
};
export const C7c: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh tone="cool">
      <Backdrop a="#1a1f3a" b="#07080f" />
      <g transform="translate(960 470)">
        <rect x={-560} y={-320} width={1120} height={640} rx={26} fill="#0b0d18" stroke="#2c3350" strokeWidth={14} />
        <rect x={-530} y={-290} width={1060} height={580} fill="#3a1630" />
        {[...Array(8)].map((_, i) => <rect key={i} x={-530} y={-290 + i * 72} width={1060} height={36} fill="#fff" opacity={0.03} />)}
        <text x={0} y={-40} textAnchor="middle" fontSize={130} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD} opacity={tw(t, 0.5, 0.8, 0, 1)}>YOU DIED</text>
        <text x={0} y={60} textAnchor="middle" fontSize={44} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} opacity={tw(t, 0.9, 1.2, 0, 1)}>ping: 1000 ms</text>
        <Spinner x={420} y={-200} t={t} r={34} />
      </g>
      <Kinetic t={t} t0={0.1} x={960} y={160} text="VIDEO GAMES?" col={C.gold} size={80} />
      <Kinetic t={t} t0={Math.max(0.2, fr('c07', 0.62) - (o - o))} x={960} y={990} text="1,000 ms. IN REAL LIFE." col={C.red} size={64} />
    </Sh>
  );
};

export const C8: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const beam = clamp01((t - 1.0) / 1.3);
  const youT = fr('c08', 0.62);
  return (
    <Sh tone="cool">
      <Space t={t} />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Earth x={360} y={560} r={170} />
        <Moon x={1600} y={500} r={70} />
        <line x1={1530} y1={505} x2={1530 - (1530 - 540) * beam} y2={505 + (555 - 505) * beam} stroke="#fff6c9" strokeWidth={8} strokeLinecap="round" />
        <circle cx={1530 - (1530 - 540) * beam} cy={505 + 50 * beam} r={14} fill="#fff" />
        <circle cx={1530 - (1530 - 540) * beam} cy={505 + 50 * beam} r={40} fill="#fff6c9" opacity={0.5} filter="url(#glowF)" />
        <Badge t={t} t0={1.1} x={1050} y={420} text={`${Math.min(1.3, (t - 1.0)).toFixed(1).replace('-', '')} s`} size={50} color={C.gold} icon="⏱" />
        {t > youT && (
          <g opacity={tw(t, youT, youT + 0.5, 0, 1)}>
            <You t={t} x={1600} y={420} scale={1.1} pose={P.wave} expr="happy" mouth="smile" />
            <Badge t={t} t0={youT + 0.2} x={1600} y={250} text="YOUR WORLD TODAY" size={34} color={C.cyan} />
          </g>
        )}
      </Cam>
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Earth–Moon light travel time ≈ 1.28 s</text>
    </Sh>
  );
};

/* ================= D — day 3–5 ================= */
export const D2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const ask = 0.3, hear = ask + 4 * (d / 8.5), leave = 1.8;
  const friendX = kf(t, [[0, 1200], [leave, 1200], [leave + 2.4, 2200]]);
  return (
    <Sh tone="warm">
      <Cam z={1.04}>
        <Hallway t={t} />
        <Jake t={t} x={friendX} scale={2.5} facing={t > leave ? 1 : -1} pose={t > leave ? walkPose(t * 1.6) : P.stand} expr="neutral" talking={t > ask && t < ask + 1.2} />
        <You t={t} x={700} scale={2.5} pose={t > hear + 0.6 ? P.give : P.stand} expr={t > hear + 1.6 ? 'worried' : 'neutral'} look={[1, 0]} talking={t > hear + 0.5 && t < hear + 1.4} />
      </Cam>
      <Bubble t={t} t0={ask} t1={ask + 1.4} x={1200} y={330} text="Wanna come Friday?" size={38} />
      {/* the question travelling slowly */}
      {t > ask + 1.4 && t < hear && <g opacity={0.8}><Bubble t={t} t0={ask + 1.4} x={1200 - (1200 - 760) * clamp01((t - ask - 1.4) / (hear - ask - 1.4))} y={330} text="Wanna come Friday?" size={30} /></g>}
      <LagTag x={700} y={240} ms={4000} col={C.gold} />
      {t > hear + 0.5 && <Bubble t={t} t0={hear + 0.5} x={760} y={420} text="Sure!" tail="down" size={44} />}
      {t > hear + 1.6 && <Kinetic t={t} t0={hear + 1.6} x={1300} y={700} text="...hello?" col={C.gray} size={48} />}
    </Sh>
  );
};

export const D4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={700}>
        <Street t={t} v="dusk" />
        <You t={t} x={960} y={900} scale={2.8} facing={-1} pose={P.stand} expr="neutral" look={[-1, 0]} />
      </Cam>
    </Sh>
  );
};

const streetPOV = (tt: number, truckAt: number, mia = false) => {
  const tx = 2600 - (tt - truckAt) * 1700;
  return (
    <g>
      <Street t={tt} v="dusk" />
      {tt > truckAt && tx > -900 && <Truck x={tx} y={930} s={1.15} blur={1} />}
      <You t={tt} x={900} y={mia && tt > truckAt + 0.9 ? 860 : 900} scale={2.6} facing={1} pose={mia && tt > truckAt + 0.9 ? P.armsUp : walkPose(tt * 0.3, 0.3)} expr={mia && tt > truckAt + 0.9 ? 'shock' : 'neutral'} look={[1, 0]} />
      {mia && <Mia t={tt} x={tt > truckAt + 0.8 ? 720 : 400 + (tt - truckAt) * 300} scale={2.6} pose={tt > truckAt + 0.8 ? P.hug : walkPose(tt * 2)} expr="shock" mouth="open" />}
    </g>
  );
};

export const D5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <PastFrame t={t} label="WHAT YOU SEE" ms={16000}>
        <Cam z={tw(t, 0, d, 1.0, 1.05)}>{streetPOV(t, 999)}</Cam>
      </PastFrame>
      <Kinetic t={t} t0={d * 0.55} x={960} y={980} text="empty." col={C.cyan} size={60} />
    </Sh>
  );
};

export const D6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <Split id="d6" t={t} left={streetPOV(t, 0.4)} right={streetPOV(t - 16, 0.4)} sub="−16 s" lShift={480} rShift={480} />
    </Sh>
  );
};

export const D7a: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const sh = t < 0.6 ? Math.sin(t * 90) * 14 * (1 - t / 0.6) : 0;
  return (
    <Sh tone="night">
      <g transform={`translate(${sh} 0)`}>
        <Cam z={tw(t, 0, d, 1.1, 1.0, ease.out)}>{streetPOV(t + 0.2, 0, true)}</Cam>
      </g>
      <Boom t={t} t0={0.0} x={1400} y={260} text="HOOONK" col={C.red} size={120} />
    </Sh>
  );
};

export const D7b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <PastFrame t={t} label="16 s LATER, YOU SEE" ms={16000}>
        <Cam z={tw(t, 0, d, 1.0, 1.08)}>{streetPOV(t - 0.4, 0, true)}</Cam>
      </PastFrame>
    </Sh>
  );
};

export const D8: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh tone="night">
      <Backdrop a="#3b2d6b" b="#0d0b1e" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={480}>
        <Mia t={t} x={960} y={1560} scale={7.0} pose={P.hold} expr="sad" tears={1} mouth={talk('d08') ? 'open' : 'frown'} talking={talk('d08')} look={[0.2, -0.3]} rim="rgba(255,150,120,0.9)" />
      </Cam>
    </Sh>
  );
};

/* ================= E — day 7 hospital + mirror ================= */
export const E2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const ticks = [['EYES', 0.55], ['EARS', 0.7], ['BRAIN SCAN', 0.86]] as const;
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Hospital t={t} />
        <Mom t={t} x={380} scale={2.5} pose={P.hold} expr="worried" />
        <Dad t={t} x={560} scale={2.6} pose={P.pockets} expr="worried" />
        <You t={t} x={960} scale={2.4} pose={P.stand} expr="neutral" look={[1, 0]} />
        <Doc t={t} x={1350} scale={2.6} facing={-1} pose={P.chin} expr="squint" />
      </Cam>
      {ticks.map(([txt, x], i) => (
        <Badge key={i} t={t} t0={fr('e02', x)} x={1550} y={360 + i * 110} text={`${txt}  ✓`} size={40} color={C.mint} />
      ))}
    </Sh>
  );
};

export const E3: ShotFC = ({ o, d }) => {
  const { t, talk, fr } = useF(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.05, 1.12)} fx={1200}>
        <Hospital t={t} px={-100} />
        <Doc t={t} x={1300} scale={3.1} facing={-1} pose={talk('e03') ? P.shrug : P.chin} expr="worried" talking={talk('e03')} mouth={talk('e03') ? 'open' : 'flat'} />
        <You t={t} x={700} scale={2.8} pose={P.stand} expr="neutral" look={[0.3, -0.2]} />
        <Spinner x={700} y={240} t={t} r={44} op={tw(t, fr('e03', 0.65), fr('e03', 0.75), 0, 1)} />
      </Cam>
      <g opacity={tw(t, fr('e03', 0.7), fr('e03', 0.8), 0, 1)}>
        <rect x={360} y={960} width={1200} height={12} rx={6} fill="rgba(255,255,255,0.2)" />
        <rect x={360} y={960} width={1200 * 0.38} height={12} rx={6} fill={C.red} />
        <rect x={360} y={960} width={1200 * (0.38 + 0.25 * ((t * 0.2) % 1))} height={12} rx={6} fill="rgba(255,255,255,0.45)" />
        <text x={360} y={940} fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>BUFFERING...</text>
      </g>
    </Sh>
  );
};

const bathYou = (tt: number, walkIn: number) => {
  const x = kf(tt, [[walkIn, 1500], [walkIn + 1.6, 1120]]);
  return <You t={tt} x={x} y={980} scale={3.2} facing={-1} pose={tt < walkIn + 1.6 && tt > walkIn ? walkPose(tt * 1.3) : P.stand} expr="neutral" look={[0, 0]} />;
};

export const E4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <MirrorFrame id="mE4">{/* empty reflection */}</MirrorFrame>
        <g transform="translate(960 1200) scale(1)">
          <You t={t} x={0} y={260} scale={6.0} pose={P.stand} expr={t > fr('e04', 0.65) ? 'shock' : 'neutral'} look={[0, -0.6]} opacity={1} />
        </g>
      </Cam>
      <Kinetic t={t} t0={fr('e04', 0.68)} x={960} y={160} text="EMPTY." col={C.cyan} size={90} />
    </Sh>
  );
};

export const E5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const walkIn = fr('e05', 0.4);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <MirrorFrame id="mE5">
          <g filter="url(#pastTint)">{bathYou(t, walkIn)}</g>
        </MirrorFrame>
        <You t={t} x={600} y={1460} scale={5.6} pose={P.stand} expr={t > walkIn + 1 ? 'shock' : 'worried'} look={[0.8, -0.6]} />
      </Cam>
      <Badge t={t} t0={0.4} x={1600} y={140} text="−1:04" size={50} color={C.cyan} icon="◷" />
    </Sh>
  );
};

export const E6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.1)}>
        <MirrorFrame id="mE6">
          <g filter="url(#pastTint)">{bathYou(t + 3, 0)}</g>
          <rect x={590} y={140} width={740} height={580} fill="url(#scan)" opacity={0.7} />
          <circle cx={650} cy={200} r={14} fill={C.red} opacity={Math.abs(Math.sin(t * 3))} />
          <text x={675} y={212} fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>REC</text>
          <rect x={620} y={670} width={680} height={10} rx={5} fill="rgba(255,255,255,0.35)" />
          <rect x={620} y={670} width={680 * (0.6 + t * 0.03)} height={10} rx={5} fill={C.red} />
          <circle cx={620 + 680 * (0.6 + t * 0.03)} cy={675} r={14} fill={C.red} />
        </MirrorFrame>
      </Cam>
    </Sh>
  );
};

/* ================= F — day 10 sunlight, viral ================= */
export const F2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const beam = clamp01((t - 0.6) / (d * 0.75));
  const secs = Math.min(500, beam * 500);
  return (
    <Sh tone="cool">
      <Space t={t} />
      <Sun x={260} y={540} r={170} t={t} />
      <Earth x={1660} y={560} r={80} />
      <line x1={440} y1={540} x2={440 + (1570 - 440) * beam} y2={540 + 20 * beam} stroke="#ffe58a" strokeWidth={10} strokeLinecap="round" />
      <circle cx={440 + (1570 - 440) * beam} cy={540 + 20 * beam} r={46} fill="#ffe58a" opacity={0.5} filter="url(#glowF)" />
      <Badge t={t} t0={0.6} x={960} y={360} text={`${Math.floor(secs / 60)} min ${String(Math.floor(secs % 60)).padStart(2, '0')} s`} size={60} color={C.gold} icon="⏱" />
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Sun–Earth light travel time ≈ 8 min 20 s</text>
    </Sh>
  );
};

export const F3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const youK = tw(t, fr('f03', 0.55), fr('f03', 0.7), 0, 1);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <rect x={0} y={0} width={1920} height={1080} fill="#ffcf8a" />
        <Sun x={1600} y={200} r={110} t={t} />
        <rect x={0} y={760} width={1920} height={320} fill="#6b4a3a" />
        {[0, 1, 2, 3].map((i) => <Kid key={i} i={i} t={t} x={260 + i * 230} y={860} scale={2.2} pose={i % 2 ? P.point : P.stand} expr="neutral" look={[0.9, -0.9]} />)}
        <Neon t={t} t0={0.8} x={1100} y={300} text="8 min old" col={C.gold} ax={1480} ay={220} size={48} />
        <g opacity={youK}>
          <g filter="url(#pastTint)"><You t={t} x={1450} scale={2.6} pose={P.stand} expr="neutral" look={[0.4, -0.6]} /></g>
          <LagTag x={1450} y={330} ms={512000} col={C.red} />
        </g>
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill={C.cyan} opacity={0.12 * youK} />
    </Sh>
  );
};

export const F4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const views = Math.min(10_000_000, Math.exp(tw(t, 0.5, d * 0.8, Math.log(120), Math.log(10_000_000), ease.in)));
  return (
    <Sh tone="cool">
      <Backdrop a="#2a2f5c" b="#0b0c18" />
      <ViralPhone x={960} y={560} s={1.15} t={t} views={views}>
        <g transform="translate(0 -150) scale(0.42)">
          <rect x={-450} y={-360} width={900} height={720} fill="#a9c6e8" />
          <g filter="url(#pastTint)"><You t={t} x={0} y={300} scale={2.4} pose={P.stand} expr="neutral" /></g>
          <Spinner x={0} y={-120} t={t} r={60} />
        </g>
      </ViralPhone>
      {[0, 1, 2, 3, 4].map((i) => {
        const t0 = 1 + i * 0.6;
        const k = pop(t, t0, 0.4);
        return k > 0 ? <text key={i} x={1320 + (i % 2) * 120} y={700 - (t - t0) * 120} fontSize={60} opacity={1 - clamp01((t - t0) / 2)}>{['❤️', '😳', '🔥', '❤️', '🤯'][i]}</text> : null;
      })}
    </Sh>
  );
};

export const F5a: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Hospital t={t} />
        <You t={t} x={960} scale={2.5} pose={P.stand} expr="worried" look={[0, -0.2]} />
        {[[420, 'Doc'], [1500, 'Doc'], [650, 'p'], [1270, 'p']].map(([x, k], i) => (k === 'Doc'
          ? <Doc key={i} t={t} x={x as number} scale={2.5} facing={(x as number) > 960 ? -1 : 1} pose={P.phone} expr="squint" />
          : <Kid key={i} i={i + 2} t={t} x={x as number} y={860} scale={2.2} facing={(x as number) > 960 ? -1 : 1} pose={P.phone} expr="shock" mouth="o" />))}
        {[...Array(6)].map((_, i) => { const ph = (t * 1.7 + i * 0.37) % 1; return ph < 0.12 ? <circle key={i} cx={420 + (i * 233) % 1100} cy={430 + (i * 71) % 200} r={70} fill="#fff" opacity={0.8 * (1 - ph / 0.12)} filter="url(#glowF)" /> : null; })}
      </Cam>
    </Sh>
  );
};

export const F5b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="cool">
      <KidRoom t={t} v="dawn" bed={false} />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fx={450} fy={420}>
        <rect x={0} y={0} width={1920} height={1080} fill="none" />
        <You t={t} x={760} y={1300} scale={4.4} facing={-1} pose={P.stand} expr="sad" look={[-0.9, -0.5]} rim="rgba(255,180,140,0.9)" />
      </Cam>
      <Kinetic t={t} t0={d * 0.62} x={960} y={980} text="Just one second of NOW." col="#fff" size={58} />
    </Sh>
  );
};
