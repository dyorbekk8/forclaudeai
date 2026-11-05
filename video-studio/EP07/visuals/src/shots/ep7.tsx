import React from 'react';
import { Cam, Badge, BigText, Bubble, Stamp } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, Hallway, DataBG, Backdrop, Classroom, Dining, Stairs } from '../sets/Sets';
import { Street } from '../sets/Sets2';
import { Court, Ball, Earth, KidRoom, Living, ViralPhone, Hospital } from '../sets/Sets3';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Leo, Mia, Mom, Teach, Coach, Dad, Doc, COL } from './cast3';
import { Kid } from './common';
import { Sh, Neon, Kinetic, Boom, frOf } from './kit3';
import { NameFly, Streaks, Dust, Cone } from '../lib/cine';
import { heightAt } from '../lib/height';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };
const RIM = 'rgba(255,190,120,0.95)';
const RIMC = 'rgba(140,220,255,0.95)';
const LIE = (p: { t: number; t0: number; fx: number; fy: number; tx: number; ty: number; size?: number }) => <NameFly {...p} word="STUPID" col="#ff6a6a" pill="+1%" />;
const TRUTH = (p: { t: number; t0: number; fx: number; fy: number; tx: number; ty: number; size?: number }) => <NameFly {...p} word="SMART" col="#7fd4ff" pill="−1%" pillCol="#7fd4ff" />;
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


const Math_: React.FC<{ t: number; n?: number; op?: number }> = ({ t, n = 18, op = 0.5 }) => {
  const eq = ['∫x²dx', 'e^iπ+1=0', 'E=mc²', '∑1/n²=π²/6', 'a²+b²=c²', 'F=ma', '∇·E=ρ/ε₀', 'iℏ∂ψ/∂t', 'φ=1.618', 'lim→∞', '√2', 'dx/dt', 'π', '∞'];
  return (<g>{[...Array(Math.max(0, Math.floor(n)))].map((_, i) => <text key={i} x={((i * 271 + t * (20 + (i % 4) * 8)) % 2100) - 100} y={120 + (i * 151) % 860} fontSize={30 + (i % 4) * 10} fill="#9fe0ff" opacity={op * (0.4 + 0.6 * Math.abs(Math.sin(t + i)))} fontFamily={FONT_HEAD}>{eq[i % eq.length]}</text>)}</g>);
};
const Face: React.FC<{ t: number; who?: 'leo' | 'mia' | 'dad' | 'kid'; expr?: any; mouth?: any; talking?: boolean; tears?: number; mood?: any; a?: string; b?: string; look?: [number, number] }> = ({ t, who = 'leo', expr = 'neutral', mouth = 'none', talking, tears, mood = 'dusk', a = '#2a1a4a', b = '#06040e', look = [0, 0] }) => {
  const C2 = who === 'mia' ? Mia : who === 'dad' ? Dad : Leo;
  return (
    <Sh mood={mood} kx={50} ky={40} box={1}>
      <Backdrop a={a} b={b} />
      <Cam z={tw(t, 0, 6, 1.0, 1.1)} fy={430}>
        {who === 'kid' ? <Kid i={5} t={t} x={960} y={1700} scale={6.4} pose={P.stand} expr={expr} mouth={mouth} talking={talking} look={look} />
          : <C2 t={t} x={960} y={who === 'mia' ? 1560 : who === 'dad' ? 1650 : 1720} scale={who === 'mia' ? 7.0 : who === 'dad' ? 6.2 : 6.4} pose={P.stand} expr={expr} mouth={mouth} talking={talking} tears={tears} look={look} rim={RIM} />}
      </Cam>
    </Sh>
  );
};

/* A */
export const A1: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="cold" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.08, 1.0, ease.out)}>
        <Hallway t={t} />
        <Kid i={5} t={t} x={1300} y={880} scale={2.6} facing={-1} pose={P.point} expr="smug" mouth={talk('a01') ? 'open' : 'smirk'} talking={talk('a01')} />
        <Leo t={t} x={760} y={880} scale={2.5} pose={P.pockets} expr="sad" rim={RIMC} />
      </Cam>
      <LIE t={t} t0={0.6} fx={1300} fy={430} tx={760} ty={520} size={54} />
    </Sh>
  );
};
export const A2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#0b1530" b="#02040a" />
      <Math_ t={t} n={24} op={0.8} />
      <Cam z={tw(t, 0, d, 1.2, 1.0, ease.out)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" mouth="o" look={[0, -0.4]} rim={RIMC} />
      </Cam>
      <Boom t={t} t0={0.3} x={1400} y={280} text="∫ CALCULUS?!" col="#9fe0ff" size={80} />
    </Sh>
  );
};
export const A3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={40} box={1}>
      <Backdrop a="#2a1a4a" b="#06040e" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={430}><Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" look={[0, -0.3]} rim={RIM} /></Cam>
      <Neon t={t} t0={fr('a03', 0.65)} x={960} y={210} text="“STUPID” = +1% IQ" col="#ff6a6a" size={62} />
    </Sh>
  );
};
export const A4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const n = Math.floor(t * 6);
  return (
    <Sh mood="cold" kx={50} ky={20} box={1}>
      <Cam z={1.0}><Hallway t={t} />
        {[0, 1, 2, 3].map((i) => <Kid key={i} i={i + 1} t={t} x={300 + i * 440} y={880} scale={2.3} pose={P.point} expr="smug" mouth="grin" talking />)}
        <Leo t={t} x={1100} y={880} scale={2.3} pose={P.facepalm} expr="closed" rim={RIMC} />
      </Cam>
      {[...Array(Math.min(8, n))].map((_, i) => <Kinetic key={i} t={t} t0={i / 6} x={250 + (i * 233) % 1400} y={300 + (i * 97) % 250} text={['STUPID', 'DUMB', 'IDIOT'][i % 3]} col="#ff6a6a" size={50} />)}
    </Sh>
  );
};
/* B */
export const B1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={20} box={1}>
      <Backdrop a="#0b1530" b="#02040a" />
      <Math_ t={t} op={0.25} />
      <Leo t={t} x={960} y={880} scale={2.4} pose={P.stand} expr="neutral" rim={RIMC} />
      {[...Array(5)].map((_, i) => <LIE key={i} t={t} t0={0.5 + i * 0.7} fx={200 + i * 120} fy={300 + (i % 2) * 120} tx={960} ty={600} size={40} />)}
      {[...Array(3)].map((_, i) => <TRUTH key={i} t={t} t0={fr('b01', 0.72) + i * 0.7} fx={1700 - i * 100} fy={300 + (i % 2) * 120} tx={960} ty={600} size={40} />)}
      <Badge t={t} t0={fr('b01', 0.15)} x={560} y={210} text="“stupid” → +1% IQ" size={40} color="#ff8a8a" />
      <Badge t={t} t0={fr('b01', 0.72)} x={1380} y={210} text="“smart” → −1% IQ" size={40} color="#7fd4ff" />
    </Sh>
  );
};
export const B2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={70} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}><Classroom t={t} board="Math test" />
        <Leo t={t} x={1000} y={900} scale={2.3} pose={P.sitSlump} expr="sad" rim={RIMC} />
      </Cam>
      <g transform="translate(1450 520) rotate(6)"><rect x={-150} y={-190} width={300} height={380} fill="#fff" /><text x={0} y={30} textAnchor="middle" fontSize={150} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>C−</text></g>
      <Badge t={t} t0={0.4} x={960} y={230} text="IQ 100 · perfectly average" size={44} color="#fff" />
    </Sh>
  );
};
const Ladder: React.FC<{ t: number; show: number }> = ({ t, show }) => {
  const rows: [string, string, string][] = [['IQ 100', 'You', '#fff'], ['×34', 'Genius · IQ 140', C.gold], ['×70', 'IQ 200', '#ff8a3d'], ['×231', 'IQ 1,000 · no human ever', C.red]];
  return (<g>{rows.map(([a, b, col], i) => i > show ? null : (
    <g key={i} transform={`translate(360 ${300 + i * 150})`} opacity={clamp01(pop(t, 0.1 + i * 0.05, 0.4) * 2) * (i === show ? 1 : 0.45)}>
      <rect x={0} y={-55} width={1200} height={110} rx={26} fill={i === show ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'} stroke={i === show ? col : 'rgba(255,255,255,0.12)'} strokeWidth={4} />
      <text x={40} y={18} fontSize={54} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{a}</text>
      <text x={340} y={18} fontSize={46} fontWeight={600} fill="#fff" fontFamily={FONT_HEAD}>{b}</text>
    </g>))}</g>);
};
export const B3: ShotFC = ({ o, d }) => {
  const { t, fr, s } = useF(o);
  const show = t < fr('b03', 0.55) ? 1 : t < s('b04') ? 2 : 3;
  return (<Sh mood="clean" box={1}><DataBG t={t + o} /><Ladder t={t} show={show} /></Sh>);
};
/* C */
export const C1: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="cold" kx={70} ky={20} box={1}>
      <Cam z={1.04}><Hallway t={t} />
        <Kid i={5} t={t} x={1300} y={880} scale={2.6} facing={-1} pose={P.point} expr="smug" mouth="grin" talking />
        <Leo t={t} x={760} y={880} scale={2.5} pose={P.stand} expr="shock" rim={RIMC} />
      </Cam>
      <LIE t={t} t0={1.6} fx={1300} fy={430} tx={760} ty={520} size={50} />
    </Sh>
  );
};
export const C2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <Cam z={1.04}><Kitchen t={t} v="morning" />
        <Mia t={t} x={1300} scale={2.6} facing={-1} pose={P.point} expr="smug" mouth="grin" talking rim={RIM} />
        <Leo t={t} x={760} scale={2.6} pose={P.stand} expr="squint" rim={RIM} />
      </Cam>
      <LIE t={t} t0={2.0} fx={1300} fy={430} tx={760} ty={520} size={50} />
    </Sh>
  );
};
export const C3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const part = t < fr('c03', 0.4) ? 0 : 1;
  return (
    <Sh mood="warm" kx={50} ky={20} box={1}>
      <rect width={1920} height={1080} fill="#5a3d2a" />
      {[...Array(5)].map((_, r) => <g key={r}><rect x={0} y={120 + r * 180} width={1920} height={20} fill="#3a2a1a" />{[...Array(40)].map((_, i) => <rect key={i} x={10 + i * 48} y={40 + r * 180} width={36} height={80} fill={['#c94f4f', '#4f6fb0', '#3d9a5f', '#ffc531', '#8c6bd6'][(i + r) % 5]} />)}</g>)}
      <Leo t={t} x={960} y={1000} scale={2.6} pose={part ? P.wave : P.hold} expr={part ? 'happy' : 'neutral'} mouth={part ? 'grin' : 'none'} talking={part === 1} rim={RIM} />
      {part === 0 && [...Array(8)].map((_, i) => { const k = ((t * 1.5 + i / 8) % 1); return <rect key={i} x={960 + Math.cos(i) * 400 * (1 - k)} y={500 + Math.sin(i) * 200 * (1 - k)} width={30} height={44} fill="#fff" opacity={1 - k} />; })}
      {part === 1 && ['Bonjour!', 'こんにちは!', 'Salve!'].map((w, i) => <Bubble key={i} t={t} t0={fr('c03', 0.45 + i * 0.15)} x={500 + i * 460} y={260 + (i % 2) * 90} text={w} size={44} />)}
    </Sh>
  );
};
export const C5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const part = t < fr('c05', 0.3) ? 0 : t < fr('c05', 0.6) ? 1 : 2;
  return (
    <Sh mood="warm" kx={60} ky={20} box={1}>
      {part === 0 && <Cam z={1.3} fy={800}><Hallway t={t} /><Leo t={t} x={960} y={880} scale={2.5} pose={P.stand} expr="smug" mouth="grin" rim={RIM} /><rect x={880} y={820} width={60} height={30} fill="#7a5238" /><rect x={990} y={820} width={60} height={30} fill="#7a5238" /></Cam>}
      {part === 1 && <Cam z={1.0}><Hallway t={t} /><rect x={1000} y={300} width={20} height={560} fill="#bfe6ff" opacity={0.6} /><Leo t={t} x={960} y={880} scale={2.5} pose={P.facepalm} expr="closed" tilt={-10} rim={RIM} /><Boom t={t} t0={fr('c05', 0.32)} x={1300} y={300} text="BONK" col={C.gold} size={80} /></Cam>}
      {part === 2 && <Cam z={1.0}><Dining t={t} food="none" /><Leo t={t} x={960} y={880} scale={2.5} pose={P.cheer} expr="happy" mouth="grin" rim={RIM} /><g transform="translate(960 560)"><circle r={90} fill="#f2c27a" /><circle r={78} fill="#e5483d" />{[...Array(6)].map((_, i) => <rect key={i} x={Math.cos(i) * 40 - 12} y={Math.sin(i) * 40 - 12} width={24} height={24} fill="#ffd25a" />)}</g></Cam>}
    </Sh>
  );
};
export const C6: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="warm" kx={50} ky={20} box={1}>
      <Cam z={1.04}><Dining t={t} food="none" />
        {[0, 1, 2].map((i) => <Kid key={i} i={i + 1} t={t} x={400 + i * 560} y={900} scale={2.3} pose={P.point} expr="happy" mouth="grin" talking={talk('c06')} />)}
      </Cam>
      {[0, 1, 2].map((i) => <LIE key={i} t={t} t0={0.4 + i * 0.4} fx={400 + i * 560} fy={500} tx={960} ty={1200} size={44} />)}
    </Sh>
  );
};
export const C7: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="cold" kx={20} ky={20} box={1}>
      <Cam z={1.04}><Classroom t={t} board="∫₀^∞ e^(−x²) dx = √π/2" />
        <Teach t={t} x={520} scale={2.6} pose={P.facepalm} expr="sad" tears={1} rim={RIMC} />
        <Leo t={t} x={1450} y={900} scale={2.3} facing={-1} pose={P.cheer} expr="smug" mouth="grin" rim={RIM} />
      </Cam>
      <Badge t={t} t0={fr('c07', 0.5)} x={1450} y={300} text="⏱ 4 min" size={44} color={C.gold} />
    </Sh>
  );
};
/* D */
export const D1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={45} box={1}>
      <Backdrop a="#1a1440" b="#05040e" />
      <ViralPhone x={960} y={560} s={1.0} t={t} views={Math.min(12_000_000, Math.exp(tw(t, 0, d, Math.log(1000), Math.log(12_000_000))))} cap={['Call him STUPID 👇', 'he gets smarter 🤯']}>
        <rect x={-190} y={-300} width={380} height={300} fill="#0b1530" /><Math_ t={t} n={8} />
      </ViralPhone>
    </Sh>
  );
};
export const D2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const words = ['stupid', 'idiot', 'brainless', 'dumbest kid alive', 'clown', 'dummy'];
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#0b1530" b="#02040a" />
      <Math_ t={t} n={20} op={tw(t, 0, d, 0.2, 0.8)} />
      <Leo t={t} x={960} y={900} scale={2.6} pose={P.stand} expr="shock" mouth="o" rim={RIMC} />
      {words.map((m, i) => { const t0 = 0.3 + i * (d / 7); return t > t0 && t < t0 + 2.4 ? <g key={i} opacity={1 - clamp01((t - t0 - 1.6) / 0.8)}><Bubble t={t} t0={t0} x={i % 2 ? 1500 : 420} y={300 + (i % 3) * 160} text={m} size={36} /></g> : null; })}
      {[...Array(12)].map((_, i) => <LIE key={i} t={t} t0={0.6 + i * (d / 13)} fx={i % 2 ? 1700 : 200} fy={300 + (i % 4) * 120} tx={960} ty={520} size={34} />)}
    </Sh>
  );
};
export const D3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Backdrop a="#0b0a24" b="#02020a" />
      <Cam z={tw(t, 0, d, 1.0, 1.15)}>
        <Earth x={960} y={560} r={330} />
        {[...Array(40)].map((_, i) => { const t0 = (i * 0.13) % Math.max(0.5, d - 0.8); const a = i * 2.39; return <LIE key={i} t={t} t0={t0} fx={960 + Math.cos(a) * 1100} fy={560 + Math.sin(a) * 700} tx={960 + Math.cos(a) * 300} ty={560 + Math.sin(a) * 300} size={26} />; })}
      </Cam>
    </Sh>
  );
};
export const D4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={50} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.3)} fx={960} fy={600}>
        <Kitchen t={t} v="morning" />
        <Leo t={t} x={760} scale={2.6} pose={P.sitTable} expr="happy" mouth="o" look={[1, 0.5]} rim={RIM} />
        <ellipse cx={960} cy={760} rx={150} ry={34} fill="#fff" /><ellipse cx={960} cy={752} rx={120} ry={24} fill="#f2e6c9" />
        {[...Array(9)].map((_, i) => <circle key={i} cx={900 + (i % 3) * 40} cy={746 + Math.floor(i / 3) * 6} r={8} fill="#e8a43a" />)}
        <path d="M 880 700 Q 960 600 1040 700" stroke="#9fe0ff" strokeWidth={3} fill="none" strokeDasharray="8 6" />
        <text x={960} y={640} textAnchor="middle" fontSize={26} fill="#9fe0ff" fontFamily={FONT_HEAD}>y = −0.4x² + 2</text>
      </Cam>
      <Math_ t={t} n={14} op={0.5} />
    </Sh>
  );
};
export const D5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={20} box={1}>
      <Cam z={1.04}><Hospital t={t} />
        <Doc t={t} x={420} scale={2.5} pose={P.handsHead} expr="shock" mouth="o" />
        <Doc t={t} x={1550} scale={2.5} facing={-1} pose={P.handsHead} expr="shock" mouth="o" />
        <Leo t={t} x={960} scale={2.5} pose={P.give} expr="smug" mouth="smirk" rim={RIMC} />
        <g transform="translate(1110 600) rotate(-8)"><rect x={-70} y={-50} width={140} height={100} fill="#fff" /><text x={0} y={8} textAnchor="middle" fontSize={20} fill="#333" fontFamily={FONT_HEAD}>∮ … = 0 ✓</text></g>
      </Cam>
      <Badge t={t} t0={0.5} x={960} y={220} text="30-year problem · solved in 9 min" size={42} color={C.gold} />
    </Sh>
  );
};
export const D6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={40} ky={30} box={1}>
      <Backdrop a="#0b1530" b="#020610" />
      <g transform="translate(960 520)">
        <rect x={-640} y={-380} width={1280} height={740} rx={24} fill="#0a0c14" stroke="#2a3350" strokeWidth={16} />
        <rect x={-610} y={-350} width={1220} height={680} fill="#1a2a5a" />
        <g transform="translate(0 280)"><Leo t={t} x={0} y={0} scale={2.4} pose={P.wave} expr="smug" mouth="smile" /></g>
        <rect x={-610} y={230} width={1220} height={100} fill={C.red} />
        <text x={-580} y={295} fontSize={44} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>BREAKING · SMARTEST PERSON EVER IS 15</text>
      </g>
    </Sh>
  );
};
/* E */
export const E1: ShotFC = ({ o, d }) => { const { t } = useF(o); return <Face t={t} expr="worried" mood="night" a="#1a1440" b="#000" />; };
export const E2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={30} box={1}>
      <Cam z={1.04}><Dining t={t} food="dinner" />
        {[0, 1].map((i) => <Kid key={i} i={i + 2} t={t} x={500 + i * 900} y={900} scale={2.3} pose={P.sitTable} talking expr="happy" mouth="open" />)}
        <Leo t={t} x={960} y={900} scale={2.3} pose={P.sitSlump} expr="squint" rim={RIMC} />
      </Cam>
      <Spinner2 t={t} />
    </Sh>
  );
};
const Spinner2: React.FC<{ t: number }> = ({ t }) => (
  <g transform="translate(500 420)">{[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2 + t * 3; return <circle key={i} cx={Math.cos(a) * 40} cy={Math.sin(a) * 40} r={6} fill="#fff" opacity={0.15 + 0.85 * ((i / 10 + t * 0.5) % 1)} />; })}</g>
);
export const E3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={60} ky={20} box={1}>
      <Cam z={1.04}><Hallway t={t} />
        <Kid i={2} t={t} x={1300} y={880} scale={2.4} facing={-1} pose={P.shrug} expr="sad" />
        <Leo t={t} x={760} y={880} scale={2.4} pose={P.point} expr="smug" mouth="open" talking rim={RIMC} />
      </Cam>
      <Bubble t={t} t0={0.5} x={760} y={380} text="Actually, technically…" size={40} />
    </Sh>
  );
};
export const E4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="night" kx={30} ky={20} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.08)}><Dining t={t} food="dinner" v="evening" />
        <Dad t={t} x={600} y={900} scale={2.5} pose={P.hold} expr="worried" talking rim={RIM} />
        <Leo t={t} x={1300} y={900} scale={2.4} facing={-1} pose={P.sitSlump} expr={t > fr('e04', 0.7) ? 'squint' : 'neutral'} rim={RIMC} />
        <g transform="translate(700 600)"><rect x={-60} y={-40} width={120} height={80} fill="#fff" /><path d="M -40 -20 L 40 -20 M -40 0 L 30 0 M -40 20 L 20 20" stroke="#555" strokeWidth={4} /></g>
      </Cam>
      {t > fr('e04', 0.8) && <Kinetic t={t} t0={fr('e04', 0.8)} x={1300} y={450} text="*sigh*" col="#cfd6ea" size={56} />}
    </Sh>
  );
};
export const E5: ShotFC = ({ o, d }) => { const { t, talk } = useF(o); return <Face t={t} who="dad" expr="sad" mouth={talk('e05') ? 'open' : 'frown'} talking={talk('e05')} mood="night" a="#2a1a3a" b="#05030a" />; };
export const E6: ShotFC = ({ o, d }) => { const { t } = useF(o); return (<><Face t={t} expr="sad" mood="night" a="#1a1440" b="#000" /></>); };
export const E7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={30} box={1}>
      <KidRoom t={t} v="night" />
      <Math_ t={t} n={30} op={0.7} />
      <Cam z={tw(t, 0, d, 1.0, 1.1)}><Leo t={t} x={960} y={760} scale={2.6} pose={P.handsHead} expr="squint" rim={RIMC} /></Cam>
    </Sh>
  );
};
/* F */
export const F1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#100a24" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={430}><Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="sad" rim={RIMC} /></Cam>
      <Neon t={t} t0={d * 0.4} x={960} y={210} text="“YOU'RE SMART” = −1%" col="#7fd4ff" size={60} />
    </Sh>
  );
};
export const F2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={20} box={1}>
      <Cam z={1.04}><Hallway t={t} />{[0, 1, 2].map((i) => <Kid key={i} i={i + 1} t={t} x={400 + i * 560} y={880} scale={2.3} pose={P.shrug} expr="neutral" />)}</Cam>
      <Kinetic t={t} t0={0.5} x={960} y={300} text="“…he already knows.”" col="#cfd6ea" size={54} />
    </Sh>
  );
};
export const F3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={70} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}><Stairs t={t} />
        <Leo t={t} x={760} y={760} scale={2.4} pose={P.sitSlump} expr="sad" rim={RIM} />
        <Mia t={t} x={kf(t, [[0, 1500], [d * 0.7, 980]])} y={kf(t, [[0, 600], [d * 0.7, 760]])} scale={2.4} facing={-1} pose={t > d * 0.7 ? P.sit : walkPose(t)} expr="soft" rim={RIM} />
      </Cam>
    </Sh>
  );
};
export const F4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<><Face t={t} who="mia" expr="soft" mouth={talk('f04') ? 'open' : 'smile'} talking={talk('f04')} mood="night" a="#2a1a3a" b="#05030a" /><Sh><TRUTH t={t} t0={d * 0.6} fx={960} fy={850} tx={-100} ty={600} size={56} /></Sh></>);
};
export const F5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="night" kx={50} ky={30} box={1}><Backdrop a="#1a1430" b="#05030a" /><Math_ t={t} n={tw(t, 0, d, 20, 10)} op={0.5} />
    <Cam z={1.04} fy={430}><Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="soft" rim={RIM} /></Cam>
    <Neon t={t} t0={0.2} x={960} y={210} text="−1%" col="#7fd4ff" size={80} /></Sh>);
};
export const F6: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<><Face t={t} who="mia" expr="happy" tears={0.7} mouth={talk('f06') ? 'open' : 'smile'} talking={talk('f06')} mood="night" a="#2a1a3a" b="#05030a" /><Sh>{[0, 1].map((i) => <TRUTH key={i} t={t} t0={1 + i * 3} fx={960} fy={850} tx={-100} ty={600} size={50} />)}</Sh></>);
};
export const F7: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="night" kx={50} ky={30} box={1}><Backdrop a="#1a1430" b="#05030a" /><Math_ t={t} n={6} op={0.3} />
    <Cam z={1.04}><Stairs t={t} /><Leo t={t} x={760} y={760} scale={2.4} pose={P.hug} expr="soft" tears={0.6} rim={RIM} /><Mia t={t} x={980} y={760} scale={2.4} facing={-1} pose={P.hug} expr="happy" rim={RIM} /></Cam></Sh>);
};
export const F8: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<><Face t={t} who="dad" expr="soft" mouth={talk('f08') ? 'open' : 'smile'} talking={talk('f08')} mood="golden" a="#ffcf9a" b="#7a4a3a" /><Sh><TRUTH t={t} t0={d * 0.5} fx={960} fy={900} tx={-100} ty={600} size={56} /></Sh></>);
};
export const F9: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const part = t < fr('f09', 0.33) ? 0 : t < fr('f09', 0.66) ? 1 : 2;
  return (
    <Sh mood="golden" kx={50} ky={20} box={1}>
      {part === 0 && <Cam z={1.04}><Dining t={t} food="dinner" v="evening" /><Dad t={t} x={600} y={900} scale={2.5} pose={P.give} expr="happy" mouth="open" talking rim={RIM} /><Leo t={t} x={1300} y={900} scale={2.4} facing={-1} pose={P.sitTable} expr="soft" rim={RIM} /></Cam>}
      {part === 1 && <Cam z={1.04}><Kitchen t={t} v="morning" /><Mom t={t} x={1300} scale={2.6} facing={-1} pose={P.give} expr="happy" mouth="open" talking rim={RIM} /><Leo t={t} x={760} scale={2.6} pose={P.stand} expr="soft" rim={RIM} /></Cam>}
      {part === 2 && <Cam z={1.04}><Dining t={t} food="none" />{[0, 1].map((i) => <Kid key={i} i={i + 2} t={t} x={500 + i * 900} y={900} scale={2.3} pose={P.give} expr="happy" mouth="open" talking />)}<Leo t={t} x={960} y={900} scale={2.3} pose={P.stand} expr="happy" mouth="smile" rim={RIM} /></Cam>}
      <TRUTH t={t} t0={[0.6, fr('f09', 0.4), fr('f09', 0.72)][part]} fx={part === 1 ? 1300 : 600} fy={500} tx={part === 1 ? 760 : 1200} ty={560} size={44} />
    </Sh>
  );
};
export const F10: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="clean" box={1}><DataBG t={t + o} tint="#7fd4ff" /><text x={960} y={600} textAnchor="middle" fontSize={200} fontWeight={700} fill="#7fd4ff" fontFamily={FONT_HEAD}>{Math.round(kf(t, [[0, 900], [d * 0.25, 500], [d * 0.5, 200], [d * 0.8, 140]]))}</text><text x={960} y={700} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={8}>IQ</text></Sh>);
};
/* G */
export const G1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="dawn" kx={25} ky={20} box={1}><Cam z={1.04}><Classroom t={t} board="Math test" /><Leo t={t} x={1000} y={900} scale={2.3} pose={P.sit} expr="happy" mouth="smile" rim={RIM} />{[0, 1].map((i) => <Kid key={i} i={i + 1} t={t} x={500 + i * 1000} y={900} scale={2.2} pose={P.sit} expr="happy" mouth="grin" />)}</Cam><Badge t={t} t0={0.4} x={960} y={250} text="IQ 100" size={56} color={C.gold} /></Sh>);
};
export const G2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="golden" kx={40} ky={30} box={1}><Cam z={tw(t, 0, d, 1.0, 1.06)}><Living t={t} v="evening" /><Dad t={t} x={600} scale={2.5} pose={P.hold} expr="happy" talking rim={RIM} /><Leo t={t} x={900} y={840} scale={2.4} pose={P.sit} expr="soft" mouth="smile" look={[-1, 0.3]} rim={RIM} /><Mia t={t} x={1250} scale={2.4} facing={-1} pose={P.sit} expr="happy" rim={RIM} /></Cam><Dust t={t} /></Sh>);
};
export const G3: ShotFC = ({ o, d }) => { const { t } = useF(o); return <Face t={t} expr="soft" mouth="smile" tears={0.6} mood="golden" a="#ffcf9a" b="#7a4a3a" look={[0.4, 0]} />; };
export const G4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (<Sh mood="golden" kx={30} ky={20} box={1}><Cam z={1.08}><Kitchen t={t} v="morning" /><Mia t={t} x={900} scale={2.6} pose={P.point} expr="smug" mouth={talk('g04') ? 'open' : 'smirk'} talking={talk('g04')} rim={RIM} /><Leo t={t} x={1300} scale={2.6} facing={-1} pose={P.stand} expr="squint" rim={RIM} /></Cam></Sh>);
};
export const G5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="golden" kx={50} ky={30} box={1}><Cam z={tw(t, 0, d, 1.2, 1.3)} fy={500}><Kitchen t={t} v="morning" /><Leo t={t} x={1100} scale={2.6} facing={-1} pose={P.stand} expr="shock" mouth="o" rim={RIM} /></Cam><LIE t={t} t0={0} fx={500} fy={460} tx={1100} ty={500} size={64} /></Sh>);
};
export const G6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (<Sh mood="dusk" kx={50} ky={30} box={1}><Backdrop a="#2a1650" b="#ff9e7a" /><Leo t={t} x={820} y={900} scale={2.6} pose={P.stand} expr="happy" mouth="smile" rim={RIM} /><Mia t={t} x={1100} y={900} scale={2.6} facing={-1} pose={P.cheer} expr="happy" mouth="grin" rim={RIM} /><Badge t={t} t0={0.3} x={960} y={230} text="Who makes YOU feel smart?" size={50} color="#fff" /><Neon t={t} t0={1.6} x={960} y={895} text="TAG THEM 👇" col="#7fd4ff" size={50} /></Sh>);
};
