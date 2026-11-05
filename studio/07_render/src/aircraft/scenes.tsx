import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {RedStamp} from '../components/ui';
import {Kind, Plane, SHORT, SLOTS, SLOT_COLORS} from './assets';

const at = (ev: number[] | undefined, i: number, fb = 0) => (ev && ev[i] !== undefined ? ev[i] : fb);
const TILE: React.CSSProperties = {background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 22, boxShadow: '0 18px 40px rgba(0,0,0,0.08)'};
const NAVY = '#1F2A44';
const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 90, color = C.ink, style}) => (
  <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: size, lineHeight: 1.02, color, ...style}}>{children}</div>
);
const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 32, color = C.inkSoft}) => (
  <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: size, color, letterSpacing: 2}}>{children}</div>
);

/* ---------- HUD ---------- */
export const HUD: React.FC<{step: number}> = ({step}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 40, top: 30, background: NAVY, color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '8px 18px', borderRadius: 4}}>
        EVERY LETTER IN A MILITARY AIRCRAFT NAME
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 24, display: 'flex', gap: 8}}>
        {SHORT.map((s, i) => {
          const on = i === step || (step === 6 && true);
          return (
            <div key={s} style={{padding: '6px 12px', borderRadius: 6, background: on ? SLOT_COLORS[i] : '#E7E3D8', color: on ? '#fff' : C.inkFaint, fontFamily: fonts.mono, fontWeight: 700, fontSize: 18, transform: i === step ? `translateY(${-3 + 2 * Math.sin(f / 6)}px)` : 'none'}}>
              {s}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- the designation builder ---------- */
type CodeP = {code: string[]; focus?: number; plane?: Kind; planeColor?: string; caption?: string; sub?: string; ev?: number[]; order?: number[]; labels?: boolean; pull?: boolean};
export const Code: React.FC<CodeP> = ({code, focus = -1, plane, planeColor, caption, sub, ev, order, labels = true, pull}) => {
  const f = useCurrentFrame();
  // match-move: start close on the focus slot, pull back to reveal the whole name (the slot bar is our 'map')
  const CX = [448, 622, 796, 970, 1263, 1472];
  const cy = (plane ? 520 : 360) + 115;
  const z = pull && focus >= 0 ? interpolate(f, [0, 26], [2.8, 1], {extrapolateRight: 'clamp', easing: easeInOut}) : 1;
  const origin = pull && focus >= 0 ? `${CX[focus]}px ${cy}px` : '50% 50%';
  const ord = order ?? code.map((_, i) => i);
  const appear = (i: number) => {
    const k = ord.indexOf(i);
    return at(ev, k, 6 + k * 6);
  };
  const filled = code.map((c, i) => (c ? 1 : 0));
  const dash = code.findIndex((_, i) => i === 4);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: origin}}>
      {plane && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - Math.min(1, pop(f, 0, 12))) * 60}px)`, opacity: prog(f, 0, 6)}}>
          <Plane kind={plane} size={360} color={planeColor} rotate={-90 + 4 * Math.sin(f / 30)} />
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: plane ? 520 : 360, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 14}}>
        {code.map((c, i) => {
          const s = appear(i);
          const p = c ? Math.min(1, pop(f, s, 10)) : 0;
          const on = focus === i;
          return (
            <React.Fragment key={i}>
              {i === dash && <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 190, lineHeight: '230px', color: C.ink, opacity: prog(f, 4, 6)}}>-</div>}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <div
                  style={{
                    minWidth: i === 4 ? 230 : 160,
                    height: 230,
                    padding: '0 16px',
                    borderRadius: 20,
                    border: c ? `6px solid ${on ? SLOT_COLORS[i] : C.ink}` : `5px dashed ${C.tileBorder}`,
                    background: c ? (on ? SLOT_COLORS[i] : '#fff') : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: c ? '0 16px 30px rgba(0,0,0,0.10)' : 'none',
                    transform: on ? `scale(${1.04 + 0.02 * Math.sin(f / 8)})` : 'none',
                  }}
                >
                  <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 190, color: on ? '#fff' : C.ink, transform: `translateY(${(1 - p) * -80}px) scale(${0.6 + 0.4 * p})`, opacity: p}}>{c}</div>
                </div>
                {labels && (
                  <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 20, color: on ? SLOT_COLORS[i] : filled[i] ? C.inkSoft : C.tileBorder, textAlign: 'center', width: 170, opacity: prog(f, 2, 6)}}>
                    {SLOTS[i]}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {caption && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: prog(f, at(ev, ord.length, 30), 6), transform: `translateY(${(1 - prog(f, at(ev, ord.length, 30), 8)) * 30}px)`}}>
          <span style={{background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 70, padding: '4px 24px', borderRadius: 8}}>{caption}</span>
          {sub && (
            <div style={{marginTop: 14}}>
              <Mono size={30}>{sub}</Mono>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- F-35 should be F-24 ---------- */
export const Cross: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s1 = at(ev, 0, 30);
  const strike = prog(f, s1, 8);
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
      <div style={{transform: `scale(${Math.min(1, pop(f, 0, 12))})`}}>
        <Plane kind="fighter" size={560} rotate={-90 + 3 * Math.sin(f / 25)} />
      </div>
      <div>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <Big size={260}>F-35</Big>
          <div style={{position: 'absolute', left: -10, top: '52%', height: 18, width: `${strike * 110}%`, background: C.red, transform: 'rotate(-8deg)', borderRadius: 9}} />
        </div>
        <div style={{opacity: prog(f, s1 + 6, 6), transform: `translateX(${(1 - prog(f, s1 + 6, 8)) * 40}px)`}}>
          <Big size={200} color={C.red}>F-24?</Big>
          <Mono size={34}>THE NEXT NUMBER IN LINE</Mono>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- same jet, two names ---------- */
export const Versus: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s1 = at(ev, 0, 10);
  const s2 = at(ev, 1, 40);
  const merge = prog(f, at(ev, 2, 999), 20, easeInOut);
  const card = (who: string, name: string, s: number, dx: number) => (
    <div style={{...TILE, width: 560, height: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: prog(f, s, 6) * (1 - merge * 0.85), transform: `translateX(${dx * merge}px) scale(${0.9 + 0.1 * Math.min(1, pop(f, s, 12))})`}}>
      <Mono size={34} color={C.red}>{who}</Mono>
      <Plane kind="fighter" size={330} rotate={-90} />
      <Big size={120}>{name}</Big>
    </div>
  );
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
      {card('NAVY', 'F4H', s1, 340)}
      {card('AIR FORCE', 'F-110', s2, -340)}
      {merge > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: merge}}>
          <div style={{...TILE, width: 620, height: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderColor: C.red, borderWidth: 6}}>
            <Mono size={34} color={C.red}>1962 · ONE SYSTEM</Mono>
            <Plane kind="fighter" size={360} rotate={-90} />
            <Big size={150}>F-4</Big>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- letter tiles with silhouettes ---------- */
type LT = {l: string; m: string; kind?: Kind; dim?: boolean};
export const Letters: React.FC<{items: LT[]; title?: string; color?: string; ev?: number[]}> = ({items, title, color = C.red, ev}) => {
  const f = useCurrentFrame();
  const n = items.length;
  const cols = n <= 4 ? n : n <= 6 ? 3 : 4;
  const w = n <= 4 ? 380 : 330;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {title && (
        <div style={{position: 'absolute', top: 120, opacity: prog(f, 0, 6)}}>
          <Mono size={36} color={color}>{title}</Mono>
        </div>
      )}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap: 26, marginTop: 50}}>
        {items.map((it, i) => {
          const s = at(ev, i, 8 + i * 10);
          const p = Math.min(1, pop(f, s, 11));
          return (
            <div key={it.l + i} style={{...TILE, height: n <= 4 ? 500 : 330, display: 'flex', flexDirection: n <= 4 ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16, opacity: p * (it.dim ? 0.45 : 1), transform: `translateY(${(1 - p) * 50}px)`}}>
              <div style={{width: 120, height: 120, borderRadius: 18, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 100}}>{it.l}</div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: n <= 4 ? 'center' : 'flex-start'}}>
                {it.kind && <Plane kind={it.kind} size={n <= 4 ? 200 : 120} rotate={-90} />}
                <Big size={n <= 4 ? 56 : 44} style={{textAlign: n <= 4 ? 'center' : 'left'}}>{it.m}</Big>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- one airframe, many jobs ---------- */
const JOBS = [
  {p: 'AC', m: 'GUNSHIP', c: '#D7262E'},
  {p: 'HC', m: 'RESCUE', c: '#E07A1F'},
  {p: 'MC', m: 'SPECIAL OPERATIONS', c: '#16161A'},
  {p: 'EC', m: 'ELECTRONIC WARFARE', c: '#7A5BC4'},
  {p: 'KC', m: 'TANKER', c: '#2F6FD1'},
];
export const Morph: React.FC<{ev?: number[]; base?: boolean}> = ({ev, base}) => {
  const f = useCurrentFrame();
  const cur = base ? -1 : JOBS.reduce((a, _, i) => (f >= at(ev, i, 10 + i * 24) ? i : a), -1);
  const j = cur >= 0 ? JOBS[cur] : null;
  const since = cur >= 0 ? f - at(ev, cur, 10 + cur * 24) : f;
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 100}}>
      <div style={{...TILE, width: 640, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: j ? j.c : C.tileBorder, borderWidth: j ? 6 : 3}}>
        <Plane kind="cargo" size={520} rotate={-90} color={j ? j.c : '#5E6670'} />
      </div>
      <div>
        <div style={{display: 'flex', alignItems: 'baseline'}}>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 240, color: j ? j.c : C.ink, transform: `scale(${j ? 0.85 + 0.15 * Math.min(1, pop(f, f - since, 9)) : 1})`, transformOrigin: 'right'}}>{j ? j.p[0] : ''}</div>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 240, color: C.ink}}>C-130</div>
        </div>
        <Big size={90} color={j ? j.c : C.inkSoft}>{j ? j.m : 'CARGO'}</Big>
        <div style={{display: 'flex', gap: 10, marginTop: 30}}>
          {JOBS.map((x, i) => (
            <div key={x.p} style={{padding: '6px 14px', borderRadius: 8, background: i <= cur ? x.c : '#E7E3D8', color: i <= cur ? '#fff' : C.inkFaint, fontFamily: fonts.label, fontWeight: 800, fontSize: 40}}>{x.p}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- dated story card ---------- */
export const Story: React.FC<{date: string; head: string; sub?: string; stamp?: string; plane?: Kind; planeColor?: string; ev?: number[]}> = ({date, head, sub, stamp, plane, planeColor, ev}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 90}}>
      {plane && (
        <div style={{...TILE, width: 560, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * Math.min(1, pop(f, 0, 12))})`}}>
          <Plane kind={plane} size={440} rotate={-90 + 3 * Math.sin(f / 28)} color={planeColor} />
        </div>
      )}
      <div style={{maxWidth: 1000}}>
        <div style={{opacity: prog(f, 2, 6)}}>
          <Mono size={44} color={C.red}>{date}</Mono>
        </div>
        <div style={{opacity: prog(f, 6, 6), transform: `translateY(${(1 - prog(f, 6, 8)) * 30}px)`}}>
          <Big size={96}>{head}</Big>
        </div>
        {sub && (
          <div style={{marginTop: 18, opacity: prog(f, at(ev, 0, 30), 6)}}>
            <Mono size={34}>{sub}</Mono>
          </div>
        )}
        {stamp && (
          <div style={{marginTop: 36}}>
            <RedStamp text={stamp} f={f} delay={at(ev, 1, 50)} size={72} rotate={-5} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- series letters: I and O skipped ---------- */
export const SeriesRow: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const L = 'ABCDEFGHIJKLMNOP'.split('');
  const s1 = at(ev, 0, 40);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: 1500, justifyContent: 'center'}}>
        {L.map((l, i) => {
          const skip = l === 'I' || l === 'O';
          const p = Math.min(1, pop(f, 4 + i * 2, 11));
          return (
            <div key={l} style={{width: 150, height: 170, ...TILE, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, borderColor: skip && f >= s1 ? C.red : C.tileBorder}}>
              <Big size={110} color={skip && f >= s1 ? C.red : C.ink}>{l}</Big>
              {skip && f >= s1 && <div style={{position: 'absolute', width: `${prog(f, s1, 6) * 120}%`, height: 12, background: C.red, transform: 'rotate(-30deg)', borderRadius: 6}} />}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 160, opacity: prog(f, s1 + 6, 6)}}>
        <Big size={70}>
          I <span style={{color: C.inkFaint}}>≠</span> 1 · O <span style={{color: C.inkFaint}}>≠</span> 0
        </Big>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- rule breakers board ---------- */
type RB = {name: string; why: string; kind: Kind};
export const Breakers: React.FC<{items: RB[]; ev?: number[]}> = ({items, ev}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, items.length)}, 520px)`, gap: 30}}>
        {items.map((it, i) => {
          const s = at(ev, i, 6 + i * 10);
          const p = Math.min(1, pop(f, s, 11));
          return (
            <div key={it.name} style={{...TILE, height: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
              <Plane kind={it.kind} size={180} rotate={-90} />
              <Big size={80}>{it.name}</Big>
              <Mono size={24} color={C.red}>{it.why}</Mono>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- missile designation: LAUNCH · MISSION · TYPE - NUMBER SERIES ---------- */
const MLAB = ['LAUNCHED FROM', 'MISSION', 'VEHICLE TYPE', 'DESIGN NUMBER', 'SERIES'];
const MCOL = ['#2F6FD1', '#D7262E', '#16161A', '#16161A', '#2E9E4F'];
export const Missile: React.FC<{size?: number}> = ({size = 900}) => (
  <svg width={size} height={size * 0.16} viewBox="0 0 500 80" style={{overflow: 'visible', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.15))'}}>
    <path d="M 40 30 L 420 30 Q 480 40 420 50 L 40 50 Z" fill="#E9E6DE" stroke="#16161A" strokeWidth={3} />
    <path d="M 40 30 L 10 6 L 30 6 L 70 30 Z M 40 50 L 10 74 L 30 74 L 70 50 Z" fill="#9AA0A6" stroke="#16161A" strokeWidth={3} />
    <path d="M 300 30 L 330 14 L 344 14 L 330 30 Z M 300 50 L 330 66 L 344 66 L 330 50 Z" fill="#9AA0A6" stroke="#16161A" strokeWidth={3} />
    <rect x={380} y={30} width={10} height={20} fill="#F2C21B" />
  </svg>
);
export const MCode: React.FC<{code: string[]; focus?: number; caption?: string; ev?: number[]; order?: number[]}> = ({code, focus = -1, caption, ev, order}) => {
  const f = useCurrentFrame();
  const ord = order ?? code.map((_, i) => i);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', transform: `translateX(${interpolate(f, [0, 300], [-30, 30])}px)`, opacity: prog(f, 0, 8)}}>
        <Missile size={980} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 14}}>
        {code.map((c, i) => {
          const s = at(ev, ord.indexOf(i), 6 + ord.indexOf(i) * 6);
          const p = c ? Math.min(1, pop(f, s, 10)) : 0;
          const on = focus === i;
          return (
            <React.Fragment key={i}>
              {i === 3 && <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 190, lineHeight: '230px', color: C.ink}}>-</div>}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <div style={{minWidth: i === 3 ? 230 : 170, height: 230, padding: '0 16px', borderRadius: 20, border: c ? `6px solid ${on ? MCOL[i] : C.ink}` : `5px dashed ${C.tileBorder}`, background: c ? (on ? MCOL[i] : '#fff') : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: c ? '0 16px 30px rgba(0,0,0,0.10)' : 'none'}}>
                  <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 190, color: on ? '#fff' : C.ink, transform: `translateY(${(1 - p) * -60}px)`, opacity: p}}>{c}</div>
                </div>
                <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 20, color: on ? MCOL[i] : C.inkSoft, width: 180, textAlign: 'center'}}>{MLAB[i]}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {caption && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', opacity: prog(f, at(ev, ord.length, 30), 8)}}>
          <span style={{background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 64, padding: '4px 24px', borderRadius: 8}}>{caption}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
