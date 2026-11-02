import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag } from '../lib/ui';
import { Character, P, walkPose } from '../lib/Character';
import { Hallway, Classroom, Desk, Dining, Backdrop, Kitchen, KitchenTable, Bathroom, BusDoor } from '../sets/Sets';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { ageAt } from '../lib/ledger';
import { Kid, Phone } from './common';

/* D1 — the lies start slipping out */
export const D1: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const words = ['No.', "I'm fine.", 'Good, thanks!', 'Totally.', 'On my way!', 'Love it!'];
  return (
    <Stage>
      <Backdrop a="#3a2550" b="#120a1f" />
      <Cam z={tw(t, 0, d, 1.0, 1.12)} fy={520}>
        <Character t={t} seed={1} x={960} y={1000} scale={3.4} hair="eli" age={16} pose={P.chin} expr="worried" mouth="flat" look={[0, -0.4]} rim="rgba(255,120,160,0.7)" />
        {words.map((w, i) => {
          const t0 = 0.5 + i * 0.45;
          const k = pop(t, t0, 0.45);
          if (k <= 0) return null;
          const dt = t - t0;
          const a = -2.4 + i * 0.95;
          const r = 260 + dt * 70;
          return (
            <g key={i} transform={`translate(${960 + Math.cos(a) * r} ${420 + Math.sin(a) * r * 0.55 - dt * 20}) scale(${k})`} opacity={Math.max(0, 1 - dt / 4)}>
              <rect x={-w.length * 13 - 26} y={-34} width={w.length * 26 + 52} height={68} rx={34} fill="#fff" />
              <text x={0} y={12} textAnchor="middle" fontSize={36} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>{w}</text>
            </g>
          );
        })}
      </Cam>
      <BigText t={t} t0={s('d01') + 2.3} x={960} y={950} text="REFLEX LIES" size={84} color={C.red} />
    </Stage>
  );
};

/* D2 — cookie jar */
export const D2: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  const no = s('d03');
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.15, 1.3)} fx={1250} fy={520}>
        <Kitchen t={t} v="evening" noTable />
        <Character t={t} seed={2} x={1700} y={830} scale={2.4} facing={-1} hair="mom" outfit={C.mom} dress pose={P.hold} talking={talk('d02')} expr="angry" look={[0.9, 0.2]} />
        <Character t={t} seed={1} x={1150} y={830} scale={2.4} hair="eli" age={16} pose={t > no ? P.shrug : P.stand} expr={t > no ? 'smug' : 'worried'} mouth="flat" talking={talk('d03')} look={[1, 0]} />
        {/* crumbs on chin */}
        {[[1160, 476], [1173, 484], [1150, 488], [1182, 479]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#c98a4b" />)}
        <KitchenTable px={-120} jar="empty" />
      </Cam>
      {t > no && <Bubble t={t} t0={no} x={1080} y={250} text="No." size={50} />}
    </Stage>
  );
};

/* D3 — POP. Seventeen. */
export const D3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const age = ageAt(t + o);
  return (
    <Stage>
      <Backdrop a="#ffb38a" b="#b8465b" />
      <Cam z={tw(t, 0, d, 1.2, 1.1, ease.out)} fy={470}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={age} expr="shock" mouth="o" look={[0, -0.2]} />
        {[[990, 645], [1018, 657], [968, 662], [1004, 672]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#c98a4b" />)}
      </Cam>
      <BigText t={t} t0={0.05} x={1450} y={300} text="17" size={200} color={C.gold} />
    </Stage>
  );
};

/* D4 — bumped in the hallway: "I'm fine." -> 18 */
export const D4: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const bump = 0.7;
  const hit = t > bump;
  const stumble = hit ? Math.exp(-(t - bump) * 4) : 0;
  return (
    <Stage>
      <Cam z={1.05} fy={560}>
        <Hallway t={t} px={-t * 40} />
        <Kid i={0} t={t} x={kf(t, [[0, 1900], [bump, 1150], [2.5, 400]], ease.lin)} y={830} scale={2.9} facing={-1} pose={walkPose(t * 1.7)} expr="angry" height={1.08} />
        <Character t={t} seed={1} x={960 - stumble * 80} y={830} scale={2.5} hair="eli" age={ageAt(t + o)} pose={hit ? P.shrug : walkPose(t * 1.4)} tilt={-stumble * 18} expr={hit ? 'closed' : 'neutral'} mouth={hit ? 'smile' : 'none'} look={[1, 0]} />
      </Cam>
      {hit && <Bubble t={t} t0={s('d05') + 1.6} x={900} y={300} text="I'm fine!" size={46} />}
      {hit && <BigText t={t} t0={bump} x={1150} y={430} text="BUMP" size={70} color="#fff" t1={bump + 0.7} />}
    </Stage>
  );
};

/* D5 — aunt calls: "How are you?" "Good, thanks!" -> 19 */
export const D5: ShotFC = ({ o, d }) => {
  const { t, s, gt } = useShot(o);
  const age = ageAt(gt);
  const how = s('d07') + 0.95, good = s('d07') + 1.7;
  return (
    <Stage>
      <Backdrop a="#e8f0ff" b="#9db6ea" />
      {/* split screen */}
      <g>
        <rect x={0} y={0} width={960} height={1080} fill="#ffd9e8" />
        <Character t={t} seed={9} x={480} y={1150} scale={4.2} hair="mom" outfit="#b06bd6" dress pose={P.phone} expr="happy" mouth="grin" talking={t > how && t < how + 0.7} look={[1, 0]} />
        <rect x={956} y={0} width={8} height={1080} fill="#fff" />
        <g transform={`translate(${tw(t, 0, 0.35, 300, 0, ease.out)} 0)`}>
          <Character t={t} seed={1} x={1440} y={1150} scale={4.2} hair="eli" age={age} facing={-1} pose={P.phone} expr="happy" mouth={t > good + 0.7 ? 'grin' : 'smile'} talking={t > good && t < good + 0.7} look={[1, 0]} />
        </g>
      </g>
      <Bubble t={t} t0={how} t1={d} x={520} y={260} text="How are you?" size={42} />
      <Bubble t={t} t0={good} x={1400} y={260} text="Good, thanks!" size={42} />
      <Tag t={t} text="AUNT LINDA" icon="☎" color={C.mint} />
    </Stage>
  );
};

/* D6 — 19 years old, in tenth grade */
export const D6: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.08)} fx={960}>
        <Classroom t={t} board="Grade 10 – Biology" />
        {[300, 620, 1300, 1620].map((x, i) => (
          <g key={x}><Kid i={i + 2} t={t} x={x} y={830} scale={1.75} facing={x < 960 ? 1 : -1} pose={P.sitTable} expr="shock" look={[x < 960 ? 1 : -1, -0.3]} /><Desk x={x + (x < 960 ? 50 : -50)} s={0.85} /></g>
        ))}
        <Character t={t} seed={1} x={960} y={830} scale={2.35} hair="eli" age={19} pose={P.sitTable} expr="worried" mouth="flat" sweat look={[0, 0]} />
        <Desk x={960} s={1.0} />
      </Cam>
      <Tag t={t} text="10TH GRADE" icon="✎" />
    </Stage>
  );
};

/* D7 — shaving */
export const D7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={1.05}>
        <Bathroom t={t} />
        {/* reflection */}
        <g opacity={0.92}>
          <Character t={t} seed={1} x={960} y={1180} scale={3.4} hair="eli" age={19} pose={P.phone} expr="squint" look={[0, 0]} />
          <g transform={`translate(${1060 + Math.sin(t * 22) * 6} ${660 + Math.sin(t * 7) * 14}) rotate(-25)`}>
            <rect x={-22} y={-60} width={44} height={110} rx={20} fill="#2b2f3a" /><rect x={-26} y={-74} width={52} height={22} rx={8} fill="#9aa3b5" />
          </g>
          {[[920, 640], [950, 652], [985, 648], [1010, 632], [935, 668], [970, 676], [1000, 664], [960, 690]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill="#fff" opacity={0.97} />)}
        </g>
      </Cam>
      <Badge t={t} t0={0.25} x={960} y={970} text="every. single. morning." size={40} />
    </Stage>
  );
};

/* D8 — bus driver asks for ID */
export const D8: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <BusDoor t={t} />
        <Character t={t} seed={8} x={1000} y={600} scale={1.6} hair="none" outfit="#2f4f7f" pose={P.reach} expr="squint" mouth="flat" facing={-1} look={[1, 0.2]} />
        <Character t={t} seed={1} x={520} y={870} scale={2.5} hair="eli" age={19} pose={P.stand} expr="worried" sweat look={[1, -0.3]} />
      </Cam>
      <Bubble t={t} t0={0.25} x={1100} y={260} text="I.D., please." size={44} tail="left" />
    </Stage>
  );
};

/* D9 — breakfast, mom keeps staring: "Honey... are you okay?" */
export const D9: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  const close = s('d12') - 0.15;
  const cu = t > close;
  return (
    <Stage>
      <Cam z={cu ? tw(t, close, d, 1.55, 1.62) : tw(t, 0, close, 1.0, 1.06)} fx={cu ? 600 : 960} fy={cu ? 460 : 560}>
        <Dining t={t} v="morning" food="breakfast" />
        <Character t={t} seed={2} x={560} y={860} scale={2.4} hair="mom" outfit={C.mom} dress pose={P.chin} expr={cu ? 'worried' : 'squint'} talking={talk('d12')} mouth="flat" look={[1, 0]} />
        <Character t={t} seed={1} x={1360} y={860} scale={2.4} hair="eli" age={19} facing={-1} pose={P.hold} expr="worried" mouth="flat" look={[0.2, 0.7]} />
      </Cam>
      {cu && <Bubble t={t} t0={close + 0.15} x={760} y={260} text={'Honey...\nare you okay?'} size={40} tail="left" />}
    </Stage>
  );
};

/* D10 — you can't say "I'm fine" */
export const D10: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const xk = pop(t, s('d13') + 1.6, 0.4);
  const fade = tw(t, d - 0.6, d, 1, 0);
  return (
    <Stage>
      <g opacity={fade}>
        <Backdrop a="#2a2f45" b="#0b0e18" />
        <Cam z={tw(t, 0, d, 1.0, 1.18)} fx={700} fy={480}>
          <Character t={t} seed={1} x={700} y={1500} scale={5.6} hair="eli" age={19} expr="sad" mouth="flat" look={[0.4, 0.5]} rim="rgba(140,170,255,0.6)" />
        </Cam>
        <g transform="translate(1380 500)">
          <text x={0} y={30} textAnchor="middle" fontSize={120} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} opacity={tw(t, 0.4, 0.8, 0, 1)}>"I'M FINE"</text>
          <g transform={`scale(${xk})`}><path d="M -300 -90 L 300 110 M 300 -90 L -300 110" stroke={C.red} strokeWidth={26} strokeLinecap="round" /></g>
        </g>
      </g>
    </Stage>
  );
};
