import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag } from '../lib/ui';
import { Character, P, mixPose } from '../lib/Character';
import { Kitchen, KitchenTable, Backdrop, Hallway, DataBG } from '../sets/Sets';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, kf, ease, pop, wobble } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';

/* A1 — kitchen wide: "Did you finish your homework?" "Yep." */
export const A1: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  const z = tw(t, 0, d, 1.0, 1.07, ease.soft);
  const yep = t >= s('a02');
  return (
    <Stage>
      <Cam z={z} fx={1150} fy={560}>
        <Kitchen t={t} px={-t * 6} noTable />
        <Character t={t} seed={2} x={760} y={830} scale={2.35} hair="mom" outfit={C.mom} dress pose={talk('a01') ? P.chin : P.stand} talking={talk('a01')} expr="neutral" look={[0.6, 0]} />
        <Character t={t} seed={1} x={1420} y={830} scale={2.35} hair="eli" age={15} facing={-1}
          pose={yep ? mixPose(P.stand, P.give, tw(t, s('a02'), s('a02') + 0.2, 0, 1)) : P.stand}
          expr={yep ? 'smug' : 'neutral'} mouth={yep ? 'smirk' : 'none'} talking={talk('a02')} look={[0.7, 0]} tilt={yep ? -6 : 0} />
        <KitchenTable px={-t * 6} jar="full" />
        {/* cereal bowl */}
        <g transform={`translate(${1330 - t * 6.9} 664)`}><path d="M -50 0 Q 0 60 50 0 Z" fill="#fff" stroke="#d9d2c4" strokeWidth={3} /><ellipse cx={0} cy={0} rx={50} ry={10} fill="#f4c35a" /></g>
      </Cam>
      <Tag t={t} t0={0.2} text="7:42 AM" icon="☀" />
    </Stage>
  );
};

/* A2 — close-up, the first POP */
export const A2: ShotFC = ({ o, d }) => {
  const { t, s, e } = useShot(o);
  const popT = e('a03') - 0.42;
  const after = t >= popT;
  const z = after ? 1.18 : tw(t, 0, popT, 1.0, 1.12, ease.in);
  return (
    <Stage>
      <Backdrop a="#ffe3b8" b="#e09a5c" />
      <Cam z={z} fy={480}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={after ? 16 : 15} pose={P.stand}
          expr={after ? 'shock' : t > 0.9 ? 'worried' : 'neutral'} mouth={after ? 'o' : 'flat'} look={after ? [0, -0.3] : [0.1, 0.2]} />
      </Cam>
      {after && <BigText t={t} t0={popT} x={1420} y={300} text="POP!" size={130} color={C.gold} />}
    </Stage>
  );
};

/* A3 — hoodie gets tighter, voice drops */
export const A3: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const squeeze = pop(t, 0.15, 0.5);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.25, 1.32)} fy={520}>
        <Kitchen t={t} noTable />
        <Character t={t} seed={1} x={960} y={830} scale={2.6} height={1 + 0.05 * squeeze} hair="eli" age={16} pose={P.handsHead}
          expr="shock" mouth="open" look={[0, 0.6]} />
        {/* tight hoodie strain lines */}
        {[-1, 1].map((k) => <path key={k} d={`M ${960 + k * 62} 520 l ${k * 26} -10 M ${960 + k * 64} 550 l ${k * 30} 0 M ${960 + k * 62} 580 l ${k * 26} 10`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={squeeze} />)}
      </Cam>
      <Bubble t={t} t0={s('a04') + 1.2} x={1340} y={300} text={'ahem... ♪↓'} size={40} tail="left" italic />
    </Stage>
  );
};

/* A4 — extreme close-up: one hair on the chin */
export const A4: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const grow = tw(t, 1.3, 2.4, 0, 1, ease.out);
  return (
    <Stage>
      <Backdrop a="#fff0d6" b="#e7b07a" />
      <Cam z={tw(t, 0, d, 1.25, 1.38)} fx={1000} fy={880}>
        <Character t={t} seed={3} x={980} y={2450} scale={10.5} hair="eli" age={16} expr="worried" look={[-0.1, 1]} />
        {/* the hair */}
        <path d={`M 1010 ${955} q ${14 * grow} ${50 * grow} ${-6 * grow} ${105 * grow}`} stroke="#4a4a56" strokeWidth={10} strokeLinecap="round" fill="none" />
        {grow > 0.95 && [0, 1, 2].map((i) => {
          const k = tw(t, 2.4 + i * 0.07, 2.9 + i * 0.07, 0, 1, ease.out);
          return <path key={i} d={`M ${1040 + i * 18} ${990 - i * 26} l ${20 * k} ${-12 * k}`} stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={1 - k * 0.6} />;
        })}
      </Cam>
      <Badge t={t} t0={2.5} x={1400} y={980} text="wasn't there a second ago" size={34} />
    </Stage>
  );
};

/* A5 — 15 -> 16 */
export const A5: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const flip = s('a07') + 0.55;
  const k = pop(t, flip, 0.5);
  return (
    <Stage>
      <Backdrop a="#2b2f63" b="#0d1433" />
      <Cam z={tw(t, 0, d, 1, 1.05)}>
        <Character t={t} seed={1} x={560} y={930} scale={3.0} hair="eli" age={16} pose={P.relaxed} expr={t > flip ? 'shock' : 'worried'} mouth={t > flip ? 'o' : 'flat'} look={[1, -0.2]} rim="rgba(120,160,255,0.7)" />
        <g transform={`translate(1240 560)`}>
          <text x={0} y={60} textAnchor="middle" fontSize={300} fontWeight={700} fontFamily={FONT_HEAD} fill="#fff" opacity={1 - k}
            transform={`translate(0 ${-k * 80}) scale(${1 - 0.3 * k})`}>15</text>
          {t > flip && <text x={0} y={60} textAnchor="middle" fontSize={300} fontWeight={700} fontFamily={FONT_HEAD} fill={C.gold} transform={`scale(${0.6 + 0.4 * k})`} opacity={Math.min(1, k * 2)}>16</text>}
          <text x={0} y={170} textAnchor="middle" fontSize={40} fontWeight={600} fontFamily={FONT_HEAD} fill={C.gray} letterSpacing={6}>YEARS OLD</text>
        </g>
      </Cam>
    </Stage>
  );
};

/* A6a — premise title */
export const A6a: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#1d2550" b="#070b1d" />
      {/* spotlight */}
      <path d="M 860 0 L 1060 0 L 1300 900 L 620 900 Z" fill="#fff6d0" opacity={0.08} />
      <ellipse cx={960} cy={900} rx={340} ry={40} fill="#fff6d0" opacity={0.12} />
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Character t={t} seed={1} x={960} y={900} scale={2.6} hair="eli" age={16} pose={P.pockets} expr="worried" look={[0, -0.6]} rim="rgba(255,230,170,0.7)" />
      </Cam>
      <BigText t={t} t0={0.25} x={960} y={150} text="EVERY LIE" size={120} color="#fff" />
      <BigText t={t} t0={1.4} x={960} y={300} text="= +1 YEAR" size={150} color={C.gold} />
    </Stage>
  );
};

/* A6b — mind vs body */
export const A6b: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const panel = (x: number, t0: number, title: string, val: string, col: string, icon: React.ReactNode) => {
    const k = pop(t, t0, 0.5);
    return (
      <g transform={`translate(${x} 540) scale(${k})`} opacity={Math.min(1, k * 2)}>
        <rect x={-330} y={-300} width={660} height={600} rx={46} fill="rgba(255,255,255,0.06)" stroke={col} strokeWidth={4} />
        {icon}
        <text x={0} y={150} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={4}>{title}</text>
        <text x={0} y={240} textAnchor="middle" fontSize={72} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{val}</text>
      </g>
    );
  };
  const brain = (
    <g transform="translate(0 -90)">
      <path d="M -110 0 C -140 -90 -40 -140 0 -100 C 40 -140 140 -90 110 0 C 140 70 50 120 0 90 C -50 120 -140 70 -110 0 Z" fill="#ff9fb8" stroke="#fff" strokeWidth={6} />
      <path d="M 0 -100 L 0 90 M -60 -40 q 30 20 0 50 M 60 -40 q -30 20 0 50" stroke="#e86b8c" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
  const body = (
    <g transform="translate(0 -60) scale(0.95)">
      <Character t={t} x={0} y={120} scale={1.05} hair="eli" age={16} pose={P.stand} />
    </g>
  );
  return (
    <Stage>
      <DataBG t={t + o} />
      {panel(560, 0.15, 'MIND', 'stays 15', C.mint, brain)}
      {panel(1360, s('b02') + 1.05, 'BODY', '+1 YEAR', C.red, body)}
      {t > s('b02') + 1.9 && <BigText t={t} t0={s('b02') + 1.9} x={960} y={960} text="INSTANTLY." size={80} color="#fff" />}
    </Stage>
  );
};

/* A6c — it never goes back */
export const A6c: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const rot = kf(t, [[0, 0], [0.5, 180], [0.9, 160], [1.2, 180]], ease.out);
  const x = pop(t, 0.6, 0.4);
  return (
    <Stage>
      <DataBG t={t + o} tint="#ff4d5e" />
      <g transform={`translate(960 500) rotate(${rot})`}>
        <path d="M -120 -180 L 120 -180 L 20 0 L 120 180 L -120 180 L -20 0 Z" fill="none" stroke="#fff" strokeWidth={14} strokeLinejoin="round" />
        <path d={`M -80 ${rot > 90 ? -160 : 160} L 80 ${rot > 90 ? -160 : 160} L 0 ${rot > 90 ? -40 : 40} Z`} fill={C.gold} />
      </g>
      <g transform={`translate(960 500) scale(${x})`} opacity={Math.min(1, x * 2)}>
        <path d="M -230 -230 L 230 230 M 230 -230 L -230 230" stroke={C.red} strokeWidth={38} strokeLinecap="round" />
      </g>
      <BigText t={t} t0={0.7} x={960} y={900} text="NO TAKE-BACKS" size={84} color="#fff" />
    </Stage>
  );
};

/* B1 — "That sounds easy to avoid. Until you do the math." */
export const B1: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const until = s('b04') + 1.55;
  const drop = tw(t, until, until + 0.35, -700, 0, ease.in);
  const landed = t > until + 0.35;
  return (
    <Stage>
      <Cam z={landed ? 1.04 + Math.max(0, 0.03 - (t - until - 0.35) * 0.1) : 1} fy={560}>
        <Hallway t={t} px={0} />
        <Character t={t} seed={1} x={760} y={830} scale={2.6} hair="eli" age={16} pose={landed ? P.handsHead : P.shrug}
          expr={landed ? 'shock' : 'smug'} mouth={landed ? 'open' : 'smile'} look={landed ? [0.8, -0.4] : [0.2, 0]} />
        {/* giant calculator */}
        <g transform={`translate(1250 ${560 + drop}) rotate(${landed ? -4 : 0})`}>
          <rect x={-170} y={-260} width={340} height={520} rx={36} fill="#3b3f4c" stroke="#1f222b" strokeWidth={8} />
          <rect x={-130} y={-220} width={260} height={110} rx={14} fill="#bfe8c4" />
          <text x={115} y={-140} textAnchor="end" fontSize={66} fontFamily={FONT_HEAD} fontWeight={700} fill="#1f3a26">1.65 × 365</text>
          {[...Array(12)].map((_, i) => <rect key={i} x={-130 + (i % 3) * 92} y={-80 + Math.floor(i / 3) * 82} width={76} height={64} rx={14} fill={i % 3 === 2 ? C.gold : '#5a6070'} />)}
        </g>
      </Cam>
      {landed && <Badge t={t} t0={until + 0.45} x={1250} y={950} text="do the math" size={36} />}
    </Stage>
  );
};

/* B7 — "So the rule is simple. Be one of the six." */
export const B7: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const nod = t > s('b11') + 1.2;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.02, 1.1)} fy={520}>
        <Hallway t={t} px={-t * 10} />
        <Character t={t} seed={1} x={960} y={830} scale={2.7} hair="eli" age={16} pose={nod ? P.cheer : P.stand} expr={nod ? 'happy' : 'neutral'} mouth={nod ? 'grin' : 'flat'} look={[0, 0]} bob={nod ? -Math.abs(Math.sin((t - s('b11')) * 9)) * 6 : 0} />
      </Cam>
      <g>
        <rect x={420} y={70} width={1080} height={140} rx={30} fill="rgba(10,12,22,0.86)" opacity={tw(t, 0.2, 0.5, 0, 1)} />
        <BigText t={t} t0={0.25} x={960} y={140} text="RULE: BE ONE OF THE SIX" size={64} color={C.mint} stroke="transparent" />
      </g>
    </Stage>
  );
};
