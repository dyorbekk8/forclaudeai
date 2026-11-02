import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag, Stamp } from '../lib/ui';
import { Character, P, walkPose, mixPose } from '../lib/Character';
import { Hallway, Classroom, Desk, Dining, Backdrop } from '../sets/Sets';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Kid, Phone, Heart } from './common';

/* C1 — Day one. Sam just got a haircut. */
export const C1: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const walk = tw(t, 0, 1.6, 0, 1, ease.out);
  const ex = 300 + walk * 520;
  const turn = s('c01') + 1.5;
  const turned = t > turn;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1, 1.08)} fx={1100} fy={560}>
        <Hallway t={t} px={-walk * 120} />
        <Kid i={2} t={t} x={1700} y={830} scale={2.2} facing={-1} />
        <Character t={t} seed={1} x={ex} y={830} scale={2.5} hair="eli" age={16} pose={walk < 1 ? walkPose(t * 1.6) : P.stand} expr={turned ? 'shock' : 'neutral'} mouth={turned ? 'o' : 'none'} look={[1, 0]} />
        <Character t={t} seed={4} x={1240} y={830} scale={2.5} hair="samcut" outfit={C.sam} facing={turned ? -1 : 1} pose={turned ? P.wave : P.stand} expr={turned ? 'happy' : 'neutral'} mouth={turned ? 'grin' : 'none'} />
        {turned && [0, 1, 2, 3].map((i) => {
          const k = pop(t, turn + 0.1 + i * 0.06, 0.4);
          return <path key={i} d={`M ${1240 + Math.cos(i * 1.6) * 120} ${360 + Math.sin(i * 1.6) * 60} l 0 -24 m -12 12 l 24 0`} stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={k} transform={`rotate(${t * 40} ${1240} ${360})`} />;
        })}
      </Cam>
      <Tag t={t} text="DAY 1" icon="①" />
    </Stage>
  );
};

/* C2 — Sam: "Be honest. Is it good?" */
export const C2: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#8fb0ff" b="#3d5fc4" />
      <Cam z={tw(t, 0, d, 1, 1.07)} fy={460}>
        <Character t={t} seed={4} x={960} y={1500} scale={4.6} hair="samcut" outfit={C.sam} pose={P.stand} expr="happy" mouth={talk('c02') ? undefined : 'grin'} talking={talk('c02')} blush tilt={kf(t, [[0, 0], [0.6, -8], [1.4, 6], [2, -4]])} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${960 + Math.cos(i * 1.3 + t) * 260} ${220 + Math.sin(i * 1.3 + t) * 80} l 0 -30 m -15 15 l 30 0`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
        ))}
      </Cam>
    </Stage>
  );
};

/* C3 — Eli: "It looks like... a decision." Sam deflates. */
export const C3: ShotFC = ({ o, d }) => {
  const { t, s, e, talk } = useShot(o);
  const hit = e('c03') - 0.1;
  const after = t > hit;
  return (
    <Stage>
      <Cam z={after ? 1.12 : tw(t, 0, hit, 1.0, 1.06)} fx={960} fy={500}>
        <Hallway t={t} />
        <Character t={t} seed={1} x={700} y={830} scale={2.7} hair="eli" age={16} pose={after ? P.shrug : P.chin} expr={after ? 'worried' : 'squint'} talking={talk('c03')} mouth="flat" look={[1, 0]} />
        <Character t={t} seed={4} x={1220} y={830 + (after ? 8 : 0)} scale={2.7} hair="samcut" outfit={C.sam} facing={-1}
          pose={after ? P.hunch : P.stand} expr={after ? 'sad' : 'happy'} mouth={after ? 'frown' : 'grin'} look={[0.9, after ? 0.5 : 0]} />
      </Cam>
      <Bubble t={t} t0={s('c03') + 0.1} t1={d - 0.05} x={700} y={300} text={'It looks like...\na decision.'} size={40} tail="right" />
      {after && <BigText t={t} t0={hit + 0.05} x={1300} y={240} text="oof." size={84} color="#fff" />}
    </Stage>
  );
};

/* C4 — teacher: did you read chapter four? */
export const C4: ShotFC = ({ o, d }) => {
  const { t, s, e } = useShot(o);
  const no = s('c04') + 2.4;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fx={1000}>
        <Classroom t={t} />
        <Character t={t} seed={7} x={300} y={830} scale={2.5} hair="teacher" outfit={C.teacher} dress pose={P.point} expr="smug" mouth={t < no ? 'flat' : 'smirk'} look={[0.8, 0.2]} />
        <Kid i={3} t={t} x={820} y={830} scale={2.0} pose={P.sitTable} look={[1, 0]} />
        <Desk x={870} />
        <Character t={t} seed={1} x={1300} y={830} scale={2.1} hair="eli" age={16} facing={-1} pose={P.sitTable} expr={t > no ? 'worried' : 'neutral'} mouth="flat" look={[1, 0]} tilt={t > no ? Math.sin((t - no) * 14) * 7 * Math.max(0, 1 - (t - no)) : 0} />
        <Desk x={1250} />
        <Kid i={5} t={t} x={1650} y={830} scale={2.0} facing={-1} pose={P.sitTable} look={[1, 0]} />
        <Desk x={1600} />
      </Cam>
      {t > no && <Bubble t={t} t0={no} x={1300} y={330} text="No." size={48} tail="down" />}
    </Stage>
  );
};

/* C5 — DETENTION */
export const C5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.15, 1.22)} fx={1100} fy={600}>
        <Classroom t={t} board="DETENTION" />
        <Character t={t} seed={1} x={1100} y={830} scale={2.5} hair="eli" age={16} facing={-1} pose={P.sitSlump} expr="sad" mouth="flat" look={[0, 0.6]} />
        <Desk x={1060} s={1.15} />
      </Cam>
      <Stamp t={t} t0={0.12} x={600} y={330} text="DETENTION" size={100} />
    </Stage>
  );
};

/* C6 — meatloaf: "not that hungry" */
export const C6: ShotFC = ({ o, d }) => {
  const { t, s, e } = useShot(o);
  const twist = s('c07') + 1.0;
  return (
    <Stage>
      <Cam z={t < twist ? tw(t, 0, twist, 1.0, 1.05) : 1.6} fx={960} fy={t < twist ? 560 : 640}>
        <Dining t={t} food="meatloaf" v="evening" />
        <Character t={t} seed={2} x={560} y={860} scale={2.4} hair="mom" outfit={C.mom} dress pose={P.give} expr="happy" mouth="grin" look={[0.6, 0.3]} />
        <Character t={t} seed={1} x={1400} y={860} scale={2.4} hair="eli" age={16} facing={-1} pose={P.stand} expr={t > twist ? 'squint' : 'worried'} mouth={t > twist ? 'frown' : 'flat'} look={[0.8, 0.6]} sweat={t > twist} />
      </Cam>
      {t < twist && <Badge t={t} t0={s('c06') + 1.4} x={1400} y={250} text={'"not that hungry"'} size={40} />}
      {t > twist && <Badge t={t} t0={twist + 0.1} x={960} y={950} text="technically true" size={44} color={C.mint} icon="✓" />}
    </Stage>
  );
};

/* C8 — people start trusting you */
export const C8: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const px = -t * 140;
  const turnAt = s('c08') + 1.8;
  return (
    <Stage>
      <Cam z={1.02} fy={560}>
        <Hallway t={t} px={px} />
        {[0, 1, 2, 3, 4].map((i) => {
          const kx = 300 + i * 360 + px * 0.95;
          const turned = t > turnAt + i * 0.12;
          return <Kid key={i} i={i + 1} t={t} x={kx} y={830} scale={2.1} facing={turned ? (kx > 960 ? -1 : 1) : (i % 2 ? 1 : -1)} expr={turned ? 'happy' : 'neutral'} mouth={turned ? 'smile' : 'none'} pose={turned && i % 2 ? P.wave : P.stand} />;
        })}
        <Character t={t} seed={1} x={960} y={830} scale={2.4} hair="eli" age={16} pose={walkPose(t * 1.5)} expr="neutral" look={[1, 0]} />
        {t > turnAt && [0, 1, 2, 3].map((i) => <Heart key={i} x={700 + i * 160 + Math.sin(t * 3 + i) * 20} y={420 - ((t - turnAt) * 80 + i * 30) % 200} s={1.8} op={0.85} />)}
      </Cam>
    </Stage>
  );
};

/* C9 — "Is this text too clingy?" Ask Eli. */
export const C9: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#ffd6e3" b="#e97fa5" />
      <Cam z={tw(t, 0, d, 1, 1.05)}>
        <Phone x={720} y={560} s={1.12} t={t} title="Draft" msgs={[
          { t0: 0.1, text: 'heyyy!!! :)', me: true },
          { t0: 0.35, text: 'did u get my last\n14 messages??', me: true },
          { t0: 0.6, text: 'hello??? :(', me: true },
        ]} />
        <Kid i={4} t={t} x={1300} y={1000} scale={2.6} pose={P.phone} expr="worried" facing={-1} />
      </Cam>
      <BigText t={t} t0={0.9} x={1420} y={250} text="ASK ELI." size={110} color={C.gold} />
    </Stage>
  );
};

/* C10 — "Does this shirt work?" Ask Eli. */
export const C10: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#c9f5d8" b="#43b77a" />
      <Cam z={tw(t, 0, d, 1, 1.06)}>
        <Kid i={6} t={t} x={720} y={960} scale={3.0} pose={P.hold} expr="happy" mouth="grin" />
        {/* the loud shirt */}
        <g transform="translate(840 560) rotate(-6)">
          <path d="M -120 -110 L -40 -130 Q 0 -100 40 -130 L 120 -110 L 170 -40 L 120 -10 L 110 150 L -110 150 L -120 -10 L -170 -40 Z" fill="#ff5ab8" />
          {[...Array(14)].map((_, i) => <circle key={i} cx={-90 + (i % 5) * 45} cy={-80 + Math.floor(i / 5) * 70} r={14} fill={['#ffe14d', '#3be0ff', '#7dff6b'][i % 3]} />)}
          {[...Array(6)].map((_, i) => <path key={i} d={`M ${-95 + i * 38} 120 l 12 -24 l 12 24 z`} fill="#3a1d8c" />)}
        </g>
      </Cam>
      <BigText t={t} t0={0.7} x={1440} y={250} text="ASK ELI." size={110} color={C.gold} />
    </Stage>
  );
};

/* C11 — by Friday: a queue */
export const C11: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const n = Math.round(tw(t, 0.2, 2.3, 0, 127, ease.out));
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.2, 1.0)} fx={500} fy={600}>
        <Hallway t={t} px={0} />
        {[...Array(9)].map((_, i) => <Kid key={i} i={i} t={t} x={560 + i * 170} y={830} scale={1.9} facing={-1} pose={i % 3 === 0 ? P.phone : i % 3 === 1 ? P.hold : P.stand} expr={i % 2 ? 'happy' : 'neutral'} />)}
        <Character t={t} seed={1} x={300} y={830} scale={2.3} hair="eli" age={16} pose={P.shrug} expr="worried" sweat look={[1, 0]} />
      </Cam>
      <Tag t={t} text="FRIDAY" icon="⑤" />
      <g transform="translate(960 70)">
        <rect x={-200} y={0} width={400} height={110} rx={24} fill="rgba(10,12,22,0.86)" />
        <text x={0} y={42} textAnchor="middle" fontSize={26} fontWeight={600} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={2}>OPINIONS REQUESTED</text>
        <text x={0} y={92} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>{n}</text>
      </g>
    </Stage>
  );
};

/* C12 — the only one who can't lie */
export const C12: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const glow = tw(t, 0.4, 1.5, 0, 1);
  return (
    <Stage>
      <Backdrop a="#3b2d6b" b="#0d1433" />
      <circle cx={960} cy={520} r={380} fill="#ffd25a" opacity={0.12 * glow} />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={600}>
        {[...Array(8)].map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x = 960 + Math.cos(a) * 640, y = 900 + Math.sin(a) * 60;
          return <Kid key={i} i={i} t={t} x={x} y={y} scale={1.9} facing={x > 960 ? -1 : 1} expr="happy" mouth="smile" look={[1, -0.2]} />;
        })}
        <Character t={t} seed={1} x={960} y={860} scale={2.8} hair="eli" age={16} pose={P.pockets} expr="soft" mouth="smile" rim="rgba(255,214,90,0.9)" />
      </Cam>
      <BigText t={t} t0={0.8} x={960} y={150} text="THE ONLY ONE WHO CAN'T LIE" size={72} color="#fff" />
    </Stage>
  );
};
