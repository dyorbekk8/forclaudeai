import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag } from '../lib/ui';
import { Character, P, walkPose } from '../lib/Character';
import { CareRoom, Armchair, Backdrop, Stairs, Dining, Kitchen } from '../sets/Sets';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { ageAt } from '../lib/ledger';
import { Notes } from './common';
import { Grandpa, Stool } from './actE';

/* F1 — every Saturday, one lie, one year (calendar flip) */
export const F1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const flips = Math.floor(Math.max(0, t - 0.6) / 0.5);
  const ph = (Math.max(0, t - 0.6) % 0.5) / 0.5;
  const dates = ['SAT 7', 'SAT 14', 'SAT 21', 'SAT 28', 'SAT 4', 'SAT 11', 'SAT 18'];
  return (
    <Stage>
      <Backdrop a="#f2d7b0" b="#b47c55" />
      <g transform="translate(960 520)">
        <rect x={-300} y={-300} width={600} height={620} rx={30} fill="#fff" />
        <rect x={-300} y={-300} width={600} height={140} rx={30} fill={C.red} />
        <rect x={-300} y={-200} width={600} height={40} fill={C.red} />
        <text x={0} y={-205} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={6}>SATURDAY</text>
        <text x={0} y={120} textAnchor="middle" fontSize={190} fontWeight={700} fill={C.ink} fontFamily={FONT_HEAD}>{dates[Math.min(dates.length - 1, flips)].split(' ')[1]}</text>
        {t > 0.6 && flips < dates.length - 1 && (
          <g transform={`translate(0 -160) scale(1 ${1 - ph})`} opacity={1 - ph * 0.6}>
            <rect x={-300} y={0} width={600} height={460} fill="#f7f3ea" />
          </g>
        )}
        {[0, 1, 2].map((i) => <circle key={i} cx={-180 + i * 180} cy={-300} r={18} fill="#9aa3b5" />)}
      </g>
      <BigText t={t} t0={1.4} x={960} y={950} text="ONE LIE. ONE YEAR." size={88} color="#fff" />
    </Stage>
  );
};

/* F2 — 21. He hums her favourite song. */
export const F2: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.3, 1.4)} fx={950} fy={500}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr="closed" mouth="smile" tilt={Math.sin(t * 3) * 6} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={ageAt(gt)} facing={-1} pose={P.sit} expr="soft" mouth="smile" look={[1, 0]} />
        <Notes t={t} x={780} y={400} />
      </Cam>
    </Stage>
  );
};

/* F3 — 25. He combs his hair for her. */
export const F3: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  const comb = Math.sin(t * 7);
  return (
    <Stage>
      <Backdrop a="#ffe9cc" b="#d8a676" />
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fy={520}>
        <Grandpa t={t} x={760} y={1250} scale={4.3} pose={{ ...P.phone, rel: 150 + comb * 10 }} expr="happy" mouth="grin" look={[1, -0.2]} />
        {/* comb */}
        <g transform={`translate(${880 + comb * 14} ${505 + comb * 10}) rotate(-30)`}><rect x={-12} y={-50} width={24} height={100} rx={6} fill="#e66b5b" />{[...Array(8)].map((_, i) => <rect key={i} x={10} y={-44 + i * 12} width={18} height={4} fill="#e66b5b" />)}</g>
        <Character t={t} seed={1} x={1380} y={1250} scale={4.0} hair="eli" age={ageAt(gt)} facing={-1} pose={P.hold} expr="soft" mouth="smile" look={[1, 0]} />
        {/* hand mirror */}
        <g transform="translate(1180 640)"><ellipse cx={0} cy={0} rx={70} ry={90} fill="#c9a24a" /><ellipse cx={0} cy={0} rx={56} ry={74} fill="#d6eef2" /><rect x={-10} y={86} width={20} height={80} rx={8} fill="#c9a24a" /></g>
      </Cam>
    </Stage>
  );
};

/* F4 — 30. Your knees ache on the stairs. */
export const F4: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  const step = tw(t, 0, d, 0, 1.2, ease.lin);
  const x = 520 + step * 150, y = 880 - step * 70;
  return (
    <Stage>
      <Cam z={1.25} fx={x + 100} fy={y - 260}>
        <Stairs t={t} />
        <Character t={t} seed={1} x={x} y={y} scale={2.4} hair="eli" age={ageAt(gt)} pose={{ ...walkPose(t * 0.7, 0.6), rsh: 30, rel: 70, lean: 12 }} expr="worried" mouth="frown" sweat look={[0.3, 0.6]} />
      </Cam>
      {t > 0.7 && <BigText t={t} t0={0.7} x={1350} y={300} text="*creak*" size={70} color="#fff" t1={1.8} />}
    </Stage>
  );
};

/* F5 — 36. Mom finds a gray hair on your hoodie... and it's yours. */
export const F5: ShotFC = ({ o, d }) => {
  const { t, s, gt } = useShot(o);
  const yours = s('f06') - 0.1;
  const pan = tw(t, yours, yours + 0.5, 0, 1, ease.io);
  return (
    <Stage>
      <Cam z={1.35} fx={760 + pan * 640} fy={480}>
        <Kitchen t={t} v="evening" noTable />
        <Character t={t} seed={2} x={700} y={830} scale={2.5} hair="mom" outfit={C.mom} dress pose={P.chin} expr="shock" mouth="o" look={[0.3, -0.3]} />
        {/* the hair, held up */}
        <g transform="translate(790 470)"><path d="M 0 0 q 20 -40 -6 -80 q -24 -40 10 -80" stroke="#e8edf3" strokeWidth={5} fill="none" strokeLinecap="round" /><circle cx={0} cy={-80} r={30} fill="#fff" opacity={0.14} /></g>
        <Character t={t} seed={1} x={1400} y={830} scale={2.5} hair="eli" age={ageAt(gt)} facing={-1} pose={P.stand} expr={pan > 0.5 ? 'worried' : 'neutral'} mouth="flat" look={[1, 0]} />
        {pan > 0.6 && <circle cx={1390} cy={360} r={80 + Math.sin(t * 6) * 6} fill="none" stroke={C.red} strokeWidth={8} opacity={0.9} />}
      </Cam>
    </Stage>
  );
};

/* F6 — Mom: "Eli. What is happening to you?" */
export const F6: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#c98b7a" b="#4a2a2a" />
      <Cam z={tw(t, 0, d, 1.0, 1.1)} fy={460}>
        <Character t={t} seed={2} x={960} y={1560} scale={6.0} hair="mom" outfit={C.mom} dress expr="worried" talking={talk('f07')} mouth="frown" tears={tw(t, 0.6, 1.8, 0, 0.6)} look={[0.3, 0]} />
      </Cam>
    </Stage>
  );
};

/* F7 — the truth would sound like a lie (night window) */
export const F7: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#26304f" b="#0a0e1c" />
      <g transform="translate(1100 160)">
        <rect x={0} y={0} width={620} height={640} rx={10} fill="#0d1433" stroke="#33405f" strokeWidth={18} />
        {[...Array(26)].map((_, i) => {
          const x = (i * 83) % 600 + 10, y0 = (i * 131) % 640;
          const y = (y0 + t * 420) % 640;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34} stroke="#9fb8ff" strokeOpacity={0.45} strokeWidth={3} />;
        })}
        <rect x={302} y={0} width={16} height={640} fill="#33405f" />
      </g>
      <Cam z={tw(t, 0, d, 1.0, 1.08)}>
        <Character t={t} seed={1} x={900} y={980} scale={3.2} hair="eli" age={ageAt(gt)} pose={P.pockets} expr="sad" mouth="flat" look={[1, -0.2]} rim="rgba(150,180,255,0.7)" />
      </Cam>
      <BigText t={t} t0={1.4} x={760} y={170} text="the truth would sound like a lie" size={58} color="#cfd8ff" />
    </Stage>
  );
};
