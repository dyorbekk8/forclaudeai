import React from 'react';
import { Cam, Badge, BigText, Bubble, Stamp } from '../lib/ui';
import { P, walkPose, mixPose } from '../lib/Character';
import { DataBG, Backdrop, Stairs, Kitchen } from '../sets/Sets';
import { KidRoom, Living, Cake, Dog, StickyNote, NotesWall, Ball, Court } from '../sets/Sets3';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, kf, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { You, Mia, Mom, Dad, COL } from './cast3';
import { Sh, Split, Neon, LagTag, Kinetic, frOf } from './kit3';
import { PastFrame, Spinner, RGBSplit, Slices, fmtMs } from '../lib/lag';
import { Polaroid } from './common';

const useF = (o: number) => { const u = useShot(o); return { ...u, fr: frOf(u.s, u.e) }; };

/* ================= G — day 14 ================= */
const Clock: React.FC<{ x: number; y: number; s?: number; h: number; m: number; col?: string; label?: string }> = ({ x, y, s = 1, h, m, col = '#fff', label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-90} width={380} height={180} rx={30} fill="#0b0d18" stroke={col} strokeWidth={6} />
    <text x={0} y={42} textAnchor="middle" fontSize={120} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{`${h}:${String(m).padStart(2, '0')}`}</text>
    {label && <text x={0} y={140} textAnchor="middle" fontSize={40} fontWeight={700} fill={col} fontFamily={FONT_HEAD} letterSpacing={3}>{label}</text>}
  </g>
);

export const G2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const ring = Math.sin(t * 60) * 4;
  return (
    <Sh tone="night">
      <KidRoom t={t} v="dark" />
      <g transform={`translate(${1500 + ring} 760)`}><Clock x={0} y={0} s={0.8} h={7} m={0} col={C.red} /></g>
      {[0, 1].map((i) => <path key={i} d={`M ${1680 + i * 30} 690 q 20 30 0 60`} stroke={C.red} strokeWidth={6} fill="none" opacity={Math.abs(Math.sin(t * 8 + i))} />)}
      <g transform="translate(980 600)">
        <ellipse cx={-70} cy={0} rx={36} ry={22} fill="#fff" opacity={tw(t, 0.6, 0.9, 0, 1)} />
        <ellipse cx={70} cy={0} rx={36} ry={22} fill="#fff" opacity={tw(t, 0.6, 0.9, 0, 1)} />
        <circle cx={-64} cy={2} r={10} fill="#111" opacity={tw(t, 0.6, 0.9, 0, 1)} />
        <circle cx={76} cy={2} r={10} fill="#111" opacity={tw(t, 0.6, 0.9, 0, 1)} />
      </g>
      <Kinetic t={t} t0={d * 0.5} x={960} y={300} text="PITCH BLACK." col="#fff" size={80} />
    </Sh>
  );
};

export const G3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const room = (v: 'day' | 'dark') => (
    <g>
      <KidRoom t={t} v={v} bed />
      <You t={t} x={960} scale={2.6} pose={P.stand} expr={v === 'dark' ? 'worried' : 'neutral'} />
    </g>
  );
  return (
    <Sh tone="neutral">
      <Split id="g3" t={t} left={room('day')} right={room('dark')} sub="−2 h 16 min" lShift={480} rShift={480} />
      <Clock x={560} y={330} s={0.7} h={7} m={0} col={C.gold} />
      <Clock x={1440} y={330} s={0.7} h={4} m={44} col={C.cyan} />
    </Sh>
  );
};

export const G4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const sep = tw(t, 0.4, d * 0.6, 0, 1, ease.soft);
  return (
    <Sh tone="cool">
      <DataBG t={t + o} />
      <g transform={`translate(${-sep * 300} 0)`}>
        <You t={t} x={960} y={860} scale={3.2} pose={P.stand} expr="worried" />
        <Badge t={t} t0={fr('g04', 0.4)} x={960} y={300} text="BODY: 7:00" size={44} color={C.gold} />
      </g>
      <g transform={`translate(${sep * 300} 0)`} opacity={0.5 + 0.5 * sep}>
        <g filter="url(#tintCyan)" opacity={0.6}><You t={t - 2} x={960} y={860} scale={3.2} pose={P.stand} expr="worried" /></g>
        <Badge t={t} t0={fr('g04', 0.75)} x={960} y={400} text="WORLD: 4:44" size={44} color={C.cyan} />
      </g>
    </Sh>
  );
};

export const G5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const steps = Math.floor(clamp01((t - 0.3) / (d * 0.55)) * 12);
  const walkX = 300 + steps * 90;
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Kitchen t={t} v="morning" noTable />
        {/* tape arrows on floor */}
        {[...Array(12)].map((_, i) => (
          <g key={i} opacity={t > fr('g05', 0.72) ? 1 : 0.0 + (i < steps ? 0.35 : 0)}>
            <path d={`M ${330 + i * 90} 930 l 40 0 l -10 -12 M ${370 + i * 90} 930 l -10 12`} stroke={C.gold} strokeWidth={10} strokeLinecap="round" fill="none" />
          </g>
        ))}
        <You t={t} x={walkX} scale={2.4} y={900} pose={walkPose(t * 0.9, 0.6)} expr="closed" look={[1, 0]} />
        {t > fr('g05', 0.72) && <Mia t={t} x={1500} y={900} scale={2.4} facing={-1} pose={P.hold} expr="soft" mouth="smile" />}
      </Cam>
      <Kinetic t={t} t0={0.3} x={walkX} y={400} text={`${Math.max(1, steps)}`} col={C.gold} size={80} />
    </Sh>
  );
};

export const G6: ShotFC = ({ o, d }) => {
  const { t, talk, fr } = useF(o);
  const pull = kf(t, [[0, 0], [fr('g06', 0.15), -1], [fr('g06', 0.3), 0], [fr('g06', 0.45), -1], [fr('g06', 0.55), 0]]);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.05, 1.1)} fx={900}>
        <Kitchen t={t} v="morning" />
        <You t={t} x={900 + pull * 40} scale={2.5} pose={P.stand} expr="closed" />
        <Mia t={t} x={700} scale={2.5} pose={P.reach} expr="soft" mouth={talk('g06') ? 'open' : 'smile'} talking={talk('g06')} look={[1, -0.3]} />
      </Cam>
    </Sh>
  );
};

/* ================= H — day 18 ================= */
export const H2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <KidRoom t={t} v="night" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={600}>
        <You t={t} x={960} y={760} scale={2.8} pose={P.sitSlump} expr="sad" look={[0, 0.6]} />
      </Cam>
      <Kinetic t={t} t0={d * 0.5} x={960} y={200} text="TOO LATE." col={C.red} size={90} />
    </Sh>
  );
};

export const H3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const run = fr('h03', 0.55);
  const gone = tw(t, fr('h03', 0.8), fr('h03', 0.95), 1, 0);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Stairs t={t} />
        <g opacity={gone}>
          <g filter="url(#pastTint)"><Mia t={t} x={760} y={760} scale={2.4} pose={P.sitSlump} expr="sad" tears={1} /></g>
        </g>
        <You t={t} x={kf(t, [[run, 1700], [run + 1.3, 980]])} y={880} scale={2.6} facing={-1} pose={t > run && t < run + 1.3 ? walkPose(t * 2) : P.reach} expr={gone < 0.5 ? 'sad' : 'worried'} />
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#scan)" opacity={0.4 * gone} />
      <Badge t={t} t0={0.3} x={1650} y={120} text="YESTERDAY" size={40} color={C.cyan} />
    </Sh>
  );
};

export const H4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="night">
      <KidRoom t={t} v="night" bed />
      <Cam z={tw(t, 0, d, 1.1, 1.2)} fx={980} fy={600}>
        <g transform="translate(830 600) rotate(-90)">
          <Mia t={t} x={0} y={0} scale={1.6} pose={P.stand} expr="closed" />
        </g>
      </Cam>
      {[0, 1, 2].map((i) => <text key={i} x={1000 + i * 40 + Math.sin(t + i) * 10} y={420 - ((t * 40 + i * 40) % 120)} fontSize={44 - i * 6} fontWeight={700} fill="#fff" opacity={0.7} fontFamily={FONT_HEAD}>z</text>)}
      <Stamp t={t} t0={0.6} x={1500} y={220} text="ALREADY FINE" color={C.mint} rot={-8} size={60} />
    </Sh>
  );
};

export const H5: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)}>
        <Stairs t={t} />
        {[0, 1, 2].map((i) => {
          const ph = (t * 0.25 + i * 0.33) % 1;
          return <g key={i} opacity={0.45 * Math.sin(ph * Math.PI)} filter="url(#tintCyan)">
            {i === 0 ? <Mom t={t} x={500 + ph * 900} y={880 - ph * 420} scale={2.2} pose={walkPose(t)} /> : i === 1 ? <Dad t={t} x={1500 - ph * 900} y={460 + ph * 420} scale={2.2} facing={-1} pose={walkPose(t)} /> : <Mia t={t} x={400 + ph * 700} y={880 - ph * 330} scale={2.2} pose={walkPose(t * 1.4)} />}
          </g>;
        })}
        <You t={t} x={360} y={880} scale={2.6} pose={P.sitSlump} expr="sad" />
      </Cam>
    </Sh>
  );
};

/* ================= I — birthday ================= */
const party = (tt: number, withYou: boolean, chairEmpty: boolean) => (
  <g>
    <Living t={tt} party={1} />
    <Mom t={tt} x={520} scale={2.4} pose={P.cheer} expr="happy" mouth="open" talking />
    <Dad t={tt} x={1420} scale={2.5} facing={-1} pose={P.cheer} expr="happy" mouth="open" talking />
    <Mia t={tt} x={1200} scale={2.4} facing={-1} pose={P.armsUp} expr="happy" mouth="grin" />
    {!chairEmpty && withYou && <You t={tt} x={860} y={900} scale={2.4} pose={P.sitTable} expr="neutral" look={[0, 0]} />}
    <rect x={720} y={780} width={480} height={30} rx={8} fill="#7a5238" />
    <Cake x={960} y={780} s={0.8} t={tt} />
    {[0, 1, 2].map((i) => <text key={i} x={600 + i * 330} y={330 + Math.sin(tt * 3 + i) * 16} fontSize={60} fill="#fff" opacity={0.85}>♪</text>)}
  </g>
);

export const I2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>{party(t, true, false)}</Cam>
      <Badge t={t} t0={0.4} x={960} y={140} text="HAPPY BIRTHDAY!" size={50} color={C.gold} icon="🎂" />
      <LagTag x={860} y={560} ms={2097152000} col={C.red} />
    </Sh>
  );
};

export const I3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const n = Math.min(24, Math.floor(tw(t, 0.2, d * 0.85, 0, 24)));
  return (
    <Sh tone="cool">
      <DataBG t={t + o} />
      {[...Array(28)].map((_, i) => {
        const x = 520 + (i % 7) * 130, y = 330 + Math.floor(i / 7) * 130;
        const on = i < n;
        return (
          <g key={i}>
            <rect x={x - 55} y={y - 55} width={110} height={110} rx={16} fill={on ? 'rgba(255,77,94,0.25)' : 'rgba(255,255,255,0.05)'} stroke={on ? C.red : 'rgba(255,255,255,0.15)'} strokeWidth={3} />
            <text x={x} y={y + 14} textAnchor="middle" fontSize={40} fontWeight={700} fill={on ? '#fff' : 'rgba(255,255,255,0.3)'} fontFamily={FONT_HEAD}>{i + 1}</text>
          </g>
        );
      })}
      <BigText t={t} t0={0.1} x={960} y={190} text="3½ WEEKS LATE" size={84} color={C.red} />
    </Sh>
  );
};

export const I4: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const ghost = tw(t, fr('i04', 0.45), fr('i04', 0.6), 0, 1);
  return (
    <Sh tone="cool">
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
        <Living t={t} party={0} v="evening" />
        <g opacity={ghost} filter="url(#pastTint)">
          {party(t, false, true)}
        </g>
        <rect x={830} y={760} width={120} height={140} rx={14} fill="#c4744d" opacity={1 - ghost * 0.3} />
        <You t={t} x={kf(t, [[0, 1700], [fr('i04', 0.4), 1500]])} y={880} scale={2.4} facing={-1} pose={P.stand} expr={ghost > 0.5 ? 'shock' : 'neutral'} look={[-1, 0]} />
      </Cam>
      <Badge t={t} t0={0.3} x={1680} y={110} text="TUESDAY" size={36} color={C.gray} icon="◷" />
    </Sh>
  );
};

export const I5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const blow = fr('i05', 0.7);
  const lit = t < blow ? 1 : tw(t, blow, blow + 0.6, 1, 0);
  return (
    <Sh tone="warm">
      <Backdrop a="#3a2a40" b="#0d0a14" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fy={600}>
        <g filter="url(#pastTint)" opacity={0.85}><Cake x={960} y={820} s={1.6} t={t} lit={lit} /></g>
        <You t={t} x={960} y={1500} scale={5.5} pose={P.sitTable} expr={t > blow ? 'closed' : 'sad'} mouth={t > blow && t < blow + 0.8 ? 'o' : 'none'} tears={0.7} look={[0, 0.5]} rim="rgba(255,200,120,0.9)" />
      </Cam>
      {t > blow && [...Array(9)].map((_, i) => { const k = clamp01((t - blow) / 2); return <circle key={i} cx={820 + i * 35 + Math.sin(t * 2 + i) * 20} cy={420 - k * 200 - i * 6} r={14 + k * 20} fill="#fff" opacity={0.18 * (1 - k)} />; })}
    </Sh>
  );
};

/* ================= J — Biscuit ================= */
const biscuitRoom = (tt: number, ghost: number, look = 0, wag = 1) => (
  <g>
    <KidRoom t={tt} v="day" bed />
    <g opacity={ghost * (0.86 + 0.06 * Math.sin(tt * 2.3))}>
      <ellipse cx={1050} cy={560} rx={300} ry={170} fill="#bfefff" opacity={0.35} filter="url(#glowF)" />
      <Dog x={1020} y={612} s={1.05} t={tt} look={look} wag={wag} />
      {[...Array(10)].map((_, i) => { const ph = (tt * 0.3 + i * 0.1) % 1; return <circle key={i} cx={850 + (i * 53) % 380} cy={600 - ph * 240} r={4} fill="#fff" opacity={0.7 * Math.sin(ph * Math.PI)} />; })}
    </g>
  </g>
);

export const J2: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const g = tw(t, fr('j02', 0.7), fr('j02', 0.85), 0, 1);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fx={1000} fy={560}>
        {biscuitRoom(t, g, -0.5, 0.2)}
        <You t={t} x={kf(t, [[0, 1900], [fr('j02', 0.5), 1600]])} y={900} scale={2.6} facing={-1} pose={t < fr('j02', 0.5) ? walkPose(t * 1.3) : P.stand} expr={g > 0.5 ? 'shock' : 'neutral'} mouth={g > 0.5 ? 'o' : 'none'} look={[-1, 0.1]} />
      </Cam>
    </Sh>
  );
};

export const J3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#5a4030" b="#1a120c" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Polaroid x={760} y={520} rot={-6} s={1.25} caption="me & Biscuit ♥">
          <rect x={0} y={0} width={400} height={330} fill="#bfe6ff" />
          <rect x={0} y={250} width={400} height={80} fill="#7fc46a" />
          <Dog x={270} y={300} s={0.62} t={t} lying={false} facing={-1} />
          <You t={t} x={110} y={315} scale={1.15} pose={P.cheer} expr="happy" mouth="grin" />
        </Polaroid>
        <g transform="translate(1400 760)" opacity={tw(t, fr('j03', 0.55), fr('j03', 0.75), 0, 1)}>
          <rect x={-200} y={60} width={400} height={80} fill="#4a7a3a" />
          <path d="M -90 60 L -90 -120 Q 0 -200 90 -120 L 90 60 Z" fill="#9aa3b5" />
          <text x={0} y={-40} textAnchor="middle" fontSize={42} fontWeight={700} fill="#4f5868" fontFamily={FONT_HEAD}>BISCUIT</text>
          {[-120, 120, -150].map((x, i) => <g key={i} transform={`translate(${x} 50)`}><circle r={16} fill={['#ff7aa8', '#ffd25a', '#ff8a3d'][i]} /><rect x={-3} y={0} width={6} height={30} fill="#3d7a4f" /></g>)}
        </g>
      </Cam>
    </Sh>
  );
};

export const J4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.9, 2.05, ease.soft)} fx={1120} fy={560}>
        {biscuitRoom(t, 1, tw(t, 0.4, 1.0, -0.5, 0.4), tw(t, 1.2, 1.5, 0.2, 1.4))}
      </Cam>
      <Badge t={t} t0={d * 0.55} x={960} y={150} text="1 YEAR AGO" size={44} color={C.cyan} icon="◷" />
    </Sh>
  );
};

export const J5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const handK = tw(t, fr('j05', 0.45), fr('j05', 0.7), 0, 1);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.25, 1.35)} fx={980} fy={560}>
        {biscuitRoom(t, 1, 0.3, 0.6)}
        <You t={t} x={780} y={760} scale={2.6} pose={mixPose(P.sit, P.reach, handK)} expr="soft" mouth="smile" tears={0.6} look={[1, 0.2]} />
      </Cam>
      <g transform="translate(1640 150)">
        <circle r={70} fill="rgba(10,10,20,0.75)" stroke="#fff" strokeWidth={5} />
        <line x1={0} y1={0} x2={Math.cos(t * 6) * 50} y2={Math.sin(t * 6) * 50} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.cos(t * 0.5) * 32} y2={Math.sin(t * 0.5) * 32} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
      </g>
    </Sh>
  );
};

export const J6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#ffcf9a" b="#7a4a3a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={430}>
        <You t={t} x={960} y={1700} scale={6.4} pose={P.stand} expr="soft" mouth="smile" tears={0.8} look={[0.6, 0.2]} rim="rgba(255,220,160,0.95)" />
      </Cam>
    </Sh>
  );
};

export const J7: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const stuck = fr('j07', 0.6);
  return (
    <Sh tone="cool">
      <DataBG t={t + o} tint={C.red} />
      {[['DAY 26', 0.05], ['DAY 27', 0.25], ['DAY 28', 0.38]].map(([dl, x], i) => (
        <g key={i} opacity={clamp01(pop(t, fr('j07', x as number), 0.4) * 2)}>
          <text x={420} y={370 + i * 150} fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{dl}</text>
          <rect x={760} y={320 + i * 150} width={760} height={70} rx={18} fill={C.red} />
          <text x={790} y={372 + i * 150} fontSize={48} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>1 YEAR</text>
        </g>
      ))}
      <Stamp t={t} t0={stuck} x={1140} y={850} text="STUCK" color={C.red} rot={-10} size={110} />
    </Sh>
  );
};

/* ================= K — Mia's notes ================= */
export const K1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const spill = tw(t, fr('k01', 0.6), fr('k01', 0.9), 0, 1, ease.out);
  return (
    <Sh tone="night">
      <KidRoom t={t} v="night" bed />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fx={960} fy={760}>
        <Mom t={t} x={700} y={860} scale={2.6} pose={P.reach} expr={spill > 0.3 ? 'shock' : 'neutral'} mouth={spill > 0.3 ? 'o' : 'none'} look={[1, 0.6]} />
        <rect x={880} y={790} width={260} height={90} rx={10} fill="#c4744d" />
        {[...Array(26)].map((_, i) => {
          const a = (i / 26) * Math.PI - Math.PI;
          const r = spill * (120 + (i * 37) % 220);
          return <rect key={i} x={1010 + Math.cos(a) * r - 22} y={820 + Math.sin(a) * r * 0.5 + spill * 40 - 22} width={44} height={44} fill={['#ffe066', '#ffb3c6', '#a0e7ff', '#b8f2a6'][i % 4]} transform={`rotate(${i * 23} ${1010 + Math.cos(a) * r} ${820 + Math.sin(a) * r * 0.5})`} />;
        })}
      </Cam>
    </Sh>
  );
};

export const K2: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const n = tw(t, 0, d * 0.8, 6, 140, ease.in);
  return (
    <Sh tone="warm">
      <Cam z={tw(t, 0, d, 1.15, 1.0, ease.soft)}>
        <KidRoom t={t} v="day" bed={false} notes={n} />
      </Cam>
      <Badge t={t} t0={d * 0.5} x={960} y={980} text="for the YOU who sees this room in a year" size={40} color={C.gold} />
    </Sh>
  );
};

export const K3: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const lines = ['Hi. It\'s Mia.', 'Today is day 1 for me.', 'You\'ll see this in a year.', 'I\'m still here. ♥'];
  const shown = Math.ceil(clamp01((t - 0.2) / Math.max(1, d * 0.85)) * lines.length);
  return (
    <Sh tone="warm">
      <Backdrop a="#e9d3b0" b="#a07850" />
      <Cam z={tw(t, 0, d, 1.0, 1.06, ease.soft)}>
        <StickyNote x={960} y={540} s={1.1} lines={lines.slice(0, shown)} />
      </Cam>
    </Sh>
  );
};

export const K4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const day = Math.floor(tw(t, 0, d, 1, 210));
  return (
    <Sh tone="night">
      <KidRoom t={t} v="night" bed={false} />
      <circle cx={1180} cy={560} r={300} fill="#ffcf8a" opacity={0.22} filter="url(#glowF)" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fx={1000} fy={640}>
        <rect x={760} y={740} width={600} height={30} rx={8} fill="#7a5238" />
        <rect x={800} y={770} width={20} height={90} fill="#5a3d2a" />
        <rect x={1300} y={770} width={20} height={90} fill="#5a3d2a" />
        <Mia t={t} x={900} y={880} scale={2.4} pose={P.sitTable} expr="soft" look={[1, 0.6]} rim="rgba(255,210,140,0.9)" />
        <rect x={1050} y={710} width={80} height={30} fill="#ffe066" transform={`rotate(${Math.sin(t * 2) * 4} 1090 725)`} />
      </Cam>
      <Badge t={t} t0={0.2} x={1600} y={140} text={`DAY ${day}`} size={48} color={C.gold} icon="✎" />
    </Sh>
  );
};

export const K5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const items = [['EVERY HUG', 0.28, '#ff7aa8'], ['EVERY WORD', 0.45, C.gold], ['EVERY HAND', 0.6, C.cyan]] as const;
  return (
    <Sh tone="warm">
      <Backdrop a="#2a2040" b="#0b0814" />
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
        <You t={t} x={960} y={900} scale={3.0} pose={P.stand} expr={t > fr('k05', 0.8) ? 'soft' : 'neutral'} mouth={t > fr('k05', 0.8) ? 'smile' : 'none'} rim="rgba(255,220,160,0.9)" />
        {items.map(([txt, x, col], i) => {
          const t0 = fr('k05', x);
          const k = clamp01((t - t0) / 2.4);
          if (t < t0) return null;
          const sx = i === 0 ? 200 : i === 1 ? 960 : 1720, sy = i === 1 ? 150 : 300;
          const px = sx + (960 - sx) * k, py = sy + (560 - sy) * k;
          return (
            <g key={i}>
              <path d={`M ${sx} ${sy} Q ${(sx + 960) / 2} ${sy - 120} ${px} ${py}`} stroke={col} strokeWidth={6} fill="none" opacity={0.6} strokeDasharray="10 12" />
              <circle cx={px} cy={py} r={18} fill={col} />
              <circle cx={px} cy={py} r={60} fill={col} opacity={0.35} filter="url(#glowF)" />
              <text x={sx} y={sy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill={col} fontFamily={FONT_HEAD}>{txt}</text>
            </g>
          );
        })}
      </Cam>
      <Kinetic t={t} t0={fr('k05', 0.88)} x={960} y={1000} text="...just late." col="#fff" size={64} />
    </Sh>
  );
};

export const K6: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const squeeze = fr('k06', 0.6);
  const sq = t > squeeze ? 1 + 0.04 * Math.sin((t - squeeze) * 6) : 1;
  return (
    <Sh tone="warm">
      <Backdrop a="#ffd9a8" b="#b06a4a" />
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)}>
        {/* your arm + hand */}
        <path d="M -100 760 Q 400 700 820 620" stroke="#16161c" strokeWidth={70} strokeLinecap="round" fill="none" />
        <path d="M -100 760 Q 250 720 480 690" stroke={COL.you} strokeWidth={190} strokeLinecap="round" fill="none" />
        <path d="M -100 760 Q 250 720 480 690" stroke="url(#gShadeV)" strokeWidth={190} strokeLinecap="round" fill="none" />
        <circle cx={900} cy={600} r={120} fill="#16161c" />
        <circle cx={900} cy={600} r={120} fill="url(#gHead)" />
        {/* Mia's small hand */}
        <g transform={`translate(1000 590) scale(${sq}) translate(-1000 -590)`} opacity={tw(t, squeeze - 0.6, squeeze, 0, 1)}>
          <path d="M 2020 420 Q 1600 450 1240 530" stroke="#16161c" strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M 2020 420 Q 1700 440 1420 490" stroke={COL.mia} strokeWidth={130} strokeLinecap="round" fill="none" />
          <circle cx={1010} cy={575} r={78} fill="#232330" />
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={950 + i * 30} cy={515 + Math.abs(i - 1.5) * 10} rx={16} ry={30} fill="#232330" />)}
        </g>
        <circle cx={1010} cy={580} r={220} fill="#fff3c4" opacity={t > squeeze ? 0.4 : 0} filter="url(#glowF)" />
      </Cam>
      <Badge t={t} t0={squeeze + 0.2} x={960} y={160} text="RIGHT ON TIME" size={48} color={C.gold} />
    </Sh>
  );
};

/* ================= L — twist ================= */
export const L1: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const green = t > fr('l01', 0.7);
  return (
    <Sh tone="cool">
      <Backdrop a="#0d1530" b="#04060f" />
      <g transform={`translate(960 540) scale(${tw(t, 0, d, 1.0, 1.1)})`}>
        <rect x={-640} y={-170} width={1280} height={340} rx={50} fill="rgba(8,10,18,0.92)" stroke={green ? C.mint : C.red} strokeWidth={8} />
        <rect x={-640} y={-170} width={1280} height={340} rx={50} fill={green ? C.mint : C.red} opacity={0.12} filter="url(#glowF)" />
        <text x={0} y={-60} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={6}>PING · DAY 400</text>
        <text x={0} y={90} textAnchor="middle" fontSize={130} fontWeight={700} fill={green ? C.mint : C.red} fontFamily={FONT_HEAD}>33,554,432,000</text>
      </g>
    </Sh>
  );
};

export const L3: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  // value follows the HUD ledger shape: steep log descent
  const k = clamp01((t - 0.1) / Math.max(1, d - 0.3));
  const ms = k >= 1 ? 0 : Math.max(0, Math.exp(Math.log(33554432000) * (1 - k)) - 1);
  const g = Math.floor(t * 12) % 7 === 0 ? 1 : 0;
  return (
    <Sh tone="cool">
      <Backdrop a="#06231a" b="#02060a" />
      <Slices id="l3" t={t} k={g * 0.4}>
        <text x={960} y={600} textAnchor="middle" fontSize={ms > 1e9 ? 150 : 190} fontWeight={700} fill={C.mint} fontFamily={FONT_HEAD}>{fmtMs(ms)}</text>
        <text x={960} y={700} textAnchor="middle" fontSize={50} fontWeight={700} fill="rgba(255,255,255,0.6)" fontFamily={FONT_HEAD} letterSpacing={8}>MILLISECONDS</text>
      </Slices>
    </Sh>
  );
};

export const L4: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  const fl = Math.exp(-t * 5);
  return (
    <Sh tone="neutral">
      <rect x={0} y={0} width={1920} height={1080} fill="#02060a" />
      <circle cx={960} cy={540} r={420} fill="#fff" opacity={0.25 * fl} filter="url(#glowF)" />
      <text x={960} y={640} textAnchor="middle" fontSize={300} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>0</text>
      <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={0.6 * fl} />
    </Sh>
  );
};

export const L5: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  const neg = t > fr('l05', 0.55);
  return (
    <Sh tone="pink">
      <rect x={0} y={0} width={1920} height={1080} fill={neg ? '#14072a' : '#02060a'} />
      <Slices id="l5" t={t} k={neg && t < fr('l05', 0.55) + 0.5 ? 1 : 0}>
        <RGBSplit amt={neg ? 14 : 0}>
          <text x={960} y={640} textAnchor="middle" fontSize={300} fontWeight={700} fill={neg ? '#b18cff' : '#fff'} fontFamily={FONT_HEAD}>{neg ? '−1' : '0'}</text>
        </RGBSplit>
      </Slices>
      {neg && <circle cx={960} cy={540} r={480} fill="#b18cff" opacity={0.2} filter="url(#glowF)" />}
    </Sh>
  );
};

export const L6: ShotFC = ({ o, d }) => {
  const { t } = useF(o);
  // callback: you catch the ball BEFORE Mia throws it
  const catchAt = 0.5, throwAt = 1.5;
  return (
    <Sh tone="pink">
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Court t={t} />
        <g opacity={0.55} filter="url(#tintCyan)"><Mia t={t + 1} x={1350} scale={2.3} facing={-1} pose={t + 1 < throwAt ? P.hold : P.reach} expr="smug" /></g>
        <Mia t={t} x={1350} scale={2.3} facing={-1} pose={t < throwAt ? P.hold : P.reach} expr={t > throwAt ? 'shock' : 'smug'} mouth={t > throwAt ? 'o' : 'smirk'} />
        <You t={t} x={700} scale={2.4} pose={t > catchAt ? P.hold : P.stand} expr={t > catchAt ? 'smug' : 'neutral'} mouth={t > catchAt ? 'smirk' : 'none'} look={[1, 0]} rim="rgba(177,140,255,0.95)" />
        {t > catchAt && <Ball x={790} y={600} r={34} />}
      </Cam>
      <Neon t={t} t0={0.7} x={700} y={260} text="+1 s FUTURE" col="#b18cff" size={50} />
    </Sh>
  );
};

export const L7: ShotFC = ({ o, d }) => {
  const { t, fr } = useF(o);
  return (
    <Sh tone="warm">
      <Backdrop a="#2b2050" b="#0a0716" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <You t={t} x={760} y={900} scale={2.8} pose={P.stand} expr="soft" mouth="smile" rim="rgba(177,140,255,0.9)" />
        <Mia t={t} x={1100} y={900} scale={2.8} facing={-1} pose={P.hug} expr="happy" mouth="smile" />
        <g opacity={0.45}><ellipse cx={1450} cy={850} rx={220} ry={110} fill="#bfefff" opacity={0.4} filter="url(#glowF)" /><Dog x={1450} y={900} s={0.9} t={t} lying /></g>
      </Cam>
      <Badge t={t} t0={fr('l07', 0.3)} x={960} y={170} text="Would you take the lag?" size={56} color="#fff" />
      <Neon t={t} t0={fr('l07', 0.75)} x={960} y={1000} text="PART 2: THE FUTURE" col="#b18cff" size={48} />
    </Sh>
  );
};
