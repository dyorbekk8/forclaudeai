import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {Chip, CountUp, DateStamp, Hand, Label, RedStamp} from '../components/ui';
import {BULLETS, BulletKind, Cartridge, Plate, Stick, Vest} from './assets';

export const STEPS = [
  {short: 'IIA', name: 'LEVEL IIA', kind: 'vest', shade: 0},
  {short: 'II', name: 'LEVEL II', kind: 'vest', shade: 1},
  {short: 'IIIA', name: 'LEVEL IIIA', kind: 'vest', shade: 2},
  {short: 'CLAY', name: 'THE 44 MM RULE', kind: 'clay', shade: 0},
  {short: 'III', name: 'LEVEL III', kind: 'plate', shade: 0},
  {short: 'III+', name: 'LEVEL III+', kind: 'plus', shade: 0},
  {short: 'RF2', name: 'RF2', kind: 'plate', shade: 1},
  {short: 'IV', name: 'LEVEL IV', kind: 'plate', shade: 2},
] as const;

const at = (ev: number[] | undefined, i: number, fallback = 0) => (ev && ev[i] !== undefined ? ev[i] : fallback);

/** Persistent HUD: title banner, step counter, bottom ladder tracker. */
export const HUD: React.FC<{step: number}> = ({step}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 40, top: 30, background: '#3E4A2F', color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '8px 18px', borderRadius: 4}}>
        HOW BODY ARMOR LEVELS ACTUALLY WORK
      </div>
      {step >= 0 && (
        <div style={{position: 'absolute', right: 40, top: 30, background: C.ink, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, padding: '8px 18px', borderRadius: 4}}>
          STEP {String(step + 1).padStart(2, '0')} / {STEPS.length}
        </div>
      )}
      <div style={{position: 'absolute', left: 40, bottom: 26, display: 'flex', alignItems: 'flex-end', gap: 6}}>
        {STEPS.map((s, i) => {
          const on = i === step;
          const done = step >= 0 && i < step;
          return (
            <div key={s.short} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <div style={{width: 62, height: 10 + i * 6, background: on ? C.red : done ? C.ink : '#D9D5CA', borderRadius: 2, transform: on ? `scaleY(${1 + 0.06 * Math.sin(f / 6)})` : 'none', transformOrigin: 'bottom'}} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 16, color: on ? C.red : done ? C.ink : C.inkFaint}}>{s.short}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const StepIcon: React.FC<{i: number; size: number}> = ({i, size}) => {
  const s = STEPS[i];
  if (s.kind === 'vest') return <Vest size={size} shade={s.shade} />;
  if (s.kind === 'plate') return <Plate size={size * 0.9} material={s.shade === 2 ? 'ceramic' : s.shade === 1 ? 'pe' : 'steel'} />;
  if (s.kind === 'clay')
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x="10" y="30" width="80" height="55" rx="4" fill="#B98B5E" />
        <path d="M 40 30 Q 50 50 60 30" fill="#8E6640" />
        <text x="50" y="72" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize="16" fill="#3B2A1A">44mm</text>
      </svg>
    );
  return (
    <div style={{width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `5px dashed ${C.red}`, borderRadius: 12}}>
      <Hand size={size * 0.7}>?</Hand>
    </div>
  );
};

/** The staircase canvas; camera flies to `focus`. focus=-1 shows the whole ladder. */
export const Ladder: React.FC<{focus: number; from?: number; ev?: number[]; outro?: boolean}> = ({focus, from, ev, outro}) => {
  const f = useCurrentFrame();
  const SW = 420;
  const SH = 120;
  const X0 = 200;
  const Y0 = 1700;
  const pos = (i: number) => ({x: X0 + i * SW, y: Y0 - i * SH});
  const W = X0 * 2 + STEPS.length * SW;
  const camOf = (i: number) => (i < 0 ? {x: W / 2, y: Y0 - 4 * SH - 150, s: 1920 / (W + 200)} : {x: pos(i).x + SW / 2, y: pos(i).y - 220, s: 1.05});
  const a = camOf(from ?? focus);
  const b = camOf(focus);
  const t = prog(f, 0, 26, easeInOut);
  const cx = a.x + (b.x - a.x) * t;
  const cy = a.y + (b.y - a.y) * t;
  const s = a.s + (b.s - a.s) * t;
  const land = focus >= 0 ? pop(f, 20, 10) : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 2000, transformOrigin: '0 0', transform: `translate(${960 - cx * s}px, ${560 - cy * s}px) scale(${s})`}}>
        {STEPS.map((st, i) => {
          const p = pos(i);
          const active = i === focus;
          const done = outro || (focus >= 0 && i < focus) || focus < 0;
          return (
            <div key={st.short}>
              <div style={{position: 'absolute', left: p.x, top: p.y, width: SW, height: 2000 - p.y, background: active ? '#FFFFFF' : '#EFECE3', borderTop: `8px solid ${active ? C.red : C.ink}`, borderLeft: `3px solid ${C.tileBorder}`}} />
              <div style={{position: 'absolute', left: p.x + 20, top: p.y + 24, fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: active ? C.red : C.inkFaint}}>STEP {i + 1}</div>
              <div style={{position: 'absolute', left: p.x + 20, top: p.y + 64, width: SW - 40}}>
                <Label size={56} color={active ? C.ink : C.inkSoft}>
                  {st.name}
                </Label>
              </div>
              {(done || active) && (
                <div style={{position: 'absolute', left: p.x + SW / 2 - 110, top: p.y - 300, transform: active ? `translateY(${(1 - land) * -200}px)` : 'none', opacity: active ? Math.min(1, land * 2) : 0.9}}>
                  <StepIcon i={i} size={220} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {focus >= 0 && !outro && (
        <div style={{position: 'absolute', right: 120, top: 200, opacity: prog(f, 22, 10)}}>
          <Label size={120} color={C.red}>
            {STEPS[focus].short}
          </Label>
        </div>
      )}
    </AbsoluteFill>
  );
};

type Line = {t: string; red?: boolean; size?: number; hand?: boolean};
/** Narration-mirroring headline slide: each line enters on its event frame. */
export const TextSlide: React.FC<{lines: Line[]; ev?: number[]; kicker?: string; side?: React.ReactNode}> = ({lines, ev, kicker, side}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80, padding: '0 140px'}}>
      {side && <div style={{transform: `scale(${pop(f, 0, 12)})`}}>{side}</div>}
      <div style={{maxWidth: side ? 1000 : 1600, textAlign: side ? 'left' : 'center'}}>
        {kicker && (
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: C.red, letterSpacing: 4, marginBottom: 18, opacity: prog(f, 0, 8)}}>{kicker}</div>
        )}
        {lines.map((l, i) => {
          const s = at(ev, i, i * 10);
          const p = prog(f, s, 10);
          return (
            <div key={i} style={{overflow: 'hidden', marginBottom: 6}}>
              {l.hand ? (
                <Hand size={l.size ?? 80} color={l.red ? C.red : C.ink} style={{opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
                  {l.t}
                </Hand>
              ) : (
                <Label size={l.size ?? 110} color={l.red ? C.red : C.ink} style={{transform: `translateY(${(1 - p) * 105}%)`, lineHeight: 1.08}}>
                  {l.t}
                </Label>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Object left, title right, labelled facts appearing on events. */
export const ArmorCard: React.FC<{kind: 'vest' | 'plate'; shade?: number; material?: 'ceramic' | 'steel' | 'pe'; title: string; kicker: string; facts: string[]; ev?: number[]; label?: string}> = ({
  kind,
  shade = 0,
  material = 'ceramic',
  title,
  kicker,
  facts,
  ev,
  label,
}) => {
  const f = useCurrentFrame();
  const sp = pop(f, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 230, top: 170, transform: `scale(${0.8 + 0.2 * sp}) rotate(${(1 - sp) * -6}deg)`, transformOrigin: '50% 50%'}}>
        {kind === 'vest' ? <Vest size={560} shade={shade} label={label} /> : <Plate size={520} material={material} label={label} />}
      </div>
      <div style={{position: 'absolute', left: 1000, top: 0, bottom: 0, width: 820, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: C.red, letterSpacing: 4, opacity: prog(f, 4, 8)}}>{kicker}</div>
        <div style={{overflow: 'hidden'}}>
          <Label size={150} style={{transform: `translateY(${(1 - prog(f, 4, 12)) * 105}%)`}}>
            {title}
          </Label>
        </div>
        <div style={{height: 8, width: 260 * prog(f, 10, 14), background: C.red, margin: '14px 0 30px', borderRadius: 4}} />
        {facts.map((t, i) => {
          const p = prog(f, at(ev, i, 18 + i * 14), 10);
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{width: 18, height: 18, background: i === facts.length - 1 ? C.red : C.ink, borderRadius: 3}} />
              <Label size={60} weight={700} color={i === facts.length - 1 ? C.red : C.ink}>
                {t}
              </Label>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Bullet flies into armor; stops (with stamp) or passes. */
export const BulletTest: React.FC<{armor: 'vest' | 'plate'; shade?: number; material?: 'ceramic' | 'steel' | 'pe'; bullet: BulletKind; fps?: number; result?: 'stop' | 'pass'; ev?: number[]; caption?: string}> = ({
  armor,
  shade = 0,
  material = 'ceramic',
  bullet,
  fps,
  result = 'stop',
  ev,
  caption,
}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const T = at(ev, 0, Math.round(d * 0.35));
  const fly = interpolate(f, [T - 14, T], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const AX = 1180;
  const bx = 120 + (AX - 160 - 120) * fly + (result === 'pass' && f > T ? (f - T) * 60 : 0);
  const hit = f >= T;
  const shake = hit && f < T + 8 ? Math.sin(f * 4) * (8 - (f - T)) : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: AX + shake, top: 190}}>
        {armor === 'vest' ? <Vest size={480} shade={shade} dents={hit && result === 'stop' ? [{x: 100, y: 120}] : []} /> : <Plate size={440} material={material} hits={hit && result === 'stop' ? [{x: 100, y: 125}] : []} />}
      </div>
      <div style={{position: 'absolute', left: bx, top: 440, opacity: result === 'stop' && hit ? 0 : 1}}>
        <Cartridge kind={bullet} k={7} projectileOnly />
      </div>
      {f < T && (
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {Array.from({length: 5}).map((_, i) => (
            <line key={i} x1={bx - 40 - i * 60} x2={bx - 10 - i * 60} y1={470 + (i % 2) * 14 - 7} y2={470 + (i % 2) * 14 - 7} stroke={C.inkFaint} strokeWidth={4} opacity={fly * (1 - i * 0.18)} />
          ))}
        </svg>
      )}
      {hit && <div style={{position: 'absolute', left: AX + 180, top: 420, width: 140, height: 140, borderRadius: 70, border: `6px solid #fff`, opacity: Math.max(0, 1 - (f - T) / 10), transform: `scale(${1 + (f - T) / 6})`}} />}
      <div style={{position: 'absolute', left: 130, top: 230}}>
        <div style={{transform: `scale(${pop(f, 0, 12)})`, transformOrigin: 'left'}}>
          <Cartridge kind={bullet} k={5} />
        </div>
        <Label size={70} style={{marginTop: 14}}>
          {BULLETS[bullet].label}
        </Label>
        {fps && (
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 64, color: C.red, marginTop: 10}}>
            <CountUp to={fps} f={f} start={4} len={Math.max(8, T - 8)} suffix=" ft/s" />
          </div>
        )}
        {caption && <Hand size={52} color={C.inkSoft} style={{marginTop: 10}}>{caption}</Hand>}
      </div>
      {hit && (
        <div style={{position: 'absolute', left: AX - 40, top: 760}}>
          <RedStamp text={result === 'stop' ? 'STOPPED' : 'GOES THROUGH'} f={f} delay={T + 4} size={86} rotate={-8} color={result === 'stop' ? '#2E7D4F' : C.red} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const SpeedBars: React.FC<{rows: {bullet: BulletKind; fps: number; note?: string}[]; ev?: number[]; verdict?: string}> = ({rows, ev, verdict}) => {
  const f = useCurrentFrame();
  const max = Math.max(...rows.map((r) => r.fps));
  return (
    <AbsoluteFill style={{padding: '0 200px', justifyContent: 'center'}}>
      {rows.map((r, i) => {
        const s = at(ev, i, i * 16);
        const p = prog(f, s, 20, easeInOut);
        return (
          <div key={r.bullet} style={{marginBottom: 60, opacity: prog(f, s, 6)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 14}}>
              <Cartridge kind={r.bullet} k={4} />
              <Label size={58}>{BULLETS[r.bullet].label}</Label>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
              <div style={{height: 70, width: 1150 * (r.fps / max) * p, background: i === rows.length - 1 ? C.red : C.ink, borderRadius: 6}} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 56, color: C.ink}}>
                <CountUp to={r.fps} f={f} start={s} len={20} suffix=" ft/s" />
              </div>
            </div>
          </div>
        );
      })}
      {verdict && (
        <div style={{opacity: prog(f, at(ev, rows.length, 60), 10)}}>
          <Hand size={70}>{verdict}</Hand>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Old level name flips to its new name. */
export const Rename: React.FC<{old: string; neu: string; sub: string; ev?: number[]; gone?: boolean}> = ({old, neu, sub, ev, gone}) => {
  const f = useCurrentFrame();
  const T = at(ev, 0, 14);
  const flip = prog(f, T, 12, easeInOut);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 80}}>
        <div style={{padding: '40px 70px', border: `6px solid ${C.ink}`, borderRadius: 16, background: '#fff', transform: `scale(${pop(f, 0, 12)})`, position: 'relative'}}>
          <div style={{fontFamily: fonts.mono, fontSize: 32, color: C.inkFaint, fontWeight: 700}}>OLD NAME</div>
          <Label size={200}>{old}</Label>
          {gone && f >= T && (
            <div style={{position: 'absolute', left: -20, top: 80}}>
              <RedStamp text="DROPPED" f={f} delay={T} size={110} rotate={-14} />
            </div>
          )}
        </div>
        {!gone && (
          <>
            <svg width={160} height={80} style={{opacity: flip}}>
              <path d="M 0 40 L 130 40 M 100 10 L 140 40 L 100 70" stroke={C.red} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{padding: '40px 70px', border: `6px solid ${C.red}`, borderRadius: 16, background: '#fff', transform: `rotateY(${(1 - flip) * 90}deg)`, opacity: flip}}>
              <div style={{fontFamily: fonts.mono, fontSize: 32, color: C.red, fontWeight: 700}}>NEW NAME</div>
              <Label size={200} color={C.red}>
                {neu}
              </Label>
            </div>
          </>
        )}
      </div>
      <div style={{marginTop: 60, opacity: prog(f, at(ev, 1, T + 16), 10)}}>
        <Chip size={48}>{sub}</Chip>
      </div>
    </AbsoluteFill>
  );
};

/** Richard Davis 1972: date card + kneeling figure, shot flash, stands up; phase 2 counter. */
export const Davis: React.FC<{phase: 0 | 1 | 2; ev?: number[]}> = ({phase, ev}) => {
  const f = useCurrentFrame();
  const shot = at(ev, 0, 40);
  const flash = phase === 0 && f >= shot ? Math.max(0, 1 - (f - shot) / 8) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.8}} />
      <div style={{position: 'absolute', left: 260, top: 230, transform: `scale(${pop(f, 0, 12)})`}}>
        <Stick size={560} pose={phase === 0 ? 'kneel' : 'shoot'} />
        {phase >= 1 && (
          <svg width={500} height={200} style={{position: 'absolute', left: 300, top: 140}}>
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={prog(f, at(ev, 0, 10) + i * 8, 4)}>
                <rect x={300 + i * 60} y={40} width={30} height={90} rx={12} fill="#fff" stroke={C.ink} strokeWidth={5} />
              </g>
            ))}
          </svg>
        )}
      </div>
      <div style={{position: 'absolute', left: 1050, top: 0, bottom: 0, width: 800, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        {phase === 0 && (
          <>
            <DateStamp date="1972" place="WALLED LAKE, MICHIGAN" f={f} delay={2} big />
            <Label size={84} style={{marginTop: 30, opacity: prog(f, at(ev, 1, 30), 10)}}>
              A PIZZA SHOP OWNER
            </Label>
            <Label size={84} color={C.red} style={{marginTop: 10, opacity: prog(f, shot, 6)}}>
              SHOT HIMSELF
            </Label>
          </>
        )}
        {phase === 1 && (
          <>
            <Label size={90}>WEARING HIS OWN VEST</Label>
            <Label size={90} color={C.red} style={{marginTop: 14, opacity: prog(f, at(ev, 0, 30), 10)}}>
              STOOD UP. KEPT SHOOTING.
            </Label>
          </>
        )}
        {phase === 2 && (
          <>
            <Label size={70} color={C.inkSoft}>
              HE REPEATED IT
            </Label>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 230, color: C.red, lineHeight: 1}}>
              <CountUp to={190} f={f} start={4} len={30} suffix="+" />
            </div>
            <Label size={70}>TIMES</Label>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Side view: armor slab + clay block; bullet hits, armor bends, dent depth vs the 44 mm line. */
export const Clay: React.FC<{mode: 'intro' | 'hit' | 'fail'; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  const T = mode === 'intro' ? 9999 : at(ev, 0, 18);
  const dentMax = mode === 'fail' ? 190 : 140;
  const dent = interpolate(f, [T, T + 8], [0, dentMax], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const X = 760;
  const LIMIT = 165;
  const bulletX = interpolate(f, [T - 12, T], [80, X - 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={X + 40} y={260} width={760} height={560} rx={10} fill="#B98B5E" opacity={prog(f, at(ev, mode === 'intro' ? 0 : 9, 0), 10)} />
        <path d={`M ${X + 40} ${540 - 120} Q ${X + 40 + dent} 540 ${X + 40} ${540 + 120} Z`} fill="#8E6640" />
        <path d={`M ${X} 220 L ${X + 40} 220 L ${X + 40} ${540 - 140} Q ${X + 40 + dent * 0.95} 540 ${X + 40} ${540 + 140} L ${X + 40} 860 L ${X} 860 L ${X} ${540 + 140} Q ${X + dent * 0.95} 540 ${X} ${540 - 140} Z`} fill="#3F4A55" />
        <line x1={X + 40 + LIMIT} x2={X + 40 + LIMIT} y1={240} y2={840} stroke={C.red} strokeWidth={6} strokeDasharray="18 12" opacity={mode === 'intro' ? prog(f, at(ev, 1, 30), 10) : 1} />
        {f < T && <rect x={bulletX} y={525} width={70} height={30} rx={14} fill="#C8743C" />}
      </svg>
      <div style={{position: 'absolute', left: X + 40 + LIMIT + 20, top: 210, opacity: mode === 'intro' ? prog(f, at(ev, 1, 30), 10) : 1}}>
        <Label size={60} color={C.red}>44 MM LIMIT</Label>
        <div style={{fontFamily: fonts.mono, fontSize: 30, color: C.inkSoft}}>≈ 1.73 in</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 260, width: 560}}>
        <Label size={64}>{mode === 'intro' ? 'ARMOR + CLAY' : 'DENT DEPTH'}</Label>
        {mode !== 'intro' && (
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 110, color: dent > LIMIT ? C.red : C.ink}}>
            {Math.round((dent / LIMIT) * 44)} mm
          </div>
        )}
      </div>
      {mode === 'fail' && f > T + 10 && (
        <div style={{position: 'absolute', left: 160, bottom: 170}}>
          <RedStamp text="FAIL" f={f} delay={T + 10} size={130} rotate={-10} />
        </div>
      )}
      {mode === 'fail' && (
        <div style={{position: 'absolute', left: 160, bottom: 110, opacity: prog(f, at(ev, 1, T + 30), 10)}}>
          <Hand size={56}>even though nothing got through</Hand>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Materials: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const mats: ['ceramic' | 'steel' | 'pe', string][] = [
    ['ceramic', 'CERAMIC'],
    ['steel', 'STEEL'],
    ['pe', 'POLYETHYLENE'],
  ];
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 90}}>
      {mats.map(([m, l], i) => {
        const p = pop(f, at(ev, i, i * 8), 12);
        return (
          <div key={m} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - Math.min(1, p)) * 80}px)`, opacity: Math.min(1, p)}}>
            <Plate size={330} material={m} />
            <Label size={60} style={{marginTop: 20}}>
              {l}
            </Label>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Plate takes six hits, counter top-right. */
export const SixShots: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const spots = [
    {x: 70, y: 80},
    {x: 130, y: 90},
    {x: 100, y: 130},
    {x: 60, y: 170},
    {x: 140, y: 175},
    {x: 100, y: 205},
  ];
  const step = Math.max(5, Math.floor((d * 0.75) / 6));
  const n = Math.min(6, Math.floor(f / step) + (f > 2 ? 1 : 0));
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
      <div style={{transform: `translateX(${n > 0 && f % step < 3 ? 6 : 0}px)`}}>
        <Plate size={460} material="ceramic" hits={spots.slice(0, n)} />
      </div>
      <div>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 260, color: C.red, lineHeight: 1}}>{n}/6</div>
        <Label size={80}>HITS STOPPED</Label>
      </div>
    </AbsoluteFill>
  );
};

/** Generic "web listing" cards all claiming LEVEL III+, then NOT OFFICIAL stamp. */
export const NotExist: React.FC<{ev?: number[]; showStamp?: boolean}> = ({ev, showStamp}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50}}>
      {[0, 1, 2].map((i) => {
        const p = pop(f, at(ev, 0, 0) + i * 6, 12);
        return (
          <div key={i} style={{width: 440, height: 600, background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 16, padding: 30, transform: `scale(${0.85 + 0.15 * Math.min(1, p)}) rotate(${(i - 1) * 2}deg)`, opacity: Math.min(1, p), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Plate size={220} material={(['ceramic', 'pe', 'steel'] as const)[i]} />
            <div style={{marginTop: 20, background: C.ink, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 56, padding: '6px 22px', borderRadius: 6}}>LEVEL III+</div>
            <div style={{width: '80%', height: 14, background: '#E6E3DC', borderRadius: 7, marginTop: 22}} />
            <div style={{width: '60%', height: 14, background: '#E6E3DC', borderRadius: 7, marginTop: 12}} />
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 40, color: C.red, marginTop: 18}}>{['$$', '$$$', '$$'][i]}</div>
          </div>
        );
      })}
      {showStamp && (
        <div style={{position: 'absolute', top: 400}}>
          <RedStamp text="NOT AN OFFICIAL LEVEL" f={f} delay={at(ev, 1, 30)} size={110} rotate={-8} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Full old → new mapping table; rows appear on events. */
export const RenameTable: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const rows: [string, string, boolean?][] = [
    ['IIA', 'GONE', true],
    ['II', 'HG1'],
    ['IIIA', 'HG2'],
    ['III', 'RF1'],
    ['III+', 'RF2'],
    ['IV', 'RF3'],
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: '560px 160px 360px', rowGap: 10, alignItems: 'center', marginTop: 20}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.inkFaint, letterSpacing: 3}}>OLD</div>
        <div />
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.red, letterSpacing: 3}}>NEW</div>
        {rows.map(([o, n, gone], i) => {
          const p = prog(f, at(ev, i, i * 14), 10);
          return (
            <React.Fragment key={o}>
              <div style={{opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
                <Label size={92} color={C.inkSoft} style={{whiteSpace: 'nowrap'}}>
                  LEVEL {o}
                </Label>
              </div>
              <div style={{opacity: p, fontFamily: fonts.label, fontWeight: 800, fontSize: 90, color: C.inkFaint, textAlign: 'center'}}>→</div>
              <div style={{opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <Label size={100} color={gone ? C.inkFaint : C.red} style={{textDecoration: gone ? 'line-through' : 'none'}}>
                  {n}
                </Label>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
