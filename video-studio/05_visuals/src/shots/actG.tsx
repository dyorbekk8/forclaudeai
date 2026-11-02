import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag } from '../lib/ui';
import { Character, P, walkPose, mixPose } from '../lib/Character';
import { CareRoom, Armchair, Backdrop, Ballroom, Kitchen, PhotoFrame } from '../sets/Sets';
import { C, FONT_HEAD } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { ageAt } from '../lib/ledger';
import { Sepia, MiniPop, Heart } from './common';
import { Grandpa, Stool } from './actE';

const YoungWalt: React.FC<{ t: number; x: number; y?: number; scale?: number; pose?: any; expr?: any; mouth?: any; facing?: 1 | -1; look?: [number, number]; talking?: boolean }> = (p) => (
  <Character t={p.t} seed={12} x={p.x} y={p.y ?? 830} scale={p.scale ?? 2.4} facing={p.facing} hair="sam" outfit="#6b4a33" pose={p.pose ?? P.stand} expr={p.expr ?? 'happy'} mouth={p.mouth ?? 'smile'} look={p.look} talking={p.talking} />
);
const Rosie: React.FC<{ t: number; x: number; y?: number; scale?: number; pose?: any; expr?: any; mouth?: any; facing?: 1 | -1; gray?: number; talking?: boolean; look?: [number, number] }> = (p) => (
  <Character t={p.t} seed={13} x={p.x} y={p.y ?? 830} scale={p.scale ?? 2.4} facing={p.facing} hair="rosie" grayHair={p.gray ?? 0.55} outfit={C.rosie} dress pose={p.pose ?? P.stand} expr={p.expr ?? 'happy'} mouth={p.mouth ?? 'smile'} talking={p.talking} look={p.look} />
);

/* G1 — 41. Eli walks in. */
export const G1: ShotFC = ({ o, d }) => {
  const { t, gt } = useShot(o);
  const walk = tw(t, 0, 2.0, 0, 1, ease.out);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.05)} fx={940}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr="neutral" mouth="none" look={[1, 0]} />
        <Character t={t} seed={1} x={1850 - walk * 600} y={830} scale={2.45} hair="eli" age={ageAt(gt)} facing={-1} pose={walk < 1 ? walkPose(t * 1.2, 0.8) : P.stand} expr="soft" mouth="smile" />
      </Cam>
      <BigText t={t} t0={0.05} x={480} y={240} text="41" size={180} color={C.gold} t1={1.4} />
    </Stage>
  );
};

/* G2 — he looks at your face. Really looks. */
export const G2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const really = s('g03') + 1.3;
  const lean = tw(t, s('g03'), really, 0, 1);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.5, 1.9, ease.soft)} fx={940} fy={420}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr={t > really ? 'shock' : 'squint'} mouth="flat" look={[1, -0.1]} pose={{ ...P.sit, lean: 14 * lean }} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={41} facing={-1} pose={P.sit} expr="worried" mouth="flat" look={[1, 0]} />
      </Cam>
      {t > really && <circle cx={790} cy={330} r={14} fill="#fff" opacity={Math.max(0, 1 - (t - really) * 2)} />}
    </Stage>
  );
};

/* G3 — "You've got her curse." */
export const G3: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#5a4a40" b="#140f0c" />
      <Cam z={tw(t, 0, d, 1.05, 1.15)} fy={430}>
        <Grandpa t={t} x={960} y={1600} scale={6.3} pose={P.stand} expr="neutral" mouth="flat" talking={talk('g04')} look={[0, 0]} />
      </Cam>
      <BigText t={t} t0={0.9} x={960} y={950} text={"\"YOU'VE GOT HER CURSE.\""} size={72} color="#fff" />
    </Stage>
  );
};

/* G4 — Wait. What? */
export const G4: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#ffcf7a" b="#c4532f" />
      <Cam z={tw(t, 0, d, 1.25, 1.0, ease.out)} fy={460}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={41} expr="shock" mouth="open" look={[0, -0.2]} />
      </Cam>
      <BigText t={t} t0={0.25} x={1500} y={300} text="WAIT." size={110} color="#fff" />
      <BigText t={t} t0={0.6} x={1520} y={440} text="WHAT?" size={120} color={C.gold} />
    </Stage>
  );
};

/* G5 — flashback: the wedding. Married at 20, she looked 45. */
export const G5: ShotFC = ({ o, d }) => <Wedding o={o} d={d} close={false} />;
export const G5b: ShotFC = ({ o, d }) => <Wedding o={o} d={d} close />;
const Wedding: React.FC<{ o: number; d: number; close: boolean }> = ({ o, d, close }) => {
  const { t, s, talk } = useShot(o);
  const look45 = s('g07') + 1.8;
  return (
    <Stage>
      <Sepia>
        <Cam z={close ? tw(t, 0, d, 1.55, 1.65) : tw(t, 0, d, 1.0, 1.08)} fx={960} fy={close ? 470 : 520}>
          <Ballroom t={t} arch />
          <YoungWalt t={t} x={820} scale={2.6} expr="happy" mouth="grin" look={[1, 0]} />
          <Rosie t={t} x={1100} scale={2.6} facing={-1} expr="happy" mouth="smile" gray={t > look45 ? 0.75 : 0.5} look={[1, 0]} />
        </Cam>
      </Sepia>
      <Tag t={t} text="1972" icon="♥" color="#f2a0b8" />
      {close && <Badge t={t} t0={s('g07') + 0.4} x={560} y={240} text="WALT · 20" size={42} />}
      {close && <Badge t={t} t0={look45} x={1380} y={240} text="ROSIE · 20 (looks 45)" size={42} color={C.gold} />}
      <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#000" strokeWidth={60} opacity={0.35} />
    </Stage>
  );
};

/* G6 — "You're a great dancer!" (+1) */
export const G6: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const stomp = t > 0.9;
  const sway = Math.sin(t * 4) * 20;
  return (
    <Stage>
      <Sepia>
        <Cam z={1.15} fy={540}>
          <Ballroom t={t} />
          <YoungWalt t={t} x={880 + sway} scale={2.6} pose={P.hug} expr={stomp ? 'shock' : 'happy'} mouth={stomp ? 'o' : 'grin'} />
          <Rosie t={t} x={1040 + sway} scale={2.6} facing={-1} pose={P.hug} expr={stomp ? 'squint' : 'happy'} mouth={stomp ? 'flat' : 'smile'} talking={t > 1.3 && t < 2.2} />
        </Cam>
      </Sepia>
      {stomp && <BigText t={t} t0={0.9} x={1100} y={900} text="*STOMP*" size={64} color="#fff" t1={1.6} />}
      <Bubble t={t} t0={1.3} x={1240} y={270} text={"You're a great dancer!"} size={40} tail="left" />
      <MiniPop t={t} t0={2.0} x={1120} y={420} />
    </Stage>
  );
};

/* G7 — the dog went to live on a farm (+1) */
export const G7: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Sepia>
        <Cam z={1.08}>
          <Kitchen t={t} noTable />
          <Character t={t} seed={14} x={760} y={830} scale={1.6} hair="nora" outfit={C.mom} dress expr="sad" mouth="frown" tears={0.8} look={[1, -0.4]} />
          <g transform="translate(640 830)"><path d="M -50 0 Q -50 -36 0 -36 Q 50 -36 50 0 Z" fill="#c33" /><text x={0} y={-8} textAnchor="middle" fontSize={22} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>MAX</text></g>
          <Rosie t={t} x={1120} scale={2.4} facing={-1} pose={P.point} expr="happy" mouth="grin" talking={t > 0.4 && t < 1.6} />
          {/* farm picture */}
          <g transform="translate(1380 320) rotate(4)">
            <rect x={-140} y={-100} width={280} height={200} rx={8} fill="#fff" />
            <rect x={-126} y={-86} width={252} height={172} fill="#bfe3ff" />
            <rect x={-126} y={20} width={252} height={66} fill="#8cc68a" />
            <path d="M -60 20 L -60 -30 L -20 -60 L 20 -30 L 20 20 Z" fill="#c33" />
            <text x={0} y={140} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>"a farm!"</text>
          </g>
        </Cam>
      </Sepia>
      <MiniPop t={t} t0={1.4} x={1120} y={380} />
    </Stage>
  );
};

/* G8 — every night for fifty years: "Not tired at all!" */
export const G8: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const yrs = Math.round(tw(t, 0.4, d - 0.3, 1974, 2024, ease.in));
  const gray = tw(t, 0.3, d, 0.6, 1);
  return (
    <Stage>
      <Sepia k={tw(t, 0, d, 1, 0.6)}>
        <Cam z={tw(t, 0, d, 1.0, 1.1)}>
          <Kitchen t={t} v="night" noTable />
          <Rosie t={t} x={1000} scale={2.5} facing={-1} pose={P.hold} expr="closed" mouth="smile" gray={gray} />
          <Character t={t} seed={12} x={600} y={830} scale={2.4} hair={t > d * 0.5 ? 'grandpa' : 'sam'} outfit="#6b4a33" pose={P.reach} expr="worried" look={[1, 0]} />
        </Cam>
      </Sepia>
      <Bubble t={t} t0={0.6} x={1060} y={300} text={"Tired? Me? Never."} size={40} />
      <g transform="translate(1600 110)">
        <rect x={-150} y={-50} width={300} height={100} rx={22} fill="rgba(10,12,22,0.85)" />
        <text x={0} y={22} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>{yrs}</text>
      </g>
      {[1.0, 1.6, 2.1, 2.5].map((tt, i) => <MiniPop key={i} t={t} t0={tt} x={1000 + (i % 2) * 60} y={380} />)}
    </Stage>
  );
};

/* G9 — every lie she told was for somebody else */
export const G9: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const morph = tw(t, 1.9, 2.7, 0, 1);
  return (
    <Stage>
      <Backdrop a="#5a3a40" b="#1a0f12" />
      <PhotoFrame x={960} y={260} s={2.2} glow={0.8} />
      {[...Array(14)].map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + t * 0.5;
        const r = 420 + Math.sin(i * 2 + t) * 20;
        const x = 960 + Math.cos(a) * r, y = 520 + Math.sin(a) * r * 0.55;
        return (
          <g key={i} opacity={pop(t, 0.1 + i * 0.05, 0.4)}>
            {morph < 0.5 ? (
              <g transform={`translate(${x} ${y}) scale(${1.5 * (1 - morph * 2)})`}><rect x={-40} y={-16} width={80} height={32} rx={16} fill="#fff" /><text x={0} y={9} textAnchor="middle" fontSize={20} fontWeight={700} fill={C.red} fontFamily={FONT_HEAD}>LIE</text></g>
            ) : (
              <Heart x={x} y={y} s={1.6 * (morph - 0.5) * 2} />
            )}
          </g>
        );
      })}
      <BigText t={t} t0={1.6} x={960} y={985} text="for somebody else." size={70} color="#ffd8e2" />
    </Stage>
  );
};

/* G10 — "She spent her years on us, kiddo. Don't you spend yours on me." */
export const G10: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.45, 1.6, ease.soft)} fx={930} fy={470}>
        <CareRoom t={t} v="sunset" />
        <Armchair x={760} />
        <Grandpa t={t} expr="soft" mouth="smile" talking={talk('g12')} look={[1, 0]} pose={{ ...P.sit, rsh: 70, rel: 10 }} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={41} facing={-1} pose={{ ...P.sit, rsh: 70, rel: 10 }} expr="sad" mouth="flat" look={[1, 0]} tears={tw(t, 1.5, 3, 0, 0.6)} />
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill="#ff9e5a" opacity={0.12} />
    </Stage>
  );
};

/* G11 — "So. Tell me the truth. Is Rosie coming?" (silence after) */
export const G11: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#b8735a" b="#3a1d14" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fy={430}>
        <Grandpa t={t} x={960} y={1600} scale={6.3} pose={P.stand} expr="soft" mouth="smile" talking={talk('g14')} look={[0.2, 0]} />
      </Cam>
    </Stage>
  );
};

/* G12 — "No, Grandpa. She's not." — the truth (no pop) */
export const G12: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#b8735a" b="#2a140e" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fy={460}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={41} expr="sad" mouth="flat" talking={talk('g15')} tears={0.7} look={[-0.3, 0]} rim="rgba(255,200,150,0.7)" />
      </Cam>
      <Badge t={t} t0={s('g15') + 1.1} x={1500} y={960} text="TRUTH  ·  +0" size={44} color={C.mint} icon="✓" />
    </Stage>
  );
};

/* G13 — hand squeeze */
const Hand: React.FC<{ x: number; y: number; rot: number; s?: number; sleeve: string; cuff: string; flip?: boolean }> = ({ x, y, rot, s = 1, sleeve, cuff, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${flip ? -s : s})`}>
    <rect x={-900} y={-70} width={760} height={140} rx={60} fill={sleeve} />
    <rect x={-170} y={-74} width={44} height={148} rx={18} fill={cuff} />
    <path d="M -130 -62 Q -40 -80 40 -56 Q 120 -40 128 0 Q 120 40 40 56 Q -40 80 -130 62 Z" fill={C.ink} stroke="rgba(255,214,150,0.55)" strokeWidth={4} />
    {[-30, 0, 30].map((k) => <path key={k} d={`M 30 ${k} L 118 ${k * 0.6}`} stroke="#3a3a46" strokeWidth={5} strokeLinecap="round" />)}
    <path d="M -60 -60 Q -10 -120 50 -96 Q 70 -86 52 -70 Q 10 -76 -20 -50 Z" fill={C.ink} />
  </g>
);
export const G13: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const sq = t > 0.8 && t < 1.8 ? Math.sin(((t - 0.8) / 1.0) * Math.PI) : 0;
  return (
    <Stage>
      <Backdrop a="#e0a07a" b="#6a3a2a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)}>
        <Hand x={820} y={620} rot={-8} s={1} sleeve={C.hoodie} cuff={C.hoodieShade} />
        <g transform={`translate(0 ${-sq * 10})`}>
          <Hand x={975} y={598} rot={184 - sq * 4} s={1.02} sleeve={C.grandpa} cuff="#f1e2c8" flip />
        </g>
      </Cam>
      <Heart x={960} y={300} s={3 * pop(t, 1.0, 0.5)} op={0.9} />
    </Stage>
  );
};

/* G14 — "Good. Now go live. I'll be fine." */
export const G14: ShotFC = ({ o, d }) => {
  const { t, talk } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#ffc98a" b="#9a4a2a" />
      <Cam z={tw(t, 0, d, 1.0, 1.08, ease.soft)} fy={430}>
        <Grandpa t={t} x={960} y={1600} scale={6.3} pose={P.stand} expr="happy" mouth="grin" talking={talk('g17')} look={[0, 0]} />
      </Cam>
    </Stage>
  );
};

/* G15 — the kindest lie (wide, sunset, pull out, fade) */
export const G15: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.25, 1.0, ease.soft)} fx={960}>
        <CareRoom t={t} v="sunset" />
        <Armchair x={760} />
        <Grandpa t={t} expr="closed" mouth="smile" look={[1, -0.3]} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={41} facing={-1} pose={P.sit} expr="soft" mouth="smile" look={[1, 0]} />
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill="#ff9e5a" opacity={0.16} />
      <BigText t={t} t0={0.6} x={960} y={160} text="the kindest lie." size={84} color="#fff3e0" t1={d - 0.6} />
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={tw(t, d - 0.7, d, 0, 1)} />
    </Stage>
  );
};
