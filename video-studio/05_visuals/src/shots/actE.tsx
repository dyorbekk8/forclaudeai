import React from 'react';
import { Stage, Cam, Badge, BigText, Bubble, Tag } from '../lib/ui';
import { Character, P, walkPose, Pose } from '../lib/Character';
import { CareRoom, Armchair, PhotoFrame, Backdrop, DataBG, Stairs } from '../sets/Sets';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, kf, ease, pop } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';
import { ageAt } from '../lib/ledger';
import { Polaroid, Notes, Heart } from './common';

/* reusable: Grandpa in his armchair + Eli on a chair */
export const Stool: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = 820, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-118} width={140} height={22} rx={8} fill="#7a4f34" />
    <rect x={-60} y={-260} width={16} height={150} rx={6} fill="#7a4f34" />
    <rect x={-60} y={-96} width={14} height={96} fill="#5a3b28" />
    <rect x={46} y={-96} width={14} height={96} fill="#5a3b28" />
  </g>
);

type GP = { t: number; expr?: any; mouth?: any; talking?: boolean; look?: [number, number]; tears?: number; pose?: Pose; tilt?: number; x?: number; y?: number; scale?: number; facing?: 1 | -1; bob?: number };
export const Grandpa: React.FC<GP> = ({ t, expr = 'soft', mouth = 'smile', talking, look = [0.8, -0.1], tears = 0, pose = P.sit, tilt = 0, x = 700, y = 812, scale = 2.3, facing = 1, bob = 0 }) => (
  <Character t={t} seed={11} x={x} y={y} scale={scale} facing={facing} hair="grandpa" outfit={C.grandpa} cardigan glasses pose={pose} expr={expr} mouth={mouth} talking={talking} look={look} tears={tears} tilt={tilt} bob={bob} pants="#4a4f63" shoe="#6b4a33" />
);

/* E1 — Saturdays you visit Grandpa Walt */
export const E1: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const walk = tw(t, 0, 2.2, 0, 1, ease.out);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.0, 1.06)} fx={900}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} look={[1, 0]} expr="neutral" mouth="none" />
        <Character t={t} seed={1} x={1900 - walk * 600} y={830} scale={2.4} hair="eli" age={ageAt(t + o)} facing={-1} pose={walk < 1 ? walkPose(t * 1.4) : P.wave} expr="happy" mouth="smile" />
      </Cam>
      <Tag t={t} t0={0.3} text="SATURDAY" icon="♥" color={C.red} />
    </Stage>
  );
};

/* E2 — he taught you to ride a bike / cheat at cards */
export const E2: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const p1 = tw(t, 0, 0.5, -700, 0, ease.out);
  const p2t = s('e02') + 1.6;
  const p2 = tw(t, p2t, p2t + 0.5, 900, 0, ease.out);
  return (
    <Stage>
      <Backdrop a="#f6e3c8" b="#c99a6a" />
      <Cam z={tw(t, 0, d, 1, 1.06)}>
        <g transform={`translate(${p1} 0)`}>
          <Polaroid x={620} y={500} rot={-6} s={1.15} caption="first bike!" bg="#bfe3ff">
            <rect x={0} y={250} width={400} height={80} fill="#8cc68a" />
            <Character t={t} x={150} y={300} scale={1.0} hair="none" outfit="#9a6b4f" pose={P.reach} expr="happy" mouth="grin" />
            <g transform="translate(260 300)"><circle cx={-40} cy={-24} r={24} fill="none" stroke="#333" strokeWidth={6} /><circle cx={40} cy={-24} r={24} fill="none" stroke="#333" strokeWidth={6} /><path d="M -40 -24 L 0 -60 L 40 -24 M 0 -60 L -14 -78" stroke={C.red} strokeWidth={7} fill="none" /></g>
            <Character t={t} x={255} y={240} scale={0.7} hair="eli" age={15} pose={P.cheer} expr="happy" mouth="grin" />
          </Polaroid>
        </g>
        <g transform={`translate(${p2} 0)`}>
          <Polaroid x={1320} y={540} rot={5} s={1.15} caption="(he cheated)" bg="#f5d4a8">
            <rect x={0} y={230} width={400} height={100} fill="#3d7a52" />
            <Character t={t} x={120} y={330} scale={1.1} hair="none" outfit="#9a6b4f" pose={P.hold} expr="smug" mouth="smirk" />
            <Character t={t} x={300} y={330} scale={0.85} hair="eli" age={15} facing={-1} pose={P.hold} expr="squint" mouth="flat" />
            <rect x={150} y={160} width={26} height={38} rx={4} fill="#fff" stroke="#c33" strokeWidth={3} transform="rotate(20 163 179)" />
          </Polaroid>
        </g>
      </Cam>
    </Stage>
  );
};

/* E3 — he doesn't always remember your name */
export const E3: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.7, 1.8)} fx={720} fy={430}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr="worried" mouth="flat" look={[1, -0.2]} tilt={kf(t, [[0, 0], [1, -8], [2.5, -4]])} />
      </Cam>
      {[0, 1, 2].map((i) => {
        const k = pop(t, 0.6 + i * 0.3, 0.4);
        return <text key={i} x={1060 + i * 90} y={300 - i * 50} fontSize={110 - i * 15} fontWeight={700} fill="#fff" stroke={C.ink} strokeWidth={8} paintOrder="stroke" fontFamily={FONT_HEAD} opacity={k} transform={`rotate(${(i - 1) * 12} ${1060 + i * 90} ${300 - i * 50})`}>?</text>;
      })}
      <g opacity={tw(t, 1.2, 1.6, 0, 1)}>
        <rect x={1180} y={760} width={420} height={120} rx={20} fill="#fff" transform="rotate(-4 1390 820)" />
        <text x={1390} y={840} textAnchor="middle" fontSize={56} fontWeight={700} fill={C.ink} fontFamily={FONT_HEAD} transform="rotate(-4 1390 820)">Hi, my name is ...?</text>
      </g>
    </Stage>
  );
};

/* E4 / E9 — two-shot: "Is Rosie coming today?" */
const TwoShot: React.FC<{ o: number; d: number; line: string; tag?: string; push?: boolean }> = ({ o, d, line, tag, push }) => {
  const { t, s, e, talk, gt } = useShot(o);
  const asked = t > s(line);
  return (
    <Stage>
      <Cam z={push ? tw(t, s(line), d, 1.0, 1.25, ease.soft) : tw(t, 0, d, 1.0, 1.05)} fx={940} fy={540}>
        <CareRoom t={t} />
        <Armchair x={760} />
        <Grandpa t={t} expr={asked ? 'happy' : 'soft'} mouth="smile" talking={talk(line)} look={[1, -0.3]} tilt={asked ? -6 : 0} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={ageAt(gt)} facing={-1} pose={P.sit} expr={asked ? 'worried' : 'soft'} mouth={asked ? 'flat' : 'smile'} look={[1, 0]} />
      </Cam>
      {asked && <Bubble t={t} t0={s(line) + 0.05} x={720} y={240} text="Is Rosie coming today?" size={44} tail="down" />}
      {tag && <Tag t={t} text={tag} icon="♥" color={C.red} />}
    </Stage>
  );
};
export const E4: ShotFC = ({ o, d }) => <TwoShot o={o} d={d} line="e05" />;
export const E9: ShotFC = ({ o, d }) => <TwoShot o={o} d={d} line="e15" tag="NEXT SATURDAY" push />;

/* E5 — Grandma Rosie died two years ago */
export const E5: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  return (
    <Stage>
      <Backdrop a="#3a2a2a" b="#120c0c" />
      <Cam z={tw(t, 0, d, 1.0, 1.15, ease.soft)} fy={480}>
        <PhotoFrame x={960} y={330} s={2.4} glow={0.9} />
        {/* small flower vase */}
        <g transform="translate(1380 860)"><rect x={-30} y={-80} width={60} height={80} rx={14} fill="#9fd3ff" opacity={0.8} /><path d="M 0 -80 Q -10 -170 -30 -200 M 0 -80 Q 10 -160 30 -190" stroke="#3d8f5a" strokeWidth={6} fill="none" /><circle cx={-30} cy={-205} r={20} fill="#ff8fab" /><circle cx={30} cy={-195} r={18} fill="#ffd25a" /></g>
        <rect x={400} y={860} width={1120} height={40} rx={10} fill="#6b4530" />
      </Cam>
      <Badge t={t} t0={0.6} x={960} y={980} text="Rosie  ·  1952 – 2024" size={36} color="#f1e2c8" />
    </Stage>
  );
};

/* E6 — you tell him the truth; he hears it for the first time */
export const E6: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const hear = s('e08') + 0.6;
  const k = tw(t, hear, hear + 0.8, 0, 1);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.25, 1.4, ease.soft)} fx={940} fy={480}>
        <CareRoom t={t} light={1 - k * 0.6} />
        <Armchair x={760} />
        <Grandpa t={t} expr={k > 0.5 ? 'shock' : 'happy'} mouth={k > 0.5 ? 'o' : 'smile'} look={[1, 0]} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={19} facing={-1} pose={P.reach} expr="sad" mouth="flat" talking={t > 0.2 && t < hear} look={[1, 0]} />
      </Cam>
      <g fill="#000" opacity={k * 0.25}><rect x={0} y={0} width={1920} height={1080} /></g>
    </Stage>
  );
};

/* E7 — he cries like it just happened */
export const E7: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const tear = tw(t, 0.3, 2.0, 0.1, 1);
  return (
    <Stage>
      <Backdrop a="#4a4660" b="#16131f" />
      <Cam z={tw(t, 0, d, 1.0, 1.1, ease.soft)} fy={430}>
        <Grandpa t={t} x={960} y={1600} scale={6.3} pose={P.stand} expr="sad" mouth="frown" tears={tear} look={[0, 0.5]} tilt={-4} />
      </Cam>
    </Stage>
  );
};

/* E8 — dementia: grief that feels brand new */
export const E8: ShotFC = ({ o, d }) => {
  const { t, s } = useShot(o);
  const loopT = s('e12');
  const ang = Math.max(0, t - loopT) * 2.4;
  const gentle = s('e13') + 0.2;
  return (
    <Stage>
      <DataBG t={t + o} />
      <g transform="translate(700 520)">
        <path d="M -150 0 C -190 -120 -50 -190 0 -130 C 50 -190 190 -120 150 0 C 190 95 70 160 0 120 C -70 160 -190 95 -150 0 Z" fill="#ff9fb8" opacity={0.9} />
        <path d="M 0 -130 L 0 120" stroke="#e86b8c" strokeWidth={10} />
        {/* memory loop */}
        <circle cx={0} cy={0} r={250} fill="none" stroke="#4fd8ff" strokeOpacity={0.35} strokeWidth={6} strokeDasharray="14 18" />
        {t > loopT - 0.2 && (
          <g transform={`rotate(${(ang * 180) / Math.PI})`}>
            <circle cx={250} cy={0} r={26} fill={C.cyan} />
            <path d="M 250 -46 l 18 22 l -36 0 z" fill={C.cyan} transform="rotate(90 250 -30)" />
          </g>
        )}
      </g>
      <g transform="translate(1320 360)">
        <Badge t={t} t0={0.4} x={0} y={0} text="dementia" size={40} color="#ff9fb8" />
        <Badge t={t} t0={1.4} x={0} y={110} text="bad news doesn't stay learned" size={34} />
        <Badge t={t} t0={loopT + 0.6} x={0} y={220} text="every time = the first time" size={34} color={C.cyan} />
        
      </g>
      <text x={60} y={1040} fontSize={22} fill="#8fa3c8" opacity={0.8} fontFamily={FONT_BODY} fontWeight={800}>Source: Mental Health Foundation (2016), "What is truth?" — truth and lying in dementia care</text>
    </Stage>
  );
};

/* E10 — the decision: "She's on her way, Grandpa." */
export const E10: ShotFC = ({ o, d }) => {
  const { t, s, talk } = useShot(o);
  const say = s('e16');
  return (
    <Stage>
      <Backdrop a="#6a5a70" b="#1c1622" />
      <Cam z={tw(t, 0, d, 1.0, 1.2, ease.soft)} fy={470}>
        <Character t={t} seed={1} x={960} y={1560} scale={6.2} hair="eli" age={19} expr={t > say ? 'soft' : 'worried'} mouth={t > say + 1.3 ? 'smile' : 'flat'} talking={talk('e16')} look={[-0.4, 0.2]} rim="rgba(255,200,150,0.6)" />
      </Cam>
      {t > say && <Bubble t={t} t0={say + 0.05} x={1450} y={330} text={"She's on her way,\nGrandpa."} size={42} tail="left" />}
    </Stage>
  );
};

/* E11 — POP 20 (soft). He smiles all afternoon. */
export const E11: ShotFC = ({ o, d }) => {
  const { t, s, gt } = useShot(o);
  const sun = tw(t, 1.2, d, 0, 1, ease.soft);
  return (
    <Stage>
      <Cam z={tw(t, 0, d, 1.15, 1.0, ease.soft)} fx={900}>
        <CareRoom t={t} v={sun > 0.5 ? 'sunset' : 'day'} light={1} />
        <Armchair x={760} />
        <Grandpa t={t} expr="happy" mouth="grin" look={[1, -0.4]} />
        <Stool x={1180} />
        <Character t={t} seed={1} x={1180} y={830} scale={2.3} hair="eli" age={ageAt(gt)} facing={-1} pose={P.sit} expr="soft" mouth="smile" look={[1, 0]} />
        <Notes t={t} x={760} y={380} />
      </Cam>
      <rect x={0} y={0} width={1920} height={1080} fill="#ff9e5a" opacity={sun * 0.18} />
    </Stage>
  );
};

/* E8b — truth vs kindness: a balance scale tips toward the gentle answer */
export const E8b: ShotFC = ({ o, d }) => {
  const { t } = useShot(o);
  const tip = tw(t, 0.6, 2.0, 0, 14, ease.io);
  const pan = (side: -1 | 1, label: string, col: string) => {
    const a = (tip * Math.PI) / 180;
    const x = 960 + side * 360 * Math.cos(a), y = 470 + side * 360 * Math.sin(a);
    return (
      <g transform={`translate(${x} ${y + 150})`}>
        <path d="M -120 0 L 0 -150 L 120 0" stroke="#c9b08a" strokeWidth={5} fill="none" />
        <path d="M -150 0 Q 0 90 150 0 Z" fill={col} />
        <text x={0} y={120} textAnchor="middle" fontSize={50} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} stroke="#0b1530" strokeWidth={8} paintOrder="stroke">{label}</text>
      </g>
    );
  };
  return (
    <Stage>
      <DataBG t={t + o} grid={false} />
      <Cam z={tw(t, 0, d, 1.0, 1.06)}>
        <rect x={945} y={330} width={30} height={560} rx={10} fill="#c9b08a" />
        <path d="M 820 900 L 1100 900 L 1040 860 L 880 860 Z" fill="#c9b08a" />
        <g transform={`rotate(${tip} 960 470)`}><rect x={580} y={458} width={760} height={24} rx={12} fill="#e6d2a8" /></g>
        <circle cx={960} cy={470} r={26} fill={C.gold} />
        {pan(-1, 'TRUTH', '#4a7bf0')}
        {pan(1, 'KINDNESS', '#ff6b8a')}
      </Cam>
      <Badge t={t} t0={1.2} x={960} y={1000} text="some caregivers choose a gentle answer" size={38} color={C.mint} icon="♥" />
    </Stage>
  );
};
