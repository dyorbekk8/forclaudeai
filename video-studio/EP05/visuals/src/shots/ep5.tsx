import React from 'react';
import { Cam, Badge, BigText } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { Kitchen, DataBG, Backdrop } from '../sets/Sets';
import { Street, Car } from '../sets/Sets2';
import { Earth, Moon, Sun, KidRoom } from '../sets/Sets3';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Leo, Mom, Teach, COL } from './cast3';
import { Kid } from './common';
import { Sh, Neon, Kinetic, Boom, frOf } from './kit3';
import { Streaks, Dust, Cone } from '../lib/cine';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };
const RIM = 'rgba(255,190,120,0.95)';
const RIMC = 'rgba(140,220,255,0.95)';

/* ---------- space kit ---------- */
const Stars: React.FC<{ t: number; n?: number; drift?: number; seed?: number }> = ({ t, n = 220, drift = 0, seed = 1 }) => (
  <g>
    <rect width={1920} height={1080} fill="#02020a" />
    {[...Array(n)].map((_, i) => {
      const x = (((i * 263 * seed + t * drift * (1 + (i % 3))) % 1920) + 1920) % 1920;
      const y = (i * 151 * seed) % 1080;
      return <circle key={i} cx={x} cy={y} r={(i % 4) * 0.5 + 0.7} fill={i % 9 === 0 ? '#ffd9b0' : '#fff'} opacity={0.3 + 0.6 * Math.abs(Math.sin(i * 1.7 + t * (i % 3)))} />;
    })}
  </g>
);
const Bubble: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#bfe9ff" opacity={0.08} />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#bfe9ff" strokeWidth={4} opacity={0.4} />
    <path d={`M ${x - r * 0.6} ${y - r * 0.5} Q ${x - r * 0.2} ${y - r * 0.9} ${x + r * 0.3} ${y - r * 0.8}`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.35} strokeLinecap="round" />
  </g>
);
const Floater: React.FC<{ t: number; x: number; y: number; s?: number; expr?: any; mouth?: any; look?: [number, number] }> = ({ t, x, y, s = 1.6, expr = 'shock', mouth = 'o', look = [0, 0] }) => (
  <g>
    <Leo t={t} x={x} y={y + Math.sin(t * 1.4) * 8} scale={s} pose={{ ...P.armsUp, lhip: -14, rhip: 18, lkn: 20, rkn: 30 }} expr={expr} mouth={mouth} look={look} rim={RIMC} tilt={Math.sin(t) * 6} />
    <Bubble x={x} y={y - 115 * s + Math.sin(t * 1.4) * 8} r={150 * s} />
  </g>
);
const Glow: React.FC<{ x: number; y: number; r: number; col: string; op?: number }> = ({ x, y, r, col, op = 0.4 }) => <circle cx={x} cy={y} r={r} fill={col} opacity={op} filter="url(#glowF)" />;
const EarthLimb: React.FC<{ t: number; y?: number }> = ({ t, y = 1500 }) => (
  <g>
    <circle cx={960} cy={y} r={1300} fill="#4fa8ff" opacity={0.35} filter="url(#glowF)" />
    <circle cx={960} cy={y} r={1220} fill="#1e5fbf" />
    {[...Array(9)].map((_, i) => <ellipse key={i} cx={300 + i * 180 + Math.sin(i) * 60} cy={y - 1150 + (i % 3) * 40} rx={140} ry={30} fill="#fff" opacity={0.5} />)}
    <path d={`M ${-260} ${y} A 1220 1220 0 0 1 ${2180} ${y}`} fill="none" stroke="#9fe0ff" strokeWidth={14} opacity={0.8} />
  </g>
);
const Saturn: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-18)`}>
    <ellipse rx={420} ry={90} fill="none" stroke="#d9c39a" strokeWidth={34} opacity={0.75} />
    <circle r={190} fill="#e3c78f" />
    {[...Array(5)].map((_, i) => <ellipse key={i} cx={0} cy={-120 + i * 55} rx={180 - Math.abs(i - 2) * 20} ry={10} fill="#c9a66b" opacity={0.6} />)}
    <circle r={190} fill="url(#gHead)" />
    <path d="M -420 0 A 420 90 0 0 0 420 0" fill="none" stroke="#f0dcb4" strokeWidth={34} opacity={0.9} />
  </g>
);
const Galaxy: React.FC<{ x: number; y: number; s?: number; rot?: number; col?: string; t: number }> = ({ x, y, s = 1, rot = 0, col = '#b9a6ff', t }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + t * 2}) scale(${s} ${s * 0.45})`}>
    <circle r={420} fill={col} opacity={0.12} filter="url(#glowF)" />
    {[0, 1].map((arm) => [...Array(90)].map((_, i) => {
      const a = i * 0.11 + arm * Math.PI; const r = 20 + i * 4.4;
      return <circle key={arm + '-' + i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={2 + (i % 4)} fill={i % 7 === 0 ? '#ffd9b0' : '#e8e2ff'} opacity={0.75 - i / 140} />;
    }))}
    <circle r={60} fill="#fff6d8" opacity={0.9} filter="url(#glowF)" />
    <circle r={28} fill="#fff" />
  </g>
);
const Web: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={1920} height={1080} fill="#03020c" />
    {[...Array(40)].map((_, i) => {
      const x1 = (i * 337) % 1920, y1 = (i * 211) % 1080, x2 = (i * 521 + 300) % 1920, y2 = (i * 97 + 200) % 1080;
      return <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 80} ${(y1 + y2) / 2 - 60} ${x2} ${y2}`} stroke="#9f8cff" strokeWidth={3} fill="none" opacity={0.35} filter="url(#softShadow)" />;
    })}
    {[...Array(260)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 1080} r={1 + (i % 3)} fill={i % 5 ? '#d8ccff' : '#ffd9b0'} opacity={0.6} />)}
  </g>
);

/* ================= A — hook ================= */
export const A1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const eyes = t > 0.9;
  return (
    <Sh mood="dawn" kx={25} ky={30} box={1}>
      <Cam z={tw(t, 0, d, 1.25, 1.1, ease.soft)} fx={760} fy={620}>
        <KidRoom t={t} v="dawn" bed />
        <Leo t={t} x={760} y={760} scale={2.6} pose={P.sit} expr={eyes ? 'neutral' : 'closed'} look={[0.6, 0]} rim={RIM} />
        <Cone x={450} y={170} w={700} h={900} op={0.3} rot={-25} />
        <Dust t={t} />
      </Cam>
    </Sh>
  );
};
export const A2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dawn" kx={25} ky={30} box={1}>
      <Cam z={1.1} fx={1100} fy={620}>
        <KidRoom t={t} v="dawn" bed />
        <rect x={1640} y={220} width={200} height={620} fill="#8a5a3c" stroke="#5a3d2a" strokeWidth={10} />
        <Leo t={t} x={1500} scale={2.6} pose={P.stand} expr="shock" mouth="o" look={[-1, 0]} rim={RIM} />
        <g opacity={0.35} filter="url(#tintCyan)"><Leo t={t} x={1350} y={840} scale={2.6} pose={P.stand} /></g>
      </Cam>
      <Neon t={t} t0={0.4} x={1220} y={300} text="1 m" col={C.gold} size={64} />
    </Sh>
  );
};
export const A3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const jump = fr('a03', 0.22);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <Cam z={1.05}>
        <Kitchen t={t} v="morning" />
        <Mom t={t} x={1450} scale={2.6} facing={-1} pose={t > jump ? P.handsHead : P.hold} expr={t > jump ? 'shock' : 'neutral'} mouth={t > jump ? 'o' : 'none'} rim={RIM} />
        {t > jump && <Leo t={t} x={800} scale={2.6} pose={P.stand} expr="shock" mouth="o" look={[1, 0]} rim={RIM} />}
        {t > jump && <g opacity={1 - clamp01((t - jump) / 0.6)}><Streaks t={t} k={1} /></g>}
      </Cam>
      <Neon t={t} t0={jump + 0.2} x={800} y={280} text="10 m" col={C.gold} size={64} />
    </Sh>
  );
};
export const A4: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={30} box={1}>
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={430}>
        <Mom t={t} x={960} y={1650} scale={6.2} pose={P.reach} expr="shock" mouth={talk('a04') ? 'open' : 'o'} talking={talk('a04')} rim={RIM} />
      </Cam>
    </Sh>
  );
};
export const A5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={50} ky={30} box={1}>
      <Cam z={1.0}>
        <Kitchen t={t} v="morning" />
        <Mom t={t} x={1450} scale={2.6} facing={-1} pose={P.reach} expr="shock" mouth="open" rim={RIM} />
        <g opacity={clamp01(1 - t * 3)}><Leo t={t} x={800} scale={2.6} pose={P.stand} expr="shock" rim={RIM} /></g>
        <Streaks t={t} k={clamp01(1 - t)} dir={-1} />
      </Cam>
      <Kinetic t={t} t0={0.6} x={1450} y={300} text="“…your—”" col="#fff" size={60} />
    </Sh>
  );
};

/* ================= B — rule ================= */
export const B1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <g transform={`translate(960 470) scale(${tw(t, 0, d, 1.0, 1.12)})`}>
        <path d="M -340 0 Q 0 -230 340 0 Q 0 230 -340 0 Z" fill="#fff" />
        <g transform={`translate(${Math.sin(t * 1.3) * 60} ${Math.cos(t * 0.9) * 25})`}>
          <circle r={150} fill="#4a7bf0" />
          <circle r={70 + Math.sin(t * 2) * 8} fill="#111" />
          <circle cx={-46} cy={-46} r={28} fill="#fff" />
        </g>
        <rect x={-360} y={-260} width={720} height={260 * tw(t, fr('b01', 0.1), fr('b01', 0.14), 0, 1) * (t < fr('b01', 0.2) ? 1 : 0)} fill="#0b1530" />
      </g>
      <Badge t={t} t0={fr('b01', 0.2)} x={960} y={800} text="1 blink = teleport forward" size={46} color="#fff" icon="👁" />
      <Badge t={t} t0={fr('b01', 0.6)} x={960} y={880} text="each blink ×10 farther" size={46} color={C.gold} />
    </Sh>
  );
};
export const B2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const vals = ['1 m', '10 m', '100 m', '1 km'];
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      {vals.map((v, i) => {
        const t0 = fr('b02', 0.05 + i * 0.2);
        const k = pop(t, t0, 0.35);
        const w = 40 * Math.pow(3.2, i);
        return (
          <g key={i} opacity={clamp01(k * 2)}>
            <rect x={300} y={300 + i * 130} width={w * k} height={70} rx={20} fill={[C.gold, '#ff9a3a', C.red, '#b18cff'][i]} />
            <text x={320 + w * k} y={350 + i * 130} fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{v}</text>
          </g>
        );
      })}
    </Sh>
  );
};
export const B3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const n = Math.floor(tw(t, 0.3, d - 0.3, 0, 15));
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      <g transform="translate(960 470)">
        <circle r={260} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={20} />
        <path d={`M 0 -260 A 260 260 0 ${n > 7 ? 1 : 0} 1 ${Math.sin((n / 15) * Math.PI * 2) * 260} ${-Math.cos((n / 15) * Math.PI * 2) * 260}`} stroke={C.cyan} strokeWidth={20} fill="none" strokeLinecap="round" />
        <text x={0} y={30} textAnchor="middle" fontSize={140} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{n}</text>
        <text x={0} y={110} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD}>blinks / minute</text>
      </g>
    </Sh>
  );
};
export const B4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <Stars t={t} drift={40} />
      <Cam z={tw(t, 0, d, 2.2, 0.6, ease.io)}>
        <Web t={t} />
      </Cam>
      <BigText t={t} t0={0.6} x={960} y={540} text="< 2 MINUTES" size={150} color="#fff" />
    </Sh>
  );
};
export const B5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const half = fr('b05', 0.42);
  return (
    <Sh mood="clean" box={1}>
      <DataBG t={t + o} />
      {t < half ? (
        <g>
          <rect x={1100} y={250} width={120} height={600} fill="#8a6248" />
          <Leo t={t} x={800} y={850} scale={2.4} pose={P.stand} expr="closed" look={[1, 0]} rim={RIM} />
          <Badge t={t} t0={0.4} x={960} y={200} text="can't teleport into solid things" size={42} color="#fff" icon="🧱" />
        </g>
      ) : (
        <g>
          <Leo t={t} x={960} y={850} scale={2.6} pose={P.stand} expr="closed" rim={RIM} />
          <g transform="translate(960 300)">
            <circle r={110} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={14} />
            <path d={`M 0 -110 A 110 110 0 ${(t - half) / 3.5 > 0.5 ? 1 : 0} 1 ${Math.sin(clamp01((t - half) / 3.5) * 6.283) * 110} ${-Math.cos(clamp01((t - half) / 3.5) * 6.283) * 110}`} stroke={C.mint} strokeWidth={14} fill="none" strokeLinecap="round" />
            <text x={0} y={22} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{Math.min(10, Math.floor((t - half) / 0.35))}s</text>
          </g>
          <Badge t={t} t0={half + 0.3} x={960} y={500} text="eyes closed 10 s → RESET to 1 m" size={42} color={C.mint} />
        </g>
      )}
    </Sh>
  );
};
export const B6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={40} box={1}>
      <Backdrop a="#2a1a4a" b="#06040e" />
      <Cam z={tw(t, 0, d, 1.0, 1.12)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="shock" mouth="o" look={[0, -0.2]} rim={RIM} />
      </Cam>
    </Sh>
  );
};

/* ================= C — on Earth ================= */
export const C1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const cx = 2300 - t * 1500;
  return (
    <Sh mood="golden" kx={20} ky={30} box={1}>
      <Cam z={1.0}>
        <Street t={t} v="day" />
        <Leo t={t} x={900} y={950} scale={2.5} pose={P.handsHead} expr="shock" mouth="o" rim={RIM} />
        {cx > -600 && <Car x={cx} y={980} s={1.3} col="#e5483d" />}
        <Streaks t={t} k={cx > 0 && cx < 1800 ? 0.6 : 0} dir={1} y0={760} y1={980} />
      </Cam>
      <Neon t={t} t0={0.3} x={960} y={250} text="100 m" col={C.gold} size={64} />
      <Boom t={t} t0={0.6} x={1400} y={430} text="HOOONK" col={C.red} size={90} />
    </Sh>
  );
};
export const C2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const drop = 0.9;
  return (
    <Sh mood="golden" kx={80} ky={20} box={1}>
      <rect width={1920} height={1080} fill="#8cc8ff" />
      <g opacity={0.6}>{[...Array(16)].map((_, i) => <rect key={i} x={-60 + i * 130} y={700 - ((i * 97) % 260)} width={110} height={500} fill="#9db6d4" />)}</g>
      <rect x={0} y={780} width={1920} height={300} fill="#7a7f8c" />
      <rect x={0} y={760} width={1920} height={30} fill="#5a5f6c" />
      <Cam z={1.0}>
        <Leo t={t} x={760} y={790} scale={2.5} pose={P.armsUp} expr="shock" mouth="o" rim={RIM} />
        <Teach t={t} x={1300} y={790} scale={2.6} facing={-1} pose={t > drop ? P.handsHead : P.hold} expr={t > drop ? 'shock' : 'neutral'} mouth={t > drop ? 'o' : 'none'} rim={RIM} />
        <g transform={`translate(${1240} ${t < drop ? 560 : 560 + (t - drop) * (t - drop) * 900})`}><rect x={-22} y={-26} width={44} height={52} rx={8} fill="#fff" /><rect x={-22} y={-26} width={44} height={14} fill="#a05a38" /></g>
      </Cam>
      <Neon t={t} t0={0.3} x={960} y={260} text="1 km" col={C.gold} size={64} />
    </Sh>
  );
};
export const C3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const sec = Math.min(15, Math.floor(t * 2.2));
  return (
    <Sh mood="danger" kx={50} ky={40} box={1}>
      <Backdrop a="#3a1410" b="#0a0404" />
      <Cam z={tw(t, 0, d, 1.0, 1.15)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="squint" mouth="flat" tears={clamp01(t / 3)} sweat rim="rgba(255,120,80,1)" />
      </Cam>
      <rect width={1920} height={1080} fill="#ff2a2a" opacity={0.06 + 0.06 * Math.abs(Math.sin(t * 6))} />
      <Badge t={t} t0={0.2} x={1600} y={260} text={`${sec}s without blinking`} size={40} color={C.red} />
    </Sh>
  );
};
export const C4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={50} ky={10} box={1}>
      <Cam z={tw(t, 0, d, 1.0, 1.25, ease.in)} fy={300}>
        <rect width={1920} height={1080} fill="#6fb7ff" />
        {[...Array(6)].map((_, i) => <ellipse key={i} cx={(i * 397 + t * 40) % 2200 - 140} cy={200 + (i % 3) * 120} rx={220} ry={60} fill="#fff" opacity={0.8} />)}
        <rect x={0} y={880} width={1920} height={200} fill="#5a5f6c" />
        <Leo t={t} x={960} y={900} scale={2.5} pose={P.stand} expr="worried" look={[0, -1]} rim={RIM} />
      </Cam>
    </Sh>
  );
};

/* ================= D — up ================= */
export const D1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <rect width={1920} height={1080} fill="#4f8fe0" />
      {[...Array(10)].map((_, i) => <ellipse key={i} cx={(i * 263 - t * 120) % 2400} cy={880 + (i % 3) * 50} rx={320} ry={70} fill="#fff" opacity={0.9} />)}
      <Cam z={1.0}>
        {/* plane fuselage */}
        <g transform={`translate(${1500 - t * 30} 470)`}>
          <rect x={-1100} y={-170} width={1500} height={340} rx={170} fill="#eef2f7" />
          <rect x={-1100} y={-170} width={1500} height={340} rx={170} fill="url(#gShadeV)" />
          {[...Array(7)].map((_, i) => <rect key={i} x={-1000 + i * 190} y={-70} width={90} height={110} rx={40} fill="#2c3b4f" />)}
          <rect x={-200} y={60} width={600} height={40} fill="#3a6fd8" />
          <g transform="translate(-200 -10)"><Kid i={4} t={t} x={45} y={60} scale={0.55} pose={P.stand} expr="shock" mouth="o" /></g>
        </g>
        <Floater t={t} x={760} y={760} s={1.5} expr="neutral" mouth="flat" look={[1, -0.2]} />
      </Cam>
      <Neon t={t} t0={0.3} x={700} y={250} text="10 km" col={C.gold} size={64} />
    </Sh>
  );
};
export const D2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="cold" kx={50} ky={30} box={1}>
      <rect width={1920} height={1080} fill="#2a5aa0" />
      <Cam z={tw(t, 0, d, 1.4, 1.5)} fy={540}>
        <Floater t={t} x={960} y={900} s={2.2} expr="worried" mouth="o" />
      </Cam>
      <Kinetic t={t} t0={d * 0.5} x={960} y={250} text="(don't ask. just breathe.)" col="#cfe9ff" size={60} />
    </Sh>
  );
};
export const D3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={90} box={1}>
      <Stars t={t} />
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
        <EarthLimb t={t} y={1700} />
        <line x1={0} y1={520} x2={1920} y2={520} stroke="#9fe0ff" strokeWidth={3} strokeDasharray="20 14" opacity={0.7} />
        <text x={1880} y={505} textAnchor="end" fontSize={32} fontWeight={700} fill="#9fe0ff" fontFamily={FONT_HEAD}>KÁRMÁN LINE · 100 km</text>
        <Floater t={t} x={900} y={500} s={1.2} expr="shock" mouth="o" />
      </Cam>
    </Sh>
  );
};
export const D4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={95} box={1}>
      <Stars t={t} />
      <Cam z={tw(t, 0, d, 1.2, 1.0, ease.soft)} fy={900}>
        <EarthLimb t={t} y={1900} />
      </Cam>
      <Dust t={t} col="#cfe9ff" op={0.25} />
    </Sh>
  );
};
export const D5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const sx = 1300 - t * 140;
  return (
    <Sh mood="night" kx={70} ky={30} box={1}>
      <Stars t={t} />
      <Cam z={1.0}>
        <EarthLimb t={t} y={2300} />
        <g transform={`translate(${sx} 420)`}>
          <rect x={-420} y={-10} width={840} height={20} fill="#c8cdd6" />
          {[-380, -250, 250, 380].map((x) => <rect key={x} x={x - 50} y={-140} width={100} height={280} fill="#2b4a8a" stroke="#9aa6b5" strokeWidth={4} />)}
          <rect x={-90} y={-50} width={180} height={100} rx={20} fill="#eef2f7" />
          <circle cx={-30} cy={0} r={18} fill="#2c3b4f" />
        </g>
        {t > fr('d05', 0.75) && <g transform={`translate(${sx - 20 + (t - fr('d05', 0.75)) * 40} ${450 + (t - fr('d05', 0.75)) * 60}) rotate(${t * 90})`}><rect x={-22} y={-12} width={44} height={24} rx={6} fill="#f2c27a" /><rect x={-22} y={-4} width={44} height={8} fill="#4dbf6a" /></g>}
        <Floater t={t} x={600} y={780} s={1.3} expr="happy" mouth="grin" look={[1, -0.3]} />
      </Cam>
      <Neon t={t} t0={0.3} x={600} y={250} text="1,000 km" col={C.cyan} size={60} />
    </Sh>
  );
};
export const D6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Stars t={t} />
      <Cam z={tw(t, 0, d, 1.1, 0.95, ease.soft)}>
        <Earth x={960} y={560} r={360} />
        <Glow x={960} y={560} r={420} col="#4fa8ff" op={0.25} />
      </Cam>
      <Floater t={t} x={1600} y={950} s={0.7} expr="sad" mouth="none" look={[-1, -0.4]} />
      <Badge t={t} t0={d * 0.45} x={960} y={950} text="everyone you've ever met" size={40} color="#cfe9ff" />
    </Sh>
  );
};

/* ================= E — solar system ================= */
export const E1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const pass = fr('e01', 0.35);
  const mx = t < pass ? 1500 : 1500 - (t - pass) * 3500;
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Stars t={t} drift={t > pass ? 600 : 0} />
      <Cam z={1.0}>
        {mx > -400 && <Moon x={mx} y={500} r={t < pass ? 160 : 160 + (t - pass) * 300} />}
        <Streaks t={t} k={t > pass ? 0.6 : 0} />
        <Floater t={t} x={700} y={760} s={1.1} expr="shock" mouth="o" />
      </Cam>
      <Neon t={t} t0={pass} x={960} y={250} text="1,000,000 km" col={C.cyan} size={58} />
    </Sh>
  );
};
export const E2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const r = kf(t, [[0, 260], [fr('e02', 0.42), 140], [d, 60]]);
  return (
    <Sh mood="golden" kx={20} ky={40} box={1}>
      <Stars t={t} />
      <Sun x={420} y={480} r={r} t={t} />
      <Floater t={t} x={1350} y={760} s={1.1} expr="worried" mouth="none" look={[-1, -0.2]} />
      <Neon t={t} t0={fr('e02', 0.45)} x={1300} y={250} text="100 million km" col={C.gold} size={56} />
    </Sh>
  );
};
export const E3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={40} box={1}>
      <Stars t={t} />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)}>
        <Saturn x={1100} y={540} s={1.25} />
        <Floater t={t} x={420} y={900} s={0.8} expr="shock" mouth="o" look={[1, -0.4]} />
      </Cam>
      <Badge t={t} t0={fr('e03', 0.45)} x={960} y={900} text="rings ≈ 280,000 km wide" size={40} color="#f0dcb4" />
    </Sh>
  );
};
export const E4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const pass = fr('e04', 0.75);
  const vx = t < pass ? 1200 : 1200 - (t - pass) * 2400;
  return (
    <Sh mood="night" kx={50} ky={50} box={1}>
      <Stars t={t} />
      <Cam z={1.0}>
        <g transform={`translate(${vx} 480) rotate(-15)`}>
          <path d="M -120 0 A 120 120 0 0 1 120 0 Z" fill="#e8e8ee" />
          <rect x={-8} y={0} width={16} height={60} fill="#c8cdd6" />
          <rect x={-60} y={60} width={120} height={60} fill="#c9a66b" />
          <line x1={60} y1={90} x2={360} y2={160} stroke="#9aa6b5" strokeWidth={6} />
          <line x1={-60} y1={90} x2={-260} y2={220} stroke="#9aa6b5" strokeWidth={6} />
        </g>
        <Floater t={t} x={560} y={820} s={1.0} expr={t > pass ? 'happy' : 'neutral'} mouth={t > pass ? 'grin' : 'none'} look={[1, -0.3]} />
      </Cam>
      <Badge t={t} t0={fr('e04', 0.35)} x={1200} y={240} text="VOYAGER 1 · launched 1977" size={40} color="#fff" />
    </Sh>
  );
};
export const E5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const gone = fr('e05', 0.75);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <Stars t={t} n={120} />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        <line x1={1100} y1={0} x2={980} y2={1080} stroke="#ffd9a8" strokeWidth={60} opacity={0.06} />
        {t < gone && <rect x={1040} y={470} width={8} height={8} fill="#7fc4ff" />}
        {t < gone && <circle cx={1044} cy={474} r={30} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />}
        <Floater t={t} x={560} y={860} s={0.9} expr="sad" mouth="none" look={[1, -0.3]} />
      </Cam>
    </Sh>
  );
};

/* ================= F — stars & galaxies ================= */
export const F1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="void" box={1}>
      <Stars t={t} drift={200} />
      <line x1={0} y1={600} x2={1920 * clamp01(t / (d * 0.8))} y2={600} stroke="#fff6c9" strokeWidth={6} />
      <circle cx={1920 * clamp01(t / (d * 0.8))} cy={600} r={16} fill="#fff" />
      <Badge t={t} t0={0.3} x={500} y={460} text="LIGHT: 1 year" size={44} color="#fff6c9" />
      <Badge t={t} t0={fr('f01', 0.6)} x={1400} y={760} text="YOU: 0.25 s" size={50} color="#b18cff" />
    </Sh>
  );
};
export const F2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const px = 1500 - t * 220;
  return (
    <Sh mood="danger" kx={70} ky={40} box={1}>
      <Stars t={t} drift={80} />
      <Glow x={px} y={480} r={280} col="#ff5a3a" op={0.35} />
      <circle cx={px} cy={480} r={110} fill="#ff6a4a" />
      <circle cx={px} cy={480} r={70} fill="#ffb08a" />
      <Floater t={t} x={1350} y={900} s={0.9} expr="shock" mouth="o" look={[-1, -0.4]} />
      <Badge t={t} t0={0.6} x={px} y={700} text="PROXIMA CENTAURI · 4.24 ly" size={38} color="#ffb08a" />
    </Sh>
  );
};
export const F3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <Stars t={t} n={140} />
      <Cam z={tw(t, 0, d, 1.4, 0.95, ease.soft)}>
        <Galaxy x={960} y={520} s={1.6} t={t} />
        <Floater t={t} x={1600} y={1000} s={0.5} expr="shock" mouth="o" look={[-1, -0.6]} />
      </Cam>
      <Badge t={t} t0={fr('f03', 0.4)} x={960} y={900} text="MILKY WAY · ~200 billion stars" size={42} color="#e8e2ff" />
    </Sh>
  );
};
export const F4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={30} ky={40} box={1}>
      <Stars t={t} n={160} />
      <Galaxy x={420} y={420} s={0.7} t={t} col="#ffd9b0" rot={30} />
      <Galaxy x={1480} y={640} s={0.35} t={t} col="#b9a6ff" rot={-20} />
      <Floater t={t} x={960} y={900} s={0.7} expr="neutral" mouth="none" look={[-1, -0.6]} />
      <Badge t={t} t0={0.5} x={420} y={760} text="ANDROMEDA · ~1 trillion stars" size={38} color="#ffd9b0" />
    </Sh>
  );
};
export const F5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <Cam z={tw(t, 0, d, 1.3, 1.0, ease.soft)}>
        <Web t={t} />
      </Cam>
      <Floater t={t} x={960} y={900} s={0.6} expr="happy" mouth="o" look={[0, -0.8]} />
    </Sh>
  );
};
export const F6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <rect width={1920} height={1080} fill="#02010a" />
      <Glow x={300} y={540} r={700} col="#6a4aff" op={0.18} />
      {[...Array(60)].map((_, i) => <circle key={i} cx={(i * 97) % 700} cy={(i * 151) % 1080} r={1 + (i % 3)} fill="#d8ccff" opacity={0.5} />)}
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        <Floater t={t} x={1300} y={820} s={1.2} expr="worried" mouth="none" look={[-1, 0]} />
      </Cam>
    </Sh>
  );
};

/* ================= G — edge ================= */
export const G1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="danger" kx={50} ky={40} box={1}>
      <Backdrop a="#200508" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.15)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="squint" tears={0.8} rim="rgba(255,90,60,1)" />
      </Cam>
    </Sh>
  );
};
export const G2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="clean" box={1}>
      <Stars t={t} n={140} drift={30} />
      <g transform={`translate(960 560) scale(${tw(t, 0, d, 1.0, 1.15)}) translate(-960 -560)`}>
      <circle cx={960} cy={560} r={300 + Math.sin(t * 2) * 8} fill="none" stroke="#b18cff" strokeWidth={6} opacity={0.8} />
      <circle cx={960} cy={560} r={340 + (t * 60) % 200} fill="none" stroke="#b18cff" strokeWidth={3} opacity={0.4 * (1 - ((t * 60) % 200) / 200)} />
      <circle cx={960} cy={560} r={300} fill="#6a4aff" opacity={0.08} />
      <text x={960} y={575} textAnchor="middle" fontSize={40} fontWeight={700} fill="#e8e2ff" fontFamily={FONT_HEAD}>observable universe</text>
      <text x={960} y={625} textAnchor="middle" fontSize={34} fill={C.gray} fontFamily={FONT_HEAD}>46 billion ly radius</text>
      <circle cx={960 + 300 * 0.98} cy={560} r={10} fill="#fff" />
      <g opacity={tw(t, fr('g02', 0.55), fr('g02', 0.65), 0, 1)}>
        <path d={`M ${1254} 560 L ${1254 + 600 * clamp01((t - fr('g02', 0.6)) / 1.2)} 560`} stroke={C.red} strokeWidth={8} strokeDasharray="20 12" />
        <text x={1600} y={520} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>next blink: 100 billion ly</text>
      </g>
      </g>
    </Sh>
  );
};
export const G3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const sh = Math.sin(t * 70) * 6;
  return (
    <Sh mood="danger" kx={50} ky={40} box={1}>
      <Backdrop a="#300810" b="#000" />
      <g transform={`translate(${sh} 0)`}>
        <Cam z={tw(t, 0, d, 1.4, 1.7)} fy={360}>
          <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr="squint" tears={1} sweat rim="rgba(255,90,60,1)" />
        </Cam>
      </g>
      <Badge t={t} t0={0.1} x={1600} y={260} text={`${Math.min(30, 10 + Math.floor(t * 4.5))}s`} size={56} color={C.red} />
    </Sh>
  );
};
export const G4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <Backdrop a="#1a1440" b="#000" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fy={430}>
        <Leo t={t} x={960} y={1720} scale={6.4} pose={P.stand} expr={t > d * 0.4 ? 'closed' : 'shock'} rim={RIMC} />
      </Cam>
    </Sh>
  );
};
export const G6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="night" kx={50} ky={40} box={1}>
      <rect width={1920} height={1080} fill="#000" />
      <Floater t={t} x={960} y={760} s={1.6} expr="neutral" mouth="none" look={[0, 0]} />
      <Neon t={t} t0={0.3} x={960} y={250} text="RESET · 1 m" col={C.mint} size={70} />
    </Sh>
  );
};

/* ================= H — ending ================= */
export const H1: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="void" kx={50} ky={50} box={1}>
      <rect width={1920} height={1080} fill="#000" />
      <Cam z={tw(t, 0, d, 1.0, 0.35, ease.soft)}>
        <Floater t={t} x={960} y={760} s={1.6} expr="sad" mouth="none" look={[0, 0.2]} />
      </Cam>
      <Badge t={t} t0={d * 0.3} x={960} y={900} text="home: 100,000,000,000 ly" size={44} color="#fff" icon="⌂" />
    </Sh>
  );
};
export const H2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh mood="golden" kx={70} ky={20} box={1}>
      <g>
        <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
          <Kitchen t={t} v="morning" />
          <Cone x={1450} y={0} w={700} h={1000} op={0.3} rot={18} />
          <Mom t={t} x={1300} scale={2.6} facing={-1} pose={P.reach} expr="soft" mouth="open" rim={RIM} />
        </Cam>
      </g>
      <Dust t={t} />
    </Sh>
  );
};
export const H3: ShotFC = ({ o, d }) => {
  const { t, talk } = useF(o);
  return (
    <Sh mood="golden" kx={60} ky={30} box={1}>
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <g>
        <Cam z={tw(t, 0, d, 1.0, 1.06)} fy={430}>
          <Mom t={t} x={960} y={1650} scale={6.2} pose={P.reach} expr="soft" mouth={talk('h03') ? 'open' : 'smile'} talking={talk('h03')} rim={RIM} />
        </Cam>
      </g>
    </Sh>
  );
};
export const H4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh mood="dusk" kx={50} ky={50} box={1}>
      <Stars t={t} n={160} />
      <Galaxy x={1500} y={300} s={0.3} t={t} />
      <Floater t={t} x={760} y={860} s={1.3} expr="smug" mouth="smirk" look={[1, -0.3]} />
      <Badge t={t} t0={0.3} x={1150} y={760} text="How would YOU get home?" size={50} color="#fff" />
      <Neon t={t} t0={fr('h04', 0.6)} x={1150} y={890} text="PART 2 →" col={C.cyan} size={50} />
    </Sh>
  );
};
