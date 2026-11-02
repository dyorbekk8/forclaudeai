import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag, Stamp } from '../lib/ui';
import { Character, P, walkPose } from '../lib/Character';
import { Hallway, DMV, CareRoom, Armchair, Dining, Backdrop } from '../sets/Sets';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { Kid, Heart } from './common';
import { Grandpa, Stool } from './actE';

/* H1 — fifteen years old, body forty-one */
export const H1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <Hallway t={t} px={-t * 20} />
        <Kid i={1} t={t} x={450} y={830} scale={2.0} expr="neutral" look={[1, 0]} />
        <Character t={t} seed={1} x={960} y={830} scale={2.5} hair="eli" age={41} pose={P.pockets} expr="soft" mouth="smile" look={[0.2, 0]} />
        {/* backpack straps */}
        <path d="M 930 520 L 925 610 M 990 520 L 996 610" stroke="#3a6ad6" strokeWidth={10} strokeLinecap="round" />
        <Kid i={6} t={t} x={1450} y={830} scale={2.0} facing={-1} expr="happy" look={[1, 0]} />
      </Cam>
      <Badge t={t} t0={0.3} x={620} y={240} text="REAL AGE 15" size={44} color={C.mint} />
      <Badge t={t} t0={1.4} x={1320} y={240} text="BODY 41" size={44} color={C.gold} />
    </Stage>
  );
};

/* H2 — full beard, no driver's license */
export const H2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const stampT = s('h02') + 2.6;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <DMV t={t} />
        <Character t={t} seed={15} x={1300} y={700} scale={2.2} facing={-1} hair="teacher" outfit="#2f4f7f" pose={P.hold} expr="squint" mouth="flat" look={[1, 0.3]} />
        <rect x={900} y={600} width={1100} height={480} fill="#b9c2cc" />
        <rect x={900} y={600} width={1100} height={16} fill="#d9e0e8" />
        <Character t={t} seed={1} x={700} y={1000} scale={2.6} hair="eli" age={41} pose={P.give} expr="happy" mouth="grin" look={[1, 0]} />
        {/* the ID card */}
        <g transform="translate(990 560) rotate(-6)"><rect x={-90} y={-56} width={180} height={112} rx={10} fill="#fff" /><circle cx={-48} cy={-6} r={26} fill={C.ink} /><rect x={-10} y={-26} width={86} height={10} rx={5} fill="#ccd" /><rect x={-10} y={-6} width={70} height={10} rx={5} fill="#ccd" /><text x={20} y={36} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.red} fontFamily={FONT_BODY}>DOB: 15 yrs ago</text></g>
      </Cam>
      <Stamp t={t} t0={stampT} x={1300} y={360} text="DENIED" size={110} />
    </Stage>
  );
};

/* H3 — friends who trust you */
export const H3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const hi5 = 1.0;
  const up = t > hi5 - 0.3;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Hallway t={t} />
        <Kid i={3} t={t} x={420} y={830} scale={2.1} expr="happy" mouth="smile" look={[1, 0]} />
        <Character t={t} seed={1} x={820} y={830} scale={2.5} hair="eli" age={41} pose={up ? P.wave : P.stand} expr="happy" mouth="grin" look={[1, 0]} />
        <Character t={t} seed={4} x={1100} y={830} scale={2.5} hair="sam" outfit={C.sam} facing={-1} pose={up ? P.wave : P.stand} expr="happy" mouth="grin" look={[1, 0]} />
        <Kid i={5} t={t} x={1480} y={830} scale={2.1} facing={-1} expr="happy" mouth="smile" look={[1, 0]} />
        {t > hi5 && <g transform={`translate(960 230) scale(${pop(t, hi5, 0.4)})`}>{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${Math.cos(i) * 40} ${Math.sin(i) * 40} L ${Math.cos(i) * 90} ${Math.sin(i) * 90}`} stroke={C.gold} strokeWidth={10} strokeLinecap="round" />)}</g>}
      </Cam>
      <Badge t={t} t0={1.2} x={960} y={960} text="(Sam's hair grew back)" size={36} />
    </Stage>
  );
};

/* H4 — Saturdays, the truth now, and he still smiles */
export const H4: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const laugh = s('h05') + 0.6;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.12, ease.soft)} fx={950}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr={t > laugh ? 'happy' : 'soft'} mouth={t > laugh ? 'grin' : 'smile'} pose={P.hold} look={[1, 0]} bob={t > laugh ? -Math.abs(Math.sin(t * 10)) * 3 : 0} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={41} facing={-1} pose={{ ...P.sit, rsh: 55, rel: 50 }} expr="happy" mouth="grin" look={[1, 0]} />
        {/* cards */}
        <g transform="translate(960 560)">{[-1, 0, 1].map((k) => <rect key={k} x={k * 40 - 20} y={-30} width={40} height={58} rx={5} fill="#fff" stroke="#c33" strokeWidth={3} transform={`rotate(${k * 12})`} />)}</g>
      </Cam>
      <Tag t={t} text="SATURDAY" icon="♥" color={C.red} />
      {t > laugh && <BigText t={t} t0={laugh} x={760} y={260} text="HA!" size={90} color={C.gold} />}
    </Stage>
  );
};

/* I1 — Nora knocks a glass off the table */
export const I1: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const knock = s('i01') + 2.6;
  const fall = Math.max(0, t - knock);
  const gy = 610 + 0.5 * 2600 * fall * fall;
  const broken = gy > 1000;
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fy={560}>
        <Dining t={t} v="evening" food="dinner" />
        <Character t={t} seed={2} x={460} y={860} scale={2.3} hair="mom" outfit={C.mom} dress pose={P.stand} expr="neutral" look={[1, 0]} />
        <Character t={t} seed={16} x={1180} y={860} scale={1.55} hair="nora" outfit={C.nora} dress pose={t > knock - 0.2 ? P.reach : P.stand} facing={-1} expr="happy" mouth="smile" look={[1, 0]} />
        <Character t={t} seed={1} x={1540} y={860} scale={2.3} hair="eli" age={41} facing={-1} pose={P.stand} expr={broken ? 'shock' : 'soft'} mouth={broken ? 'o' : 'smile'} look={[1, 0.3]} />
        {!broken && <g transform={`translate(1110 ${gy}) rotate(${fall * 400})`}><path d="M -26 0 L 26 0 L 22 80 L -22 80 Z" fill="#cfe8f5" opacity={0.75} stroke="#fff" strokeWidth={4} /><rect x={-20} y={30} width={40} height={48} fill="#ff9e6b" opacity={0.75} /></g>}
        {broken && [...Array(10)].map((_, i) => {
          const dt = t - knock - 0.36;
          const a = (i / 10) * Math.PI - Math.PI;
          return <path key={i} d="M 0 0 l 14 -6 l -4 16 z" fill="#dff1fb" transform={`translate(${1110 + Math.cos(a) * dt * 500} ${1010 + Math.sin(a) * dt * 300 + dt * dt * 900}) rotate(${i * 50 + dt * 600})`} />;
        })}
      </Cam>
      {broken && <BigText t={t} t0={knock + 0.36} x={1110} y={880} text="CRASH!" size={80} color="#fff" t1={knock + 1.2} />}
    </Stage>
  );
};

/* I2 — "Nora! Did you do that?" "Nope!" */
export const I2: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  const nope = s('i03');
  return (
    <Stage>
      <Backdrop a="#ffc0d6" b="#c4507a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fy={480}>
        <Character t={t} seed={2} x={540} y={1360} scale={4.6} hair="mom" outfit={C.mom} dress pose={P.point} expr="angry" talking={talk('i02')} mouth="flat" look={[1, 0]} />
        <Character t={t} seed={16} x={1380} y={1240} scale={4.2} hair="nora" outfit={C.nora} dress facing={-1} pose={t > nope ? P.shrug : P.stand} expr={t > nope ? 'smug' : 'neutral'} mouth={t > nope ? 'smirk' : 'flat'} talking={talk('i03')} look={[1, -0.2]} />
      </Cam>
      {t > nope && <Bubble t={t} t0={nope} x={1380} y={180} text="Nope!" size={56} />}
    </Stage>
  );
};

/* I3 — nothing happens. You breathe out. */
export const I3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#c98b7a" b="#3a1d1d" />
      <Cam z={tw(t, 0, d, 1.0, 1.05)} fy={470}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={41} expr={t > 0.8 ? 'closed' : 'worried'} mouth={t > 0.8 ? 'smile' : 'flat'} look={[0, 0]} />
      </Cam>
      {t > 0.9 && <g opacity={tw(t, 0.9, 1.8, 0.8, 0)}><path d={`M 1080 ${700 - (t - 0.9) * 60} q 40 -20 80 0 q 40 20 80 0`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" /></g>}
    </Stage>
  );
};

/* I4 — and then you see it. One gray hair. On a seven-year-old. */
export const I4: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const see = s('i06') - 0.2;
  const grow = tw(t, see, see + 0.9, 0, 1, ease.out);
  return (
    <Stage>
      <Backdrop a="#2b2140" b="#07050c" />
      <Cam z={tw(t, 0, d, 1.0, 1.55, ease.in)} fx={990} fy={400}>
        <Character t={t} seed={16} x={960} y={1500} scale={5.6} hair="nora" outfit={C.nora} dress expr="smug" mouth="smirk" look={[0.4, 0]} />
        <path d={`M 1000 ${362} q ${-30 * grow} ${-50 * grow} ${10 * grow} ${-110 * grow}`} stroke="#e8edf3" strokeWidth={7} fill="none" strokeLinecap="round" />
        {grow > 0.9 && <circle cx={1000} cy={285} r={60 + Math.sin(t * 5) * 6} fill="none" stroke={C.red} strokeWidth={6} opacity={0.8} />}
      </Cam>
    </Stage>
  );
};

/* I5 — end card: question + subscribe */
export const I5: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const sub = s('i08') - 0.2;
  const click = sub + 1.4;
  const pressed = t > click;
  return (
    <Stage>
      <Backdrop a="#1d2550" b="#05070f" />
      <Cam z={tw(t, 0, d, 1.0, 1.05)}>
        <Character t={t} seed={1} x={640} y={900} scale={2.6} hair="eli" age={41} pose={P.pockets} expr="soft" mouth="smile" look={[1, 0]} rim="rgba(255,214,150,0.8)" />
        <Character t={t} seed={16} x={1280} y={900} scale={1.7} hair="nora" outfit={C.nora} dress facing={-1} pose={P.stand} expr="smug" mouth="smirk" look={[1, 0]} grayHair={1} />
        <path d="M 1290 640 q -8 -24 4 -48" stroke="#e8edf3" strokeWidth={4} fill="none" />
      </Cam>
      <BigText t={t} t0={0.3} x={960} y={150} text="Would you spend a year" size={72} color="#fff" />
      <BigText t={t} t0={0.7} x={960} y={250} text="on a kind lie?" size={86} color={C.gold} />
      <Badge t={t} t0={1.6} x={960} y={360} text="tell us in the comments" size={40} icon="✎" />
      {t > sub && (
        <g transform={`translate(960 980) scale(${pop(t, sub, 0.5) * (pressed && t < click + 0.15 ? 0.92 : 1)})`}>
          <rect x={-230} y={-55} width={460} height={110} rx={55} fill={pressed ? '#3a3a3a' : '#ff1f3d'} />
          <text x={0} y={18} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={2}>{pressed ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</text>
        </g>
      )}
      {t > sub + 0.5 && (
        <g transform={`translate(${kf(t, [[sub + 0.5, 1300], [click, 1010]], ease.out)} ${kf(t, [[sub + 0.5, 1150], [click, 1000]], ease.out)})`}>
          <path d="M 0 0 L 0 48 L 12 36 L 22 58 L 30 54 L 20 32 L 36 32 Z" fill="#fff" stroke="#000" strokeWidth={3} />
        </g>
      )}
      <Badge t={t} t0={sub + 0.4} x={1580} y={980} text="PART 2: NORA" size={34} color={C.nora} />
    </Stage>
  );
};
