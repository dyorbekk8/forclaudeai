import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import edl from './ammo_edl.json';
import {C, fonts} from '../theme';
import {easeInOut, ease, pop, prog} from '../lib';
import {Paper, RedStamp} from '../components/ui';
import {Bomb, OD, Shell} from '../ammo/assets';

type W = {w: string; f: number};
const YEL = '#F2C21B';
const BLUE = '#86B6E6';
const GRAY = '#8F949B';
const GREEN = '#2F6B3A';
const TILE: React.CSSProperties = {background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.10)'};

/* ---------- captions: groups of 3 words, current word red ---------- */
const Captions: React.FC<{words: W[]}> = ({words}) => {
  const f = useCurrentFrame();
  let cur = 0;
  words.forEach((w, i) => {
    if (f >= w.f) cur = i;
  });
  const g0 = Math.floor(cur / 3) * 3;
  const group = words.slice(g0, g0 + 3);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1380, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16}}>
      {group.map((w, i) => {
        const idx = g0 + i;
        const on = idx === cur;
        return (
          <div key={idx} style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 108, lineHeight: 1.05, textTransform: 'uppercase', color: on ? '#fff' : C.ink, background: on ? C.red : 'transparent', padding: '0 14px', borderRadius: 12, opacity: f >= w.f ? 1 : 0.2, transform: on ? `scale(${1 + 0.08 * (1 - prog(f, w.f, 5))})` : 'none'}}>
            {w.w.replace(/[.,?!:]/g, '')}
          </div>
        );
      })}
    </div>
  );
};

const Head: React.FC<{t: string; red?: string; s?: number}> = ({t, red, s = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 230, textAlign: 'center', opacity: prog(f, s, 5), transform: `translateY(${(1 - prog(f, s, 7)) * 30}px)`}}>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 96, lineHeight: 1, color: C.ink}}>{t}</div>
      {red && <div style={{display: 'inline-block', marginTop: 12, background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 80, padding: '2px 22px', borderRadius: 8}}>{red}</div>}
    </div>
  );
};

/** Upright bomb (nose up) inside a tile. */
const UpBomb: React.FC<{body?: string; bands?: {c: string; x: number; w: number; p?: number}[]; h?: number; uid: string}> = ({body = OD, bands = [], h = 900, uid}) => (
  <div style={{width: h * 0.25, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{transform: 'rotate(-90deg)'}}>
      <Bomb body={body} bands={bands} width={h} uid={uid} />
    </div>
  </div>
);

/* ---------- scenes ---------- */
const S: Record<string, React.FC<any>> = {
  live: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="ONE YELLOW STRIPE" red="= LIVE" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1, pop(f, 0, 12))})`}}>
          <UpBomb bands={[{c: YEL, x: 600, w: 34, p: prog(f, 6, 12, easeInOut)}]} h={860} uid="l1" />
        </div>
      </>
    );
  },
  two: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="SO WHY TWO?" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 120}}>
          <UpBomb bands={[{c: YEL, x: 600, w: 34}]} h={820} uid="t1" />
          <div style={{transform: `scale(${Math.min(1, pop(f, 6, 10))})`}}>
            <UpBomb bands={[{c: YEL, x: 600, w: 34}, {c: YEL, x: 650, w: 34, p: prog(f, 8, 10)}]} h={820} uid="t2" />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 300, color: C.red, opacity: prog(f, 14, 6)}}>?</div>
      </>
    );
  },
  fire: ({ev}: {ev: number[]}) => {
    const f = useCurrentFrame();
    const {durationInFrames: d} = useVideoConfig();
    const boomAt = ev?.[0] ?? Math.round(d * 0.7);
    const clock = Math.min(94, Math.round(interpolate(f, [6, boomAt], [0, 94], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
    const boom = f >= boomAt;
    return (
      <>
        <Head t="JULY 29, 1967" red="USS FORRESTAL" />
        <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 560}}>
          <path d="M 40 430 L 1040 430 L 990 520 L 90 520 Z" fill="#9AA0A6" stroke={C.ink} strokeWidth={5} />
          <rect x={760} y={300} width={100} height={130} fill="#8A9096" stroke={C.ink} strokeWidth={5} />
          {Array.from({length: 22}).map((_, k) => {
            const x = 230 + random(`f${k}`) * 380;
            const h = (70 + random(`h${k}`) * 160) * (0.8 + 0.2 * Math.sin((f + k * 7) / 4)) * prog(f, 0, 14);
            return <path key={k} d={`M ${x - 28} 430 Q ${x} ${430 - h} ${x + 28} 430 Z`} fill={k % 3 ? '#F28C28' : '#E5482E'} />;
          })}
          {boom && <circle cx={420} cy={400} r={Math.min(700, (f - boomAt) * 50)} fill="#FFF1C2" opacity={Math.max(0, 1 - (f - boomAt) / 14)} />}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center'}}>
          <div style={{display: 'inline-block', ...TILE, padding: '6px 40px', fontFamily: fonts.mono, fontWeight: 700, fontSize: 150, color: boom ? C.red : C.ink}}>
            {Math.floor(clock / 60)}:{String(clock % 60).padStart(2, '0')}
          </div>
        </div>
      </>
    );
  },
  bars: () => {
    const f = useCurrentFrame();
    const a = prog(f, 4, 12, easeInOut);
    const b = prog(f, 20, 30, easeInOut);
    const bar = (label: string, h: number, p: number, tag: string, color: string, s: number) => (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 800, opacity: prog(f, s, 6)}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 80, color}}>{tag}</div>
        <div style={{width: 260, height: h * p, background: color, borderRadius: 14, marginTop: 10}} />
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 54, color: C.ink, marginTop: 14, textAlign: 'center', lineHeight: 1}}>{label}</div>
      </div>
    );
    return (
      <>
        <Head t="TIME IN A FIRE" red="BEFORE IT BLOWS" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 120, alignItems: 'flex-end'}}>
          {bar('1967', 90, a, '≈1.5 MIN', C.ink, 2)}
          {bar('COATED', 560, b, '5–10 MIN', '#C99A00', 18)}
        </div>
      </>
    );
  },
  coated: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="TWO YELLOW STRIPES" red="= FIRE-RESISTANT" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center'}}>
          <UpBomb bands={[{c: YEL, x: 600, w: 34}, {c: YEL, x: 650, w: 34}]} h={860} uid="c1" />
        </div>
        <div style={{position: 'absolute', right: 70, top: 900}}>
          <RedStamp text={'BUYS YOU\nTIME'} f={f} delay={10} size={70} rotate={-8} />
        </div>
      </>
    );
  },
  blue: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="BLUE" red="= PRACTICE" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1, pop(f, 0, 12))}) rotate(${3 * Math.sin(f / 20)}deg)`}}>
          <UpBomb body={BLUE} h={800} uid="b1" />
        </div>
      </>
    );
  },
  harmless: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="SO IT'S HARMLESS?" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center'}}>
          <UpBomb body={BLUE} h={800} uid="b2" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 300, color: C.red, opacity: prog(f, 8, 6)}}>?</div>
      </>
    );
  },
  puff: ({ev}: {ev: number[]}) => {
    const f = useCurrentFrame();
    const hit = ev?.[0] ?? 24;
    const fall = prog(f, 0, Math.max(8, hit), (x) => x * x);
    const by = interpolate(fall, [0, 1], [380, 960]);
    const after = Math.max(0, f - hit);
    return (
      <>
        <Head t="SPOTTING CHARGE" red="PUFF OF SMOKE" />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={0} y={1150} width={1080} height={200} fill="#E2DACA" />
          {[300, 200, 110].map((r) => (
            <ellipse key={r} cx={540} cy={1170} rx={r * 1.4} ry={r * 0.25} fill="none" stroke="#C9BFA6" strokeWidth={6} />
          ))}
          {after > 0 &&
            Array.from({length: 14}).map((_, k) => {
              const a = (k / 14) * Math.PI;
              const r = Math.min(1, after / 20) * (130 + random(`r${k}`) * 100);
              return <circle key={k} cx={540 + Math.cos(a) * r * 1.3} cy={1150 - Math.sin(a) * r} r={60 + Math.min(1, after / 20) * 60} fill="#ECEAE4" opacity={Math.max(0, 0.95 - after / 140)} />;
            })}
        </svg>
        {after === 0 && (
          <div style={{position: 'absolute', left: 540 - 60, top: by - 200, transform: 'rotate(180deg)'}}>
            <UpBomb body={BLUE} h={260} uid="b3" />
          </div>
        )}
      </>
    );
  },
  a10: ({ev}: {ev: number[]}) => {
    const f = useCurrentFrame();
    const {durationInFrames: d} = useVideoConfig();
    const hit = ev?.[0] ?? 30;
    const px = interpolate(f, [0, d], [-100, 1000]);
    const after = Math.max(0, f - hit);
    const hx = interpolate(hit, [0, d], [-100, 1000]);
    return (
      <>
        <Head t="JULY 2019" red="BIRD STRIKE" />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={0} y={1000} width={1080} height={340} fill="#E7E1D0" />
          <line x1={0} y1={1000} x2={1080} y2={1000} stroke={C.ink} strokeWidth={5} strokeDasharray="22 14" />
          <text x={40} y={975} fontFamily="Barlow Condensed" fontWeight={800} fontSize={60} fill={C.inkSoft}>GEORGIA</text>
          <text x={40} y={1070} fontFamily="Barlow Condensed" fontWeight={800} fontSize={60} fill={C.inkSoft}>FLORIDA</text>
          <g transform={`translate(${px} 640) scale(2.6)`}>
            <path d="M -70 0 L 70 -6 L 90 0 L 70 6 Z" fill="#6E747A" />
            <path d="M -10 -4 L 20 -60 L 34 -60 L 22 -4 Z M -10 4 L 20 60 L 34 60 L 22 4 Z" fill="#6E747A" />
          </g>
          {f >= hit && f < hit + 8 && <circle cx={px + 230} cy={640} r={80} fill="#fff" stroke={C.red} strokeWidth={8} />}
          {after > 0 &&
            [0, 1, 2].map((k) => (
              <rect key={k} x={hx + k * 70 + after * 4} y={Math.min(1150 + k * 30, 680 + after * after * 0.5)} width={90} height={30} rx={15} fill={BLUE} stroke="#2C4D70" strokeWidth={3} />
            ))}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: prog(f, (ev?.[1] ?? 60), 6)}}>
          <span style={{background: C.ink, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 60, padding: '6px 20px', borderRadius: 8}}>3 PRACTICE BOMBS DROPPED</span>
        </div>
      </>
    );
  },
  rules: ({ev}: {ev: number[]}) => {
    const f = useCurrentFrame();
    const items = ["DON'T APPROACH IT", 'CALL IT IN'];
    return (
      <>
        <Head t="THE AIR FORCE'S ADVICE" />
        <div style={{position: 'absolute', left: 90, top: 560}}>
          {items.map((t, i) => {
            const s = ev?.[i] ?? 10 + i * 20;
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 60, opacity: prog(f, s, 6), transform: `translateX(${(1 - prog(f, s, 8)) * 60}px)`}}>
                <div style={{width: 130, height: 130, borderRadius: 20, background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 90}}>{i + 1}</div>
                <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 100, color: C.ink}}>{t}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  },
  gray: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="THE STRIPE YOU" red="NEVER WANT TO SEE" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1, pop(f, 0, 12))})`}}>
          <Shell body={GRAY} bands={[{c: GREEN, broken: true}]} size={820} bandP={prog(f, 6, 14)} uid="g1" />
        </div>
      </>
    );
  },
  meaning: ({ev}: {ev: number[]}) => {
    const f = useCurrentFrame();
    const s1 = ev?.[0] ?? 20;
    return (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'center'}}>
          <Shell body={GRAY} bands={f >= s1 ? [{c: GREEN}] : []} size={760} bandP={prog(f, s1, 8)} uid="g2" />
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: prog(f, 2, 6)}}>
              <div style={{width: 90, height: 60, background: GRAY, borderRadius: 8, border: `3px solid ${C.ink}`}} />
              <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 80}}>CHEMICAL</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 50, opacity: prog(f, s1, 6)}}>
              <div style={{width: 90, height: 60, background: GREEN, borderRadius: 8, border: `3px solid ${C.ink}`}} />
              <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 80}}>TOXIC</div>
            </div>
          </div>
        </div>
      </>
    );
  },
  binary: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="BROKEN GREEN BAND" red="BINARY NERVE AGENT" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
          <Shell body={GRAY} bands={[{c: GREEN, broken: true}]} size={780} bandP={prog(f, 4, 14)} uid="g3" />
        </div>
      </>
    );
  },
  ab: () => {
    const f = useCurrentFrame();
    const mix = prog(f, 30, 24, easeInOut);
    return (
      <>
        <Head t="STORED APART" red="MIX ONLY AFTER FIRING" />
        <svg width={1080} height={800} style={{position: 'absolute', top: 560}}>
          <rect x={90 + 200 * mix} y={160} width={300} height={360} rx={26} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <rect x={690 - 200 * mix} y={160} width={300} height={360} rx={26} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <text x={240 + 200 * mix} y={390} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={170} fill={C.ink}>A</text>
          <text x={840 - 200 * mix} y={390} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={170} fill={C.ink}>B</text>
          {mix > 0.95 && <circle cx={540} cy={340} r={140 + 12 * Math.sin(f / 3)} fill={GREEN} opacity={0.35} />}
        </svg>
      </>
    );
  },
  date: () => {
    const f = useCurrentFrame();
    return (
      <>
        <Head t="JULY 7, 2023" red="KENTUCKY" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
          <div style={{filter: `grayscale(${prog(f, 20, 20)})`, opacity: 1 - 0.5 * prog(f, 20, 20)}}>
            <Shell body={GRAY} bands={[{c: GREEN, broken: true}]} size={460} uid="g4" />
          </div>
          <RedStamp text={'LAST DECLARED U.S.\nCHEMICAL WEAPON\nDESTROYED'} f={f} delay={24} size={64} rotate={-5} />
        </div>
      </>
    );
  },
};

const Shot: React.FC<{children: React.ReactNode; first: boolean; dur: number}> = ({children, first, dur}) => {
  const f = useCurrentFrame();
  const inP = first ? 1 : prog(f, 0, 5);
  const z = first ? interpolate(f, [0, 8], [1.25, 1], {extrapolateRight: 'clamp', easing: ease}) : 1.08 - 0.08 * inP;
  return <AbsoluteFill style={{opacity: inP, filter: inP < 0.95 ? `blur(${10 * (1 - inP)}px)` : undefined, transform: `scale(${z * (1 + 0.03 * (f / Math.max(1, dur)))})`}}>{children}</AbsoluteFill>;
};

type Sh = {id: string; scene: string; props: any; from: number; dur: number; words: W[]};
export const ShortAmmo: React.FC<{which: string}> = ({which}) => {
  const f = useCurrentFrame();
  const all = (edl as any)[which] as {total: number; title: string; shots: Sh[]};
  return (
    <Paper>
      {all.shots.map((s, i) => {
        const Comp = S[s.scene];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur + 5}>
            <Shot first={i === 0} dur={s.dur}>
              <Paper>
                <Comp {...s.props} />
                <Captions words={s.words} />
              </Paper>
            </Shot>
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: OD, color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 40, letterSpacing: 3, padding: '10px 26px', borderRadius: 6}}>MILITARY AMMO COLORS</div>
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 14, width: `${(f / all.total) * 100}%`, background: C.red}} />
    </Paper>
  );
};
