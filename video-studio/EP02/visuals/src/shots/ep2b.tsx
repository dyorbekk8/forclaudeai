import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag, Grade } from '../lib/ui';
import { P, walkPose } from '../lib/Character';
import { Hallway, Stairs, Backdrop } from '../sets/Sets';
import { Street, Fire, Bedroom } from '../sets/Sets2';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { kgAt } from '../lib/strength';
import { Kid, Heart } from './common';
import { Theo, Kyle, Dad, Patel, COL } from './cast';

const Sh: React.FC<{ tone?: any; children: React.ReactNode }> = ({ tone, children }) => (<><Stage>{children}</Stage><Grade tone={tone} /></>);

/* ================= ACT E — Kyle ================= */
export const E1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.1, 1.2)} fx={1100}>
        <Hallway t={t} blur />
        <Kyle t={t} x={1150} scale={2.6} facing={-1} pose={P.pockets} expr="angry" mouth="flat" look={[1, 0]} rim="rgba(160,200,255,0.8)" />
      </Cam>
      <BigText t={t} t0={2.0} x={560} y={200} text="THE ONLY DOUBTER LEFT" size={64} color="#fff" />
    </Sh>
  );
};

export const E2: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={1.02}>
        <Street t={t} v="dusk" px={-t * 40} blur />
        <Theo t={t} x={300 + t * 160} scale={2.4} pose={walkPose(t * 1.5)} expr="neutral" look={[1, 0]} />
      </Cam>
      <Tag t={t} text="7:30 AM" icon="☀" />
    </Sh>
  );
};

export const E3: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.15, 1.25)} fy={560}>
        <Hallway t={t} blur />
        <Theo t={t} x={760} scale={2.4} pose={P.point} expr="squint" talking={talk('e03')} mouth="flat" look={[1, 0]} />
        <Kyle t={t} x={1180} scale={2.6} facing={-1} pose={P.pockets} expr="smug" talking={talk('e04')} mouth="flat" look={[1, 0.2]} />
      </Cam>
      <Bubble t={t} t0={s('e03')} t1={s('e04')} x={700} y={300} text="Say it." size={46} />
      <Bubble t={t} t0={s('e04')} x={1200} y={290} text="You can't." size={46} />
    </Sh>
  );
};

export const E4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [0.8, 0], [1.6, 200], [d, 210]], ease.out);
  return (
    <Sh tone="cool">
      <Cam z={1.05}>
        <Hallway t={t} blur />
        <Kyle t={t} x={1350} scale={2.6} facing={-1} pose={P.pockets} expr="squint" mouth="flat" look={[1, -0.3]} />
        {/* Theo lifts a whole row of lockers */}
        <g transform={`translate(780 ${830 - lift})`}><rect x={-240} y={-520} width={480} height={520} fill="#3d6fd6" />{[0, 1, 2, 3].map((i) => <rect key={i} x={-230 + i * 118} y={-510} width={110} height={500} rx={4} fill="#4b80ea" />)}</g>
        <Theo t={t} x={780} scale={2.3} pose={lift > 60 ? P.armsUp : P.hold} expr="smug" mouth="grin" look={[0, -1]} />
      </Cam>
      <BigText t={t} t0={2.0} x={960} y={150} text="THE WEIRDEST FRIENDSHIP" size={72} color="#fff" />
    </Sh>
  );
};

export const E5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#f2e3c8" b="#b98a5a" />
      <rect x={300} y={700} width={1320} height={40} rx={10} fill="#a8683f" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Theo t={t} x={760} y={1000} scale={2.4} pose={P.sitTable} expr="squint" mouth="flat" look={[0.4, 0.8]} />
        <Kyle t={t} x={1200} y={1000} scale={2.5} facing={-1} pose={P.chin} expr="smug" mouth="smirk" look={[1, 0.4]} />
        <g transform="translate(900 690) rotate(-4)"><rect x={-110} y={-70} width={220} height={140} fill="#fff" /><text x={0} y={-30} textAnchor="middle" fontSize={22} fontWeight={800} fill="#333" fontFamily={FONT_BODY}>KYLE — HW #7</text>{[0, 1, 2].map((i) => <rect key={i} x={-90} y={-10 + i * 22} width={180} height={6} fill="#9aa" />)}</g>
      </Cam>
      <BigText t={t} t0={1.8} x={960} y={190} text="(keep hating me)" size={60} color={C.ink} stroke="#fff" />
    </Sh>
  );
};

export const E6: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const wk = Math.min(4, 1 + Math.floor(Math.max(0, t - 0.4) / 0.6));
  return (
    <Sh tone="cool">
      <Cam z={1.04}>
        <Hallway t={t} px={-t * 30} blur />
        <Theo t={t} x={600} scale={2.4} pose={walkPose(t * 1.3)} expr="neutral" />
        <Kyle t={t} x={1450} scale={2.6} facing={-1} pose={P.pockets} expr="neutral" mouth="flat" look={[1, 0]} />
      </Cam>
      <Tag t={t} text={`WEEK ${wk}`} icon="◷" />
    </Sh>
  );
};

export const E7a: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const step = tw(t, 0, d, 0, 1.1, ease.lin);
  return (
    <Sh tone="warm">
      <Cam z={1.2} fx={760 + step * 150} fy={520 - step * 70}>
        <Stairs t={t} />
        <Patel t={t} x={420 + step * 150} y={880 - step * 70} scale={2.3} pose={walkPose(t * 0.7, 0.5)} expr="happy" mouth="smile" />
        <Theo t={t} x={620 + step * 150} y={880 - step * 70 - 70} scale={2.3} pose={{ ...walkPose(t * 0.7, 0.5), lsh: 60, lel: 40, rsh: 60, rel: 40 }} expr="happy" mouth="smile" />
        <g transform={`translate(${680 + step * 150} ${700 - step * 70})`}><rect x={-30} y={-60} width={60} height={70} rx={6} fill="#c9a46a" /><rect x={-34} y={-70} width={68} height={14} rx={4} fill="#a8804a" /><circle cx={-10} cy={-70} r={10} fill="#7bc46b" /><circle cx={12} cy={-74} r={9} fill="#e8615a" /></g>
      </Cam>
      <Badge t={t} t0={0.4} x={1500} y={160} text="4 floors" size={40} icon="▲" />
      <Kyle t={t} x={1820} y={1080} scale={2.2} facing={-1} pose={P.pockets} expr="soft" look={[1, -0.5]} />
    </Sh>
  );
};

export const E7b: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const fixed = t > 1.6;
  const sw = fixed ? Math.sin(t * 2.5) * 22 : 0;
  return (
    <Sh tone="warm">
      <Cam z={1.04}>
        <Street t={t} v="day" blur />
        <g transform="translate(1060 380)">
          <path d="M -200 0 L 200 0 M -200 0 L -260 450 M 200 0 L 260 450" stroke="#8a5a3a" strokeWidth={22} strokeLinecap="round" />
          <g transform={`rotate(${sw} 0 0)`}>
            <path d={fixed ? 'M -40 0 L -40 300 M 40 0 L 40 300' : 'M -40 0 L -40 300 M 40 0 L 60 140'} stroke="#555" strokeWidth={6} />
            <rect x={-60} y={296} width={120} height={18} rx={6} fill={C.red} transform={fixed ? '' : 'rotate(20 0 305)'} />
          </g>
        </g>
        <Kid i={1} t={t} x={1060 + Math.sin(sw / 22) * 0} y={fixed ? 760 : 830} scale={fixed ? 1.4 : 1.6} pose={fixed ? P.sit : P.stand} expr={fixed ? 'happy' : 'sad'} mouth={fixed ? 'grin' : 'frown'} />
        <Theo t={t} x={720} scale={2.3} pose={fixed ? P.wave : P.reach} expr="happy" mouth="smile" look={[1, -0.3]} />
        <Kyle t={t} x={1640} scale={2.5} facing={-1} pose={P.pockets} expr="soft" mouth="none" look={[1, 0]} />
      </Cam>
    </Sh>
  );
};

export const E8: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const open = t > s('e08') + 2.0;
  return (
    <Sh tone="cool">
      <Backdrop a="#9fb3d6" b="#2a3550" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={460}>
        <Kyle t={t} x={960} y={1620} scale={6.0} expr={open ? 'sad' : 'neutral'} mouth={open ? 'o' : 'flat'} look={[-0.3, 0.2]} />
      </Cam>
    </Sh>
  );
};

export const E9: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="cool">
      <Backdrop a="#9fb3d6" b="#2a3550" />
      <Cam z={tw(t, 0, d, 1.12, 1.18)} fy={460}>
        <Kyle t={t} x={960} y={1620} scale={6.0} expr="soft" mouth="smile" talking={talk('e09')} look={[-0.3, 0.2]} />
      </Cam>
      <Bubble t={t} t0={0.1} x={1450} y={330} text={"I can't say it\nanymore, man."} size={42} tail="left" />
    </Sh>
  );
};

export const E10: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#3a2a4a" b="#0c0814" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fy={470}>
        <Theo t={t} x={960} y={1580} scale={6.0} expr="sad" mouth="frown" look={[0.2, 0.4]} rim="rgba(200,160,255,0.7)" />
      </Cam>
      <BigText t={t} t0={1.4} x={960} y={950} text="HE BELIEVES IN YOU." size={70} color="#fff" />
    </Sh>
  );
};

/* ================= ACT F — the fire ================= */
export const F1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="fire">
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Street t={t} v="fire" gym />
        <Fire t={t} x={960} y={600} w={460} h={360} />
        <rect x={0} y={0} width={1920} height={1080} fill={Math.sin(t * 8) > 0 ? '#ff2a2a' : '#2a5aff'} opacity={0.06} />
      </Cam>
      <Tag t={t} text="TUESDAY · 9:14 PM" icon="⚠" color={C.red} />
    </Sh>
  );
};

export const F2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const fall = kf(t, [[0, -400], [s('f02') + 0.4, -400], [s('f02') + 0.9, 0]], ease.in);
  const landed = fall > -5;
  return (
    <Sh tone="fire">
      <Backdrop a="#5a2a1a" b="#140806" />
      <Cam z={landed ? 1.06 : 1.0}>
        <rect x={700} y={380} width={520} height={500} fill="#1a0e0a" stroke="#3a2016" strokeWidth={20} />
        <text x={960} y={360} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffcf7a" fontFamily={FONT_HEAD}>EXIT</text>
        <Dad t={t} x={960} y={880} scale={2.2} pose={P.handsHead} expr="shock" mouth="open" sweat />
        <g transform={`translate(960 ${640 + fall}) rotate(${landed ? -8 : -30})`}><rect x={-520} y={-40} width={1040} height={80} rx={10} fill="#5a3b28" /><rect x={-520} y={-40} width={1040} height={18} fill="#7a5238" /></g>
        <Fire t={t} x={420} y={900} w={300} h={260} />
        <Fire t={t} x={1500} y={900} w={300} h={300} />
      </Cam>
      {landed && <BigText t={t} t0={s('f02') + 0.9} x={960} y={160} text="DAD IS INSIDE." size={84} color="#fff" />}
    </Sh>
  );
};

export const F3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="fire">
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Street t={t} v="fire" gym blur />
        <Fire t={t} x={960} y={600} w={460} h={360} k={0.7} />
        {[...Array(9)].map((_, i) => <Kid key={i} i={i} t={t} x={120 + i * 210} y={1000} scale={2.2} facing={i > 4 ? -1 : 1} pose={P.relaxed} expr="worried" look={[0, -0.6]} />)}
      </Cam>
    </Sh>
  );
};

export const F4: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="fire">
      <Cam z={1.08}>
        <Street t={t} v="fire" gym blur />
        {[...Array(9)].map((_, i) => <Kid key={i} i={i} t={t} x={120 + i * 210} y={1000} scale={2.2} facing={i > 4 ? -1 : 1} pose={i % 2 ? P.cheer : P.wave} expr="happy" mouth="open" bob={-Math.abs(Math.sin(t * 8 + i)) * 8} />)}
        {[...Array(6)].map((_, i) => <Heart key={'h' + i} x={300 + i * 260} y={420 - ((t * 80 + i * 50) % 220)} s={2} op={0.9} />)}
      </Cam>
      <BigText t={t} t0={0.1} x={960} y={200} text="YOU CAN DO IT, THEO!" size={90} color="#fff" />
    </Sh>
  );
};

export const F5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const shake = Math.sin(t * 40) * 4;
  return (
    <Sh tone="fire">
      <Backdrop a="#5a2a1a" b="#140806" />
      <Cam z={tw(t, 0, d, 1.05, 1.2)} fy={600}>
        <g transform={`translate(${960 + shake} 330) rotate(-6)`}><rect x={-560} y={-40} width={1120} height={80} rx={10} fill="#5a3b28" /><rect x={-560} y={-40} width={1120} height={16} fill="#7a5238" /></g>
        <Theo t={t} x={960 + shake} y={880} scale={2.6} pose={{ ...P.armsUp, lkn: 30, rkn: 30 }} expr="angry" mouth="open" sweat look={[0, -1]} />
        <Fire t={t} x={300} y={950} w={260} h={240} />
        <Fire t={t} x={1620} y={950} w={260} h={260} />
      </Cam>
    </Sh>
  );
};

export const F6: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  const { kg } = kgAt(gt);
  return (
    <Sh tone="fire">
      <Backdrop a="#3a0c0c" b="#0c0202" />
      <text x={960} y={330} textAnchor="middle" fontSize={44} fontWeight={600} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={8}>CAN LIFT</text>
      <text x={960} y={640} textAnchor="middle" fontSize={300} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>{kg.toLocaleString('en-US')}</text>
      <text x={960} y={740} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>kg</text>
      <circle cx={960} cy={520} r={460 + Math.sin(t * 10) * 10} fill="none" stroke={C.red} strokeWidth={6} opacity={0.4} />
    </Sh>
  );
};

export const F7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="fire">
      <Cam z={tw(t, 0, d, 1.4, 1.6)} fx={1300} fy={760}>
        <Street t={t} v="fire" gym blur />
        {[...Array(5)].map((_, i) => <Kid key={i} i={i} t={t} x={900 + i * 200} y={1000} scale={2.2} facing={-1} pose={P.cheer} expr="happy" mouth="open" />)}
        <Kyle t={t} x={1320} y={1000} scale={2.5} facing={-1} pose={P.pockets} expr="worried" mouth="flat" look={[1, 0]} rim="rgba(255,170,90,0.9)" />
      </Cam>
    </Sh>
  );
};

export const F8: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="fire">
      <Backdrop a="#8a3a1a" b="#1a0806" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={470}>
        <Theo t={t} x={960} y={1580} scale={6.0} expr="sad" mouth="open" talking={talk('f07')} tears={0.7} sweat look={[-0.4, 0]} rim="rgba(255,170,90,0.9)" />
      </Cam>
      <Bubble t={t} t0={0.3} x={1450} y={330} text={"Kyle. Please.\nTell me I can't."} size={42} tail="left" />
    </Sh>
  );
};

export const F9: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="fire">
      <Backdrop a="#8a3a1a" b="#1a0806" />
      <Cam z={tw(t, 0, d, 1.15, 1.0, ease.out)} fy={470}>
        <Kyle t={t} x={960} y={1620} scale={6.0} expr="angry" mouth="open" talking={talk('f08')} tears={tw(t, 0.4, 1.4, 0.2, 1)} look={[0.4, 0]} rim="rgba(255,170,90,0.9)" />
      </Cam>
      <BigText t={t} t0={0.2} x={1500} y={260} text="YOU CAN'T." size={100} color="#fff" />
    </Sh>
  );
};

export const F10: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="fire">
      <Backdrop a="#6a2a14" b="#140604" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fx={980} fy={420}>
        <Kyle t={t} x={960} y={1620} scale={6.0} expr="sad" mouth="frown" tears={1} look={[0.4, 0.2]} rim="rgba(255,170,90,0.9)" />
      </Cam>
      <BigText t={t} t0={1.6} x={960} y={960} text="not a single word." size={64} color="#ffd9c4" />
    </Sh>
  );
};

export const F11: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const k = tw(t, 0, 0.8, 0, 1, ease.out);
  return (
    <Sh tone="fire">
      <Backdrop a="#fff3d6" b="#ff9e5a" />
      {[...Array(24)].map((_, i) => <path key={i} d={`M 960 540 L ${960 + Math.cos(i * 0.26) * 1400 * k} ${540 + Math.sin(i * 0.26) * 1400 * k}`} stroke="#fff" strokeWidth={24} opacity={0.18} />)}
      <BigText t={t} t0={0.1} x={960} y={560} text="WORDS ARE WORDS." size={130} color="#fff" stroke="#c0392b" />
    </Sh>
  );
};

export const F12: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [0.3, 0], [0.9, 380], [d, 400]], ease.out);
  const walk = tw(t, 1.6, d, 0, 1);
  return (
    <Sh tone="fire">
      <Backdrop a="#5a2a1a" b="#140806" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <rect x={700} y={380} width={520} height={500} fill="#1a0e0a" stroke="#3a2016" strokeWidth={20} />
        <Dad t={t} x={960 + walk * 500} y={880} scale={2.2} pose={walk > 0 ? walkPose(t * 1.2) : P.handsHead} expr={walk > 0 ? 'happy' : 'shock'} mouth={walk > 0 ? 'smile' : 'open'} />
        <g transform={`translate(760 ${640 - lift}) rotate(${-8 + lift * 0.02})`}><rect x={-520} y={-40} width={1040} height={80} rx={10} fill="#5a3b28" /></g>
        <Theo t={t} x={560} y={880} scale={2.6} pose={P.armsUp} expr="angry" mouth="grin" look={[0, -1]} rim="rgba(77,255,176,1)" />
        {[...Array(16)].map((_, i) => { const ph = (t * 1.2 + i * 0.07) % 1; return <circle key={i} cx={560 + ((i * 97) % 600) - 300} cy={600 - ph * 400} r={4} fill="#ffcf7a" opacity={1 - ph} />; })}
        <Fire t={t} x={1620} y={950} w={260} h={240} />
      </Cam>
    </Sh>
  );
};

/* ================= ACT G — the curb ================= */
const Curb: React.FC<{ t: number; k?: number }> = ({ t }) => (
  <g>
    <Street t={t} v="dusk" gym blur />
    <rect x={0} y={860} width={1920} height={30} fill="#5a5f6c" />
    {[...Array(6)].map((_, i) => { const ph = (t * 0.2 + i / 6) % 1; return <circle key={i} cx={960 + Math.sin(i) * 60} cy={420 - ph * 400} r={60 + ph * 120} fill="#4a4250" opacity={0.35 * (1 - ph)} />; })}
  </g>
);

export const G1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Curb t={t} />
        <Theo t={t} x={820} y={880} scale={2.4} pose={P.sit} expr="soft" look={[1, 0.2]} />
        <Kyle t={t} x={1120} y={880} scale={2.5} facing={-1} pose={P.sitSlump} expr="sad" look={[1, 0.6]} />
      </Cam>
      <Tag t={t} text="5:52 AM" icon="☀" />
    </Sh>
  );
};

export const G2: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={1.5} fx={1100} fy={560}>
        <Curb t={t} />
        <Theo t={t} x={820} y={880} scale={2.4} pose={P.sit} expr="soft" look={[1, 0.2]} />
        <Kyle t={t} x={1120} y={880} scale={2.5} facing={-1} pose={P.sitSlump} expr="sad" talking={talk('g02')} mouth="flat" look={[1, 0.6]} />
      </Cam>
    </Sh>
  );
};

export const G3: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={1.5} fx={820} fy={560}>
        <Curb t={t} />
        <Theo t={t} x={820} y={880} scale={2.4} pose={P.sit} expr="happy" mouth="smile" talking={talk('g03')} look={[1, 0]} />
        <Kyle t={t} x={1120} y={880} scale={2.5} facing={-1} pose={P.sitSlump} expr="soft" look={[1, 0.2]} />
      </Cam>
      <Bubble t={t} t0={0.6} x={820} y={300} text={"That's the nicest thing anyone's\never said to me."} size={36} />
    </Sh>
  );
};

export const G4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.3, 1.0, ease.soft)}>
        <Curb t={t} />
        <circle cx={1500} cy={520} r={200} fill="#ffe2a8" opacity={0.6} filter="url(#glowF)" />
        <Theo t={t} x={820} y={880} scale={2.4} pose={P.sit} expr="happy" mouth="smile" look={[1, 0]} />
        <Kyle t={t} x={1120} y={880} scale={2.5} facing={-1} pose={{ ...P.sit, rsh: 120, rel: 20 }} expr="happy" mouth="smile" look={[1, 0]} />
      </Cam>
      <BigText t={t} t0={1.6} x={960} y={160} text="brave enough to say you can't." size={58} color="#fff4e0" t1={d - 0.5} />
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={tw(t, d - 0.6, d, 0, 1)} />
    </Sh>
  );
};

/* ================= ACT H — the mirror (cliffhanger) ================= */
export const H1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fx={1050}>
        <Bedroom t={t} />
        <defs><clipPath id="mirC"><rect x={895} y={215} width={410} height={610} rx={20} /></clipPath></defs>
        <g clipPath="url(#mirC)">
          <Theo t={t} x={1130} y={980} scale={2.4} facing={-1} pose={P.relaxed} expr="neutral" look={[1, -0.2]} rim="rgba(160,190,255,0.5)" />
          <rect x={895} y={215} width={410} height={610} fill="#8fb0ff" opacity={0.12} />
        </g>
        <Theo t={t} x={760} y={920} scale={2.7} pose={P.relaxed} expr="neutral" look={[1, -0.2]} rim="rgba(255,207,138,0.7)" />
      </Cam>
    </Sh>
  );
};

export const H2: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#3a4a6a" b="#0c1020" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={470}>
        <Theo t={t} x={960} y={1580} scale={6.0} expr="worried" mouth="flat" look={[0, 0]} rim="rgba(160,190,255,0.7)" />
      </Cam>
    </Sh>
  );
};

export const H3: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#2a3550" b="#05070f" />
      <Cam z={tw(t, 0, d, 1.4, 1.6, ease.in)} fy={600}>
        <Theo t={t} x={960} y={1580} scale={6.0} expr="squint" mouth="flat" talking={talk('h03')} look={[0, 0]} rim="rgba(160,190,255,0.7)" />
      </Cam>
      <BigText t={t} t0={0.2} x={960} y={950} text={'"I can\'t."'} size={90} color="#cfd8ff" />
    </Sh>
  );
};

export const H4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const crack = tw(t, 0.1, 0.7, 0, 1, ease.out);
  const lights = t < 1.6 ? 1 : 0;
  return (
    <Sh tone="night">
      <Cam z={t < 0.7 ? 1.0 + Math.sin(t * 60) * 0.01 : 1.04} fx={1100}>
        <Bedroom t={t} crack={crack} lights={lights} />
        <Theo t={t} x={880} y={900} scale={2.6} pose={P.handsHead} expr="shock" mouth="open" look={[1, -0.2]} rim={lights ? 'rgba(255,207,138,0.7)' : 'rgba(120,150,255,0.5)'} />
      </Cam>
      <g opacity={t > 1.8 ? 0.9 : 0}><text x={1680} y={150} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.mint} fontFamily={FONT_HEAD}>CAN LIFT</text><text x={1680} y={230} textAnchor="middle" fontSize={80} fontWeight={700} fill={Math.sin(t * 30) > 0 ? C.mint : C.red} fontFamily={FONT_HEAD}>???</text></g>
    </Sh>
  );
};

export const H5: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const sub = s('h06') - 0.2, click = sub + 1.4, pressed = t > click;
  return (
    <Sh tone="night">
      <Backdrop a="#1d2550" b="#05070f" />
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Theo t={t} x={760} y={900} scale={2.6} pose={P.cheer} expr="smug" mouth="grin" rim="rgba(77,255,176,0.9)" />
        <Kyle t={t} x={1180} y={900} scale={2.6} facing={-1} pose={P.point} expr="smug" mouth="smirk" />
      </Cam>
      <BigText t={t} t0={0.3} x={960} y={150} text="Strong only when" size={72} color="#fff" />
      <BigText t={t} t0={0.7} x={960} y={250} text="people doubt you?" size={86} color={C.mint} />
      <Badge t={t} t0={1.6} x={960} y={360} text="tell us in the comments" size={40} icon="✎" />
      {t > sub && (
        <g transform={`translate(960 990) scale(${pop(t, sub, 0.5) * (pressed && t < click + 0.15 ? 0.92 : 1)})`}>
          <rect x={-230} y={-55} width={460} height={110} rx={55} fill={pressed ? '#3a3a3a' : '#ff1f3d'} />
          <text x={0} y={18} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{pressed ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</text>
        </g>
      )}
      {t > sub + 0.5 && <g transform={`translate(${kf(t, [[sub + 0.5, 1300], [click, 1010]], ease.out)} ${kf(t, [[sub + 0.5, 1150], [click, 1000]], ease.out)})`}><path d="M 0 0 L 0 48 L 12 36 L 22 58 L 30 54 L 20 32 L 36 32 Z" fill="#fff" stroke="#000" strokeWidth={3} /></g>}
      <Badge t={t} t0={sub + 0.4} x={1600} y={990} text="NEXT: THE WORLD SAYS NO" size={30} color={C.red} />
    </Sh>
  );
};
