import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag, Stamp, Grade } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, KitchenTable, Hallway, DataBG, Backdrop } from '../sets/Sets';
import { Gym, Barbell, Driveway, Car, Elephant, Street } from '../sets/Sets2';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Person } from './dataviz';
import { Phone, Kid, Heart } from './common';
import { Theo, Kyle, Coach, Sis, Dad, Whistle, COL } from './cast';

const Sh: React.FC<{ tone?: any; children: React.ReactNode }> = ({ tone, children }) => (<><Stage>{children}</Stage><Grade tone={tone} /></>);

/* neon tag with arrow (thumbnail language inside the video) */
const Neon: React.FC<{ t: number; t0: number; x: number; y: number; text: string; col: string; ax: number; ay: number }> = ({ t, t0, x, y, text, col, ax, ay }) => {
  const k = pop(t, t0, 0.5);
  if (k <= 0) return null;
  const w = text.length * 34 + 60;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <path d={`M ${x} ${y + 40} Q ${(x + ax) / 2 + 30} ${(y + ay) / 2} ${ax} ${ay}`} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" />
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <rect x={-w / 2} y={-40} width={w} height={80} rx={20} fill={col} opacity={0.45} filter="url(#glowF)" />
        <rect x={-w / 2} y={-40} width={w} height={80} rx={20} fill="#0c0f16" stroke={col} strokeWidth={6} />
        <text x={0} y={20} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{text}</text>
      </g>
    </g>
  );
};

/* ================= ACT A — cold open ================= */
export const A1: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fx={900}>
        <Gym t={t} blur />
        <Barbell x={960} y={830} />
        <Kyle t={t} x={1420} scale={2.5} facing={-1} pose={talk('a01') ? P.point : P.relaxed} expr="smug" mouth="smirk" talking={talk('a01')} look={[0.8, 0.2]} />
        <Theo t={t} x={620} scale={2.3} pose={P.stand} expr="worried" look={[1, 0.4]} />
      </Cam>
    </Sh>
  );
};

export const A2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.25, 1.35)} fx={820} fy={620}>
        <Gym t={t} blur bar={false} />
        <Barbell x={1000} y={830} />
        <Theo t={t} x={680} scale={2.4} pose={P.stand} expr="worried" sweat look={[1, 0.5]} />
      </Cam>
      <Neon t={t} t0={s('a02') + 1.4} x={1240} y={360} text="40 kg" col={C.red} ax={1100} ay={560} />
      <Neon t={t} t0={s('a02') + 2.8} x={420} y={240} text="45 kg" col={C.cyan} ax={560} ay={330} />
    </Sh>
  );
};

export const A3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const heat = tw(t, 0.6, 2.6, 0, 1);
  return (
    <Sh tone="fire">
      <Backdrop a="#3a1a14" b="#0c0606" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.in)}>
        {/* forearm ECU */}
        <path d="M -100 780 L 1300 520" stroke={COL.theo} strokeWidth={230} strokeLinecap="round" />
        <circle cx={1360} cy={505} r={150} fill="#16161c" />
        <rect x={1180} y={560} width={360} height={70} rx={30} fill="#c8cdd6" transform="rotate(-18 1360 595)" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${200 + i * 260} ${745 - i * 50} q 60 -40 130 -10 t 120 -30`} stroke="#ffb347" strokeWidth={10 * heat} fill="none" strokeLinecap="round" opacity={heat} filter="url(#glowF)" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={'c' + i} d={`M ${200 + i * 260} ${745 - i * 50} q 60 -40 130 -10 t 120 -30`} stroke="#fff3c4" strokeWidth={4 * heat} fill="none" strokeLinecap="round" opacity={heat} />
        ))}
        {[...Array(18)].map((_, i) => {
          const ph = (t * 0.8 + i * 0.13) % 1;
          return <circle key={'p' + i} cx={150 + ((i * 97) % 1100)} cy={760 - ((i * 53) % 260) - ph * 300} r={4 + (i % 3) * 2} fill="#ffcf7a" opacity={heat * (1 - ph)} />;
        })}
      </Cam>
    </Sh>
  );
};

export const A4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [0.5, 0], [1.0, 360], [d, 380]], ease.out);
  const up = lift > 100;
  return (
    <Sh tone="warm">
      <Cam z={up ? 1.08 : 1.0} fx={960}>
        <Gym t={t} blur bar={false} />
        <Barbell x={960} y={830} lift={lift} />
        <Theo t={t} x={960} scale={2.5} pose={up ? P.armsUp : P.hold} expr={up ? 'shock' : 'squint'} mouth={up ? 'o' : 'flat'} look={[0, -0.8]} />
        <Kyle t={t} x={1500} scale={2.5} facing={-1} pose={up ? P.handsHead : P.relaxed} expr={up ? 'shock' : 'smug'} mouth={up ? 'open' : 'smirk'} look={[0.9, -0.4]} />
        {up && [...Array(10)].map((_, i) => { const k = tw(t, 1.0, 1.8, 0, 1); return <circle key={i} cx={960 + Math.cos(i) * 260 * k} cy={830 - Math.abs(Math.sin(i)) * 60 * k} r={18 * (1 - k)} fill="#e8d2b0" opacity={1 - k} />; })}
      </Cam>
      {up && <BigText t={t} t0={1.0} x={960} y={160} text="LIKE PAPER." size={96} color="#fff" />}
    </Sh>
  );
};

export const A5: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#e8c9a0" b="#8a5a3a" />
      <Cam z={tw(t, 0, d, 1.05, 1.15)} fy={460}>
        <Kyle t={t} x={960} y={1580} scale={6.0} pose={P.stand} expr="shock" mouth="open" talking={talk('a05')} look={[0, -0.5]} />
      </Cam>
    </Sh>
  );
};

/* ================= ACT B — premise + Pygmalion ================= */
export const B1: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#1d2550" b="#070b1d" />
      <path d="M 860 0 L 1060 0 L 1300 900 L 620 900 Z" fill="#fff6d0" opacity={0.08} />
      {[...Array(8)].map((_, i) => {
        const k = ((t * 0.6 + i / 8) % 1);
        const a = (i / 8) * Math.PI * 2;
        const r = 700 * (1 - k);
        return (
          <g key={i} transform={`translate(${960 + Math.cos(a) * r} ${560 + Math.sin(a) * r * 0.5})`} opacity={Math.min(1, k * 3) * (1 - k)}>
            <rect x={-90} y={-26} width={180} height={52} rx={26} fill="#fff" />
            <text x={0} y={12} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>you can't</text>
          </g>
        );
      })}
      <circle cx={960} cy={600} r={260 + Math.sin(t * 6) * 10} fill={C.mint} opacity={0.12} filter="url(#glowF)" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Theo t={t} x={960} y={900} scale={2.6} pose={P.cheer} expr="smug" mouth="grin" rim="rgba(77,255,176,0.9)" />
      </Cam>
      <BigText t={t} t0={s('b01') + 2.2} x={960} y={150} text={'EVERY "YOU CAN\'T"'} size={92} color="#fff" />
      <BigText t={t} t0={s('b01') + 4.2} x={960} y={1000} text="= STRONGER" size={110} color={C.mint} />
    </Sh>
  );
};

export const B2: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#13224a" b="#05070f" />
      {[...Array(12)].map((_, i) => <path key={i} d={`M 960 560 L ${960 + Math.cos(i * 0.52 + t) * 1200} ${560 + Math.sin(i * 0.52 + t) * 1200}`} stroke={C.mint} strokeWidth={30} opacity={0.06} />)}
      <Cam z={tw(t, 0, d, 1.0, 1.25, ease.in)} fy={520}>
        <Theo t={t} x={960} y={1240} scale={4.4} pose={P.cheer} expr="happy" mouth="grin" rim="rgba(77,255,176,1)" />
      </Cam>
      <BigText t={t} t0={0.9} x={960} y={160} text="A LOT." size={130} color={C.mint} />
    </Sh>
  );
};

export const B3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const who = [[260, 300], [700, 220], [1180, 330], [1640, 250], [420, 720], [960, 640], [1500, 760]];
  return (
    <Sh tone="neutral">
      <Backdrop a="#f2e3c8" b="#c9a77a" />
      {who.map(([x, y], i) => {
        const k = pop(t, 0.15 + i * 0.32, 0.4);
        return k > 0 ? (
          <g key={i} transform={`translate(${x} ${y}) scale(${k}) rotate(${(i % 3 - 1) * 6})`}>
            <rect x={-150} y={-55} width={300} height={110} rx={30} fill="#fff" stroke="#1a1d26" strokeWidth={5} />
            <text x={0} y={18} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>{["YOU CAN'T", 'NO WAY', 'NOT A CHANCE', "YOU CAN'T", 'TOO WEAK', 'GIVE UP', "YOU CAN'T"][i]}</text>
          </g>
        ) : null;
      })}
    </Sh>
  );
};

const SRC = 'Rosenthal & Jacobson (1968), "Pygmalion in the Classroom"';
export const B4: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const chosen = [2, 7, 11, 16, 19];
  const pick = s('b05') - 0.4;
  return (
    <Sh>
      <DataBG t={t + o} />
      <Tag t={t} text="1968" icon="◷" />
      <BigText t={t} t0={0.3} x={960} y={190} text="A CLASS. 20 KIDS." size={70} color="#fff" stroke={C.navy} />
      {[...Array(20)].map((_, i) => {
        const on = chosen.includes(i) && t > pick + chosen.indexOf(i) * 0.35;
        return <Person key={i} x={390 + (i % 10) * 125} y={520 + Math.floor(i / 10) * 220} s={1.6 * pop(t, 0.3 + i * 0.03, 0.4)} col={on ? C.gold : '#5f7ab8'} glow={on ? 1 : 0} />;
      })}
      {t > pick && <Badge t={t} t0={pick + 0.2} x={960} y={930} text={'"These kids are about to bloom."'} size={40} color={C.gold} />}
      {t > s('b05') + 1.2 && <Badge t={t} t0={s('b05') + 1.2} x={960} y={1010} text="picked at random" size={34} icon="⚄" />}
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>{SRC}</text>
    </Sh>
  );
};

export const B5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const g1 = tw(t, 0.6, 2.4, 0, 1, ease.out), g2 = tw(t, 0.6, 2.4, 0, 1, ease.out);
  return (
    <Sh>
      <DataBG t={t + o} />
      <BigText t={t} t0={0.2} x={960} y={170} text="ONE YEAR LATER" size={70} color="#fff" stroke={C.navy} />
      <text x={960} y={250} textAnchor="middle" fontSize={34} fill={C.gray} fontFamily={FONT_HEAD}>average I.Q. gain</text>
      <rect x={600} y={850 - 420 * g1} width={260} height={420 * g1} rx={16} fill={C.gold} />
      <rect x={1060} y={850 - 260 * g2} width={260} height={260 * g2} rx={16} fill="#5f7ab8" />
      <text x={730} y={910} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>"bloomers"</text>
      <text x={1190} y={910} textAnchor="middle" fontSize={40} fontWeight={700} fill="#9fb3e0" fontFamily={FONT_HEAD}>everyone else</text>
      <line x1={520} y1={852} x2={1400} y2={852} stroke="#8fa3c8" strokeWidth={4} />
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>{SRC} · bars illustrative</text>
    </Sh>
  );
};

export const B6: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh>
      <DataBG t={t + o} />
      <BigText t={t} t0={0.2} x={960} y={220} text="THE PYGMALION EFFECT" size={84} color={C.gold} stroke={C.navy} />
      {[['EXPECTATION', 560, C.cyan], ['PERFORMANCE', 1360, C.mint]].map(([txt, x, col], i) => (
        <g key={i} transform={`translate(${x} 580) scale(${pop(t, 0.8 + i * 0.6, 0.45)})`}>
          <rect x={-250} y={-70} width={500} height={140} rx={30} fill="rgba(255,255,255,0.06)" stroke={col as string} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{txt}</text>
        </g>
      ))}
      <path d={`M 830 580 L ${830 + 230 * tw(t, 1.2, 1.8, 0, 1)} 580`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      <path d="M 1050 555 L 1085 580 L 1050 605" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={tw(t, 1.7, 1.9, 0, 1)} />
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>{SRC}</text>
    </Sh>
  );
};

export const B7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const flip = tw(t, 0.4, 1.0, 0, 180, ease.io);
  return (
    <Sh tone="night">
      <DataBG t={t + o} tint="#ff4d5e" />
      <g transform={`translate(960 480) rotate(${flip})`}>
        <path d="M -300 0 L 260 0 M 200 -50 L 270 0 L 200 50" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={560} y={640} textAnchor="middle" fontSize={56} fontWeight={700} fill={flip > 90 ? C.mint : C.cyan} fontFamily={FONT_HEAD}>{flip > 90 ? 'STRENGTH' : 'EXPECTATION'}</text>
      <text x={1360} y={640} textAnchor="middle" fontSize={56} fontWeight={700} fill={flip > 90 ? C.red : C.mint} fontFamily={FONT_HEAD}>{flip > 90 ? 'DOUBT' : 'PERFORMANCE'}</text>
      <Theo t={t} x={960} y={1060} scale={1.9} pose={P.shrug} expr="smug" mouth="smirk" rim="rgba(255,120,140,0.9)" />
      <BigText t={t} t0={1.0} x={960} y={190} text="FLIPPED." size={110} color={C.red} />
    </Sh>
  );
};

/* ================= ACT C — collecting doubts ================= */
export const C1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={1.04} fy={560}>
        <Hallway t={t} px={-t * 60} />
        <Kid i={2} t={t} x={300} scale={2.1} />
        <Theo t={t} x={960} scale={2.5} pose={{ ...walkPose(t * 1.4), rsh: 40, rel: 70 }} expr="smug" mouth="smirk" look={[1, 0.3]} />
        <g transform="translate(1010 560) rotate(-8)"><rect x={-40} y={-55} width={80} height={110} rx={6} fill="#fff8e6" stroke="#333" strokeWidth={3} /><text x={0} y={-25} textAnchor="middle" fontSize={14} fontWeight={800} fill={C.red} fontFamily={FONT_BODY}>DOUBTERS</text>{[0, 1, 2].map((i) => <rect key={i} x={-28} y={-12 + i * 18} width={56} height={5} rx={2} fill="#999" />)}</g>
      </Cam>
      <Tag t={t} text="DAY 1" icon="①" />
    </Sh>
  );
};

export const C2: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.05, 1.12)} fx={960}>
        <Gym t={t} blur bar={false} />
        <Coach t={t} x={1300} scale={2.6} facing={-1} pose={P.relaxed} expr="squint" mouth="flat" look={[1, 0.6]} />
        <Whistle x={1300 - 0} y={830 - 2.6 * 1.1 * 130} s={2.4} />
        <Theo t={t} x={720} scale={2.3} pose={P.hold} expr="neutral" look={[1, -0.2]} />
      </Cam>
    </Sh>
  );
};

export const C3: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#d9c4a0" b="#7a5a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={460}>
        <Coach t={t} x={960} y={1620} scale={6.0} expr="smug" mouth="smirk" talking={talk('c03')} look={[0.2, 0.3]} />
      </Cam>
      <Bubble t={t} t0={0.2} x={1380} y={430} text={'Rope climb? You?\nNot a chance.'} size={42} tail="left" />
    </Sh>
  );
};

export const C4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const climb = tw(t, 0.2, 1.3, 0, 1, ease.out);
  const snap = t > 1.9;
  const fall = snap ? Math.min(1, (t - 1.9) / 0.5) : 0;
  const y = 830 - 560 * climb + 560 * fall * fall;
  return (
    <Sh tone="warm">
      <Cam z={1.0} fx={760}>
        <Gym t={t} blur bar={false} rope={snap ? 'snapped' : 'up'} />
        <Theo t={t} x={560} y={y} scale={2.2} pose={snap && fall >= 1 ? P.cheer : P.armsUp} expr={snap ? 'shock' : 'smug'} mouth={snap ? 'o' : 'grin'} />
        <Coach t={t} x={1250} scale={2.5} facing={-1} pose={snap ? P.handsHead : P.relaxed} expr={snap ? 'shock' : 'squint'} mouth={snap ? 'open' : 'flat'} look={[1, -0.6]} />
      </Cam>
      <Badge t={t} t0={1.2} x={330} y={150} text="4 seconds" size={42} icon="◷" color={C.gold} />
      {snap && <BigText t={t} t0={1.9} x={960} y={240} text="SNAP!" size={120} color="#fff" t1={3.0} />}
    </Sh>
  );
};

export const C5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.15, 1.25)} fx={1100} fy={560}>
        <Kitchen t={t} noTable />
        <Sis t={t} x={900} scale={2.4} pose={P.give} expr="smug" mouth="smirk" look={[1, 0]} />
        <g transform="translate(1012 600)"><rect x={-30} y={-50} width={60} height={80} rx={10} fill="#a8d08d" opacity={0.85} /><rect x={-32} y={-62} width={64} height={18} rx={4} fill="#d9a441" /></g>
        <Theo t={t} x={1350} scale={2.4} facing={-1} pose={P.relaxed} expr="smug" look={[1, 0.3]} />
        <KitchenTable px={0} />
      </Cam>
      <Bubble t={t} t0={0.6} x={850} y={300} text={"Bet you can't."} size={44} />
    </Sh>
  );
};

export const C6: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const boom = s('c06') + 1.6;
  const b = t > boom;
  return (
    <Sh tone="warm">
      <Cam z={b ? 1.12 : 1.05} fx={1100} fy={560}>
        <Kitchen t={t} noTable />
        <Sis t={t} x={850} scale={2.4} pose={b ? P.handsHead : P.relaxed} expr={b ? 'shock' : 'smug'} mouth={b ? 'open' : 'smirk'} look={[1, 0]} />
        <Theo t={t} x={1250} scale={2.4} facing={-1} pose={P.hold} expr={b ? 'shock' : 'squint'} mouth={b ? 'o' : 'flat'} look={[0.4, 0.6]} />
        <KitchenTable px={0} />
        {b && [...Array(14)].map((_, i) => {
          const k = tw(t, boom, boom + 0.8, 0, 1, ease.out);
          const a = (i / 14) * Math.PI * 2;
          return <rect key={i} x={1180 + Math.cos(a) * 260 * k} y={650 + Math.sin(a) * 160 * k + k * k * 80} width={22} height={14} fill={i % 3 ? '#a8d08d' : '#efe3cf'} transform={`rotate(${i * 40 + t * 300} ${1180 + Math.cos(a) * 260 * k} ${650 + Math.sin(a) * 160 * k})`} opacity={1 - k * 0.5} />;
        })}
        {b && <path d="M 1100 690 L 1140 720 L 1120 760 L 1170 800 M 1250 690 L 1230 740 L 1270 780" stroke="#1a1d26" strokeWidth={6} fill="none" />}
      </Cam>
      {b && <BigText t={t} t0={boom} x={960} y={200} text="CRACK!" size={110} color="#fff" t1={boom + 1.2} />}
    </Sh>
  );
};

export const C7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [0.8, 0], [2.0, 330], [d, 340]], ease.out);
  const up = lift > 150;
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Driveway t={t} blur />
        <Car x={1000} y={835} lift={lift} rot={up ? -2 : 0} col={COL.dad} s={0.95} />
        <Theo t={t} x={1000} y={835} scale={2.3} pose={up ? P.armsUp : P.hold} expr={up ? 'smug' : 'squint'} mouth={up ? 'grin' : 'flat'} look={[0, -1]} />
      </Cam>
      <Tag t={t} text="FRIDAY" icon="⑤" />
      {up && <Neon t={t} t0={2.0} x={1540} y={210} text="≈1,500 kg" col={C.gold} ax={1300} ay={360} />}
    </Sh>
  );
};

export const C8: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const g = tw(t, 0.3, 1.8, 0, 1, ease.out);
  const H = 640, max = 1600;
  const bar = (x: number, kg: number, label: string, col: string, t0: number) => {
    const k = tw(t, t0, t0 + 1.2, 0, 1, ease.out);
    const h = (kg / max) * H * k;
    return (
      <g key={label}>
        <rect x={x} y={880 - h} width={240} height={h} rx={16} fill={col} />
        <text x={x + 120} y={860 - h} textAnchor="middle" fontSize={44} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} opacity={k}>{Math.round(kg * k).toLocaleString('en-US')} kg</text>
        <text x={x + 120} y={940} textAnchor="middle" fontSize={34} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD}>{label}</text>
      </g>
    );
  };
  return (
    <Sh>
      <DataBG t={t + o} />
      {bar(420, 501, 'world record', C.cyan, 0.3)}
      {bar(1260, 1500, 'you (Friday)', C.gold, 1.2)}
      <line x1={360} y1={882} x2={1560} y2={882} stroke="#8fa3c8" strokeWidth={4} />
      <text x={60} y={1050} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Deadlift world record: 501 kg, Hafþór Björnsson (2020) · {g > 1 ? '' : ''}</text>
    </Sh>
  );
};

export const C9: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const names = ['Coach Briggs', 'My sister', 'Mr. Dunn (math)', 'The mailman', 'Uncle Ray', 'Kyle'];
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Street t={t} v="day" px={-t * 50} blur />
        <Theo t={t} x={560} scale={2.4} pose={walkPose(t * 1.4)} expr="smug" mouth="grin" />
      </Cam>
      <g transform="translate(1340 520) rotate(4)">
        <rect x={-300} y={-380} width={600} height={760} rx={16} fill="#fff8e6" stroke="#2a2a2a" strokeWidth={6} />
        <text x={0} y={-300} textAnchor="middle" fontSize={54} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>DOUBTERS</text>
        {names.map((n, i) => {
          const done = t > 0.6 + i * 0.7;
          return (
            <g key={n} transform={`translate(-240 ${-210 + i * 100})`}>
              <rect x={0} y={-32} width={40} height={40} rx={6} fill="none" stroke="#333" strokeWidth={4} />
              {done && <path d="M 6 -14 L 18 0 L 40 -34" stroke={C.mint} strokeWidth={8} fill="none" strokeLinecap="round" />}
              <text x={64} y={0} fontSize={40} fontWeight={600} fill="#333" fontFamily={FONT_HEAD}>{n}</text>
            </g>
          );
        })}
      </g>
    </Sh>
  );
};

export const C10: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="pink">
      <Backdrop a="#2a1840" b="#0a0614" />
      <circle cx={960} cy={540} r={300 + Math.sin(t * 3) * 20} fill="#ff5aa8" opacity={0.15} filter="url(#glowF)" />
      <g transform={`translate(960 540) scale(${pop(t, 0.1, 0.5)})`}>
        <circle cx={0} cy={0} r={200} fill="none" stroke="#ff8ac8" strokeWidth={12} />
        <ellipse cx={0} cy={0} rx={90} ry={200} fill="none" stroke="#ff8ac8" strokeWidth={8} />
        <path d="M -200 0 L 200 0 M -170 -100 L 170 -100 M -170 100 L 170 100" stroke="#ff8ac8" strokeWidth={8} />
      </g>
      <BigText t={t} t0={0.6} x={960} y={930} text="THE INTERNET" size={100} color="#fff" />
    </Sh>
  );
};

export const C11: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [0.6, 0], [1.4, 260], [d, 270]], ease.out);
  return (
    <Sh tone="warm">
      <Cam z={1.08} fx={900} fy={560}>
        <Kitchen t={t} noTable />
        <g transform={`translate(1000 ${830 - lift})`}><rect x={-110} y={-430} width={220} height={430} rx={20} fill="#e8eef3" /><rect x={-110} y={-290} width={220} height={6} fill="#c7d0d8" /><rect x={80} y={-400} width={10} height={70} rx={5} fill="#aab2bd" /></g>
        <Theo t={t} x={1000} scale={2.3} pose={lift > 100 ? P.armsUp : P.hold} expr="smug" mouth="grin" look={[-1, -0.5]} />
        {/* phone on tripod */}
        <g transform="translate(420 830)"><path d="M 0 0 L 40 -260 L 80 0 M 40 -260 L 40 0" stroke="#333" strokeWidth={8} /><rect x={10} y={-340} width={60} height={100} rx={10} fill="#15161c" /><circle cx={40} cy={-320} r={6} fill="#ff4d5e" opacity={Math.sin(t * 6) > 0 ? 1 : 0.3} /></g>
      </Cam>
      <Badge t={t} t0={0.2} x={330} y={150} text="● REC" size={40} color={C.red} />
    </Sh>
  );
};

export const C12: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const cm = [['FAKE.', '2.1K'], ['EDITED 100%', '1.4K'], ['you can see the wires lol', '988'], ['no way a kid can do that', '3.3K'], ['CGI', '640']];
  return (
    <Sh tone="pink">
      <Backdrop a="#ffd6e3" b="#e97fa5" />
      <g transform="translate(960 560)">
        <rect x={-560} y={-470} width={1120} height={940} rx={40} fill="#fff" />
        <text x={-500} y={-390} fontSize={40} fontWeight={800} fill="#222" fontFamily={FONT_BODY}>Comments · 48,201</text>
        {cm.map(([c, l], i) => {
          const k = pop(t, 0.2 + i * 0.5, 0.4);
          return k > 0 ? (
            <g key={i} transform={`translate(-500 ${-300 + i * 150}) scale(${k})`}>
              <circle cx={30} cy={20} r={30} fill={['#e8615a', '#4a7bf0', '#8c6bd6', '#3fb6a8', '#f08a3a'][i]} />
              <text x={84} y={6} fontSize={26} fontWeight={800} fill="#888" fontFamily={FONT_BODY}>@user{1000 + i * 337}</text>
              <text x={84} y={50} fontSize={40} fontWeight={800} fill="#111" fontFamily={FONT_BODY}>{c}</text>
              <text x={900} y={50} textAnchor="end" fontSize={30} fontWeight={800} fill="#666" fontFamily={FONT_BODY}>♥ {l}</text>
            </g>
          ) : null;
        })}
      </g>
    </Sh>
  );
};

export const C13: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#13224a" b="#05070f" />
      {[...Array(10)].map((_, i) => {
        const k = ((t * 0.9 + i * 0.1) % 1);
        const sx = i % 2 ? -100 : 2020, sy = 120 + (i * 97) % 700;
        return <g key={i} transform={`translate(${sx + (960 - sx) * k} ${sy + (560 - sy) * k}) scale(${1 - k * 0.6})`} opacity={1 - k}><rect x={-70} y={-24} width={140} height={48} rx={24} fill="#fff" /><text x={0} y={10} textAnchor="middle" fontSize={26} fontWeight={800} fill={C.red} fontFamily={FONT_BODY}>FAKE</text></g>;
      })}
      <Cam z={tw(t, 0, d, 1.0, 1.1)}>
        <Theo t={t} x={960} y={1000} scale={3.0} pose={P.cheer} expr="happy" mouth="grin" rim="rgba(77,255,176,1)" />
        <g transform="translate(1180 520)"><path d="M -40 -110 L 40 -110 L 30 60 L -30 60 Z" fill="#fff" opacity={0.9} /><rect x={-40} y={-140} width={80} height={30} rx={8} fill={C.mint} /><text x={0} y={-20} textAnchor="middle" fontSize={22} fontWeight={800} fill="#333" fontFamily={FONT_BODY}>HATE</text><text x={0} y={10} textAnchor="middle" fontSize={22} fontWeight={800} fill="#333" fontFamily={FONT_BODY}>WHEY</text></g>
      </Cam>
    </Sh>
  );
};

export const C14: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const lift = kf(t, [[0, 0], [1.4, 0], [2.6, 240], [d, 250]], ease.out);
  return (
    <Sh tone="warm">
      <Backdrop a="#ffd59a" b="#c96b3a" />
      <rect x={0} y={860} width={1920} height={220} fill="#b98a4a" />
      <circle cx={1500} cy={300} r={160} fill="#fff1c0" opacity={0.8} />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <g transform={`translate(0 ${-lift})`}><Elephant x={1000} y={860} s={1.6} col="#8c8f99" /></g>
        <Theo t={t} x={1000} y={870} scale={2.2} pose={lift > 80 ? P.armsUp : P.hold} expr="smug" mouth="grin" look={[0, -1]} />
      </Cam>
      <Tag t={t} text="SUNDAY" icon="⑦" />
      <Neon t={t} t0={2.6} x={420} y={240} text="≈6,000 kg" col={C.gold} ax={760} ay={420} />
    </Sh>
  );
};

/* ================= ACT D — belief makes you weak ================= */
export const D1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const v = Math.round(tw(t, 0.2, d, 0, 12000000, ease.in));
  return (
    <Sh tone="pink">
      <Backdrop a="#2a1840" b="#0a0614" />
      <Phone x={960} y={560} s={1.0} t={t} title="Trending" msgs={[{ t0: 0.1, text: '14-year-old lifts\na CAR?!' }]} />
      <BigText t={t} t0={0.3} x={1500} y={300} text="VIRAL" size={110} color={C.red} />
      <text x={1500} y={480} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{v.toLocaleString('en-US')}</text>
      <text x={1500} y={540} textAnchor="middle" fontSize={34} fill={C.gray} fontFamily={FONT_HEAD}>views</text>
    </Sh>
  );
};

export const D2: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="neutral">
      <Backdrop a="#1d2c4a" b="#0b1222" />
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <rect x={160} y={140} width={1600} height={760} rx={20} fill="#0e1424" stroke="#2b3a5c" strokeWidth={10} />
        <Driveway t={t} blur />
        <Car x={960} y={835} lift={300} rot={-2} col={COL.dad} s={0.8} />
        <Theo t={t} x={960} y={835} scale={2.0} pose={P.armsUp} expr="smug" mouth="grin" />
      </Cam>
      <rect x={160} y={780} width={1600} height={110} fill="#c0392b" />
      <rect x={160} y={780} width={260} height={110} fill="#fff" />
      <text x={290} y={850} textAnchor="middle" fontSize={44} fontWeight={700} fill="#c0392b" fontFamily={FONT_HEAD}>BREAKING</text>
      <text x={460} y={852} fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>14-YEAR-OLD LIFTS CAR · 12,000,000 VIEWS</text>
    </Sh>
  );
};

export const D3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Street t={t} v="day" blur />
        {[...Array(7)].map((_, i) => <Kid key={i} i={i} t={t} x={180 + i * 240 + (i > 2 ? 280 : 0)} y={840} scale={2.0} facing={i > 2 ? -1 : 1} pose={i % 2 ? P.wave : P.cheer} expr="happy" mouth="grin" />)}
        <Theo t={t} x={960} scale={2.4} pose={P.relaxed} expr="worried" mouth="flat" sweat look={[0, -0.2]} />
        {[...Array(8)].map((_, i) => <Heart key={i} x={300 + i * 200 + Math.sin(t * 3 + i) * 20} y={380 - ((t * 60 + i * 40) % 200)} s={1.8} op={0.85} />)}
      </Cam>
      <BigText t={t} t0={2.4} x={960} y={150} text="NOW THEY BELIEVE." size={90} color="#fff" />
    </Sh>
  );
};

export const D4: ShotFC = ({ o, d }) => {
  const { t, s, e, talk } = useShot(o);
  const buckle = e('d05') + 0.1;
  const b = t > buckle;
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.1, 1.2)} fy={600}>
        <Street t={t} v="day" blur />
        <Kid i={4} t={t} x={720} y={840} scale={1.6} pose={P.reach} expr="happy" mouth="grin" talking={talk('d05')} look={[1, -0.4]} />
        <Theo t={t} x={1150} y={840 + (b ? 26 : 0)} scale={2.5} facing={-1} pose={b ? { ...P.hunch, lkn: 40, rkn: 40, lean: 20 } : P.relaxed} expr={b ? 'shock' : 'soft'} mouth={b ? 'o' : 'smile'} sweat={b} look={[1, 0.3]} />
      </Cam>
      <Bubble t={t} t0={s('d05')} x={720} y={360} text="You can do anything!" size={42} />
    </Sh>
  );
};

export const D5: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.25, 1.35)} fx={960} fy={560}>
        <Kitchen t={t} v="evening" noTable />
        <Dad t={t} x={1060} scale={2.6} facing={-1} pose={P.hug} expr="happy" mouth={talk('d08') ? undefined : 'smile'} talking={talk('d08')} />
        <Theo t={t} x={880} scale={2.35} pose={P.hug} expr="worried" mouth="flat" sweat />
      </Cam>
      <Bubble t={t} t0={1.6} x={1260} y={260} text="I always knew you could." size={40} tail="left" />
    </Sh>
  );
};

export const D6: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const strain = Math.sin(t * 30) * 3;
  return (
    <Sh tone="warm">
      <Cam z={1.3} fy={640}>
        <Hallway t={t} blur />
        <g transform={`translate(${1010 + strain} 820)`}><rect x={-70} y={-120} width={140} height={120} rx={22} fill="#2c5aa0" /><rect x={-50} y={-90} width={100} height={40} rx={10} fill="#3d6fd6" /></g>
        <Theo t={t} x={900} scale={2.5} pose={{ ...P.hunch, rsh: 60, rel: 30, lean: 30 }} expr="angry" mouth="flat" sweat look={[1, 0.8]} />
      </Cam>
      <Badge t={t} t0={0.5} x={1300} y={300} text="backpack · 6 kg" size={40} color={C.red} />
    </Sh>
  );
};

export const D7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const m = tw(t, 0.6, 1.6, 0, 1);
  return (
    <Sh tone="night">
      <Backdrop a="#3a1a2a" b="#0c0610" />
      {[...Array(6)].map((_, i) => {
        const x = 360 + i * 240;
        return (
          <g key={i} transform={`translate(${x} ${500 + Math.sin(t * 2 + i) * 20})`}>
            {m < 0.5 ? <Heart x={0} y={0} s={4 * (1 - m * 2)} /> : (
              <g transform={`scale(${(m - 0.5) * 2})`}><rect x={-60} y={-40} width={120} height={80} rx={14} fill="#3b4150" /><path d="M -30 -40 Q 0 -90 30 -40" stroke="#3b4150" strokeWidth={14} fill="none" /><text x={0} y={18} textAnchor="middle" fontSize={34} fontWeight={700} fill="#c8cdd6" fontFamily={FONT_HEAD}>kg</text></g>
            )}
          </g>
        );
      })}
      <BigText t={t} t0={0.2} x={960} y={220} text="LOVE MAKES YOU WEAK" size={84} color="#fff" />
      <BigText t={t} t0={1.4} x={960} y={860} text="(LITERALLY)" size={70} color={C.red} />
    </Sh>
  );
};

export const D8: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="cool">
      <Cam z={1.06}>
        <Hallway t={t} blur />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 3} t={t} x={1300 + i * 200} y={840} scale={2.0} facing={-1} pose={P.wave} expr="happy" mouth="grin" look={[1, 0]} />)}
        <Theo t={t} x={500} scale={2.4} pose={P.hunch} expr="worried" sweat look={[1, 0]} />
      </Cam>
      <Phone x={300} y={560} s={0.45} t={t} title="DAD" msgs={[{ t0: 0.2, text: 'Missed call (4)' }]} />
    </Sh>
  );
};

export const D9: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Sh tone="night">
      <Backdrop a="#26304f" b="#0a0e1c" />
      <g transform="translate(1100 160)">
        <rect x={0} y={0} width={620} height={640} rx={10} fill="#0d1433" stroke="#33405f" strokeWidth={18} />
        {[...Array(26)].map((_, i) => { const x = (i * 83) % 600 + 10; const y = ((i * 131) + t * 420) % 640; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34} stroke="#9fb8ff" strokeOpacity={0.45} strokeWidth={3} />; })}
      </g>
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Theo t={t} x={900} y={980} scale={3.2} pose={P.pockets} expr="sad" mouth="flat" look={[1, -0.2]} rim="rgba(150,180,255,0.8)" />
      </Cam>
      <BigText t={t} t0={1.2} x={760} y={170} text="please... hate me." size={64} color="#cfd8ff" />
    </Sh>
  );
};
