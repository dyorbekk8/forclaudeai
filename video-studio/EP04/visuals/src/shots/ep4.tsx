import React from 'react';
import { Cam, Badge, BigText, Bubble, Stamp } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, Hallway, DataBG, Backdrop, Classroom, Dining } from '../sets/Sets';
import { Street } from '../sets/Sets2';
import { Court, Ball, Space, Earth, KidRoom, Living, ViralPhone } from '../sets/Sets3';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Leo, Mia, Mom, Teach, Coach, COL } from './cast3';
import { Kid } from './common';
import { Sh, Neon, Kinetic, Boom, frOf } from './kit3';
import { RGBSplit, Slices, Spinner } from '../lib/lag';
import { NameFly, Streaks, Boomring, Shards, Dust, Cone, speedAt, fmtSpeed } from '../lib/cine';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };
const RIM = 'rgba(255,190,120,0.95)';
const RIMC = 'rgba(140,220,255,0.95)';

/* ---------- small props ---------- */
const Toast: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-46} y={-40} width={92} height={80} rx={22} fill="#d9944a" />
    <rect x={-36} y={-30} width={72} height={62} rx={16} fill="#f2c27a" />
  </g>
);
const Bus: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-420} y={-300} width={840} height={260} rx={30} fill="#ffc531" />
    <rect x={-420} y={-300} width={840} height={260} rx={30} fill="url(#gShadeV)" />
    {[...Array(6)].map((_, i) => <rect key={i} x={-380 + i * 125} y={-270} width={100} height={80} rx={10} fill="#2c3b4f" />)}
    <rect x={-420} y={-120} width={840} height={16} fill="#2a2a2a" />
    {[-280, 280].map((wx) => <g key={wx}><circle cx={wx} cy={-40} r={50} fill="#16161c" /><circle cx={wx} cy={-40} r={20} fill="#8a8f99" /></g>)}
  </g>
);
const Window: React.FC<{ x: number; y: number; w?: number; h?: number; broken?: number; sky?: string }> = ({ x, y, w = 300, h = 380, broken = 0, sky = '#ffb07a' }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={w} height={h} fill={sky} stroke="#e8e8ee" strokeWidth={14} />
    {broken < 0.5 && <><line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#e8e8ee" strokeWidth={10} /><path d={`M 30 40 L 120 10 M 40 110 L 200 30`} stroke="#fff" strokeWidth={10} opacity={0.4} /></>}
    {broken >= 0.5 && <path d={`M 0 0 L ${w * 0.3} ${h * 0.2} L ${w * 0.1} ${h * 0.6} M ${w} 0 L ${w * 0.7} ${h * 0.3} L ${w * 0.9} ${h * 0.7}`} stroke="#d8f2ff" strokeWidth={8} fill="none" />}
  </g>
);
const Sky: React.FC<{ t: number; a: string; b: string; stars?: boolean }> = ({ t, a, b, stars }) => {
  const id = ('sk' + a + b).replace(/#/g, '');
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width={1920} height={1080} fill={`url(#${id})`} />
      {stars && [...Array(80)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 700} r={(i % 3) * 0.6 + 0.8} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(i + t))} />)}
    </g>
  );
};
const City: React.FC<{ px?: number; col?: string; lit?: boolean; y?: number }> = ({ px = 0, col = '#1a1030', lit = true, y = 0 }) => (
  <g transform={`translate(${px} ${y})`}>
    {[...Array(18)].map((_, i) => {
      const x = -100 + i * 130, h = 260 + ((i * 97) % 300);
      return (
        <g key={i}>
          <rect x={x} y={860 - h} width={112} height={h} fill={col} />
          {lit && [...Array(10)].map((_, j) => (j * 7 + i) % 3 === 0 ? <rect key={j} x={x + 14 + (j % 3) * 32} y={880 - h + Math.floor(j / 3) * 46} width={16} height={22} fill="#ffcf7a" opacity={0.75} /> : null)}
        </g>
      );
    })}
  </g>
);

/* ================= A — hook ================= */
export const A1: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.08, 1.0, ease.out)} fy={600}>
        <Kitchen t={t} v="morning" />
        <Cone x={1450} y={0} w={700} h={1000} op={0.3} rot={18} />
        <Mom t={t} x={1450} scale={2.6} facing={-1} pose={talk('a01') ? P.point : P.hold} expr="happy" mouth={talk('a01') ? 'open' : 'smile'} talking={talk('a01')} rim={RIM} />
        <Dust t={t} />
      </Cam>
      <Kinetic t={t} t0={0.45} x={1200} y={300} text="“LEO!”" col={C.gold} size={110} />
      <NameFly t={t} t0={0.9} fx={1250} fy={300} tx={260} ty={520} />
    </Sh>
  );
};

export const A2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const arrive = 0.35;
  return (
    <Sh mood="golden" kx={65} ky={25} box={1}>
      <Cam z={1.05}>
        <Kitchen t={t} v="morning" />
        <Mom t={t} x={1500} scale={2.6} facing={-1} pose={P.point} expr="shock" mouth="o" rim={RIM} />
        {t < arrive ? <Streaks t={t} k={1} /> : null}
        {t < arrive && <rect x={-200 + t * 3000} y={560} width={900} height={60} rx={30} fill={COL.you} opacity={0.6} filter="url(#softShadow)" />}
        {t >= arrive && <Leo t={t} x={820} scale={2.6} pose={P.stand} expr="shock" mouth="o" look={[1, 0]} rim={RIM} />}
        {t >= arrive && <g opacity={1 - clamp01((t - arrive) / 0.8)}>{[...Array(8)].map((_, i) => <rect key={i} x={300 + i * 50} y={520 + i * 22} width={300 - i * 20} height={8} rx={4} fill="#fff" opacity={0.5} />)}</g>}
      </Cam>
      <Boom t={t} t0={arrive} x={820} y={300} text="WHOOSH" col={C.gold} size={90} rot={-6} />
    </Sh>
  );
};

export const A3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  // bullet time: toast frozen in the air, slow orbit
  return (
    <Sh mood="golden" kx={50} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.55, 1.75, ease.soft)} fx={980} fy={520} rot={tw(t, 0, d, -2, 2)}>
        <Kitchen t={t} v="morning" />
        <Leo t={t} x={820} scale={2.6} pose={P.reach} expr="squint" look={[1, -0.6]} rim={RIM} />
        <Toast x={1040 + t * 4} y={460 - t * 2} rot={20 + t * 6} />
        {[...Array(12)].map((_, i) => <circle key={i} cx={1010 + (i % 4) * 22 + t * 3} cy={500 + Math.floor(i / 4) * 16} r={3} fill="#f2c27a" />)}
        <Dust t={t * 0.1} n={40} />
      </Cam>
      <Badge t={t} t0={0.5} x={1500} y={195} text="Mom: “Le—”" size={44} color="#fff" />
    </Sh>
  );
};

export const A4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={40} box={1}>
      <Backdrop a="#2a1a4a" b="#06040e" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" look={[0, -0.3]} rim={RIM} />
      </Cam>
      <Dust t={t} col="#ffd9a8" />
      <Neon t={t} t0={fr('a04', 0.62)} x={960} y={210} text="+1% PER NAME" col={C.gold} size={70} />
    </Sh>
  );
};

export const A5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const n = Math.floor(tw(t, 0.3, d, 1, 300, ease.in));
  return (
    <Sh mood="clean" kx={50} ky={50} box={1}>
      <DataBG t={t + o} tint={C.gold} />
      <text x={960} y={560} textAnchor="middle" fontSize={180} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>1.01<tspan fontSize={90} dy={-80}>{n}</tspan></text>
      <text x={960} y={700} textAnchor="middle" fontSize={56} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>= ×{Math.round(Math.pow(1.01, n)).toLocaleString('en-US')}</text>
    </Sh>
  );
};

/* ================= B — rule + math ================= */
export const B1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={20} box={1}>
      <Sky t={t} a="#0b0a24" b="#2a1650" stars />
      <City col="#140c28" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Earth x={960} y={1500} r={820} />
        {[...Array(9)].map((_, i) => {
          const t0 = 0.6 + i * 0.55; const a = -2.6 + i * 0.6;
          return <NameFly key={i} t={t} t0={t0} fx={960 + Math.cos(a) * 900} fy={700 + Math.sin(a) * 500} tx={960} ty={600} size={46} />;
        })}
        <Leo t={t} x={960} y={720} scale={1.6} pose={P.stand} expr="neutral" rim={RIM} />
      </Cam>
      <Badge t={t} t0={fr('b01', 0.15)} x={960} y={190} text="ANYONE · ANYWHERE · OUT LOUD → +1%" size={38} color={C.gold} />
      <Badge t={t} t0={fr('b01', 0.78)} x={960} y={265} text="EVERY SILENT HOUR → −1%" size={38} color="#7fb8ff" />
    </Sh>
  );
};

const Ladder: React.FC<{ t: number; show: number; hi: number }> = ({ t, show, hi }) => {
  const rows: [string, string, string][] = [['24 km/h', 'You', '#fff'], ['×62', 'Usain Bolt · 44 km/h', C.gold], ['×396', 'Speed of sound · 1,235 km/h', '#ff8a3d'], ['×1,771', 'Speed of light', C.red]];
  return (
    <g>
      {rows.map(([a, b, col], i) => {
        if (i > show) return null;
        const k = pop(t, 0.1 + i * 0.05, 0.4);
        return (
          <g key={i} transform={`translate(360 ${300 + i * 150})`} opacity={clamp01(k * 2) * (i === hi ? 1 : 0.45)}>
            <rect x={0} y={-55} width={1200} height={110} rx={26} fill={i === hi ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'} stroke={i === hi ? col : 'rgba(255,255,255,0.12)'} strokeWidth={4} />
            <text x={40} y={18} fontSize={54} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{a}</text>
            <text x={340} y={18} fontSize={46} fontWeight={600} fill="#fff" fontFamily={FONT_HEAD}>{b}</text>
          </g>
        );
      })}
    </g>
  );
};
export const B2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={70} ky={30} box={1}>
      <Court t={t} hoop={false} />
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Leo t={t} x={960} scale={2.6} pose={walkPose(t * 1.6)} expr="neutral" rim={RIM} />
      </Cam>
      <Badge t={t} t0={0.6} x={960} y={210} text="TOP SPEED: 24 km/h" size={52} color="#fff" icon="⚡" />
    </Sh>
  );
};
export const B3: ShotFC = ({ o, d }) => {
  const { t, s } = useF(o);
  const hi = t < s('b04') ? 1 : t < s('b05') ? 2 : 3;
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <Ladder t={t} show={hi} hi={hi} />
      {hi === 2 && <Boomring t={t} t0={s('b04') + 1.4} x={1300} y={600} />}
      {hi === 3 && <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={0.5 * Math.max(0, 1 - (t - s('b05') - 2.5) * 3) * (t > s('b05') + 2.5 ? 1 : 0)} />}
    </Sh>
  );
};
export const B6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.15, 1.0, ease.out)}>
        <Court t={t} />
        {[...Array(30)].map((_, i) => <Kid key={i} i={i} t={t} x={120 + (i % 15) * 125} y={760 + Math.floor(i / 15) * 150} scale={1.25 + Math.floor(i / 15) * 0.25} pose={P.stand} />)}
      </Cam>
      <Neon t={t} t0={0.4} x={960} y={200} text="1,771 PEOPLE" col={C.red} size={80} />
    </Sh>
  );
};

/* ================= C — quiet kid ================= */
export const C1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={80} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)} fx={1500}>
        <Hallway t={t} />
        {[0, 1, 2, 3].map((i) => <Kid key={i} i={i + 2} t={t} x={300 + i * 260 + Math.sin(t + i) * 20} y={860} scale={2.2} pose={walkPose(t * 1.2 + i * 0.3)} talking={i % 2 === 0} />)}
        <Leo t={t} x={1560} scale={2.3} facing={-1} pose={P.pockets} expr="sad" look={[-0.5, 0.5]} rim={RIMC} />
      </Cam>
    </Sh>
  );
};
export const C2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={85} ky={15} kr={45} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Classroom t={t} board="Chapter 7 · Motion" />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 1} t={t} x={360 + i * 280} y={900} scale={2.1} pose={P.sit} talking={i === 1} />)}
        <Leo t={t} x={1560} y={900} scale={2.2} pose={P.sitSlump} expr="neutral" look={[0.4, 0.6]} rim={RIMC} />
        <rect x={1520} y={560} width={80} height={24} rx={10} fill="#222" />
      </Cam>
      <Badge t={t} t0={d * 0.6} x={1560} y={300} text="≈ 3 times a day" size={36} color="#7fb8ff" />
    </Sh>
  );
};
export const C3: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="cold" kx={20} ky={20} box={1}>
      <Cam z={1.08} fx={700}>
        <Classroom t={t} board="Attendance" />
        <Teach t={t} x={520} scale={2.6} pose={P.hold} expr="squint" talking={talk('c03')} mouth={talk('c03') ? 'open' : 'flat'} rim={RIMC} />
        <Leo t={t} x={1500} y={900} scale={2.2} facing={-1} pose={t > 2.2 ? P.wave : P.sitSlump} expr={t > 2.2 ? 'shock' : 'neutral'} rim={RIMC} />
      </Cam>
      <NameFly t={t} t0={0.3} fx={560} fy={330} tx={1500} ty={560} size={52} />
      <NameFly t={t} t0={1.9} fx={560} fy={330} tx={1500} ty={560} size={52} />
    </Sh>
  );
};
export const C5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const k = t < fr('c05', 0.25) ? 0 : t < fr('c05', 0.55) ? 1 : 2;
  return (
    <Sh mood={k === 2 ? 'warm' : 'cold'} kx={60} ky={20} box={1}>
      {k < 2 ? (
        <Cam z={1.05}>
          <Hallway t={t} />
          {k === 1 && [0, 1, 2].map((i) => <Kid key={i} i={i + 3} t={t} x={1100 + i * 250} y={860} scale={2.2} facing={-1} pose={P.wave} expr="happy" mouth="grin" talking />)}
          <Leo t={t} x={700} scale={2.4} pose={k === 1 ? P.wave : P.stand} expr="happy" mouth="grin" rim={RIM} />
          <g transform="translate(720 520)"><rect x={-70} y={-34} width={140} height={68} rx={10} fill="#fff" stroke="#e5483d" strokeWidth={6} /><text x={0} y={-6} textAnchor="middle" fontSize={16} fontWeight={700} fill="#e5483d" fontFamily={FONT_HEAD}>HELLO my name is</text><text x={0} y={24} textAnchor="middle" fontSize={30} fontWeight={700} fill="#222" fontFamily={FONT_HEAD}>LEO</text></g>
          {k === 1 && [0, 1, 2].map((i) => <NameFly key={i} t={t} t0={fr('c05', 0.3) + i * 0.4} fx={1100 + i * 250} fy={500} tx={700} ty={520} size={40} />)}
        </Cam>
      ) : (
        <Cam z={1.04}>
          <Court t={t} />
          <Coach t={t} x={1500} scale={2.6} facing={-1} pose={P.point} expr="angry" mouth="open" talking rim={RIM} />
          <Leo t={t} x={800} scale={2.4} pose={P.hold} expr="happy" mouth="grin" rim={RIM} />
          <Ball x={860} y={620} r={30} />
        </Cam>
      )}
    </Sh>
  );
};
export const C6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="warm" kx={75} ky={20} box={1}>
      <Backdrop a="#ff9a5a" b="#5a2010" />
      <Cam z={tw(t, 0, d, 1.0, 1.12)} fy={430}>
        <Coach t={t} x={960} y={1700} scale={6.4} pose={P.stand} expr="angry" mouth="open" talking rim={RIM} />
      </Cam>
      <NameFly t={t} t0={0.15} fx={960} fy={820} tx={200} ty={700} size={90} col={C.gold} />
      <NameFly t={t} t0={1.6} fx={960} fy={820} tx={200} ty={700} size={90} col={C.gold} />
    </Sh>
  );
};
export const C7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const run = clamp01(t / 1.2);
  return (
    <Sh mood="golden" kx={80} ky={25} box={1}>
      <Cam z={1.0}>
        <Court t={t} px={-run * 200} hoop={false} />
        <Streaks t={t} k={run < 1 ? 0.8 : 0} dir={-1} />
        <Leo t={t} x={300 + run * 1300} scale={2.4} pose={run < 1 ? walkPose(t * 4, 1.4) : P.cheer} expr={run < 1 ? 'squint' : 'happy'} mouth={run < 1 ? 'flat' : 'grin'} rim={RIM} />
        <Coach t={t} x={1700} scale={2.6} facing={-1} pose={t > 1.4 ? P.handsHead : P.hold} expr="shock" mouth="o" rim={RIM} />
        {t > 1.4 && <g transform={`translate(${1620 - (t - 1.4) * 40} ${560 + Math.min(1, (t - 1.4) * 2) * 280})`}><circle r={26} fill="#c8cdd6" /><rect x={-6} y={-36} width={12} height={12} fill="#c8cdd6" /></g>}
      </Cam>
      <Badge t={t} t0={1.3} x={960} y={200} text="40 m · 3.0 s" size={56} color={C.gold} icon="⏱" />
    </Sh>
  );
};
export const C8: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const part = t < fr('c08', 0.3) ? 0 : t < fr('c08', 0.55) ? 1 : 2;
  return (
    <Sh mood={part === 1 ? 'cold' : 'golden'} kx={60} ky={25} box={1}>
      {part === 0 && (
        <Cam z={1.5} fx={960} fy={600}>
          <KidRoom t={t} v="day" bed={false} />
          <Leo t={t} x={900} scale={2.6} pose={P.reach} expr="smug" mouth="smirk" rim={RIM} />
          <g transform={`translate(1060 ${Math.min(700, 560 + t * 30)}) rotate(20)`}><rect x={-26} y={-46} width={52} height={92} rx={10} fill="#16161c" /><rect x={-20} y={-38} width={40} height={72} rx={6} fill="#4fd8ff" /></g>
        </Cam>
      )}
      {part === 1 && (
        <Cam z={1.05}>
          <Classroom t={t} board="Q: 3x + 5 = 20" />
          <Teach t={t} x={520} scale={2.6} pose={P.point} expr="shock" mouth="o" rim={RIMC} />
          <Leo t={t} x={1500} y={900} scale={2.2} facing={-1} pose={P.cheer} expr="smug" mouth="grin" rim={RIM} />
          <Bubble t={t} t0={fr('c08', 0.32)} x={1500} y={430} text="x = 5. Done." size={40} />
        </Cam>
      )}
      {part === 2 && (
        <Cam z={1.04}>
          <Sky t={t} a="#ffb07a" b="#ffe3b8" />
          <City col="#b48a70" lit={false} px={-t * 400} />
          <Streaks t={t} k={0.9} />
          <Leo t={t} x={960} scale={2.6} pose={walkPose(t * 5, 1.5)} expr="happy" mouth="grin" rim={RIM} />
          <g transform="translate(1080 600)"><rect x={-40} y={-30} width={80} height={60} rx={8} fill="#c4744d" /><rect x={-40} y={-30} width={80} height={14} fill="#a05a38" /></g>
        </Cam>
      )}
    </Sh>
  );
};

/* ================= D — viral + sonic boom ================= */
export const D1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={20} ky={30} box={1}>
      <Cam z={1.0}>
        <Street t={t} v="day" px={-t * 300} />
        <Streaks t={t} k={0.7} />
        <Bus x={1100 - t * 120} y={940} s={1.0} />
        <Leo t={t} x={500 + t * 360} y={930} scale={2.5} pose={walkPose(t * 5, 1.5)} expr="happy" mouth="grin" rim={RIM} />
        <g transform="translate(240 640) rotate(-8)"><rect x={-70} y={-120} width={140} height={240} rx={18} fill="#16161c" /><rect x={-60} y={-108} width={120} height={200} rx={10} fill="#3a4a6a" /><circle cx={40} cy={-90} r={10} fill={C.red} /></g>
      </Cam>
      <Badge t={t} t0={0.3} x={300} y={420} text="REC" size={32} color={C.red} icon="●" />
    </Sh>
  );
};
export const D2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const views = Math.min(11_000_000, Math.exp(tw(t, 0.2, d * 0.5, Math.log(300), Math.log(11_000_000), ease.in)));
  return (
    <Sh mood="night" kx={50} ky={45} box={1}>
      <Backdrop a="#1a1440" b="#05040e" />
      <ViralPhone x={960} y={560} s={1.0} t={t} views={views} cap={['Kid outruns a SCHOOL BUS', '(his name is Leo) 🤯']}>
        <g transform="translate(0 -150) scale(0.42)">
          <rect x={-450} y={-360} width={900} height={720} fill="#8cc8ff" />
          <Leo t={t} x={-100} y={300} scale={2.4} pose={walkPose(t * 4, 1.4)} expr="happy" />
          <Bus x={300} y={330} s={0.6} />
        </g>
      </ViralPhone>
      {[...Array(14)].map((_, i) => {
        const t0 = d * 0.45 + i * 0.32;
        if (t < t0) return null;
        const k = clamp01((t - t0) / 2.2);
        const x = i % 2 ? 1450 + (i % 4) * 60 : 300 + (i % 3) * 70;
        return <text key={i} x={x} y={850 - k * 600} fontSize={40 + (i % 3) * 10} fontWeight={700} fill={C.gold} opacity={1 - k} stroke="#1a0c00" strokeWidth={6} paintOrder="stroke" fontFamily={FONT_HEAD}>LEO</text>;
      })}
    </Sh>
  );
};
export const D3: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="dusk" kx={30} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Hallway t={t} />
        <Kid i={5} t={t} x={760} y={880} scale={2.6} pose={P.phone} expr="shock" mouth="open" talking={talk('d03')} />
        <Kid i={2} t={t} x={1160} y={880} scale={2.5} facing={-1} pose={P.handsHead} expr="shock" mouth="o" />
      </Cam>
      <NameFly t={t} t0={0.5} fx={880} fy={600} tx={1900} ty={300} />
      <NameFly t={t} t0={1.3} fx={880} fy={600} tx={1900} ty={300} />
    </Sh>
  );
};
export const D4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Sky t={t} a="#0b0a24" b="#2a1650" stars />
      <Cam z={tw(t, 0, d, 1.0, 1.15)}>
        <Earth x={960} y={560} r={330} />
        {[...Array(40)].map((_, i) => {
          const t0 = (i * 0.13) % Math.max(0.5, d - 0.8);
          const a = i * 2.39;
          return <NameFly key={i} t={t} t0={t0} fx={960 + Math.cos(a) * 1100} fy={560 + Math.sin(a) * 700} tx={960 + Math.cos(a) * 300} ty={560 + Math.sin(a) * 300} size={30} />;
        })}
      </Cam>
    </Sh>
  );
};
export const D4b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="danger" kx={50} ky={80} box={1}>
      <Backdrop a="#3a1410" b="#0a0404" />
      <Cam z={tw(t, 0, d, 1.4, 1.6)} fy={760}>
        <rect x={0} y={860} width={1920} height={220} fill="#2a2228" />
        <Leo t={t} x={960} y={860} scale={2.6} pose={P.stand} expr="worried" look={[0, 0.8]} rim="rgba(255,120,60,1)" />
        {[0, 1].map((i) => <ellipse key={i} cx={930 + i * 60} cy={862} rx={40} ry={10} fill="#ff6a2a" opacity={0.7 + 0.3 * Math.sin(t * 20 + i)} filter="url(#glowF)" />)}
        {[...Array(10)].map((_, i) => { const ph = (t * 0.8 + i * 0.1) % 1; return <path key={i} d={`M ${900 + i * 12} ${850 - ph * 200} q 10 -20 0 -40`} stroke="#bbb" strokeWidth={6} fill="none" opacity={0.5 * (1 - ph)} />; })}
      </Cam>
      <Kinetic t={t} t0={0.2} x={500} y={250} text="MACH 1" col="#ff8a3d" size={90} />
      <Kinetic t={t} t0={1.2} x={1420} y={250} text="MACH 2" col={C.red} size={90} />
      <Badge t={t} t0={d * 0.6} x={960} y={890} text="3 pairs of sneakers a day" size={40} color="#fff" icon="👟" />
    </Sh>
  );
};
const cafeteria = (t: number, boom: number, broken: number) => (
  <g>
    <Dining t={t} food="dinner" v="day" />
    {[0, 1, 2, 3].map((i) => <Window key={i} x={120 + i * 460} y={90} w={300} h={300} broken={broken} sky="#bfe6ff" />)}
    {[0, 1].map((i) => <Kid key={i} i={i} t={t} x={420 + i * 1080} y={900} scale={2.1} pose={boom > 0 ? P.handsHead : P.sitTable} expr={boom > 0 ? 'shock' : 'neutral'} mouth={boom > 0 ? 'o' : 'none'} />)}
  </g>
);
export const D5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const up = fr('d05', 0.45);
  return (
    <Sh mood="warm" kx={50} ky={10} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.2, ease.in)} fy={600}>
        {cafeteria(t, 0, 0)}
        <Leo t={t} x={960} y={t > up ? 880 : 900} scale={2.4} pose={t > up ? P.stand : P.sitTable} expr={t > up ? 'shock' : 'neutral'} rim={RIM} />
      </Cam>
      {t > up && <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={0.6 * Math.max(0, 1 - (t - up) * 4)} />}
    </Sh>
  );
};
export const D6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const sh = t < 0.8 ? Math.sin(t * 90) * 26 * (1 - t / 0.8) : 0;
  return (
    <Sh mood="warm" kx={50} ky={10} box={1}>
      <g transform={`translate(${sh} ${sh * 0.5})`}>
        <Cam z={1.0}>
          {cafeteria(t, 1, t > 0.15 ? 1 : 0)}
          <Leo t={t} x={960} y={880} scale={2.4} pose={P.armsUp} expr="shock" mouth="o" rim={RIM} />
          <Boomring t={t} t0={0} x={960} y={620} />
          {[0, 1, 2, 3].map((i) => <Shards key={i} t={t} t0={0.12} x={270 + i * 460} y={240} n={14} />)}
        </Cam>
      </g>
      <Boom t={t} t0={0.05} x={960} y={200} text="BOOM" col="#bfe9ff" size={150} rot={-4} />
    </Sh>
  );
};
export const D7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        {cafeteria(t, 0, 1)}
        {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 520} y={760} width={240} height={160} fill="#20283a" opacity={0.0} />)}
        <Leo t={t} x={960} y={880} scale={2.4} pose={P.pockets} expr="sad" look={[0, 0.6]} rim={RIMC} />
      </Cam>
      <Kinetic t={t} t0={d * 0.55} x={960} y={895} text="scared of you." col="#bfe9ff" size={60} />
    </Sh>
  );
};

/* ================= E — escape velocity / relativity ================= */
export const E1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={30} box={1}>
      <Sky t={t} a="#05061a" b="#1a1a4a" stars />
      <Cam z={tw(t, 0, d, 1.0, 1.1)}>
        <Earth x={960} y={1600} r={1000} />
        <Leo t={t} x={960} y={610} scale={2.0} pose={P.stand} expr="worried" look={[0, -0.8]} rim={RIMC} />
        <path d="M 960 560 Q 1000 200 1300 -100" stroke={C.gold} strokeWidth={6} strokeDasharray="18 14" fill="none" opacity={tw(t, fr('e01', 0.6), fr('e01', 0.75), 0, 1)} />
      </Cam>
      <Badge t={t} t0={fr('e01', 0.3)} x={960} y={195} text="40,320 km/h = ESCAPE VELOCITY" size={44} color={C.red} />
    </Sh>
  );
};
export const E2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const step = (t * 0.25) % 1;
  return (
    <Sh mood="dusk" kx={70} ky={20} box={1}>
      <Cam z={1.1}>
        <Kitchen t={t} v="evening" />
        <Leo t={t} x={700 + t * 20} scale={2.6} pose={walkPose(step * 0.5, 0.4)} expr="squint" mouth="flat" sweat rim={RIM} />
        <g transform="translate(1100 610)"><rect x={-30} y={-50} width={60} height={100} rx={8} fill="#bfe6ff" opacity={0.7} /></g>
      </Cam>
      <Badge t={t} t0={0.6} x={960} y={200} text="slow… slow… slow…" size={44} color="#fff" />
    </Sh>
  );
};
export const E2b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={60} ky={10} kr={60} box={1}>
      <Cam z={tw(t, 0, d, 1.2, 1.0, ease.soft)} fy={560}>
        <Street t={t} v="night" />
        <Cone x={1500} y={200} w={600} h={900} op={0.35} />
        {/* frozen raindrops */}
        {[...Array(160)].map((_, i) => {
          const x = (i * 137) % 1920, y = (i * 89) % 900 + 40;
          const near = Math.abs(x - (700 + t * 70)) < 90 && y > 300;
          return <path key={i} d={`M ${x} ${y} q 6 10 0 18 q -6 -8 0 -18 Z`} fill="#cfe9ff" opacity={near ? 0.15 : 0.75} />;
        })}
        <Leo t={t} x={700 + t * 70} y={920} scale={2.4} pose={walkPose(t * 0.6, 0.6)} expr="happy" mouth="smile" look={[0.6, -0.6]} rim={RIMC} />
      </Cam>
      <Dust t={t} col="#cfe9ff" op={0.4} />
    </Sh>
  );
};
export const E3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="clean" kx={50} ky={50} box={1}>
      <Backdrop a="#141030" b="#020208" />
      <g transform="translate(960 540)">
        <circle r={300} fill="none" stroke="#fff" strokeWidth={10} opacity={0.8} />
        {[...Array(12)].map((_, i) => <rect key={i} x={-4} y={-290} width={8} height={30} fill="#fff" transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={0} y2={-230} stroke={C.gold} strokeWidth={12} strokeLinecap="round" transform={`rotate(${t * 8})`} />
        <line x1={0} y1={0} x2={0} y2={-160} stroke="#fff" strokeWidth={16} strokeLinecap="round" transform={`rotate(${t * 0.7})`} />
      </g>
      <RGBSplit amt={6}><text x={960} y={890} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>TIME</text></RGBSplit>
    </Sh>
  );
};
export const E4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const split = fr('e04', 0.5);
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <text x={960} y={190} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>Einstein, 1905: moving clocks run slow</text>
      {[['YOU', 0.15, C.gold, 380], ['EVERYONE ELSE', 1, '#7fb8ff', 1540]].map(([lab, rate, col, x], i) => (
        <g key={i} transform={`translate(${x} 560)`}>
          <circle r={190} fill="none" stroke={col as string} strokeWidth={10} />
          <line x1={0} y1={0} x2={0} y2={-150} stroke={col as string} strokeWidth={12} strokeLinecap="round" transform={`rotate(${t * 60 * (rate as number) * (t > split ? 1 : 0.999)})`} />
          <text x={0} y={280} textAnchor="middle" fontSize={50} fontWeight={700} fill={col as string} fontFamily={FONT_HEAD}>{lab as string}</text>
        </g>
      ))}
      <text x={60} y={935} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Special relativity: time dilation factor γ = 1/√(1−v²/c²)</text>
    </Sh>
  );
};
export const E5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const days = Math.floor(tw(t, fr('e05', 0.6), fr('e05', 0.95), 1, 70));
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} tint={C.red} />
      <BigText t={t} t0={0.2} x={960} y={220} text="99.99% LIGHT SPEED" size={86} color={C.red} />
      <g transform="translate(560 600)"><rect x={-220} y={-150} width={440} height={300} rx={30} fill="rgba(255,210,90,0.1)" stroke={C.gold} strokeWidth={6} /><text x={0} y={30} textAnchor="middle" fontSize={110} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>1 day</text><text x={0} y={120} textAnchor="middle" fontSize={40} fill="#fff" fontFamily={FONT_HEAD}>you</text></g>
      <text x={960} y={630} textAnchor="middle" fontSize={90} fill="#fff" fontFamily={FONT_HEAD}>=</text>
      <g transform="translate(1360 600)" opacity={tw(t, fr('e05', 0.55), fr('e05', 0.65), 0, 1)}><rect x={-220} y={-150} width={440} height={300} rx={30} fill="rgba(127,184,255,0.1)" stroke="#7fb8ff" strokeWidth={6} /><text x={0} y={30} textAnchor="middle" fontSize={110} fontWeight={700} fill="#7fb8ff" fontFamily={FONT_HEAD}>{days} days</text><text x={0} y={120} textAnchor="middle" fontSize={40} fill="#fff" fontFamily={FONT_HEAD}>them</text></g>
    </Sh>
  );
};
export const E6: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const home = fr('e06', 0.5);
  // time-lapse: sun/moon spinning across the sky while Leo walks back
  return (
    <Sh mood={t > home ? 'cold' : 'golden'} kx={60} ky={20} box={1}>
      <Cam z={1.0}>
        {t < home ? (
          <>
            <Street t={t} v="day" />
            <Leo t={t} x={500 + t * 200} y={930} scale={2.5} pose={walkPose(t * 1.2)} expr="happy" mouth="smile" rim={RIM} />
            <g transform={`translate(${520 + t * 200} 690)`}><rect x={-26} y={-50} width={52} height={90} rx={8} fill="#fff" /><rect x={-26} y={-50} width={52} height={24} fill="#4fd8ff" /></g>
          </>
        ) : (
          <>
            <rect width={1920} height={1080} fill={Math.floor((t - home) * 3) % 2 ? '#0b1230' : '#8cc8ff'} />
            {[...Array(6)].map((_, i) => <circle key={i} cx={(((t - home) * 1800 + i * 640) % 2400) - 200} cy={200 + Math.sin(i) * 60} r={50} fill={i % 2 ? '#fff6c9' : '#d9dbe2'} opacity={0.8} />)}
            <Street t={t} v="night" />
            <Leo t={t} x={900} y={930} scale={2.5} pose={P.hold} expr="shock" mouth="o" rim={RIMC} />
            <g transform="translate(940 690)"><rect x={-26} y={-50} width={52} height={90} rx={8} fill="#fff" /><rect x={-26} y={-50} width={52} height={24} fill="#4fd8ff" /></g>
            <Badge t={t} t0={home + 0.4} x={960} y={200} text="+ 2 MONTHS" size={60} color={C.red} icon="◷" />
          </>
        )}
      </Cam>
    </Sh>
  );
};
export const E7: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="night" kx={30} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Living t={t} v="evening" />
        <Cone x={420} y={0} w={600} h={1000} op={0.3} />
        <Mom t={t} x={760} scale={2.6} pose={P.hug} expr="sad" tears={1} mouth={talk('e07') ? 'open' : 'frown'} talking={talk('e07')} gray={0.25} rim={RIM} />
        <Leo t={t} x={1080} scale={2.5} facing={-1} pose={P.hold} expr="worried" rim={RIM} />
      </Cam>
      <NameFly t={t} t0={0.2} fx={760} fy={420} tx={1080} ty={560} />
      <NameFly t={t} t0={1.0} fx={760} fy={420} tx={1080} ty={560} />
    </Sh>
  );
};
export const E8: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const away = tw(t, fr('e08', 0.5), d, 0, 1, ease.soft);
  return (
    <Sh mood="night" kx={50} ky={30} box={1}>
      <Backdrop a="#1a1440" b="#04030a" />
      <Cam z={tw(t, 0, d, 1.0, 0.85, ease.soft)}>
        <Mom t={t} x={760 - away * 300} scale={2.6} pose={P.reach} expr="sad" tears={1} gray={0.25 + away * 0.6} rim={RIM} opacity={1 - away * 0.4} />
        <Leo t={t} x={1160 + away * 300} scale={2.5} facing={-1} pose={P.reach} expr="sad" rim={RIMC} />
        <Streaks t={t} k={away * 0.6} dir={1} y0={500} y1={800} />
      </Cam>
    </Sh>
  );
};

/* ================= F — the choice ================= */
export const F1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const grow = tw(t, fr('f01', 0.55), fr('f01', 0.95), 0, 1, ease.soft);
  return (
    <Sh mood="dusk" kx={70} ky={20} box={1}>
      <Cam z={1.04}>
        <KidRoom t={t} v="dawn" bed={false} />
        <Leo t={t} x={660} scale={2.6} pose={P.stand} expr="worried" look={[1, 0]} rim={RIM} />
        <Mia t={t} x={1260} scale={2.6} facing={-1} height={0.68 + grow * 0.3} pose={P.stand} expr="neutral" rim={RIM} />
      </Cam>
      <Badge t={t} t0={fr('f01', 0.2)} x={960} y={195} text="1 afternoon = 10 years" size={52} color={C.red} icon="◷" />
    </Sh>
  );
};
export const F2: ShotFC = ({ o, d }) => {
  const { t, s } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={40} box={1}>
      <Backdrop a="#100a24" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fy={440}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="sad" look={[0, 0.3]} rim={RIM} />
      </Cam>
      <Kinetic t={t} t0={s('f03') + 0.3} x={960} y={200} text="FORGET MY NAME." col="#fff" size={96} />
    </Sh>
  );
};
export const F4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const del = clamp01((t - 0.5) / 2.5);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#1a1440" b="#05040e" />
      <ViralPhone x={960} y={560} s={1.0} t={t} views={11_000_000 * (1 - del)} cap={['Kid outruns a SCHOOL BUS', '(his name is Leo) 🤯']}>
        <rect x={-190} y={-300} width={380} height={300} fill="#2a3350" />
        <text x={0} y={-140} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{del > 0.95 ? 'Video removed' : 'Deleting…'}</text>
        <rect x={-140} y={-110} width={280} height={14} rx={7} fill="rgba(255,255,255,0.2)" />
        <rect x={-140} y={-110} width={280 * del} height={14} rx={7} fill={C.red} />
      </ViralPhone>
      <Kinetic t={t} t0={fr('f04', 0.7)} x={960} y={895} text="you disappear." col="#bfe9ff" size={60} />
    </Sh>
  );
};
export const F5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const fade = clamp01(t / (d * 0.8));
  return (
    <Sh mood="cold" kx={50} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Hallway t={t} />
        {[0, 1, 2, 3].map((i) => <Kid key={i} i={i + 1} t={t} x={300 + i * 330} y={860} scale={2.2} pose={P.phone} />)}
        {[0, 1, 2, 3].map((i) => <text key={i} x={300 + i * 330} y={420 - (i % 2) * 40} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.gold} opacity={1 - fade} fontFamily={FONT_HEAD}>LEO</text>)}
      </Cam>
    </Sh>
  );
};
export const F5b: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="cold" kx={40} ky={30} box={1}>
      <Backdrop a="#0b1530" b="#020610" />
      <g transform="translate(960 520)">
        <rect x={-640} y={-380} width={1280} height={740} rx={24} fill="#0a0c14" stroke="#2a3350" strokeWidth={16} />
        <rect x={-610} y={-350} width={1220} height={680} fill="#c99a78" />
        <g transform="translate(0 280)"><Mom t={t} x={0} y={0} scale={2.4} pose={P.hold} expr="sad" tears={1} mouth={talk('f05b') ? 'open' : 'frown'} talking={talk('f05b')} gray={0.4} /></g>
        <rect x={-610} y={230} width={1220} height={100} fill={C.red} />
        <text x={-580} y={295} fontSize={46} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>LIVE · MOTHER OF “SPEED BOY” MAKES PLEA</text>
      </g>
    </Sh>
  );
};
export const F6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const f = fmtSpeed(speedAt(o + t).kmh);
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} tint="#7fb8ff" />
      {[0, 1, 2].map((i) => <Kinetic key={i} t={t} t0={0.2 + i * 1.0} x={960} y={330 + i * 110} text="−1%" col="#7fb8ff" size={80} />)}
      <text x={960} y={820} textAnchor="middle" fontSize={90} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{f.big} <tspan fontSize={40}>{f.unit}</tspan></text>
    </Sh>
  );
};
export const F7: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const stage = t < fr('f07', 0.12) ? 0 : t < fr('f07', 0.22) ? 1 : t < fr('f07', 0.35) ? 2 : 3;
  return (
    <Sh mood={stage === 3 ? 'golden' : 'dusk'} kx={70} ky={30} box={1}>
      <Cam z={1.0}>
        <Sky t={t} a="#ff9e6b" b="#ffd9a0" />
        <City col="#6a3a50" lit={false} px={-t * (stage === 3 ? 10 : 600 / (stage + 1))} />
        <rect x={0} y={860} width={1920} height={220} fill="#3a2430" />
        {stage < 3 && <Streaks t={t} k={1 - stage * 0.3} />}
        <Leo t={t} x={960} y={880} scale={2.6} pose={stage < 3 ? walkPose(t * (4 - stage), 1.3 - stage * 0.25) : P.stand} expr={stage === 3 ? 'happy' : 'squint'} mouth={stage === 3 ? 'smile' : 'flat'} rim={RIM} />
      </Cam>
      <Kinetic t={t} t0={fr('f07', 0.02)} x={500} y={200} text={['LIGHT SPEED', 'ROCKET', 'CAR', 'NORMAL.'][stage]} col={stage === 3 ? '#fff' : C.gold} size={80} />
      <Dust t={t} />
    </Sh>
  );
};

/* ================= G — the freeze ================= */
export const G1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="clean" kx={50} ky={50} box={1}>
      <Backdrop a="#0a0a1e" b="#000" />
      <Slices id="g1" t={t} k={t < 0.4 ? 1 : 0}>
        <text x={960} y={560} textAnchor="middle" fontSize={140} fontWeight={700} fill="#7fb8ff" fontFamily={FONT_HEAD}>24 → 0 km/h</text>
      </Slices>
    </Sh>
  );
};
export const G2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const reach = clamp01(t / 7);
  return (
    <Sh mood="cold" kx={30} ky={25} box={1}>
      <Cam z={tw(t, 0, d, 1.4, 1.5)} fx={1000} fy={600}>
        <Kitchen t={t} v="evening" />
        <Leo t={t} x={860} scale={2.6} pose={mixPose(P.stand, P.reach, reach)} expr="worried" rim={RIMC} />
        <g transform="translate(1100 610)"><rect x={-30} y={-50} width={60} height={100} rx={8} fill="#bfe6ff" opacity={0.7} /></g>
      </Cam>
      <Badge t={t} t0={0.4} x={960} y={195} text="⅕ speed · 10 s to reach a glass" size={44} color="#7fb8ff" />
    </Sh>
  );
};
export const G2b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={60} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <KidRoom t={t} v="dawn" bed />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr="neutral" rim={RIM} />
        <Mia t={t} x={1150} y={760} scale={2.6} facing={-1} pose={P.sit} expr="soft" mouth="open" talking rim={RIM} />
      </Cam>
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${1150 - i * 120 - (t * 30) % 120} ${470 - i * 20})`} opacity={0.6}><path d="M 0 0 q 20 -30 40 0 t 40 0" stroke="#ffd9a8" strokeWidth={6} fill="none" transform={`scale(${1 + i * 0.2} 1)`} /></g>)}
      <Kinetic t={t} t0={d * 0.5} x={960} y={895} text="…h e l l o   L e o…" col="#ffd9a8" size={50} />
    </Sh>
  );
};
export const G3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const day = Math.floor(tw(t, 0.3, d, 1, 31));
  const sweep = (t * 0.6) % 1;
  return (
    <Sh mood="cold" kx={20 + sweep * 60} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fy={620}>
        <KidRoom t={t} v="day" bed />
        <g filter="url(#softShadow)" opacity={0.0} />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr="neutral" look={[0.2, 0]} rim={RIMC} />
        {[...Array(12)].map((_, i) => <circle key={i} cx={700 + (i * 37) % 160} cy={420 + (i * 23) % 260} r={2} fill="#fff" opacity={0.35} />)}
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.35 * Math.abs(Math.sin(sweep * Math.PI * 2))} />
      <Badge t={t} t0={0.3} x={1650} y={195} text={`DAY ${day}`} size={50} color="#7fb8ff" icon="◷" />
      <Stamp t={t} t0={fr('g03', 0.35)} x={1200} y={300} text="STATUE" color="#7fb8ff" rot={-8} size={70} />
    </Sh>
  );
};
export const G4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={40} box={1}>
      <Backdrop a="#0d0d22" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.06, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="neutral" look={[0, 0]} rim={RIMC} />
      </Cam>
      {[0, 1, 2].map((i) => { const k = ((t * 0.5 + i / 3) % 1); return <circle key={i} cx={960} cy={500} r={200 + k * 600} fill="none" stroke="#7fb8ff" strokeWidth={4} opacity={0.4 * (1 - k)} />; })}
    </Sh>
  );
};
export const G5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={20} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
        <Kitchen t={t} v="night" />
        <Cone x={500} y={0} w={500} h={1000} op={0.3} />
        <Mom t={t} x={520} scale={2.6} pose={P.facepalm} expr="sad" tears={1} gray={0.55} rim={RIM} />
      </Cam>
    </Sh>
  );
};

/* ================= H — Mia ================= */
export const H1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const open = tw(t, fr('h01', 0.2), fr('h01', 0.4), 0, 1);
  const sitX = kf(t, [[fr('h01', 0.4), 1650], [fr('h01', 0.8), 1080]]);
  return (
    <Sh mood="night" kx={88} ky={40} kr={50} box={1}>
      <Cam z={1.0}>
        <KidRoom t={t} v="night" bed />
        <rect x={1700} y={220} width={180} height={620} fill="#ffcf8a" opacity={open * 0.85} />
        <Cone x={1790} y={240} w={900} h={900} op={open * 0.35} rot={45} />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr="neutral" rim={RIM} />
        {open > 0.3 && <Mia t={t} x={sitX} y={sitX < 1100 ? 760 : 840} scale={2.6} facing={-1} pose={sitX < 1100 ? P.sit : walkPose(t)} expr="sad" rim={RIM} />}
      </Cam>
    </Sh>
  );
};
export const H2: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="night" kx={70} ky={40} box={1}>
      <Backdrop a="#2a1a3a" b="#05030a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={430}>
        <Mia t={t} x={960} y={1560} scale={7.0} pose={P.stand} expr="sad" tears={0.6} mouth={talk('h02') ? 'open' : 'flat'} talking={talk('h02')} rim={RIM} />
      </Cam>
      <NameFly t={t} t0={0.2} fx={960} fy={900} tx={-100} ty={700} size={90} />
    </Sh>
  );
};
export const H3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const tw1 = t > 1.0 ? Math.sin((t - 1) * 18) * 8 * Math.max(0, 1 - (t - 1) * 1.5) : 0;
  return (
    <Sh mood="night" kx={50} ky={30} box={1}>
      <Backdrop a="#1a1430" b="#05030a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        <path d="M -100 780 Q 500 720 900 640" stroke={COL.you} strokeWidth={190} strokeLinecap="round" fill="none" />
        <path d="M -100 780 Q 400 730 800 660" stroke="#16161c" strokeWidth={60} strokeLinecap="round" fill="none" />
        <circle cx={950} cy={630} r={110} fill="#16161c" />
        <circle cx={950} cy={630} r={110} fill="url(#gHead)" />
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={1050 + i * 8} cy={560 + i * 42} rx={70} ry={24} fill="#16161c" transform={`rotate(${i === 0 ? -10 + tw1 * 4 : 8} ${1000} ${560 + i * 42})`} />)}
        <ellipse cx={890} cy={540} rx={26} ry={60} fill="#16161c" transform="rotate(-35 890 560)" />
        {t > 1 && <path d="M 1150 520 q 20 -10 34 6 M 1160 500 q 24 -18 44 0" stroke="#ffd9a8" strokeWidth={6} fill="none" opacity={Math.max(0, 1 - (t - 1) * 0.8)} strokeLinecap="round" />}
        <circle cx={1000} cy={600} r={200} fill="#ffcf8a" opacity={t > 1 ? 0.12 : 0} filter="url(#glowF)" />
      </Cam>
      <Neon t={t} t0={0.2} x={960} y={200} text="+1%" col={C.mint} size={80} />
    </Sh>
  );
};
export const H4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="night" kx={60} ky={40} box={1}>
      <Cam z={tw(t, 0, d, 1.1, 1.2)}>
        <KidRoom t={t} v="night" bed />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr="neutral" look={[0.8, 0]} rim={RIM} />
        <Mia t={t} x={1080} y={760} scale={2.6} facing={-1} pose={P.hug} expr="sad" tears={1} mouth="open" talking={talk('h04')} rim={RIM} />
      </Cam>
      {[0, 1, 2].map((i) => <NameFly key={i} t={t} t0={0.1 + i * 0.6} fx={1020} fy={600} tx={760} ty={600} size={56} />)}
    </Sh>
  );
};
export const H5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const dawn = t > fr('h05', 0.45);
  const n = Math.floor(tw(t, 0.2, fr('h05', 0.45), 1, 100));
  return (
    <Sh mood={dawn ? 'dawn' : 'night'} kx={dawn ? 25 : 60} ky={30} box={1}>
      <Cam z={1.04}>
        <KidRoom t={t} v={dawn ? 'dawn' : 'night'} bed />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr={dawn ? 'soft' : 'neutral'} rim={RIM} />
        <Mia t={t} x={1080} y={760} scale={2.6} facing={-1} pose={P.sit} expr="soft" mouth="open" talking rim={RIM} />
      </Cam>
      {[...Array(6)].map((_, i) => <NameFly key={i} t={t} t0={0.2 + i * (d / 6)} fx={1020} fy={600} tx={760} ty={600} size={44} />)}
      <Badge t={t} t0={0.2} x={1650} y={195} text={dawn ? 'NEXT MORNING' : `“LEO” ×${n}`} size={44} color={C.gold} />
    </Sh>
  );
};
export const H6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dawn" kx={50} ky={20} box={1}>
      <Sky t={t} a="#2a2050" b="#ffb48a" />
      <City col="#2a1a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        <Earth x={960} y={1700} r={1000} />
        {[...Array(18)].map((_, i) => <circle key={i} cx={200 + (i * 97) % 1500} cy={300 + (i * 61) % 300} r={6} fill="#fff" opacity={0.25} />)}
        <Mia t={t} x={1000} y={720} scale={1.6} facing={-1} pose={P.stand} expr="soft" rim={RIM} />
        <circle cx={1000} cy={600} r={160} fill="#ffd9a8" opacity={0.3} filter="url(#glowF)" />
      </Cam>
      <Dust t={t} />
    </Sh>
  );
};
export const H7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={30} box={1}>
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="soft" mouth="smile" tears={0.8} look={[0.5, 0.1]} rim={RIM} />
      </Cam>
      <Dust t={t} />
    </Sh>
  );
};
export const H8: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={30} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.04)}>
        <Kitchen t={t} v="morning" />
        <Cone x={400} y={0} w={700} h={1000} op={0.35} rot={-12} />
        <Mia t={t} x={760} scale={2.6} pose={P.wave} expr="happy" mouth={talk('h08') ? 'open' : 'grin'} talking={talk('h08')} rim={RIM} />
        <Leo t={t} x={1160} scale={2.6} facing={-1} pose={P.wave} expr="happy" mouth="grin" rim={RIM} />
      </Cam>
      <NameFly t={t} t0={0.3} fx={760} fy={420} tx={1160} ty={520} />
      <Dust t={t} />
    </Sh>
  );
};

/* ================= I — cliffhanger ================= */
export const I1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const n = Math.min(100, Math.floor(tw(t, 1.5, d - 0.5, 0, 100)));
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Court t={t} />
        <Mia t={t} x={1300} scale={2.6} facing={-1} pose={P.cheer} expr="happy" mouth="grin" talking rim={RIM} />
        <Leo t={t} x={700} scale={2.6} pose={P.hold} expr="happy" mouth="grin" rim={RIM} />
        <Ball x={760} y={620} r={30} />
      </Cam>
      <Badge t={t} t0={0.6} x={960} y={200} text={`“LEO” ×${n} / 100`} size={48} color={C.gold} />
    </Sh>
  );
};
export const I2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const buzz = Math.sin(t * 80) * 6 * (t < 1.2 ? 1 : 0);
  return (
    <Sh mood="clean" kx={50} ky={50} box={1}>
      <Backdrop a="#0d0d22" b="#000" />
      <g transform={`translate(${960 + buzz} 560)`}>
        <rect x={-200} y={-380} width={400} height={760} rx={50} fill="#111" />
        <rect x={-180} y={-350} width={360} height={700} rx={34} fill="#14182a" />
        <rect x={-160} y={-300} width={320} height={120} rx={20} fill="#2a3350" />
        <text x={-130} y={-250} fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>🔥 TRENDING #1</text>
        <text x={-130} y={-210} fontSize={24} fill="#cfd6ea" fontFamily={FONT_HEAD}>“LEO the speed boy” is back</text>
      </g>
      <circle cx={960} cy={560} r={420} fill={C.red} opacity={0.08} filter="url(#glowF)" />
    </Sh>
  );
};
export const I3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="danger" kx={50} ky={50} box={1}>
      <Sky t={t} a="#05061a" b="#2a0a1a" stars />
      <Cam z={tw(t, 0, d, 1.0, 1.25, ease.in)}>
        <Earth x={960} y={560} r={330} />
        {[...Array(60)].map((_, i) => {
          const t0 = (i * 0.07) % Math.max(0.5, d - 0.8); const a = i * 2.39;
          return <NameFly key={i} t={t} t0={t0} fx={960 + Math.cos(a) * 1100} fy={560 + Math.sin(a) * 700} tx={960 + Math.cos(a) * 300} ty={560 + Math.sin(a) * 300} size={28} col={i % 3 ? C.gold : C.red} />;
        })}
      </Cam>
    </Sh>
  );
};
export const I4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const beat = Math.abs(Math.sin(t * (4 + t * 3)));
  return (
    <Sh mood="danger" kx={50} ky={40} box={1}>
      <Backdrop a="#2a0a10" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.15)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" look={[0, -0.2]} rim="rgba(255,90,60,1)" />
      </Cam>
      <circle cx={960} cy={540} r={500} fill={C.red} opacity={0.15 * beat} filter="url(#glowF)" />
      <Streaks t={t} k={tw(t, 1.5, d, 0, 0.8)} />
    </Sh>
  );
};
export const I5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={30} box={1}>
      <Sky t={t} a="#2a1650" b="#ff9e7a" />
      <City col="#1a1030" />
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Leo t={t} x={820} y={900} scale={2.6} pose={P.stand} expr="smug" mouth="smirk" rim={RIM} />
        <Mia t={t} x={1100} y={900} scale={2.6} facing={-1} pose={P.cheer} expr="happy" mouth="grin" rim={RIM} />
      </Cam>
      <Badge t={t} t0={fr('i05', 0.05)} x={960} y={205} text="Would you want this power?" size={54} color="#fff" />
      <Neon t={t} t0={fr('i05', 0.55)} x={960} y={895} text="WHO WOULD SAY YOUR NAME?" col={C.gold} size={46} />
    </Sh>
  );
};
