import React from 'react';
import { Cam, Badge, BigText, Bubble, Stamp } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, Hallway, DataBG, Backdrop, Classroom } from '../sets/Sets';
import { Street } from '../sets/Sets2';
import { Court, Ball, Earth, KidRoom, Living, ViralPhone } from '../sets/Sets3';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Leo, Mia, Mom, Teach, Coach, COL } from './cast3';
import { Kid } from './common';
import { Sh, Neon, Kinetic, Boom, frOf } from './kit3';
import { NameFly, Streaks, Dust, Cone } from '../lib/cine';
import { heightAt } from '../lib/height';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };
const RIM = 'rgba(255,190,120,0.95)';
const RIMC = 'rgba(140,220,255,0.95)';
const LIE = (p: { t: number; t0: number; fx: number; fy: number; tx: number; ty: number; size?: number }) => <NameFly {...p} word="LIE" col="#ff6a6a" pill="+1%" />;
const TRUTH = (p: { t: number; t0: number; fx: number; fy: number; tx: number; ty: number; size?: number }) => <NameFly {...p} word="TRUTH" col="#7fd4ff" pill="−1%" pillCol="#7fd4ff" />;
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

/* ---------- giant-scale props ---------- */
const Liberty: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const s = h / 900;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#5aa38a">
      <rect x={-140} y={-240} width={280} height={240} fill="#8a8f99" />
      <rect x={-90} y={-560} width={180} height={330} rx={40} />
      <circle cx={0} cy={-610} r={60} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M 0 -640 L ${Math.cos(-Math.PI + i * Math.PI / 6) * 120} ${-640 + Math.sin(-Math.PI + i * Math.PI / 6) * 120}`} stroke="#5aa38a" strokeWidth={14} />)}
      <rect x={60} y={-860} width={34} height={320} rx={14} transform="rotate(10 77 -700)" />
      <path d="M 70 -880 q 30 -60 50 0 Z" fill="#ffcf5a" />
    </g>
  );
};
const Burj: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M -${h * 0.06} 0 L -${h * 0.035} ${-h * 0.45} L -${h * 0.02} ${-h * 0.75} L -3 ${-h} L 3 ${-h} L ${h * 0.02} ${-h * 0.75} L ${h * 0.035} ${-h * 0.45} L ${h * 0.06} 0 Z`} fill="#9fb3cf" />
    <path d={`M 0 0 L 0 ${-h}`} stroke="#d8e4f2" strokeWidth={2} opacity={0.6} />
  </g>
);
const Mountain: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-w / 2} 0 L ${-w * 0.12} ${-h * 0.7} L 0 ${-h} L ${w * 0.15} ${-h * 0.62} L ${w / 2} 0 Z`} fill="#5a6478" />
    <path d={`M ${-w * 0.08} ${-h * 0.78} L 0 ${-h} L ${w * 0.1} ${-h * 0.7} L ${w * 0.03} ${-h * 0.74} L -${w * 0.02} ${-h * 0.68} Z`} fill="#f2f6fb" />
  </g>
);
const Cloud: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={160} ry={46} fill="#fff" /><ellipse cx={-70} cy={-24} rx={80} ry={50} fill="#fff" /><ellipse cx={60} cy={-30} rx={90} ry={56} fill="#fff" />
  </g>
);
const Heli: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={90} ry={50} fill="#e5483d" />
    <rect x={60} y={-12} width={160} height={20} rx={8} fill="#e5483d" />
    <ellipse cx={-30} cy={-6} rx={40} ry={26} fill="#9fd0ff" />
    <rect x={-160 * Math.abs(Math.cos(t * 30))} y={-62} width={320 * Math.abs(Math.cos(t * 30))} height={8} fill="#333" />
    <rect x={-60} y={46} width={120} height={8} fill="#333" />
  </g>
);
const Jet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-40} width={600} height={80} rx={40} fill="#eef2f7" />
    <path d="M -60 0 L 80 -180 L 140 -180 L 60 0 Z" fill="#c8cdd6" />
    <path d="M 220 -30 L 300 -130 L 330 -130 L 290 -20 Z" fill="#c8cdd6" />
    {[...Array(9)].map((_, i) => <circle key={i} cx={-220 + i * 50} cy={-8} r={9} fill="#2c3b4f" />)}
  </g>
);
const BunkBed: React.FC = () => (
  <g>
    <rect x={500} y={300} width={30} height={560} fill="#6d4a33" />
    <rect x={1300} y={300} width={30} height={560} fill="#6d4a33" />
    <rect x={500} y={520} width={830} height={50} rx={10} fill="#7b5cff" />
    <rect x={500} y={780} width={830} height={50} rx={10} fill="#4fd8ff" />
    <rect x={0} y={0} width={1920} height={300} fill="#cfd6e4" />
    <rect x={0} y={290} width={1920} height={14} fill="#a9b3c4" />
  </g>
);

/* ================= A — hook ================= */
export const A1: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.08, 1.0, ease.out)} fy={600}>
        <Kitchen t={t} v="morning" />
        <Mia t={t} x={1300} scale={2.6} facing={-1} pose={P.give} expr="happy" mouth={talk('a01') ? 'open' : 'grin'} talking={talk('a01')} rim={RIM} />
        <Leo t={t} x={760} scale={2.6} pose={P.stand} expr="happy" mouth="smile" rim={RIM} />
      </Cam>
      <LIE t={t} t0={0.6} fx={1300} fy={430} tx={760} ty={520} />
    </Sh>
  );
};
export const A2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const hit = 0.25;
  const sh = t > hit && t < hit + 0.4 ? Math.sin(t * 100) * 14 * (1 - (t - hit) / 0.4) : 0;
  return (
    <Sh mood="dawn" kx={30} ky={30} box={1}>
      <g transform={`translate(${sh} 0)`}>
        <Cam z={1.15} fx={900} fy={420}>
          <KidRoom t={t} v="dawn" bed={false} />
          <BunkBed />
          <Leo t={t} x={900} y={530} scale={2.4} pose={P.sit} expr={t > hit ? 'closed' : 'shock'} mouth={t > hit ? 'flat' : 'o'} tilt={t > hit ? 10 : 0} height={1.25} rim={RIM} />
        </Cam>
      </g>
      <Boom t={t} t0={hit} x={1250} y={300} text="BONK" col={C.gold} size={100} />
    </Sh>
  );
};
export const A3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={40} box={1}>
      <Backdrop a="#2a1a4a" b="#06040e" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" look={[0, -0.3]} rim={RIM} />
      </Cam>
      <Neon t={t} t0={fr('a03', 0.65)} x={960} y={210} text="LIE = +1% TALLER" col="#ff6a6a" size={66} />
    </Sh>
  );
};
export const A4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={30} box={1}>
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={430}>
        <Mia t={t} x={960} y={1560} scale={7.0} pose={P.stand} expr="smug" mouth="smirk" look={[0.6, 0]} rim={RIM} />
      </Cam>
      <Kinetic t={t} t0={d * 0.45} x={960} y={895} text="(she hates it)" col="#fff" size={58} />
    </Sh>
  );
};

/* ================= B — rule ================= */
export const B1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={20} box={1}>
      <Sky t={t} a="#0b0a24" b="#2a1650" stars />
      <City col="#140c28" />
      <Leo t={t} x={960} y={860} scale={2.4} pose={P.stand} expr="neutral" rim={RIM} />
      {[...Array(5)].map((_, i) => <LIE key={i} t={t} t0={0.5 + i * 0.6} fx={200 + i * 120} fy={300 + (i % 2) * 120} tx={960} ty={600} size={46} />)}
      {[...Array(4)].map((_, i) => <TRUTH key={i} t={t} t0={fr('b01', 0.68) + i * 0.6} fx={1700 - i * 100} fy={300 + (i % 2) * 120} tx={960} ty={600} size={42} />)}
      <Badge t={t} t0={fr('b01', 0.15)} x={560} y={210} text="LIE → +1% taller" size={40} color="#ff8a8a" />
      <Badge t={t} t0={fr('b01', 0.7)} x={1380} y={210} text="HARD TRUTH → −1%" size={40} color="#7fd4ff" />
    </Sh>
  );
};
export const B2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Classroom t={t} board="Class photo day" />
        {[0, 1, 2, 3, 4].map((i) => <Kid key={i} i={i + 1} t={t} x={300 + i * 330 + (i >= 2 ? 330 : 0)} y={900} scale={2.3} height={1.15} pose={P.stand} />)}
        <Leo t={t} x={960} y={900} scale={2.3} pose={P.pockets} expr="sad" look={[0, -0.6]} rim={RIMC} />
      </Cam>
      <Badge t={t} t0={0.5} x={960} y={260} text="160 cm · shortest in class" size={44} color="#fff" />
    </Sh>
  );
};
export const B3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const q = ['“Nice shirt!”', '“I’m almost there.”', '“I’m fine.”'];
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <BigText t={t} t0={0.2} x={960} y={260} text="≈ 1.65 LIES / DAY" size={90} color="#ff8a8a" />
      {q.map((x, i) => <Bubble key={i} t={t} t0={fr('b03', 0.5 + i * 0.13)} x={480 + i * 480} y={620} text={x} size={44} />)}
      <text x={60} y={935} fontSize={22} fill="#8fa3c8" fontFamily={FONT_BODY} fontWeight={800}>Serota et al. (2010): average self-reported lies per day ≈ 1.65</text>
    </Sh>
  );
};
const Ladder: React.FC<{ t: number; show: number }> = ({ t, show }) => {
  const rows: [string, string, string][] = [['160 cm', 'You', '#fff'], ['×53', 'Robert Wadlow · 2.72 m', C.gold], ['×408', 'Statue of Liberty · 93 m', '#ff8a3d'], ['×866', 'Mount Everest · 8,849 m', C.red]];
  return (
    <g>
      {rows.map(([a, b, col], i) => i > show ? null : (
        <g key={i} transform={`translate(360 ${300 + i * 150})`} opacity={clamp01(pop(t, 0.1 + i * 0.05, 0.4) * 2) * (i === show ? 1 : 0.45)}>
          <rect x={0} y={-55} width={1200} height={110} rx={26} fill={i === show ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'} stroke={i === show ? col : 'rgba(255,255,255,0.12)'} strokeWidth={4} />
          <text x={40} y={18} fontSize={54} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{a}</text>
          <text x={340} y={18} fontSize={46} fontWeight={600} fill="#fff" fontFamily={FONT_HEAD}>{b}</text>
        </g>
      ))}
    </g>
  );
};
export const B4: ShotFC = ({ o, d }) => {
  const { t, s } = useF(o);
  const show = t < s('b05') ? 1 : t < s('b05') + 1.5 ? 2 : 3;
  return (<Sh mood="clean" box={1}><DataBG t={t + o} /><Ladder t={t} show={show} /></Sh>);
};

/* ================= C — day 1 ================= */
export const C1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="golden" kx={20} ky={20} box={1}>
      <Cam z={1.0}>
        <Street t={t} v="day" />
        <Leo t={t} x={600} y={930} scale={2.4} pose={P.phone} expr="neutral" rim={RIM} />
      </Cam>
      <g transform="translate(1350 560)">
        <rect x={-200} y={-330} width={400} height={660} rx={46} fill="#111" />
        <rect x={-180} y={-300} width={360} height={600} rx={30} fill="#eef2f7" />
        <rect x={-180} y={-300} width={360} height={70} fill="#2a3350" />
        <text x={0} y={-255} textAnchor="middle" fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>Sam</text>
        <rect x={-150} y={-180} width={260} height={70} rx={24} fill="#4fd8ff" />
        <text x={-130} y={-136} fontSize={28} fontWeight={700} fill="#0b1530" fontFamily={FONT_HEAD}>5 min away! 🏃</text>
        <rect x={-150} y={-60} width={300} height={170} rx={16} fill="#cfe6d0" />
        <circle cx={0} cy={20} r={18} fill={C.red} />
        <text x={0} y={140} textAnchor="middle" fontSize={24} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>📍 still at home</text>
      </g>
      <LIE t={t} t0={fr('c01', 0.5)} fx={1300} fy={300} tx={600} ty={600} />
    </Sh>
  );
};
export const C2: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="cold" kx={20} ky={20} box={1}>
      <Cam z={1.05} fx={700}>
        <Classroom t={t} board="TEST TODAY" />
        <Teach t={t} x={520} scale={2.6} pose={P.shrug} expr="happy" mouth="grin" rim={RIMC} />
        <Leo t={t} x={1450} y={900} scale={2.3} facing={-1} pose={P.sitSlump} expr="worried" rim={RIMC} />
      </Cam>
      <Bubble t={t} t0={0.2} x={620} y={360} text="It'll be EASY!" size={44} />
      <LIE t={t} t0={1.6} fx={620} fy={360} tx={1450} ty={560} />
    </Sh>
  );
};
export const C3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="warm" kx={60} ky={20} box={1}>
      <Cam z={1.04}>
        <Hallway t={t} />
        <rect x={880} y={300} width={260} height={560} fill="none" stroke="#8a6248" strokeWidth={24} />
        <Leo t={t} x={1010} y={860} scale={2.4} height={1.4} pose={{ ...P.stand, lean: 22 }} expr="happy" mouth="grin" rim={RIM} />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 2} t={t} x={400 + i * 220 + (i > 0 ? 900 : 0)} y={860} scale={2.2} pose={P.stand} look={[i === 0 ? 1 : -1, -0.9]} expr="shock" mouth="o" />)}
      </Cam>
      <Badge t={t} t0={0.4} x={960} y={210} text="2 m · ducking under doors" size={44} color={C.gold} />
    </Sh>
  );
};
export const C4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={40} box={1}>
      <Backdrop a="#2a1a4a" b="#06040e" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.chin} expr="smug" mouth="smirk" look={[0.4, -0.4]} rim={RIM} />
      </Cam>
    </Sh>
  );
};
export const C5: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="warm" kx={60} ky={20} box={1}>
      <Cam z={1.06}>
        <Hallway t={t} />
        <Kid i={5} t={t} x={1250} y={880} scale={2.5} facing={-1} pose={P.hold} expr="worried" mouth="grin" talking={talk('c05')} />
        <Leo t={t} x={700} y={880} scale={2.5} height={1.45} pose={P.give} expr="happy" mouth="grin" rim={RIM} />
        <g transform="translate(920 540) rotate(-6)"><rect x={-110} y={-80} width={220} height={160} fill="#fff" stroke="#ccc" strokeWidth={4} /><path d="M -80 40 L -40 -40 L 0 30 L 40 -20 L 80 40" stroke="#333" strokeWidth={6} fill="none" /><circle cx={50} cy={-45} r={16} fill="#ffd25a" /></g>
      </Cam>
      <LIE t={t} t0={2.4} fx={1250} fy={500} tx={700} ty={480} />
    </Sh>
  );
};
export const C6: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const qs: [string, number][] = [['Do I look tired?', 0.1], ['Is my singing good?', 0.38], ['Am I funny?', 0.62]];
  return (
    <Sh mood="warm" kx={50} ky={20} box={1}>
      <Cam z={1.04}>
        <Hallway t={t} />
        <Leo t={t} x={960} y={880} scale={2.4} height={kf(t, [[0, 1.45], [d, 1.6]])} pose={P.shrug} expr="smug" mouth="grin" rim={RIM} />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 1} t={t} x={i === 1 ? 1500 : i === 0 ? 400 : 1700} y={880} scale={2.3} facing={i === 0 ? 1 : -1} pose={P.wave} expr="happy" mouth="grin" talking />)}
      </Cam>
      {qs.map(([q, x], i) => <Bubble key={i} t={t} t0={fr('c06', x)} t1={fr('c06', x + 0.24)} x={960} y={300} text={q} size={44} />)}
      {[0, 1, 2].map((i) => <LIE key={i} t={t} t0={fr('c06', 0.2 + i * 0.26)} fx={[400, 1500, 1700][i]} fy={520} tx={960} ty={460} size={46} />)}
    </Sh>
  );
};
export const C7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <line x1={200} y1={900} x2={1720} y2={900} stroke="#8fa3c8" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <g key={i}><line x1={200} y1={900 - i * 200} x2={1720} y2={900 - i * 200} stroke="#8fa3c8" strokeWidth={1} opacity={0.3} /><text x={180} y={908 - i * 200} textAnchor="end" fontSize={26} fill="#8fa3c8" fontFamily={FONT_HEAD}>{i} m</text></g>)}
      <g opacity={0.45}><Person2 x={700} h={544} /></g>
      <text x={700} y={960} textAnchor="middle" fontSize={32} fontWeight={700} fill="#cfd6ea" fontFamily={FONT_HEAD}>Wadlow · 2.72 m</text>
      <Leo t={t} x={1200} y={900} scale={2.66} height={kf(t, [[0, 1.0], [2.5, 1.0]])} pose={P.cheer} expr="happy" mouth="grin" rim={RIM} />
      <text x={1200} y={960} textAnchor="middle" fontSize={32} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>You · 2.72 m</text>
    </Sh>
  );
};
const Person2: React.FC<{ x: number; h: number }> = ({ x, h }) => (
  <g transform={`translate(${x} 900)`} fill="#9fb3e0">
    <circle cx={0} cy={-h + 40} r={40} /><rect x={-50} y={-h + 85} width={100} height={h * 0.42} rx={20} /><rect x={-40} y={-h * 0.5 + 40} width={30} height={h * 0.5 - 40} /><rect x={10} y={-h * 0.5 + 40} width={30} height={h * 0.5 - 40} />
  </g>
);
export const C8: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={80} ky={25} box={1}>
      <Cam z={1.0}>
        <Court t={t} />
        <Leo t={t} x={1500} y={860} scale={2.4} height={1.75} pose={P.armsUp} expr="happy" mouth="grin" rim={RIM} />
        <Ball x={1620} y={kf(t, [[0, 360], [0.6, 400], [1.0, 600]])} r={30} />
        {[0, 1, 2, 3].map((i) => <Kid key={i} i={i} t={t} x={300 + i * 220} y={880} scale={2.2} pose={P.cheer} expr="happy" mouth="grin" />)}
      </Cam>
      {[0, 1, 2].map((i) => <LIE key={i} t={t} t0={1.5 + i * 1.6} fx={300 + i * 220} fy={500} tx={1500} ty={360} size={44} />)}
      <Boom t={t} t0={0.6} x={1200} y={260} text="DUNK!" col={C.gold} size={90} />
    </Sh>
  );
};

/* ================= D — viral / giant ================= */
export const D1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={45} box={1}>
      <Backdrop a="#1a1440" b="#05040e" />
      <ViralPhone x={960} y={560} s={1.0} t={t} views={Math.min(9_400_000, Math.exp(tw(t, 0, d, Math.log(1000), Math.log(9_400_000))))} cap={['This kid GROWS when you lie', 'to him 🤯 (tell him he’s cool)']}>
        <rect x={-190} y={-300} width={380} height={300} fill="#8cc8ff" />
        <g transform="translate(0 -20) scale(0.45)"><Leo t={t} x={0} y={0} scale={2.4} height={1.8} pose={P.cheer} expr="happy" /></g>
      </ViralPhone>
    </Sh>
  );
};
export const D2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const msgs = ['You can fly 🦅', '200 IQ!!', 'most handsome alive', 'you’re a genius', 'best singer ever', 'you look amazing'];
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Sky t={t} a="#0b0a24" b="#2a1650" stars />
      <City col="#140c28" />
      <Cam z={tw(t, 0, d, 1.0, 0.9)}>
        <Leo t={t} x={960} y={900} scale={2.4} height={kf(t, [[0, 1.9], [d, 3.2]])} pose={P.stand} expr="shock" mouth="o" rim={RIM} />
      </Cam>
      {msgs.map((m, i) => { const t0 = 0.3 + i * (d / 7); return t > t0 && t < t0 + 2.4 ? <g key={i} opacity={1 - clamp01((t - t0 - 1.6) / 0.8)}><Bubble t={t} t0={t0} x={i % 2 ? 1500 : 420} y={300 + (i % 3) * 160} text={m} size={36} /></g> : null; })}
      {[...Array(12)].map((_, i) => <LIE key={i} t={t} t0={0.6 + i * (d / 13)} fx={i % 2 ? 1700 : 200} fy={300 + (i % 4) * 120} tx={960} ty={420} size={38} />)}
    </Sh>
  );
};
export const D3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Sky t={t} a="#0b0a24" b="#2a1650" stars />
      <Cam z={tw(t, 0, d, 1.0, 1.15)}>
        <Earth x={960} y={560} r={330} />
        {[...Array(40)].map((_, i) => { const t0 = (i * 0.13) % Math.max(0.5, d - 0.8); const a = i * 2.39; return <LIE key={i} t={t} t0={t0} fx={960 + Math.cos(a) * 1100} fy={560 + Math.sin(a) * 700} tx={960 + Math.cos(a) * 300} ty={560 + Math.sin(a) * 300} size={30} />; })}
      </Cam>
    </Sh>
  );
};
export const D4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const house = t > fr('d04', 0.45);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <rect width={1920} height={1080} fill="#8cc8ff" />
      <rect x={0} y={860} width={1920} height={220} fill="#6a9a5a" />
      {!house ? (
        <g>
          <g transform="translate(600 860)" fill="#e8b45a"><rect x={-30} y={-300} width={60} height={300} /><ellipse cx={0} cy={-330} rx={70} ry={40} /><rect x={-10} y={-420} width={20} height={100} /><circle cx={0} cy={-440} r={40} /></g>
          <Leo t={t} x={1100} y={860} scale={2.4} height={2.6} pose={P.stand} expr="shock" mouth="o" rim={RIM} />
          <Badge t={t} t0={0.3} x={850} y={200} text="giraffe · 5.5 m" size={40} color="#fff" />
        </g>
      ) : (
        <g>
          <g transform="translate(960 860)"><rect x={-300} y={-260} width={600} height={260} fill="#f0d9b5" /><path d="M -340 -260 L 0 -420 L 340 -260 Z" fill="#b84a3a" /><rect x={-40} y={-140} width={80} height={140} fill="#6d4a33" /></g>
          <Leo t={t} x={960} y={860} scale={2.4} height={3.4} pose={P.handsHead} expr="worried" rim={RIM} />
          {[...Array(10)].map((_, i) => <rect key={i} x={760 + (i * 47) % 400} y={430 - (t - fr('d04', 0.45)) * 200 + (i * 31) % 60} width={30} height={14} fill="#b84a3a" />)}
        </g>
      )}
    </Sh>
  );
};
export const D5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={30} box={1}>
      <rect width={1920} height={1080} fill="#2a3a2a" />
      {[...Array(6)].map((_, i) => <rect key={i} x={0} y={140 + i * 160} width={1920} height={50} fill="#3a3f4c" />)}
      {[...Array(6)].map((_, i) => <rect key={i} x={140 + i * 300} y={0} width={50} height={1080} fill="#3a3f4c" />)}
      {[...Array(30)].map((_, i) => <circle key={i} cx={(i * 197) % 1920} cy={(i * 131) % 1080} r={30} fill="#3d6a3a" />)}
      <g transform="translate(960 560) rotate(-90)"><Leo t={t} x={0} y={0} scale={6.5} pose={P.stand} expr="closed" rim={RIMC} /></g>
      <text x={960} y={880} textAnchor="middle" fontSize={44} fill="#cfe9ff" fontFamily={FONT_HEAD}>z z z</text>
    </Sh>
  );
};
export const D6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const step = Math.floor(t / 1.6);
  return (
    <Sh mood="dusk" kx={70} ky={30} box={1}>
      <Sky t={t} a="#4a3a8a" b="#ff9e7a" />
      <City col="#2a1a3a" y={300} />
      <rect x={0} y={1000} width={1920} height={80} fill="#1a1020" />
      <Liberty x={600} y={1000} h={760} />
      <Leo t={t} x={1250} y={1000} scale={2.4} height={3.7} pose={walkPose(t * 0.3, 0.3)} expr="shock" mouth="o" rim={RIM} />
      {[...Array(6)].map((_, i) => <circle key={i} cx={1250 + (i - 3) * 90} cy={990} r={8} fill={(i + step) % 2 ? C.red : '#ffcf5a'} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 8 + i))} />)}
      <Badge t={t} t0={0.5} x={600} y={200} text="Statue of Liberty · 93 m" size={40} color="#a8f0d0" />
    </Sh>
  );
};
export const D6b: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={30} ky={30} box={1}>
      <Sky t={t} a="#4a3a8a" b="#ff9e7a" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fy={430}>
        <Leo t={t} x={1200} y={1720} scale={6.4} pose={P.stand} expr="neutral" look={[-1, 0]} rim={RIM} />
      </Cam>
      <Heli x={480 + Math.sin(t) * 40} y={420 + Math.cos(t * 1.3) * 20} t={t} s={1.3} />
      <Bubble t={t} t0={fr('d06b', 0.45)} x={480} y={240} text="YOU LOOK FANTASTIC!" size={40} />
      <LIE t={t} t0={fr('d06b', 0.65)} fx={480} fy={300} tx={1200} ty={420} />
    </Sh>
  );
};

/* ================= E — higher ================= */
export const E1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={80} ky={20} box={1}>
      <Sky t={t} a="#6fb7ff" b="#ffe3b8" />
      <g transform="translate(0 200)">
        <City col="#9fb3cf" lit={false} y={500} />
        <Burj x={760} y={1080} h={760} />
      </g>
      <Cam z={1.0}>
        <Leo t={t} x={1200} y={1300} scale={6.0} pose={P.stand} expr="neutral" look={[-0.8, 0.9]} rim={RIM} />
      </Cam>
      <Badge t={t} t0={0.5} x={760} y={200} text="Burj Khalifa · 828 m" size={40} color="#fff" />
    </Sh>
  );
};
export const E2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={60} ky={20} box={1}>
      <rect width={1920} height={1080} fill="#4a7ab8" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={500}>
        <Leo t={t} x={960} y={1700} scale={6.0} pose={P.hug} expr="worried" mouth="flat" look={[0, 0]} rim={RIMC} />
        {[...Array(5)].map((_, i) => <Cloud key={i} x={((i * 470 + t * 90) % 2400) - 240} y={1000 + (i % 2) * 60} s={1.4} />)}
      </Cam>
      {[...Array(30)].map((_, i) => <circle key={i} cx={(i * 137 + t * 40) % 1920} cy={(i * 97 + t * 120) % 1080} r={3} fill="#fff" opacity={0.7} />)}
    </Sh>
  );
};
export const E2b: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={20} ky={30} box={1}>
      <rect width={1920} height={1080} fill="#4f8fe0" />
      {[...Array(6)].map((_, i) => <Cloud key={i} x={(i * 397) % 2000} y={900 + (i % 2) * 60} s={1.6} />)}
      <Cam z={1.0} fy={430}>
        <Leo t={t} x={1350} y={1720} scale={6.4} pose={mixPose(P.stand, P.wave, clamp01((t - 2) / 2))} expr="happy" mouth="smile" look={[-1, 0]} rim={RIM} />
      </Cam>
      <Jet x={-400 + t * 220} y={540} s={1.0} />
    </Sh>
  );
};
export const E3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="cold" kx={70} ky={20} box={1}>
      <Sky t={t} a="#1a3a7a" b="#bfe0ff" />
      <Mountain x={600} y={1080} w={1300} h={760} />
      {[...Array(5)].map((_, i) => <Cloud key={i} x={(i * 420 + t * 30) % 2200 - 100} y={880} s={1.5} />)}
      <Leo t={t} x={1350} y={1600} scale={5.4} pose={P.stand} expr="worried" look={[-1, 0.3]} rim={RIMC} />
      <Badge t={t} t0={0.5} x={600} y={220} text="Everest · 8,849 m" size={40} color="#fff" />
      <Stamp t={t} t0={fr('e03', 0.6)} x={1350} y={300} text="DEATH ZONE" color={C.red} rot={-8} size={70} />
    </Sh>
  );
};
export const E4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={30} box={1}>
      <Backdrop a="#1a2a5a" b="#02040a" />
      <Cam z={tw(t, 0, d, 1.0, 1.12)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="squint" mouth="flat" sweat look={[0, 0]} rim={RIMC} />
        <path d="M 900 760 q 60 18 120 0" stroke="#6aa8ff" strokeWidth={14} fill="none" strokeLinecap="round" />
      </Cam>
      {[...Array(10)].map((_, i) => <LIE key={i} t={t} t0={0.3 + i * 0.45} fx={i % 2 ? 1800 : 100} fy={200 + (i % 4) * 200} tx={960} ty={540} size={34} />)}
    </Sh>
  );
};
export const E5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={90} box={1}>
      <Sky t={t} a="#02020a" b="#1a2a6a" stars />
      <circle cx={960} cy={2100} r={1600} fill="#1e5fbf" />
      <circle cx={960} cy={2100} r={1680} fill="#4fa8ff" opacity={0.3} filter="url(#glowF)" />
      <line x1={0} y1={320} x2={1920} y2={320} stroke="#9fe0ff" strokeWidth={3} strokeDasharray="20 14" opacity={0.7} />
      <text x={1880} y={305} textAnchor="end" fontSize={30} fontWeight={700} fill="#9fe0ff" fontFamily={FONT_HEAD}>SPACE · 100 km</text>
      <Leo t={t} x={960} y={1300} scale={4.2} height={kf(t, [[0, 1.0], [d, 1.12]])} pose={P.stand} expr="shock" mouth="o" look={[0, -1]} rim={RIMC} />
    </Sh>
  );
};

/* ================= F — truth ================= */
export const F1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#100a24" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="sad" look={[0, 0.3]} rim={RIMC} />
      </Cam>
      <Neon t={t} t0={d * 0.4} x={960} y={210} text="ONLY THE TRUTH" col="#7fd4ff" size={64} />
    </Sh>
  );
};
export const F2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const part = t < fr('f02', 0.35) ? 0 : t < fr('f02', 0.6) ? 1 : 2;
  const who = [['Doctor', '“You’ll be fine.”'], ['News', '“Help is on the way.”'], ['Mom', '“Everything’s okay, sweetheart.”']][part];
  return (
    <Sh mood="cold" kx={40} ky={30} box={1}>
      <Backdrop a="#1a2a4a" b="#05080f" />
      <Cam z={1.02}>
        {part === 2 ? <Mom t={t} x={760} scale={2.8} pose={P.phone} expr="worried" mouth="smile" talking rim={RIM} /> : <Kid i={part + 3} t={t} x={760} y={880} scale={2.8} pose={P.phone} expr="happy" mouth="grin" talking />}
      </Cam>
      <Bubble t={t} t0={fr('f02', [0.05, 0.38, 0.62][part])} x={1250} y={400} text={who[1]} size={44} />
      <Badge t={t} t0={0.1} x={760} y={220} text={who[0]} size={40} color="#fff" />
      <LIE t={t} t0={fr('f02', [0.2, 0.5, 0.85][part])} fx={1250} fy={400} tx={1900} ty={300} />
    </Sh>
  );
};
export const F3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Sky t={t} a="#02020a" b="#1a2a6a" stars />
      <circle cx={960} cy={2100} r={1600} fill="#1e5fbf" />
      {[...Array(18)].map((_, i) => <LIE key={i} t={t} t0={0.2 + i * 0.35} fx={(i * 271) % 1920} fy={1080} tx={960} ty={400} size={34} />)}
      <Leo t={t} x={960} y={1300} scale={4.3} pose={P.handsHead} expr="sad" look={[0, -0.4]} rim={RIMC} />
    </Sh>
  );
};
export const F4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#1a1440" b="#04030a" />
      <Cam z={tw(t, 0, d, 1.2, 1.35, ease.soft)} fx={1150} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.phone} expr="sad" look={[0.6, 0]} rim={RIMC} />
      </Cam>
      {[0, 1, 2].map((i) => { const k = ((t * 0.7 + i / 3) % 1); return <circle key={i} cx={1180} cy={480} r={40 + k * 140} fill="none" stroke="#7fd4ff" strokeWidth={4} opacity={0.6 * (1 - k)} />; })}
    </Sh>
  );
};
const MiaCall: React.FC<{ t: number; talk: boolean; tears?: number; expr?: any }> = ({ t, talk, tears = 0, expr = 'neutral' }) => (
  <>
    <KidRoom t={t} v="night" bed={false} />
    <Cone x={1650} y={240} w={800} h={900} op={0.3} rot={30} />
    <Mia t={t} x={960} y={1560} scale={7.0} pose={P.phone} expr={expr} tears={tears} mouth={talk ? 'open' : 'flat'} talking={talk} rim={RIM} />
  </>
);
export const F5: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<Sh mood="night" kx={80} ky={30} box={1}><Cam z={tw(t, 0, d, 1.0, 1.06)} fy={430}><MiaCall t={t} talk={talk('f05')} expr="angry" /></Cam></Sh>);
};
export const F6: ShotFC = ({ o, d }) => {
  const { t, talk, fr } = useF(o);
  return (
    <Sh mood="night" kx={80} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.06, 1.14)} fy={430}><MiaCall t={t} talk={talk('f06')} expr="sad" tears={0.5} /></Cam>
      {[0, 1, 2].map((i) => <TRUTH key={i} t={t} t0={fr('f06', 0.15 + i * 0.3)} fx={960} fy={820} tx={1900} ty={300} size={48} />)}
    </Sh>
  );
};
export const F7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={30} box={1}>
      <Sky t={t} a="#1a3a7a" b="#bfe0ff" />
      <Cam z={1.0}>
        <Leo t={t} x={960} y={1500} scale={4.8} height={kf(t, [[0, 1.0], [d, 0.93]])} pose={P.hug} expr="sad" mouth="frown" tears={0.6} rim={RIMC} />
      </Cam>
      {[0, 1].map((i) => <TRUTH key={i} t={t} t0={0.3 + i * 1.6} fx={200} fy={900} tx={960} ty={400} size={46} />)}
    </Sh>
  );
};
export const F8: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<Sh mood="night" kx={80} ky={30} box={1}><Cam z={tw(t, 0, d, 1.0, 1.1)} fy={430}><MiaCall t={t} talk={talk('f08')} expr="sad" tears={1} /></Cam>
    {[0, 1, 2].map((i) => <TRUTH key={i} t={t} t0={1 + i * 2} fx={960} fy={820} tx={1900} ty={300} size={48} />)}</Sh>);
};
export const F8b: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="night" kx={30} ky={30} box={1}>
      <Backdrop a="#2a1a3a" b="#05030a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={430}>
        <Mom t={t} x={960} y={1650} scale={6.2} pose={P.phone} expr="sad" tears={1} mouth={talk('f08b') ? 'open' : 'frown'} talking={talk('f08b')} rim={RIM} />
      </Cam>
      <TRUTH t={t} t0={d * 0.7} fx={960} fy={900} tx={1900} ty={300} size={52} />
    </Sh>
  );
};
export const F9: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const stage = t < fr('f09', 0.45) ? 0 : t < fr('f09', 0.7) ? 1 : 2;
  return (
    <Sh mood={stage === 2 ? 'dawn' : 'cold'} kx={50} ky={30} box={1}>
      <Sky t={t} a={stage === 2 ? '#6a5aa0' : '#4a7ab8'} b={stage === 2 ? '#ffb48a' : '#bfe0ff'} />
      {stage === 0 && [...Array(5)].map((_, i) => <Cloud key={i} x={(i * 420) % 2000} y={300 - t * 200 + (i % 2) * 100} s={1.5} />)}
      {stage >= 1 && <City col="#3a2a4a" y={stage === 1 ? 300 - (t - fr('f09', 0.45)) * 200 : 100} />}
      {stage === 2 && [...Array(8)].map((_, i) => <g key={i} transform={`translate(${120 + i * 240} 860)`}><rect x={-10} y={0} width={20} height={80} fill="#5a3d2a" /><circle cx={0} cy={-20} r={60} fill="#3d7a4f" /></g>)}
      <Leo t={t} x={960} y={stage === 2 ? 940 : 1400} scale={stage === 2 ? 2.4 : 4.2} pose={P.stand} expr="soft" rim={RIM} />
      <Streaks t={t} k={stage < 2 ? 0.5 : 0} dir={1} />
    </Sh>
  );
};
export const F10: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={70} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <KidRoom t={t} v="night" bed={false} />
        <Mia t={t} x={1150} y={760} scale={2.6} facing={-1} pose={P.phone} expr="soft" talking rim={RIM} />
        <rect x={1300} y={680} width={140} height={160} rx={10} fill="#c4744d" />
      </Cam>
      <Badge t={t} t0={0.3} x={1650} y={210} text="all night" size={40} color="#7fd4ff" icon="◷" />
    </Sh>
  );
};

/* ================= G — ending ================= */
export const G1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dawn" kx={25} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Classroom t={t} board="Class photo day" />
        {[0, 1, 2, 3, 4].map((i) => <Kid key={i} i={i + 1} t={t} x={300 + i * 330 + (i >= 2 ? 330 : 0)} y={900} scale={2.3} height={1.15} pose={P.stand} />)}
        <Leo t={t} x={960} y={900} scale={2.3} pose={P.stand} expr="happy" mouth="smile" rim={RIM} />
      </Cam>
      <Badge t={t} t0={0.4} x={960} y={250} text="160 cm" size={52} color={C.gold} />
    </Sh>
  );
};
export const G2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="golden" kx={40} ky={30} box={1}>
      <Sky t={t} a="#6a5aa0" b="#ffb48a" />
      <City col="#3a2a4a" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Leo t={t} x={820} y={900} scale={2.6} pose={P.hug} expr="soft" mouth="smile" rim={RIM} />
        <Mia t={t} x={1100} y={900} scale={2.6} facing={-1} pose={P.hug} expr="happy" mouth="smile" rim={RIM} />
      </Cam>
      <Dust t={t} />
    </Sh>
  );
};
export const G3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={30} box={1}>
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="soft" mouth="smile" tears={0.6} look={[0.4, 0]} rim={RIM} />
      </Cam>
      <Dust t={t} />
    </Sh>
  );
};
export const G4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={30} ky={20} box={1}>
      <Cam z={1.08}>
        <Kitchen t={t} v="morning" />
        <Mia t={t} x={900} scale={2.6} pose={P.pockets} expr="smug" mouth={talk('g04') ? 'open' : 'smirk'} talking={talk('g04')} rim={RIM} />
        {[...Array(8)].map((_, i) => <circle key={i} cx={880 + (i * 13) % 60} cy={560 + (i * 7) % 30} r={4} fill="#a0703a" />)}
        <Leo t={t} x={1300} scale={2.6} facing={-1} pose={P.stand} expr="squint" mouth="flat" rim={RIM} />
      </Cam>
    </Sh>
  );
};
export const G5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={50} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.2, 1.3)} fy={500}>
        <Kitchen t={t} v="morning" />
        <Leo t={t} x={1100} scale={2.6} facing={-1} pose={P.stand} expr="shock" mouth="o" rim={RIM} />
      </Cam>
      <LIE t={t} t0={0.0} fx={500} fy={460} tx={1100} ty={500} size={70} />
    </Sh>
  );
};
export const G6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={30} box={1}>
      <Sky t={t} a="#2a1650" b="#ff9e7a" />
      <City col="#1a1030" />
      <Leo t={t} x={820} y={900} scale={2.6} pose={P.stand} expr="happy" mouth="smile" rim={RIM} />
      <Mia t={t} x={1100} y={900} scale={2.6} facing={-1} pose={P.cheer} expr="happy" mouth="grin" rim={RIM} />
      <Badge t={t} t0={0.3} x={960} y={230} text="Who always tells YOU the truth?" size={50} color="#fff" />
      <Neon t={t} t0={1.6} x={960} y={895} text="TAG THEM 👇" col="#7fd4ff" size={50} />
    </Sh>
  );
};
