import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {ease, easeInOut, pop, prog} from '../lib';
import {Label, RedStamp} from '../components/ui';
import {Bomb, ITEMS, OD, Round, Shell} from './assets';

const at = (ev: number[] | undefined, i: number, fb = 0) => (ev && ev[i] !== undefined ? ev[i] : fb);
const TILE: React.CSSProperties = {background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 22, boxShadow: '0 18px 40px rgba(0,0,0,0.08)'};

/* ---------- HUD ---------- */
export const HUD: React.FC<{step: number}> = ({step}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 40, top: 30, background: OD, color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '8px 18px', borderRadius: 4}}>
        EVERY MILITARY AMMO COLOR EXPLAINED
      </div>
      {step >= 0 && (
        <div style={{position: 'absolute', right: 40, top: 30, background: C.ink, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, padding: '8px 18px', borderRadius: 4}}>
          COLOR {String(step + 1).padStart(2, '0')} / 08
        </div>
      )}
      <div style={{position: 'absolute', left: 40, bottom: 22, display: 'flex', alignItems: 'flex-end', gap: 16}}>
        {ITEMS.map((it, i) => {
          const on = i === step;
          const done = step >= 0 && i < step;
          return (
            <div key={it.key} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: on || done ? 1 : 0.35, transform: on ? `translateY(${-4 + 3 * Math.sin(f / 6)}px) scale(1.18)` : 'none'}}>
              <Shell body={it.body} bands={it.bands} size={70} uid={`hud${i}`} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 14, color: on ? C.red : C.ink}}>{it.short}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- kinetic words (light theme) ---------- */
type Line = {t: string; red?: boolean};
const Words: React.FC<{line: Line; start: number; size: number}> = ({line, start, size}) => {
  const f = useCurrentFrame();
  const words = line.t.split(' ');
  const box = prog(f, start, 7, ease);
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: line.red ? '0 18px' : 0, marginBottom: 6}}>
      {line.red && <div style={{position: 'absolute', inset: '6% 0 4% 0', background: C.red, transformOrigin: 'left', transform: `scaleX(${box})`, borderRadius: 4}} />}
      <div style={{position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.22}px`}}>
        {words.map((w, i) => {
          const s = start + i * 2;
          const p = pop(f, s, 11, 0.6);
          return (
            <span key={i} style={{fontFamily: fonts.label, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: line.red ? '#fff' : C.ink, opacity: Math.min(1, prog(f, s, 3)), transform: `translateY(${(1 - Math.min(1, p)) * 40}px) scale(${0.8 + 0.2 * p})`, display: 'inline-block'}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
export const Kinetic: React.FC<{lines: Line[]; kicker?: string; ev?: number[]; item?: number; size?: number}> = ({lines, kicker, ev, item, size}) => {
  const f = useCurrentFrame();
  const longest = Math.max(...lines.map((l) => l.t.length));
  const sz = size ?? Math.min(150, Math.round((item !== undefined ? 1200 : 1560) / (longest * 0.56)));
  const it = item !== undefined ? ITEMS[item] : null;
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70, padding: '0 120px'}}>
      {it && (
        <div style={{transform: `scale(${Math.min(1, pop(f, 0, 12))}) rotate(${-4 + 2 * Math.sin(f / 30)}deg)`}}>
          <Shell body={it.body} bands={it.bands} size={560} uid="kin" />
        </div>
      )}
      <div style={{textAlign: 'center', maxWidth: it ? 1150 : 1680}}>
        {kicker && <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: C.red, letterSpacing: 5, marginBottom: 16, opacity: prog(f, 0, 6)}}>{kicker}</div>}
        {lines.map((l, i) => (
          <div key={i}>
            <Words line={l} start={at(ev, i, 2 + i * 8)} size={sz} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the line-up: 8 shells on tiles, camera picks one ---------- */
export const Lineup: React.FC<{focus: number; from?: number; labels?: boolean; ev?: number[]}> = ({focus, from, labels, ev}) => {
  const f = useCurrentFrame();
  const TW = 212;
  const GAP = 18;
  const W = ITEMS.length * TW + (ITEMS.length - 1) * GAP;
  const X0 = (1920 - W) / 2;
  const cam = (i: number) => (i < 0 ? {x: 960, y: 560, s: 1} : {x: X0 + i * (TW + GAP) + TW / 2, y: 540, s: 2.5});
  const a = cam(from ?? focus);
  const b = cam(focus);
  const t = prog(f, 4, 22, easeInOut);
  const cx = a.x + (b.x - a.x) * t;
  const cy = a.y + (b.y - a.y) * t;
  const s = a.s + (b.s - a.s) * t;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})`}}>
        {ITEMS.map((it, i) => {
          const active = i === focus;
          const dim = focus >= 0 && !active;
          const appear = focus < 0 && from === undefined ? pop(f, i * 3, 12) : 1;
          return (
            <div
              key={it.key}
              style={{
                position: 'absolute',
                left: X0 + i * (TW + GAP),
                top: 260,
                width: TW,
                height: 520,
                ...TILE,
                borderColor: active ? C.red : C.tileBorder,
                borderWidth: active ? 6 : 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 24,
                opacity: (dim ? 0.45 : 1) * Math.min(1, appear),
                transform: `translateY(${(1 - Math.min(1, appear)) * 60}px)`,
              }}
            >
              <div style={{marginBottom: 18, transform: active ? `translateY(${-6 * Math.sin(f / 10)}px)` : 'none'}}>
                <Shell body={it.body} bands={it.bands} size={330} uid={`lu${i}`} />
              </div>
              <Label size={it.name.length > 8 ? 36 : 44}>{it.name}</Label>
              {labels && (
                <div style={{marginTop: 6, fontFamily: fonts.mono, fontWeight: 700, fontSize: 17, color: C.red, opacity: prog(f, at(ev, i - 1, 6 + i * 6), 6)}}>{it.meaning}</div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- hero card: big shell + name + meaning + facts ---------- */
export const Hero: React.FC<{item: number; facts?: string[]; ev?: number[]; stamp?: string}> = ({item, facts = [], ev, stamp}) => {
  const f = useCurrentFrame();
  const it = ITEMS[item];
  const p = pop(f, 0, 12);
  const bandP = prog(f, 6, 14, easeInOut);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 150, width: 560, height: 800, ...TILE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * Math.min(1, p)})`, opacity: Math.min(1, p * 1.5)}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 22, background: `radial-gradient(circle at 50% 45%, ${it.bands[0]?.c ?? it.body}33 0%, rgba(255,255,255,0) 60%)`}} />
        <div style={{transform: `translateY(${-8 * Math.sin(f / 14)}px) rotate(${2 * Math.sin(f / 22)}deg)`}}>
          <Shell body={it.body} bands={it.bands} size={660} bandP={bandP} uid="hero" />
        </div>
      </div>
      <div style={{position: 'absolute', left: 800, top: 210, right: 100}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: C.inkFaint, letterSpacing: 4, opacity: prog(f, 2, 6)}}>COLOR {String(item + 1).padStart(2, '0')}</div>
        <div style={{overflow: 'hidden'}}>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: it.name.length > 8 ? 170 : 200, lineHeight: 1, color: C.ink, transform: `translateY(${(1 - prog(f, 3, 9)) * 105}%)`}}>{it.name}</div>
        </div>
        <div style={{display: 'inline-block', marginTop: 14, background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 70, padding: '2px 22px', borderRadius: 6, transformOrigin: 'left', transform: `scale(${Math.min(1, pop(f, at(ev, 0, 14), 10))})`}}>
          {it.meaning}
        </div>
        <div style={{marginTop: 40}}>
          {facts.map((x, i) => {
            const s = at(ev, i + 1, 30 + i * 20);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14, opacity: prog(f, s, 6), transform: `translateX(${(1 - prog(f, s, 8)) * 40}px)`}}>
                <div style={{width: 18, height: 18, background: C.ink, transform: 'rotate(45deg)'}} />
                <Label size={58} color={C.inkSoft}>
                  {x}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
      {stamp && (
        <div style={{position: 'absolute', right: 140, bottom: 170}}>
          <RedStamp text={stamp} f={f} delay={at(ev, facts.length + 1, 40)} size={78} rotate={-6} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- tier split: tips vs bands ---------- */
export const Tiers: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const col = (s: number, children: React.ReactNode, title: string, sub: string, red?: boolean) => (
    <div style={{width: 700, height: 700, ...TILE, borderColor: red ? C.red : C.tileBorder, borderWidth: red ? 6 : 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40, opacity: prog(f, s, 6), transform: `scale(${0.9 + 0.1 * Math.min(1, pop(f, s, 12))})`}}>
      <div style={{height: 400, display: 'flex', alignItems: 'flex-end', gap: 30, marginBottom: 30}}>{children}</div>
      <Label size={84}>{title}</Label>
      <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: red ? C.red : C.inkSoft, marginTop: 6}}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80}}>
      {col(at(ev, 0, 2), <><Shell body={OD} bands={[{c: '#F2C21B'}]} size={380} uid="t1" /><Shell body="#A5CF84" size={330} uid="t2" /><Shell body="#8F949B" bands={[{c: '#2F6B3A'}]} size={300} uid="t3" /></>, '20 MM AND UP', 'BODY COLOR + BANDS', true)}
      {col(at(ev, 1, 40), <><Round tip="#1E1F22" size={260} /><Round tip="#C8312E" size={260} /><Round tip="#3D7FD1" size={260} /><Round tip="#2E9E4F" size={260} /></>, 'SMALLER BULLETS', 'A PAINTED TIP')}
    </AbsoluteFill>
  );
};

/* ---------- bomb with bands painted on ---------- */
export const BombBands: React.FC<{mode: 'live' | 'thermal' | 'inert' | 'brown'; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const p1 = prog(f, at(ev, 0, 10), 14, easeInOut);
  const p2 = prog(f, at(ev, 1, 40), 14, easeInOut);
  const bands =
    mode === 'live'
      ? [{c: '#F2C21B', x: 600, w: 34, p: p1}]
      : mode === 'thermal'
        ? [{c: '#F2C21B', x: 600, w: 34, p: 1}, {c: '#F2C21B', x: 650, w: 34, p: p1}]
        : mode === 'inert'
          ? [{c: '#F2C21B', x: 600, w: 20, p: 1}, {c: '#3D7FD1', x: 630, w: 28, p: p1}]
          : [{c: '#F2C21B', x: 620, w: 30, p: p2}, {c: '#7A4A24', x: 250, w: 34, p: p1}];
  const z = interpolate(f, [0, d], [1, 1.06]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', opacity: prog(f, 0, 6)}}>
        <Label size={84}>{mode === 'brown' ? 'MISSILE · MOTOR vs WARHEAD' : mode === 'thermal' ? 'THERMAL COATING = TWO BANDS' : 'MK 82 · 500 LB GENERAL PURPOSE'}</Label>
      </div>
      <div style={{transform: `scale(${z}) translateY(40px)`}}>
        <Bomb bands={bands} width={1500} uid={mode} />
      </div>
      {mode === 'live' && (
        <div style={{position: 'absolute', left: 1500, top: 400, opacity: prog(f, at(ev, 1, 30), 8)}}>
          <svg width={200} height={80} style={{position: 'absolute', left: -90, top: 130}}>
            <line x1={10} y1={40} x2={190} y2={40} stroke={C.red} strokeWidth={5} />
          </svg>
          <Label size={72} color={C.red}>≈ 3 INCHES</Label>
        </div>
      )}
      {mode === 'brown' && (
        <>
          <div style={{position: 'absolute', left: 430, top: 760, opacity: prog(f, at(ev, 0, 10) + 8, 8), background: '#7A4A24', color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 54, padding: '4px 18px', borderRadius: 6}}>MOTOR: LIVE</div>
          <div style={{position: 'absolute', left: 1240, top: 760, opacity: prog(f, at(ev, 1, 40) + 8, 8), background: C.ink, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 54, padding: '4px 18px', borderRadius: 6}}>WARHEAD: SEPARATE CODE</div>
        </>
      )}
      {mode === 'thermal' && (
        <div style={{position: 'absolute', right: 160, bottom: 190}}>
          <RedStamp text="THIS ONE IS REAL" f={f} delay={at(ev, 1, 50)} size={72} rotate={-5} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- burn vs detonate ---------- */
export const BurnVsBlast: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s0 = at(ev, 0, 6);
  const s1 = at(ev, 1, 40);
  const burn = prog(f, s0, 50, (x) => x);
  const blast = prog(f, s1, 3);
  const row = (label: string, color: string, p: number, tag: string, s: number) => (
    <div style={{marginBottom: 70, opacity: prog(f, s - 4, 6)}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
        <Label size={72}>{label}</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color}}>{tag}</div>
      </div>
      <div style={{width: 1400, height: 90, ...TILE, borderRadius: 14, overflow: 'hidden', marginTop: 12, padding: 0}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`}} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 260}}>
      {row('LOW EXPLOSIVE', '#7A4A24', burn, 'BURNS · PUSHES', s0)}
      {row('HIGH EXPLOSIVE', '#E0A800', blast, 'DETONATES · INSTANT', s1)}
    </AbsoluteFill>
  );
};

/* ---------- practice bomb drop + spotting puff ---------- */
export const Practice: React.FC<{mode: 'drop' | 'ranges'; ev?: number[]; nopuff?: boolean}> = ({mode, ev, nopuff}) => {
  const f = useCurrentFrame();
  const {durationInFrames: dd} = useVideoConfig();
  const hit = nopuff ? dd + 100 : at(ev, 0, 40);
  const fall = nopuff ? prog(f, 0, dd + 20, (x) => x * x) * 0.75 : prog(f, 0, Math.max(10, hit), (x) => x * x);
  const by = interpolate(fall, [0, 1], [-200, 700]);
  const puff = Math.max(0, f - hit);
  if (mode === 'ranges') {
    const n = Math.floor(prog(f, 4, 50, (x) => x) * 220);
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <rect x={160} y={170} width={1600} height={720} rx={22} fill="#E9E3D3" stroke={C.tileBorder} strokeWidth={3} />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              {[200, 140, 80].map((r) => (
                <circle key={r} cx={480 + k * 480} cy={530} r={r} fill="none" stroke="#C9BFA6" strokeWidth={6} />
              ))}
            </g>
          ))}
          {Array.from({length: n}).map((_, k) => (
            <g key={k} transform={`translate(${200 + random(`px${k}`) * 1520} ${200 + random(`py${k}`) * 660}) rotate(${random(`pr${k}`) * 360})`}>
              <rect x={-12} y={-4} width={24} height={8} rx={4} fill="#86B6E6" stroke="#2C4D70" strokeWidth={1.5} />
            </g>
          ))}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
          <div style={{display: 'inline-block', background: '#fff', padding: '6px 26px', borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.12)'}}>
            <Label size={80}>HUNDREDS OF THOUSANDS ON U.S. RANGES</Label>
          </div>
        </div>
        <div style={{position: 'absolute', right: 180, bottom: 200}}>
          <RedStamp text={"DON'T\nPICK IT UP"} f={f} delay={at(ev, 0, 60)} size={86} rotate={-7} />
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={800} width={1920} height={280} fill="#E2DACA" />
        {[260, 180, 100].map((r) => (
          <ellipse key={r} cx={960} cy={830} rx={r * 2} ry={r * 0.32} fill="none" stroke="#C9BFA6" strokeWidth={6} />
        ))}
        {puff > 0 &&
          Array.from({length: 14}).map((_, k) => {
            const a = (k / 14) * Math.PI;
            const r = Math.min(1, puff / 24) * (120 + random(`r${k}`) * 90);
            return <circle key={k} cx={960 + Math.cos(a) * r * 1.4} cy={800 - Math.sin(a) * r} r={50 + Math.min(1, puff / 24) * 60} fill="#ECEAE4" opacity={Math.max(0, 0.95 - puff / 120)} />;
          })}
      </svg>
      {puff === 0 && (
        <div style={{position: 'absolute', left: 960 - 120, top: by, transform: 'rotate(90deg)'}}>
          <Bomb body="#86B6E6" width={240} uid="bdu" />
        </div>
      )}
      <div style={{position: 'absolute', left: 120, top: 170}}>
        <Label size={90}>BDU-33 PRACTICE BOMB</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 36, color: C.inkSoft, marginTop: 6, opacity: prog(f, 6, 6)}}>≈ 25 LB · FLIES LIKE A MK 82</div>
      </div>
      {puff > 0 && (
        <div style={{position: 'absolute', right: 160, top: 220, opacity: prog(f, hit + 6, 6)}}>
          <div style={{background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 64, padding: '4px 20px', borderRadius: 6}}>SPOTTING CHARGE</div>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 8}}>PUFF OF SMOKE = SCORE THE HIT</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- smoke: screening + marking ---------- */
export const Smoke: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s0 = at(ev, 0, 6);
  const s1 = at(ev, 1, 60);
  const grow = prog(f, s0, 40, ease);
  const mark = prog(f, s1, 30, ease);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={760} width={1920} height={320} fill="#E2DACA" />
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${200 + k * 230} 690)`}>
            <rect x={0} y={30} width={170} height={50} rx={10} fill="#5E6338" />
            <rect x={40} y={0} width={80} height={40} rx={8} fill="#4E5330" />
            <rect x={110} y={14} width={90} height={10} fill="#4E5330" />
            <circle cx={30} cy={84} r={14} fill="#2B2B2B" />
            <circle cx={140} cy={84} r={14} fill="#2B2B2B" />
          </g>
        ))}
        {Array.from({length: 22}).map((_, k) => {
          const x = 120 + (k / 21) * 780 + Math.sin((f + k * 13) / 25) * 18;
          const y = 720 - random(`sy${k}`) * 220 * grow;
          const r = (70 + random(`sr${k}`) * 70) * grow;
          return <circle key={k} cx={x} cy={y} r={r} fill="#DDE6D2" opacity={0.92} />;
        })}
        <ellipse cx={1450} cy={850} rx={220} ry={46} fill="none" stroke={C.ink} strokeWidth={6} opacity={prog(f, s1 - 6, 6)} />
        <text x={1450} y={866} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={52} fill={C.ink} opacity={prog(f, s1 - 6, 6)}>
          LZ
        </text>
        {mark > 0 &&
          Array.from({length: 16}).map((_, k) => {
            const tt = Math.min(1, mark + k * 0.02);
            const y = 840 - k * 34 * tt;
            const x = 1450 + Math.sin((f + k * 10) / 18) * (10 + k * 3) + k * 8;
            return <circle key={k} cx={x} cy={y} r={30 + k * 5} fill="#B67AD1" opacity={0.75 - k * 0.03} />;
          })}
      </svg>
      <div style={{position: 'absolute', left: 140, top: 170, opacity: prog(f, s0, 6)}}>
        <Label size={84}>SCREENING SMOKE</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: C.inkSoft}}>HIDES TROOPS + VEHICLES</div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 170, opacity: prog(f, s1, 6)}}>
        <Label size={84}>MARKING SMOKE</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: C.inkSoft}}>POINTS OUT A TARGET / LZ</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- illumination: flare under parachute, inside a framed card ---------- */
export const Illum: React.FC<{ev?: number[]; lit?: boolean}> = ({ev, lit}) => {
  const f = useCurrentFrame();
  const s0 = lit ? -200 : at(ev, 0, 20);
  const pop1 = f >= s0;
  const fy = interpolate(f, [s0, s0 + 240], [140, 420], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const light = prog(f, s0, 14);
  const shellY = interpolate(f, [0, Math.max(1, s0)], [620, 120], {extrapolateRight: 'clamp', easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1600, height: 780, ...TILE, padding: 0, overflow: 'hidden', position: 'relative', marginTop: 40}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${`rgb(${18 + 150 * light},${28 + 150 * light},${52 + 140 * light})`} 0%, rgb(${40 + 140 * light},${46 + 130 * light},${60 + 110 * light}) 100%)`}} />
        <svg width={1600} height={780} style={{position: 'absolute'}}>
          <path d={`M 0 640 Q 300 600 600 630 T 1200 620 T 1600 640 L 1600 780 L 0 780 Z`} fill={`rgb(${30 + 120 * light},${36 + 110 * light},${30 + 90 * light})`} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={260 + k * 300} y={590 - (k % 2) * 20} width={120} height={50 + (k % 2) * 20} fill={`rgb(${40 + 90 * light},${40 + 80 * light},${40 + 60 * light})`} />
          ))}
          {!pop1 && <circle cx={800} cy={shellY} r={10} fill="#fff" />}
          {pop1 && (
            <g transform={`translate(800 ${fy})`}>
              <path d="M -60 -60 Q 0 -110 60 -60 Z" fill="#fff" opacity={0.95} />
              <line x1={-60} y1={-60} x2={0} y2={0} stroke="#fff" strokeWidth={2} />
              <line x1={60} y1={-60} x2={0} y2={0} stroke="#fff" strokeWidth={2} />
              <circle r={70 + 6 * Math.sin(f / 2)} fill="#FFF6C8" opacity={0.35} />
              <circle r={16} fill="#FFFDF0" />
            </g>
          )}
        </svg>
        <div style={{position: 'absolute', left: 40, top: 30, background: '#fff', padding: '4px 18px', borderRadius: 8, opacity: prog(f, at(ev, 1, 60), 6)}}>
          <Label size={56}>PARACHUTE FLARE</Label>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- armor: black round punches a plate ---------- */
export const Punch: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s0 = at(ev, 0, 20);
  const x = interpolate(f, [0, s0], [-300, 860], {extrapolateRight: 'clamp', easing: (t) => t * t});
  const hit = f >= s0;
  const after = Math.max(0, f - s0);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={960} y={240} width={110} height={640} fill="#8B9096" stroke={C.ink} strokeWidth={5} />
        <rect x={1070} y={240} width={20} height={640} fill="#6C7177" stroke={C.ink} strokeWidth={4} />
        {hit && (
          <g>
            <ellipse cx={1015} cy={560} rx={34} ry={44} fill="#2A2A2E" />
            {Array.from({length: 18}).map((_, k) => {
              const a = (k / 18) * Math.PI * 2;
              const r = Math.min(1, after / 10) * (60 + random(`sp${k}`) * 110);
              return <circle key={k} cx={1100 + Math.cos(a) * r * 1.2 + after * 4} cy={560 + Math.sin(a) * r} r={6} fill="#F2A93B" opacity={Math.max(0, 1 - after / 30)} />;
            })}
          </g>
        )}
      </svg>
      <div style={{position: 'absolute', left: hit ? 1120 + after * 18 : x, top: 520, transform: 'rotate(90deg)', transformOrigin: 'center', opacity: hit && after > 20 ? 0 : 1}}>
        <Shell body="#1E1F22" size={200} uid="pu" />
      </div>
      <div style={{position: 'absolute', left: 140, top: 180, opacity: prog(f, 4, 6)}}>
        <Label size={90}>BUILT TO PUNCH THROUGH</Label>
        <Label size={90} color={C.red}>TANK ARMOR</Label>
      </div>
      <div style={{position: 'absolute', right: 160, top: 220, display: 'flex', alignItems: 'center', gap: 20, opacity: prog(f, at(ev, 1, 60), 8), ...TILE, padding: '20px 30px'}}>
        <Round tip="#1E1F22" size={200} />
        <div>
          <Label size={56}>SAME IDEA</Label>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: C.inkSoft}}>BLACK TIP = ARMOR PIERCING</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- chemical: band changes on a gray shell ---------- */
const CHEM = [
  {c: '#9E2A2B', l: 'DARK RED', m: 'RIOT CONTROL', sub: 'LIKE TEAR GAS'},
  {c: '#6E3FA3', l: 'VIOLET', m: 'INCAPACITATING', sub: 'DISABLES, TEMPORARILY'},
  {c: '#2F6B3A', l: 'DARK GREEN', m: 'TOXIC CHEMICAL', sub: 'THE DEADLY CLASS'},
];
export const Chem: React.FC<{mode: 'bands' | 'binary'; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  if (mode === 'binary') {
    const s0 = at(ev, 0, 10);
    const s1 = at(ev, 1, 50);
    const mix = prog(f, s1 + 20, 24, easeInOut);
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', left: 220, top: 170, ...TILE, width: 520, height: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Shell body="#8F949B" bands={[{c: '#2F6B3A', broken: true}]} size={640} bandP={prog(f, s0, 16)} uid="bin" />
        </div>
        <div style={{position: 'absolute', left: 860, top: 200, opacity: prog(f, s0, 6)}}>
          <Label size={100}>BROKEN GREEN BAND</Label>
          <div style={{display: 'inline-block', background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 70, padding: '2px 20px', borderRadius: 6, marginTop: 8}}>BINARY NERVE AGENT</div>
        </div>
        <svg width={900} height={420} style={{position: 'absolute', left: 860, top: 520, opacity: prog(f, s1, 8)}}>
          <rect x={60 + 170 * mix} y={80} width={220} height={260} rx={20} fill="#fff" stroke={C.ink} strokeWidth={5} />
          <rect x={520 - 170 * mix} y={80} width={220} height={260} rx={20} fill="#fff" stroke={C.ink} strokeWidth={5} />
          <text x={170 + 170 * mix} y={230} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={120} fill={C.ink}>A</text>
          <text x={630 - 170 * mix} y={230} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={120} fill={C.ink}>B</text>
          {mix > 0.95 && <circle cx={400} cy={210} r={90 + 10 * Math.sin(f / 3)} fill="#2F6B3A" opacity={0.35} />}
        </svg>
        <div style={{position: 'absolute', left: 900, top: 960, fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.inkSoft, opacity: prog(f, s1 + 10, 6)}}>STORED APART · MIX ONLY AFTER FIRING</div>
      </AbsoluteFill>
    );
  }
  const cur = CHEM.reduce((acc, _, i) => (f >= at(ev, i, 20 + i * 40) ? i : acc), -1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 220, top: 170, ...TILE, width: 520, height: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Shell body="#8F949B" bands={cur >= 0 ? [{c: CHEM[cur].c}] : []} size={640} bandP={cur >= 0 ? prog(f, at(ev, cur, 0), 8) : 0} uid={`chem${cur}`} />
      </div>
      <div style={{position: 'absolute', left: 860, top: 200}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: C.inkFaint, letterSpacing: 4}}>GRAY BODY = CHEMICAL · THE BAND SAYS WHICH</div>
        {CHEM.map((c, i) => {
          const s = at(ev, i, 20 + i * 40);
          const on = i === cur;
          return (
            <div key={c.l} style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 34, opacity: prog(f, s, 6) * (on ? 1 : 0.5), transform: `translateX(${(1 - prog(f, s, 8)) * 50}px) scale(${on ? 1 : 0.94})`, transformOrigin: 'left'}}>
              <div style={{width: 120, height: 60, background: c.c, borderRadius: 8, border: `3px solid ${C.ink}`}} />
              <div>
                <Label size={74}>{c.m}</Label>
                <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: C.inkSoft}}>
                  {c.l} BAND · {c.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- fading color warning ---------- */
export const Fade: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const fade = prog(f, 6, 70, (x) => x);
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
      <div style={{...TILE, width: 520, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{filter: `saturate(${1 - fade * 0.9}) sepia(${fade * 0.6}) brightness(${1 - fade * 0.15})`}}>
          <Shell body="#86B6E6" size={600} uid="fade" />
        </div>
      </div>
      <div>
        <Label size={110}>COLORS FADE.</Label>
        <Label size={110}>CODES DIFFER.</Label>
        <div style={{marginTop: 40}}>
          <RedStamp text={'NOT PROOF\nIT\'S SAFE'} f={f} delay={at(ev, 0, 50)} size={84} rotate={-6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ======================= long-form additions ======================= */
const Big: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 90, color = C.ink}) => (
  <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: size, lineHeight: 1.02, color}}>{children}</div>
);
const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 32, color = C.inkSoft}) => (
  <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: size, color, letterSpacing: 2}}>{children}</div>
);

/** Bomb cut-away: how much of a Mk 82 is explosive. */
export const Filler: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const p = prog(f, at(ev, 0, 12), 30, easeInOut);
  const n = Math.round(192 * p);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <Big size={84}>MK 82 · 500 LB GENERAL PURPOSE</Big>
      </div>
      <div style={{position: 'relative', marginTop: 40}}>
        <Bomb width={1500} uid="fill" />
        <svg width={1500} height={375} style={{position: 'absolute', left: 0, top: 0}} viewBox="0 0 800 200">
          <clipPath id="fillclip">
            <path d="M 150 72 L 560 66 C 660 66 740 86 760 100 C 740 114 660 134 560 134 L 150 128 Z" />
          </clipPath>
          <rect x={150} y={60} width={610 * p} height={80} fill="#F2C21B" opacity={0.85} clipPath="url(#fillclip)" />
        </svg>
      </div>
      <div style={{position: 'absolute', bottom: 190, display: 'flex', alignItems: 'baseline', gap: 26, opacity: prog(f, at(ev, 0, 12), 6)}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 150, color: C.red, lineHeight: 1}}>≈{n}</div>
        <Big size={70}>LB OF EXPLOSIVE FILLER</Big>
      </div>
    </AbsoluteFill>
  );
};

/** USS Forrestal 1967: fire on deck, clock to the first explosion. */
export const Forrestal: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const s1 = at(ev, 1, Math.round(d * 0.6));
  const clock = Math.min(94, Math.round(interpolate(f, [at(ev, 0, 10), s1], [0, 94], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const boom = f >= s1;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 150}}>
        <Mono size={40} color={C.red}>JULY 29, 1967</Mono>
        <Big size={110}>USS FORRESTAL</Big>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M 160 700 L 1760 700 L 1700 800 L 240 800 Z" fill="#9AA0A6" stroke={C.ink} strokeWidth={5} />
        <rect x={1180} y={560} width={120} height={140} fill="#8A9096" stroke={C.ink} strokeWidth={5} />
        {Array.from({length: 26}).map((_, k) => {
          const x = 560 + random(`fx${k}`) * 420;
          const h = (60 + random(`fh${k}`) * 140) * (0.8 + 0.2 * Math.sin((f + k * 7) / 4)) * prog(f, at(ev, 0, 10), 16);
          return <path key={k} d={`M ${x - 26} 700 Q ${x} ${700 - h} ${x + 26} 700 Z`} fill={k % 3 ? '#F28C28' : '#E5482E'} opacity={0.9} />;
        })}
        <g transform="translate(760 690)">
          <Bomb width={200} uid="fr" />
        </g>
        {boom && <circle cx={860} cy={680} r={Math.min(500, (f - s1) * 40)} fill="#FFF1C2" opacity={Math.max(0, 1 - (f - s1) / 14)} />}
      </svg>
      <div style={{position: 'absolute', right: 140, top: 170, ...TILE, padding: '18px 34px', textAlign: 'center'}}>
        <Mono size={26}>FIRE → FIRST BOMB EXPLODES</Mono>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 130, color: boom ? C.red : C.ink, lineHeight: 1}}>
          {Math.floor(clock / 60)}:{String(clock % 60).padStart(2, '0')}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Cook-off time bars: unprotected vs thermal coating. */
export const CookOff: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const a = prog(f, at(ev, 0, 6), 14, easeInOut);
  const b = prog(f, at(ev, 1, 40), 30, easeInOut);
  const row = (label: string, w: number, p: number, tag: string, color: string, s: number) => (
    <div style={{marginBottom: 60, opacity: prog(f, s - 4, 6)}}>
      <Big size={64}>{label}</Big>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 10}}>
        <div style={{height: 90, width: w * p, background: color, borderRadius: 10}} />
        <Big size={72} color={color}>{tag}</Big>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 220}}>
      <Mono size={34} color={C.red}>TIME IN A FUEL FIRE BEFORE COOK-OFF</Mono>
      <div style={{height: 40}} />
      {row('1967 · NO PROTECTION', 220, a, '≈ 1.5 MIN', C.ink, at(ev, 0, 6))}
      {row('THERMAL COATING · MK 82', 1050, b, '5–10 MIN', '#C99A00', at(ev, 1, 40))}
    </AbsoluteFill>
  );
};

/** 2019: an A-10 drops three BDU-33s after a bird strike. */
export const A10Drop: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const hit = at(ev, 0, 40);
  const px = interpolate(f, [0, d], [100, 1500]);
  const py = interpolate(f, [0, d], [300, 420]);
  const after = Math.max(0, f - hit);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={560} width={1920} height={520} fill="#E7E1D0" />
        <line x1={0} y1={560} x2={1920} y2={560} stroke={C.ink} strokeWidth={5} strokeDasharray="22 14" />
        <text x={80} y={530} fontFamily="Barlow Condensed" fontWeight={800} fontSize={64} fill={C.inkSoft}>GEORGIA</text>
        <text x={80} y={640} fontFamily="Barlow Condensed" fontWeight={800} fontSize={64} fill={C.inkSoft}>FLORIDA</text>
        <g transform={`translate(${px} ${py}) scale(2.2)`}>
          <path d="M -70 0 L 70 -6 L 90 0 L 70 6 Z" fill="#6E747A" />
          <path d="M -10 -4 L 20 -60 L 34 -60 L 22 -4 Z M -10 4 L 20 60 L 34 60 L 22 4 Z" fill="#6E747A" />
          <rect x={-60} y={-18} width={18} height={10} fill="#6E747A" />
          <rect x={-60} y={8} width={18} height={10} fill="#6E747A" />
        </g>
        {f >= hit && f < hit + 8 && <circle cx={px + 200} cy={py} r={70} fill="#fff" stroke={C.red} strokeWidth={6} />}
        {after > 0 &&
          [0, 1, 2].map((k) => {
            const x0 = interpolate(hit, [0, d], [100, 1500]) + k * 40;
            const y = Math.min(760 + k * 20, interpolate(hit, [0, d], [300, 420]) + after * after * 0.4);
            return <rect key={k} x={x0 + after * 3} y={y} width={80} height={26} rx={13} fill="#86B6E6" stroke="#2C4D70" strokeWidth={2} />;
          })}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 140}}>
        <Mono size={40} color={C.red}>JULY 2019 · MOODY AIR FORCE BASE</Mono>
        <Big size={96}>BIRD STRIKE → 3 PRACTICE BOMBS RELEASED</Big>
      </div>
      <div style={{position: 'absolute', right: 160, bottom: 200, opacity: prog(f, at(ev, 1, 80), 8), background: C.ink, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 54, padding: '6px 20px', borderRadius: 8}}>
        LANDED: NORTHERN FLORIDA
      </div>
    </AbsoluteFill>
  );
};

/** Short rule list (checklist style). */
export const Rules: React.FC<{title: string; items: string[]; ev?: number[]}> = ({title, items, ev}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 260}}>
      <Mono size={36} color={C.red}>{title}</Mono>
      <div style={{height: 30}} />
      {items.map((t, i) => {
        const s = at(ev, i, 10 + i * 20);
        return (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 34, opacity: prog(f, s, 6), transform: `translateX(${(1 - prog(f, s, 8)) * 60}px)`}}>
            <div style={{width: 92, height: 92, borderRadius: 16, background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 64}}>{i + 1}</div>
            <Big size={110}>{t}</Big>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** M18 colored smoke grenades. */
const Grenade: React.FC<{c: string; size?: number}> = ({c, size = 300}) => (
  <svg width={size * 0.55} height={size} viewBox="0 0 55 100" style={{overflow: 'visible', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.15))'}}>
    <rect x="6" y="22" width="43" height="74" rx="5" fill="#5E6338" stroke="#16161A" strokeWidth="2.5" />
    <rect x="6" y="22" width="43" height="16" fill={c} stroke="#16161A" strokeWidth="2.5" />
    <rect x="20" y="8" width="15" height="14" fill="#9DA1A5" stroke="#16161A" strokeWidth="2.5" />
    <path d="M 35 12 Q 52 14 50 34" fill="none" stroke="#9DA1A5" strokeWidth="4" />
    <circle cx="16" cy="9" r="6" fill="none" stroke="#9DA1A5" strokeWidth="2.5" />
  </svg>
);
export const M18: React.FC<{mode: 'four' | 'violet'; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  const cols = [
    {c: '#D23A32', l: 'RED'},
    {c: '#F2C21B', l: 'YELLOW'},
    {c: '#3C9A4B', l: 'GREEN'},
    {c: '#7A45B5', l: 'VIOLET'},
  ];
  if (mode === 'violet')
    return (
      <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
        <div style={{...TILE, width: 460, height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Grenade c="#7A45B5" size={480} />
        </div>
        <div>
          <Big size={110}>VIOLET</Big>
          <div style={{marginTop: 20}}>
            <RedStamp text={'PULLED:\nTOXIC'} f={f} delay={at(ev, 0, 10)} size={80} rotate={-6} />
          </div>
          <div style={{marginTop: 40, opacity: prog(f, at(ev, 1, 60), 6)}}>
            <Big size={70} color="#3C9A4B">SAFE VERSION: 2000s</Big>
          </div>
        </div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 150}}>
        <Big size={90}>M18 COLORED SMOKE</Big>
      </div>
      <div style={{display: 'flex', gap: 60, marginTop: 60}}>
        {cols.map((c, i) => {
          const s = at(ev, i, 10 + i * 10);
          const p = pop(f, s, 11);
          return (
            <div key={c.l} style={{...TILE, width: 300, height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20, opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 60}px)`}}>
              <svg width={300} height={160} style={{position: 'absolute', top: 10}}>
                {Array.from({length: 7}).map((_, k) => (
                  <circle key={k} cx={150 + Math.sin((f + k * 9) / 14) * 24} cy={150 - k * 20 * Math.min(1, Math.max(0, (f - s) / 30))} r={22 + k * 4} fill={c.c} opacity={0.5 - k * 0.05} />
                ))}
              </svg>
              <Grenade c={c.c} size={260} />
              <Big size={52}>{c.l}</Big>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 150, opacity: prog(f, at(ev, 4, 80), 6)}}>
        <Mono size={40} color={C.red}>≈ 1 MINUTE OF SMOKE</Mono>
      </div>
    </AbsoluteFill>
  );
};

/** Single big number with label lines. */
export const Stat: React.FC<{value: string; label: string; sub?: string; item?: number; ev?: number[]}> = ({value, label, sub, item, ev}) => {
  const f = useCurrentFrame();
  const it = item !== undefined ? ITEMS[item] : null;
  const p = pop(f, at(ev, 0, 6), 11);
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 100}}>
      {it && (
        <div style={{transform: `rotate(-6deg) scale(${Math.min(1, pop(f, 0, 12))})`}}>
          <Shell body={it.body} bands={it.bands} size={520} uid="stat" />
        </div>
      )}
      <div>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: value.length > 9 ? 150 : 190, color: C.red, lineHeight: 1, transform: `scale(${0.8 + 0.2 * Math.min(1, p)})`, transformOrigin: 'left', opacity: Math.min(1, p)}}>{value}</div>
        <div style={{opacity: prog(f, at(ev, 0, 6) + 6, 6)}}>
          <Big size={84}>{label}</Big>
        </div>
        {sub && (
          <div style={{marginTop: 14, opacity: prog(f, at(ev, 1, 50), 6)}}>
            <Mono size={38}>{sub}</Mono>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Date + place card with a stamp. */
export const DateCard: React.FC<{date: string; place: string; stamp?: string; item?: number; ev?: number[]}> = ({date, place, stamp, item, ev}) => {
  const f = useCurrentFrame();
  const it = item !== undefined ? ITEMS[item] : null;
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 100}}>
      {it && (
        <div style={{...TILE, width: 460, height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Shell body={it.body} bands={it.bands} size={560} uid="date" />
        </div>
      )}
      <div style={{maxWidth: 1100}}>
        <div style={{opacity: prog(f, 2, 6)}}>
          <Mono size={46} color={C.red}>{date}</Mono>
        </div>
        <div style={{opacity: prog(f, 6, 6), transform: `translateY(${(1 - prog(f, 6, 8)) * 30}px)`}}>
          <Big size={100}>{place}</Big>
        </div>
        {stamp && (
          <div style={{marginTop: 40}}>
            <RedStamp text={stamp} f={f} delay={at(ev, 0, 40)} size={70} rotate={-5} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
