import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {Chip, CountUp, DateStamp, Hand, Label, RedStamp} from '../components/ui';
import {Stick} from '../armor/assets';

const at = (ev: number[] | undefined, i: number, fb = 0) => (ev && ev[i] !== undefined ? ev[i] : fb);

export const STEPS = [
  {short: 'SCORE', name: 'THE SCORE'},
  {short: 'MIN', name: 'MINIMUM'},
  {short: 'LOW', name: 'LOW'},
  {short: 'MED', name: 'MEDIUM'},
  {short: 'HIGH', name: 'HIGH'},
  {short: 'ADMIN', name: 'ADMINISTRATIVE'},
  {short: 'ADX', name: 'ADX FLORENCE'},
];

export const HUD: React.FC<{step: number}> = ({step}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 40, top: 30, background: '#2B2F36', color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '8px 18px', borderRadius: 4}}>
        HOW PRISON SECURITY LEVELS ACTUALLY WORK
      </div>
      {step >= 0 && (
        <div style={{position: 'absolute', right: 40, top: 30, background: C.red, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, padding: '8px 18px', borderRadius: 4}}>
          STEP {String(step + 1).padStart(2, '0')} / {STEPS.length}
        </div>
      )}
      <div style={{position: 'absolute', left: 40, bottom: 26, display: 'flex', alignItems: 'flex-end', gap: 6}}>
        {STEPS.map((s, i) => {
          const on = i === step;
          const done = step >= 0 && i < step;
          return (
            <div key={s.short} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <div style={{width: 70, height: 10 + i * 7, background: on ? C.red : done ? C.ink : '#D9D5CA', borderRadius: 2, transform: on ? `scaleY(${1 + 0.06 * Math.sin(f / 6)})` : 'none', transformOrigin: 'bottom'}} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 15, color: on ? C.red : done ? C.ink : C.inkFaint}}>{s.short}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ assets */

/** Side elevation of a prison perimeter. kind: camp | low | medium | high | adx */
export const Perimeter: React.FC<{kind: string; w?: number; reveal?: number}> = ({kind, w = 1500, reveal = 1}) => {
  const H = 520;
  const ground = 440;
  const fence = (x: number, h: number, key: string) => (
    <g key={key} opacity={reveal}>
      <rect x={x} y={ground - h} width={w - 2 * (x - 0)} height={h} fill="url(#chain)" />
      {Array.from({length: Math.floor((w - 2 * x) / 90) + 1}).map((_, i) => (
        <line key={i} x1={x + i * 90} x2={x + i * 90} y1={ground - h - 6} y2={ground} stroke="#5A6068" strokeWidth={5} />
      ))}
      <line x1={x} x2={w - x} y1={ground - h} y2={ground - h} stroke="#5A6068" strokeWidth={4} />
      {Array.from({length: Math.floor((w - 2 * x) / 26)}).map((_, i) => (
        <circle key={`c${i}`} cx={x + 13 + i * 26} cy={ground - h - 12} r={12} fill="none" stroke="#7D838B" strokeWidth={3} />
      ))}
    </g>
  );
  return (
    <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`}>
      <defs>
        <pattern id="chain" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="18" height="18" fill="none" />
          <path d="M 0 0 L 0 18 M 0 0 L 18 0" stroke="#8A9099" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x={0} y={ground} width={w} height={H - ground} fill="#D8D2C2" />
      {/* main building */}
      <rect x={w / 2 - 260} y={ground - 200} width={520} height={200} fill={kind === 'adx' ? '#9C9A93' : '#C9C3B5'} stroke="#6B675E" strokeWidth={4} />
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x={w / 2 - 230 + i * 60} y={ground - 160} width={kind === 'camp' || kind === 'low' ? 34 : 8} height={kind === 'camp' || kind === 'low' ? 40 : 70} fill="#3F454D" />
      ))}
      {kind === 'camp' && (
        <g>
          {[160, 1260].map((x) => (
            <g key={x}>
              <rect x={x} y={ground - 90} width={14} height={90} fill="#7A5A3A" />
              <circle cx={x + 7} cy={ground - 120} r={60} fill="#7BA05B" />
            </g>
          ))}
        </g>
      )}
      {(kind === 'low' || kind === 'medium' || kind === 'high' || kind === 'adx') && fence(90, 150, 'f1')}
      {(kind === 'low' || kind === 'medium' || kind === 'high' || kind === 'adx') && fence(170, 120, 'f2')}
      {(kind === 'medium' || kind === 'high' || kind === 'adx') &&
        Array.from({length: 12}).map((_, i) => <circle key={`s${i}`} cx={120 + i * 115} cy={ground - 30} r={9} fill={C.red} opacity={0.6 + 0.4 * Math.sin(i)} />)}
      {(kind === 'high' || kind === 'adx') && (
        <g>
          <rect x={30} y={ground - 260} width={40} height={260} fill="#A7A39A" stroke="#6B675E" strokeWidth={3} />
          <rect x={w - 70} y={ground - 260} width={40} height={260} fill="#A7A39A" stroke="#6B675E" strokeWidth={3} />
          <rect x={10} y={ground - 330} width={80} height={70} fill="#6B675E" />
          <rect x={w - 90} y={ground - 330} width={80} height={70} fill="#6B675E" />
          <rect x={22} y={ground - 318} width={56} height={22} fill="#C7DCEB" />
          <rect x={w - 78} y={ground - 318} width={56} height={22} fill="#C7DCEB" />
        </g>
      )}
    </svg>
  );
};

/** Top-down housing plans. */
export const Housing: React.FC<{kind: 'dorm' | 'cubicle' | 'cell'; size?: number}> = ({kind, size = 700}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 500 310">
    <rect x="5" y="5" width="490" height="300" fill="#FBFAF7" stroke={C.ink} strokeWidth="6" />
    {kind === 'dorm' &&
      Array.from({length: 4}).map((_, r) =>
        Array.from({length: 6}).map((_, c) => (
          <g key={`${r}${c}`}>
            <rect x={30 + c * 78} y={25 + r * 70} width={50} height={26} rx={4} fill="#8FA3B5" stroke={C.ink} strokeWidth={2} />
            <rect x={30 + c * 78} y={25 + r * 70} width={12} height={26} rx={3} fill="#fff" />
          </g>
        )),
      )}
    {kind === 'cubicle' &&
      Array.from({length: 3}).map((_, r) =>
        Array.from({length: 5}).map((_, c) => (
          <g key={`${r}${c}`}>
            <rect x={20 + c * 94} y={20 + r * 95} width={86} height={86} fill="none" stroke="#6B7480" strokeWidth={3} />
            <rect x={30 + c * 94} y={32 + r * 95} width={50} height={24} rx={4} fill="#8FA3B5" stroke={C.ink} strokeWidth={2} />
          </g>
        )),
      )}
    {kind === 'cell' &&
      Array.from({length: 2}).map((_, r) =>
        Array.from({length: 6}).map((_, c) => (
          <g key={`${r}${c}`}>
            <rect x={14 + c * 80} y={14 + r * 160} width={74} height={120} fill="#E6E2D8" stroke={C.ink} strokeWidth={4} />
            <rect x={22 + c * 80} y={24 + r * 160} width={22} height={60} rx={3} fill="#8FA3B5" stroke={C.ink} strokeWidth={2} />
            <rect x={14 + c * 80 + 20} y={r === 0 ? 130 : 170} width={34} height={8} fill={C.red} />
          </g>
        )),
      )}
  </svg>
);

/* ------------------------------------------------------------------ scenes */

export const Ladder: React.FC<{focus: number; from?: number; outro?: boolean}> = ({focus, from, outro}) => {
  const f = useCurrentFrame();
  const SW = 460;
  const SH = 130;
  const X0 = 200;
  const Y0 = 1700;
  const pos = (i: number) => ({x: X0 + i * SW, y: Y0 - i * SH});
  const W = X0 * 2 + STEPS.length * SW;
  const camOf = (i: number) => (i < 0 ? {x: W / 2, y: Y0 - 3.5 * SH - 160, s: 1920 / (W + 200)} : {x: pos(i).x + SW / 2, y: pos(i).y - 220, s: 1.05});
  const a = camOf(from ?? focus);
  const b = camOf(focus);
  const t = prog(f, 0, 26, easeInOut);
  const cx = a.x + (b.x - a.x) * t;
  const cy = a.y + (b.y - a.y) * t;
  const s = a.s + (b.s - a.s) * t;
  const land = focus >= 0 ? pop(f, 20, 10) : 1;
  const icon = (i: number) => {
    const k = ['score', 'camp', 'low', 'medium', 'high', 'admin', 'adx'][i];
    if (k === 'score')
      return (
        <div style={{width: 230, height: 280, background: '#fff', border: `4px solid ${C.ink}`, borderRadius: 8, padding: 20}}>
          {[0, 1, 2, 3, 4].map((j) => (
            <div key={j} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 14}}>
              <div style={{width: 120, height: 14, background: '#D9D5CA', borderRadius: 7}} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, color: C.red}}>+{[3, 2, 5, 1, 3][j]}</div>
            </div>
          ))}
        </div>
      );
    if (k === 'admin')
      return (
        <div style={{width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: `4px solid ${C.ink}`, borderRadius: 12}}>
          <Label size={110} color={C.ink}>
            ADM
          </Label>
        </div>
      );
    return <Perimeter kind={k} w={300} />;
  };
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
                <Label size={58} color={active ? C.ink : C.inkSoft}>
                  {st.name}
                </Label>
              </div>
              {(done || active) && (
                <div style={{position: 'absolute', left: p.x + SW / 2 - 150, top: p.y - 300, width: 300, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 290, transform: active ? `translateY(${(1 - land) * -200}px)` : 'none', opacity: active ? Math.min(1, land * 2) : 0.9}}>
                  {icon(i)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {focus >= 0 && !outro && (
        <div style={{position: 'absolute', right: 120, top: 190, opacity: prog(f, 22, 10)}}>
          <Label size={130} color={C.red}>
            {STEPS[focus].short}
          </Label>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Form with rows adding points on events. */
export const ScoreForm: React.FC<{rows: string[]; pts: number[]; ev?: number[]}> = ({rows, pts, ev}) => {
  const f = useCurrentFrame();
  let total = 0;
  rows.forEach((_, i) => {
    if (f >= at(ev, i, i * 14) + 6) total += pts[i];
  });
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 90}}>
      <div style={{width: 900, background: '#fff', border: `5px solid ${C.ink}`, borderRadius: 10, padding: '40px 50px', transform: `rotate(-1.2deg) scale(${pop(f, 0, 14)})`}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.inkSoft, letterSpacing: 3}}>SECURITY DESIGNATION</div>
        <div style={{height: 3, background: C.ink, margin: '16px 0 26px'}} />
        {rows.map((r, i) => {
          const s = at(ev, i, i * 14);
          const p = prog(f, s, 8);
          return (
            <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, opacity: 0.25 + 0.75 * p}}>
              <Label size={60} weight={700}>
                {r}
              </Label>
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 60, color: C.red, transform: `scale(${f >= s + 6 ? 1 : 0})`}}>+{pts[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign: 'center'}}>
        <Label size={60} color={C.inkSoft}>
          TOTAL
        </Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 200, color: C.ink, lineHeight: 1}}>{total}</div>
      </div>
    </AbsoluteFill>
  );
};

const BANDS = [
  {l: 'MINIMUM', a: 0, b: 11, c: '#7BA05B'},
  {l: 'LOW', a: 12, b: 15, c: '#E3B23C'},
  {l: 'MEDIUM', a: 16, b: 23, c: '#E07A2E'},
  {l: 'HIGH', a: 24, b: 36, c: C.red},
];

/** 0–36 point scale with level bands; optional marker and 3-2-1 quiz. */
export const ScoreScale: React.FC<{marker?: number; quiz?: boolean; reveal?: boolean; gapNote?: boolean; ev?: number[]}> = ({marker, quiz, reveal, gapNote, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const X0 = 160;
  const X1 = 1760;
  const x = (v: number) => X0 + (v / 36) * (X1 - X0);
  const Y = 520;
  const qStart = Math.max(0, d - 95);
  const left = quiz ? Math.max(0, 3 - Math.floor((f - qStart) / 30)) : 0;
  return (
    <AbsoluteFill>
      {BANDS.map((b, i) => {
        const p = prog(f, quiz || reveal || marker !== undefined ? 0 : at(ev, i, i * 12), 12, easeInOut);
        const hi = reveal && b.l === 'LOW';
        return (
          <div key={b.l}>
            <div style={{position: 'absolute', left: x(b.a), top: Y - 70, width: (x(b.b + 1) - x(b.a) - 6) * p, height: 140, background: b.c, opacity: reveal && !hi ? 0.3 : 1, borderRadius: 8, boxShadow: hi ? `0 0 0 8px ${C.ink}` : 'none'}} />
            <div style={{position: 'absolute', left: x(b.a) + 16, top: Y - 50, opacity: p}}>
              <Label size={58} color="#fff">
                {b.l}
              </Label>
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: '#fff'}}>
                {b.a}–{b.l === 'HIGH' ? '24+' : b.b}
              </div>
            </div>
          </div>
        );
      })}
      {marker !== undefined && (
        <div style={{position: 'absolute', left: x(marker) - 40, top: Y - 230, textAlign: 'center', width: 80, transform: `translateY(${(1 - pop(f, 4, 10)) * -80}px)`}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 70, color: C.ink}}>{marker}</div>
          <svg width={80} height={80}>
            <path d="M 10 10 L 70 10 L 40 70 Z" fill={C.ink} />
          </svg>
        </div>
      )}
      {quiz && f >= qStart && left > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 200, height: 200, borderRadius: 100, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.15 * (1 - ((f - qStart) % 30) / 30)})`}}>
            <Label size={150} color="#fff">
              {left}
            </Label>
          </div>
        </div>
      )}
      {quiz && f < qStart && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', opacity: prog(f, 6, 10)}}>
          <Hand size={80}>where are you going?</Hand>
        </div>
      )}
      {gapNote && (
        <div style={{position: 'absolute', left: x(11) - 60, top: Y + 100, opacity: prog(f, at(ev, 0, 20), 10)}}>
          <svg width={330} height={60}>
            <path d="M 10 30 L 320 30 M 10 10 L 10 50 M 320 10 L 320 50" stroke={C.red} strokeWidth={6} />
          </svg>
          <Label size={56} color={C.red}>
            JUST 3 POINTS
          </Label>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Big perimeter elevation with labelled features entering on events. */
export const PerimeterScene: React.FC<{kind: string; labels?: string[]; ev?: number[]; title?: string}> = ({kind, labels = [], ev, title}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {title && (
        <div style={{position: 'absolute', top: 120, opacity: prog(f, 0, 8)}}>
          <Label size={84}>{title}</Label>
        </div>
      )}
      <div style={{transform: `translateY(40px) scale(${0.95 + 0.05 * pop(f, 0, 14)})`}}>
        <Perimeter kind={kind} w={1600} reveal={prog(f, 2, 16)} />
      </div>
      <div style={{position: 'absolute', bottom: 120, display: 'flex', gap: 30}}>
        {labels.map((l, i) => (
          <div key={l} style={{opacity: prog(f, at(ev, i, 10 + i * 12), 8), transform: `translateY(${(1 - prog(f, at(ev, i, 10 + i * 12), 8)) * 20}px)`}}>
            <Chip size={46} color={i === labels.length - 1 ? C.red : C.ink}>
              {l}
            </Chip>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const HousingScene: React.FC<{kinds: ('dorm' | 'cubicle' | 'cell')[]; labels: string[]; ev?: number[]}> = ({kinds, labels, ev}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70}}>
      {kinds.map((k, i) => {
        const p = pop(f, i === 0 ? Math.min(4, at(ev, 0, 0)) : at(ev, i, i * 10), 12);
        return (
          <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 60}px)`}}>
            <Housing kind={k} size={kinds.length > 1 ? 760 : 1100} />
            <Label size={70} style={{marginTop: 20}} color={i === kinds.length - 1 ? C.red : C.ink}>
              {labels[i]}
            </Label>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Open camp: a figure strolls off; escape counter. */
export const WalkAway: React.FC<{ev?: number[]; phase: 0 | 1}> = ({ev, phase}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const walk = interpolate(f, [0, d], [700, 1500]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 160, top: 300, opacity: 0.9}}>
        <Perimeter kind="camp" w={1600} />
      </div>
      <div style={{position: 'absolute', left: walk, top: 470, transform: `translateY(${Math.abs(Math.sin(f / 4)) * -8}px)`}}>
        <Stick size={260} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 140}}>
        {phase === 0 ? (
          <>
            <DateStamp date="2021 · ASSOCIATED PRESS" place="18 MONTHS OF FEDERAL ESCAPES" f={f} delay={2} big />
            <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 20, opacity: prog(f, at(ev, 0, 30), 8)}}>
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 170, color: C.red, lineHeight: 1}}>
                <CountUp to={29} f={f} start={at(ev, 0, 30)} len={24} />
              </div>
              <Label size={70}>ESCAPES</Label>
            </div>
            <div style={{opacity: prog(f, at(ev, 1, 60), 8)}}>
              <Chip size={44} color={C.red}>
                EVERY ONE FROM A MINIMUM CAMP
              </Chip>
            </div>
          </>
        ) : (
          <>
            <Label size={110} color={C.red}>
              NEARLY HALF
            </Label>
            <Label size={80}>STILL NOT CAUGHT</Label>
            <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 20, opacity: prog(f, at(ev, 0, 40), 8)}}>
              <Stick size={130} color={C.inkSoft} />
              <Label size={60}>SOMETIMES ONE OFFICER PER SHIFT</Label>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Two labels: "WALK AWAY" vs "ESCAPE". */
export const TwoWords: React.FC<{a: string; aWho: string; b: string; bWho: string; ev?: number[]}> = ({a, aWho, b, bWho, ev}) => {
  const f = useCurrentFrame();
  const card = (w: string, who: string, s: number, red: boolean) => {
    const p = pop(f, s, 12);
    return (
      <div style={{width: 700, height: 420, background: '#fff', border: `6px solid ${red ? C.red : C.ink}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * Math.min(1, p)})`, opacity: Math.min(1, p)}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: C.inkSoft, letterSpacing: 3}}>{who}</div>
        <Label size={130} color={red ? C.red : C.ink}>
          {w}
        </Label>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60}}>
      {card(a, aWho, at(ev, 0, 0), false)}
      {card(b, bWho, at(ev, 1, 30), true)}
    </AbsoluteFill>
  );
};

/** ADX cell, top-down plan with dimensions; parts labelled on events. */
export const ADXCell: React.FC<{ev?: number[]; window?: boolean}> = ({ev, window}) => {
  const f = useCurrentFrame();
  const k = 52;
  const W = 7 * k;
  const L = 12 * k;
  const ox = 520;
  const oy = 180;
  const part = (i: number) => prog(f, at(ev, i, 10 + i * 10), 8);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={ox - 14} y={oy - 14} width={L + 28} height={W + 28} fill="#6B675E" />
        <rect x={ox} y={oy} width={L} height={W} fill="#D8D4CA" />
        <g opacity={part(0)}>
          <rect x={ox + 20} y={oy + 20} width={250} height={90} rx={6} fill="#A9A59B" stroke="#6B675E" strokeWidth={4} />
          <text x={ox + 145} y={oy + 75} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={34} fill="#3B3830">BED</text>
        </g>
        <g opacity={part(1)}>
          <rect x={ox + 330} y={oy + 20} width={160} height={60} rx={4} fill="#A9A59B" stroke="#6B675E" strokeWidth={4} />
          <circle cx={ox + 410} cy={oy + 125} r={26} fill="#A9A59B" stroke="#6B675E" strokeWidth={4} />
          <text x={ox + 410} y={oy + 62} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={30} fill="#3B3830">DESK</text>
        </g>
        <g opacity={part(1)}>
          <rect x={ox + L - 110} y={oy + W - 110} width={90} height={90} rx={10} fill="#BFC5CB" stroke="#6B675E" strokeWidth={4} />
          <rect x={ox + L - 110} y={oy + 20} width={90} height={120} fill="#C7DCEB" stroke="#6B675E" strokeWidth={4} />
        </g>
        {(window || at(ev, 2, -1) >= 0) && (
          <g opacity={window ? 1 : part(2)}>
            <rect x={ox + L / 2 - 8} y={oy - 14} width={17} height={14} fill="#9FD3F2" />
            <rect x={ox + L / 2 - 8} y={oy - 14} width={17} height={14} fill="none" stroke={C.red} strokeWidth={3} />
          </g>
        )}
        <g stroke={C.ink} strokeWidth={3} opacity={prog(f, 4, 10)}>
          <line x1={ox} x2={ox + L} y1={oy + W + 50} y2={oy + W + 50} />
          <line x1={ox - 50} x2={ox - 50} y1={oy} y2={oy + W} />
        </g>
        <text x={ox + L / 2} y={oy + W + 95} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={44} fill={C.ink} opacity={prog(f, 4, 10)}>
          ≈ 12 FT
        </text>
        <text x={ox - 70} y={oy + W / 2} textAnchor="end" fontFamily="JetBrains Mono" fontWeight={700} fontSize={44} fill={C.ink} opacity={prog(f, 4, 10)}>
          ≈ 7 FT
        </text>
      </svg>
      {window && (
        <div style={{position: 'absolute', left: ox + L / 2 + 30, top: 40, opacity: prog(f, 4, 10)}}>
          <Label size={80} color={C.red}>
            ≈ 4 INCHES WIDE
          </Label>
          <Hand size={56}>the sky — but not where you are</Hand>
        </div>
      )}
      {!window && (
        <div style={{position: 'absolute', left: 520, top: 760, opacity: part(1)}}>
          <Chip size={50} color={C.ink}>
            ALL POURED CONCRETE
          </Chip>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** 24h bar: 23 hours in cell, 1 out. */
export const Hours23: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 4, 30, easeInOut);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 280, color: C.red, lineHeight: 1}}>
          <CountUp to={23} f={f} start={4} len={30} />
        </div>
        <Label size={110}>HOURS ALONE</Label>
      </div>
      <div style={{display: 'flex', gap: 6, marginTop: 40}}>
        {Array.from({length: 24}).map((_, i) => (
          <div key={i} style={{width: 56, height: 90, borderRadius: 6, background: i < 23 * p ? C.ink : i === 23 && p > 0.98 ? '#9FD3F2' : '#E6E3DC'}} />
        ))}
      </div>
      <div style={{marginTop: 18, fontFamily: fonts.mono, fontSize: 32, color: C.inkSoft, opacity: p}}>EVERY DAY</div>
    </AbsoluteFill>
  );
};

/** Notorious inmates: silhouette cards with name + crime. */
export const Inmates: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const list = [
    ['JOAQUÍN "EL CHAPO" GUZMÁN', 'DRUG LORD'],
    ['DZHOKHAR TSARNAEV', 'BOSTON MARATHON BOMBER'],
    ['TERRY NICHOLS', 'OKLAHOMA CITY BOMBER'],
  ];
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50}}>
      {list.map(([n, c], i) => {
        const p = pop(f, at(ev, i, i * 20), 12);
        return (
          <div key={n} style={{width: 500, height: 640, background: '#fff', border: `4px solid ${C.ink}`, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, transform: `translateY(${(1 - Math.min(1, p)) * 80}px)`, opacity: Math.min(1, p)}}>
            <svg width={260} height={300} viewBox="0 0 100 115">
              <rect width="100" height="115" fill="#E6E3DC" />
              {[20, 40, 60, 80, 100].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#C9C4B8" strokeWidth="0.8" />
              ))}
              <circle cx="50" cy="42" r="20" fill="#2B2F36" />
              <path d="M 14 115 Q 18 70 50 68 Q 82 70 86 115 Z" fill="#2B2F36" />
            </svg>
            <Label size={46} style={{textAlign: 'center', marginTop: 24, padding: '0 20px'}}>
              {n}
            </Label>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: C.red, marginTop: 10, textAlign: 'center'}}>{c}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** ~90% donut. */
export const Ninety: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s = at(ev, 0, 10);
  const p = prog(f, s, 30, easeInOut) * 0.9;
  const R = 230;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110}}>
      <div style={{position: 'relative', width: 560, height: 560}}>
        <svg width={560} height={560}>
          <circle cx={280} cy={280} r={R} stroke="#E6E3DC" strokeWidth={70} fill="none" />
          <circle cx={280} cy={280} r={R} stroke={C.red} strokeWidth={70} fill="none" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform="rotate(-90 280 280)" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.mono, fontWeight: 700, fontSize: 140, color: C.ink}}>{Math.round(p * 100)}%</div>
      </div>
      <div style={{width: 760}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: C.inkSoft, letterSpacing: 3, opacity: prog(f, 0, 8)}}>2016 REPORT · 400+ INMATES</div>
        <Label size={84} style={{marginTop: 14, opacity: prog(f, s, 10)}}>
          NOT THERE FOR THEIR CRIME
        </Label>
        <Label size={84} color={C.red} style={{marginTop: 10, opacity: prog(f, at(ev, 1, s + 40), 10)}}>
          THERE FOR HOW THEY BEHAVED INSIDE
        </Label>
      </div>
    </AbsoluteFill>
  );
};

/** Florence, Colorado: mountains + pin + name. */
export const Florence: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <polygon points="0,820 340,380 560,620 820,300 1120,700 1380,420 1920,820" fill="#B9B4A6" />
        <polygon points="820,300 900,400 860,390 820,340 780,395 740,400" fill="#fff" />
        <polygon points="340,380 400,460 340,440 290,450" fill="#fff" />
        <rect x={0} y={820} width={1920} height={260} fill="#D8D2C2" />
      </svg>
      <div style={{position: 'absolute', left: 860, top: 520, transform: `translateY(${(1 - pop(f, 4, 10)) * -200}px)`}}>
        <svg width={120} height={160} viewBox="0 0 30 40">
          <path d="M 15 39 C 15 39 2 22 2 14 A 13 13 0 0 1 28 14 C 28 22 15 39 15 39 Z" fill={C.red} />
          <circle cx="15" cy="14" r="5" fill="#fff" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 140, top: 160}}>
        <DateStamp date="OPENED 1994" place="FLORENCE, COLORADO" f={f} delay={2} big />
        <Label size={90} style={{marginTop: 24, opacity: prog(f, at(ev, 0, 30), 10)}}>
          ADMINISTRATIVE MAXIMUM
        </Label>
        <Hand size={70} style={{marginTop: 10, opacity: prog(f, at(ev, 1, 60), 10)}}>
          "the Alcatraz of the Rockies"
        </Hand>
      </div>
    </AbsoluteFill>
  );
};

/** "NO ESCAPES" stamp over the ADX perimeter. */
export const NoEscape: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Perimeter kind="adx" w={1600} />
      <div style={{position: 'absolute', top: 330}}>
        <RedStamp text="NO ESCAPES SINCE 1994" f={f} delay={10} size={110} rotate={-6} />
      </div>
    </AbsoluteFill>
  );
};
