import React from 'react';
import { Stage, Cam, Badge, BigText } from '../lib/ui';
import { Character, P } from '../lib/Character';
import { DataBG } from '../sets/Sets';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';

/* tiny person glyph */
export const Person: React.FC<{ x: number; y: number; s?: number; col?: string; glow?: number; op?: number }> = ({ x, y, s = 1, col = '#5f7ab8', glow = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    {glow > 0 && <circle cx={0} cy={-26} r={46} fill={col} opacity={0.25 * glow} />}
    <circle cx={0} cy={-46} r={12} fill={col} />
    <path d="M -17 0 L -17 -18 Q -17 -32 0 -32 Q 17 -32 17 -18 L 17 0 Z" fill={col} />
  </g>
);

const Source: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <text x={60} y={1040} fontSize={24} fill="#8fa3c8" opacity={tw(t, 0.5, 1, 0, 0.85)} fontFamily={FONT_BODY} fontWeight={800}>{text}</text>
);
const SRC = 'Source: Serota, Levine & Boster (2010), Human Communication Research';

/* B2 — 1,000 American adults survey */
export const B2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const cols = 40, rows = 25;
  const fill = tw(t, 0.4, 3.2, 0, 1000, ease.out);
  const q = s('b05') + 3.9;
  return (
    <Stage>
      <DataBG t={t + o} />
      <Cam z={tw(t, 0, d, 1, 1.06)}>
        <g transform="translate(330 250)">
          {[...Array(cols * rows)].map((_, i) => {
            const x = (i % cols) * 32, y = Math.floor(i / cols) * 26;
            const on = i < fill;
            return <circle key={i} cx={x} cy={y} r={on ? 9 : 3} fill={on ? '#7fb4ff' : '#1d2b55'} opacity={on ? 0.9 : 0.6} />;
          })}
        </g>
        <BigText t={t} t0={0.3} x={960} y={140} text="1,000 U.S. ADULTS" size={78} color="#fff" stroke={C.navy} />
      </Cam>
      {t > q && (
        <g>
          <rect x={360} y={850} width={1200} height={130} rx={30} fill="rgba(255,255,255,0.95)" transform={`translate(960 915) scale(${pop(t, q, 0.45)}) translate(-960 -915)`} />
          <text x={960} y={935} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.ink} fontFamily={FONT_HEAD} opacity={pop(t, q, 0.45)}>"How many lies did you tell in the last 24 hours?"</text>
        </g>
      )}
      <Source t={t} text={SRC} />
    </Stage>
  );
};

/* B3 — average 1.65 lies a day */
export const B3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const v = tw(t, 0.25, 1.6, 0, 1.65, ease.out);
  return (
    <Stage>
      <DataBG t={t + o} />
      <text x={960} y={330} textAnchor="middle" fontSize={44} fontWeight={600} fill={C.gray} fontFamily={FONT_HEAD} letterSpacing={8}>THE AVERAGE</text>
      <g transform={`translate(960 600) scale(${1 + 0.08 * Math.exp(-Math.max(0, t - 1.6) * 6) * (t > 1.6 ? 1 : 0)})`}>
        <text x={0} y={0} textAnchor="middle" fontSize={300} fontWeight={700} fill={C.cyan} fontFamily={FONT_HEAD}>{v.toFixed(2)}</text>
      </g>
      <text x={960} y={720} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>lies per day</text>
      <Source t={t} text={SRC} />
    </Stage>
  );
};

/* B4 — at that rate: 90 in ~6 weeks */
export const B4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const X0 = 300, X1 = 1650, Y0 = 860, Y1 = 220;
  const days = 46;
  const px = (dd: number) => X0 + (dd / days) * (X1 - X0);
  const py = (age: number) => Y0 - ((age - 15) / (90 - 15)) * (Y0 - Y1);
  const k = tw(t, 0.4, 2.8, 0, 1, ease.io);
  const curDay = k * 45.5;
  const curAge = 15 + 1.65 * curDay;
  const marks = [0, 7, 14, 21, 28, 35, 42];
  return (
    <Stage>
      <DataBG t={t + o} />
      <g opacity={tw(t, 0, 0.3, 0, 1)}>
        <path d={`M ${X0} ${Y1 - 40} L ${X0} ${Y0} L ${X1 + 40} ${Y0}`} stroke="#8fa3c8" strokeWidth={4} fill="none" />
        {marks.map((m) => (
          <g key={m}>
            <line x1={px(m)} y1={Y0} x2={px(m)} y2={Y0 + 12} stroke="#8fa3c8" strokeWidth={3} />
            <text x={px(m)} y={Y0 + 50} textAnchor="middle" fontSize={28} fill="#8fa3c8" fontFamily={FONT_HEAD}>{m === 0 ? 'day 0' : `wk ${m / 7}`}</text>
          </g>
        ))}
        {[15, 30, 45, 60, 75, 90].map((a) => (
          <g key={a}>
            <line x1={X0 - 12} y1={py(a)} x2={X1} y2={py(a)} stroke="#8fa3c8" strokeOpacity={0.15} strokeWidth={2} />
            <text x={X0 - 24} y={py(a) + 10} textAnchor="end" fontSize={28} fill="#8fa3c8" fontFamily={FONT_HEAD}>{a}</text>
          </g>
        ))}
        <text x={X0 - 24} y={Y1 - 70} textAnchor="end" fontSize={28} fill="#8fa3c8" fontFamily={FONT_HEAD} fontWeight={600}>BODY AGE</text>
      </g>
      <path d={`M ${px(0)} ${py(15)} L ${px(curDay)} ${py(curAge)}`} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
      <circle cx={px(curDay)} cy={py(curAge)} r={16} fill={C.red} />
      {/* ageing mini-Eli riding the line */}
      <Character t={t} x={px(curDay) - 10} y={py(curAge) - 26} scale={0.85} hair="eli" age={Math.min(41, curAge)} grayHair={clamp01((curAge - 40) / 35)} pose={curAge > 60 ? P.hunch : P.stand} cane={curAge > 70} expr={curAge > 60 ? 'worried' : 'neutral'} look={[0.6, 0]} />
      <g transform={`translate(${px(curDay) + 70} ${py(curAge) + 10})`}>
        <text x={0} y={0} fontSize={56} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{Math.round(curAge)}</text>
      </g>
      {k >= 1 && <Badge t={t} t0={2.85} x={1180} y={130} text="90 years old in about 6 weeks" size={44} color={C.gold} />}
    </Stage>
  );
};

/* B5 — six out of ten told zero lies */
export const B5: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const lightAt = s('b09') + 0.3;
  return (
    <Stage>
      <DataBG t={t + o} />
      <BigText t={t} t0={0.15} x={960} y={200} text="BUT HERE'S THE WEIRD PART" size={66} color={C.gold} stroke={C.navy} t1={s('b09') - 0.1} />
      {[...Array(10)].map((_, i) => {
        const on = i < 6 && t > lightAt + i * 0.12;
        const k = pop(t, 0.2 + i * 0.06, 0.4);
        return <Person key={i} x={330 + i * 140} y={640} s={2.2 * k} col={on ? C.mint : '#4a5f94'} glow={on ? 1 : 0} />;
      })}
      {t > lightAt + 0.8 && (
        <g>
          <path d={`M 290 700 L 290 730 L 1070 730 L 1070 700`} stroke={C.mint} strokeWidth={5} fill="none" opacity={tw(t, lightAt + 0.8, lightAt + 1.1, 0, 1)} />
          <Badge t={t} t0={lightAt + 0.9} x={680} y={810} text="0 lies that day" size={44} color={C.mint} />
        </g>
      )}
      <BigText t={t} t0={lightAt + 0.2} x={960} y={360} text="6 OUT OF 10" size={110} color="#fff" stroke={C.navy} />
      <Source t={t} text={SRC} />
    </Stage>
  );
};

/* B6 — half of all lies come from one person in twenty */
export const B6: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const hot = 12;
  const stack = tw(t, 1.6, 3.2, 0, 1, ease.out);
  return (
    <Stage>
      <DataBG t={t + o} />
      {[...Array(20)].map((_, i) => {
        const isHot = i === hot;
        const x = 162 + i * 84, y = 820;
        return <Person key={i} x={x} y={y} s={1.45 * pop(t, 0.05 + i * 0.03, 0.4)} col={isHot ? C.red : '#4a5f94'} glow={isHot ? 1 : 0} op={isHot || t < 1.2 ? 1 : 0.5} />;
      })}
      {/* stack of lie bubbles above the liar */}
      {[...Array(12)].map((_, i) => {
        const vis = stack * 12 > i;
        const x = 162 + hot * 84, y = 820 - 110 - i * 34;
        return vis ? <g key={i} transform={`translate(${x + Math.sin(i * 1.7) * 10} ${y})`}><rect x={-46} y={-14} width={92} height={28} rx={14} fill="#fff" /><text x={0} y={9} textAnchor="middle" fontSize={20} fontWeight={800} fill={C.red} fontFamily={FONT_BODY}>LIE</text></g> : null;
      })}
      <BigText t={t} t0={0.2} x={960} y={150} text="HALF OF ALL LIES" size={96} color="#fff" stroke={C.navy} />
      <BigText t={t} t0={1.3} x={960} y={270} text="came from 1 person in 20" size={56} color={C.red} stroke={C.navy} />
      <Source t={t} text={SRC} />
    </Stage>
  );
};
