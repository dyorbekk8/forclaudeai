/* v2 visual layer for the presidential-protection video: real photos with tracked callouts,
   dark tactical radar / map scenes, slam layer cards, kinetic type, film grade. */
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {ease, easeInOut, pop, prog} from '../lib';
import {LAYERS} from './scenes';

const at = (ev: number[] | undefined, i: number, fb = 0) => (ev && ev[i] !== undefined ? ev[i] : fb);
export const NAVY = '#0E1626';
const SCOPE = '#071019';
const GREEN = '#41E28A';
const CYAN = '#7FD3FF';

/* ---------- film grade: grain + vignette (drawn over everything) ---------- */
export const Grade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.11, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 9} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.30) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ---------- headline chip / highlighted words ---------- */
type Line = {t: string; red?: boolean};
const Words: React.FC<{line: Line; start: number; size: number; dark: boolean; align?: 'left' | 'center'}> = ({line, start, size, dark, align = 'left'}) => {
  const f = useCurrentFrame();
  const words = line.t.split(' ');
  const box = prog(f, start, 7, ease);
  return (
    <div style={{position: 'relative', display: 'inline-block', padding: line.red ? '0 18px' : 0, marginBottom: 8}}>
      {line.red && <div style={{position: 'absolute', inset: '6% 0 4% 0', background: C.red, transformOrigin: 'left', transform: `scaleX(${box})`, borderRadius: 4}} />}
      <div style={{position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.22}px`}}>
        {words.map((w, i) => {
          const s = start + i * 2;
          const p = pop(f, s, 11, 0.6);
          return (
            <span
              key={i}
              style={{
                fontFamily: fonts.label,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1.04,
                color: line.red ? '#fff' : dark ? '#fff' : C.ink,
                opacity: Math.min(1, prog(f, s, 3)),
                transform: `translateY(${(1 - Math.min(1, p)) * 40}px) scale(${0.8 + 0.2 * p})`,
                display: 'inline-block',
                textShadow: dark && !line.red ? '0 4px 30px rgba(0,0,0,0.55)' : 'none',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- full-bleed photo, Ken Burns, callouts that track the image ---------- */
type Callout = {u: number; v: number; l: string; e?: number; dx?: number; dy?: number; ring?: number};
export const PhotoShot: React.FC<{
  src: string;
  w: number;
  h: number;
  credit: string;
  focus?: [number, number];
  zoom?: [number, number];
  pan?: [number, number];
  kicker?: string;
  tag?: string;
  lines?: Line[];
  callouts?: Callout[];
  pos?: 'bl' | 'tl' | 'c';
  flash?: boolean;
  bw?: boolean;
  ev?: number[];
}> = ({src, w, h, credit, focus = [50, 50], zoom = [1.05, 1.18], pan = [0, 0], kicker, tag, lines = [], callouts = [], pos = 'bl', flash, bw, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const t = interpolate(f, [0, d], [0, 1], {easing: easeInOut});
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  const s = Math.max(1920 / w, 1080 / h);
  const dw = w * s;
  const dh = h * s;
  const ox = (1920 - dw) * (focus[0] / 100);
  const oy = (1080 - dh) * (focus[1] / 100);
  const px = pan[0] * t;
  const py = pan[1] * t;
  const nl = lines.length;
  const textPos: React.CSSProperties =
    pos === 'c' ? {left: 0, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'} : pos === 'tl' ? {left: 90, top: 150, maxWidth: 1300} : {left: 90, bottom: 120, maxWidth: 1400};
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${px}px, ${py}px) scale(${z})`, transformOrigin: `${focus[0]}% ${focus[1]}%`}}>
        <Img
          src={staticFile(`photos/potus/${src}`)}
          style={{position: 'absolute', left: ox, top: oy, width: dw, height: dh, filter: `contrast(1.12) saturate(${bw ? 0 : 0.82}) brightness(0.92)`}}
        />
        {callouts.map((c, i) => {
          const st = at(ev, c.e ?? -1, 8 + i * 10);
          const p = pop(f, st, 12);
          const x = ox + c.u * dw;
          const y = oy + c.v * dh;
          const r = c.ring ?? 70;
          const dx = c.dx ?? 140;
          const dy = c.dy ?? -120;
          const lp = prog(f, st + 3, 8);
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: Math.min(1, prog(f, st, 3))}}>
              <svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
                <circle cx={x} cy={y} r={r * Math.min(1.15, p)} fill="none" stroke={C.red} strokeWidth={7 / z} />
                <circle cx={x} cy={y} r={r * (1 + 0.5 * ((f - st) % 30) / 30)} fill="none" stroke={C.red} strokeWidth={3} opacity={0.5 * (1 - ((f - st) % 30) / 30)} />
                <line x1={x + Math.sign(dx) * r * 0.72} y1={y + Math.sign(dy) * r * 0.72} x2={x + Math.sign(dx) * r * 0.72 + (dx - Math.sign(dx) * r * 0.72) * lp} y2={y + Math.sign(dy) * r * 0.72 + (dy - Math.sign(dy) * r * 0.72) * lp} stroke={C.red} strokeWidth={5} />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  left: x + dx,
                  top: y + dy,
                  transform: `translate(${dx < 0 ? '-100%' : '0'}, -50%) scale(${Math.min(1, prog(f, st + 8, 6))})`,
                  transformOrigin: dx < 0 ? 'right center' : 'left center',
                  background: '#fff',
                  color: C.ink,
                  fontFamily: fonts.label,
                  fontWeight: 800,
                  fontSize: 44,
                  letterSpacing: 1,
                  padding: '6px 18px',
                  borderRadius: 6,
                  borderLeft: `8px solid ${C.red}`,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                }}
              >
                {c.l}
              </div>
            </div>
          );
        })}
      </div>
      {nl > 0 && (
        <AbsoluteFill
          style={{
            background:
              pos === 'c'
                ? 'rgba(6,10,18,0.55)'
                : pos === 'tl'
                  ? 'linear-gradient(180deg, rgba(6,10,18,0.78) 0%, rgba(6,10,18,0.15) 55%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(0deg, rgba(6,10,18,0.85) 0%, rgba(6,10,18,0.25) 50%, rgba(0,0,0,0) 75%)',
            opacity: prog(f, 0, 6),
          }}
        />
      )}
      <div style={{position: 'absolute', ...textPos}}>
        {kicker && (
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: '#FF5A60', letterSpacing: 4, marginBottom: 14, opacity: prog(f, 2, 6)}}>{kicker}</div>
        )}
        {lines.map((l, i) => (
          <div key={i}>
            <Words line={l} start={at(ev, i, 4 + i * 8)} size={nl > 2 ? 104 : 124} dark align={pos === 'c' ? 'center' : 'left'} />
          </div>
        ))}
      </div>
      {tag && (
        <div style={{position: 'absolute', left: 40, top: 92, background: 'rgba(8,12,20,0.82)', color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, padding: '8px 14px', borderLeft: `6px solid ${C.red}`, opacity: prog(f, 4, 6)}}>
          {tag}
        </div>
      )}
      <div style={{position: 'absolute', right: 22, bottom: 104, fontFamily: fonts.body, fontSize: 17, color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', maxWidth: 900, textAlign: 'right'}}>{credit}</div>
      {flash && <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(f, 0, 7)}} />}
    </AbsoluteFill>
  );
};

/* ---------- kinetic type on dark / blurred-photo backdrop ---------- */
export const Kinetic: React.FC<{lines: Line[]; kicker?: string; bg?: string; ev?: number[]; size?: number}> = ({lines, kicker, bg, ev, size}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const longest = Math.max(...lines.map((l) => l.t.length));
  const sz = size ?? Math.min(170, Math.round(1560 / (longest * 0.56)));
  const z = interpolate(f, [0, d], [1.12, 1.22]);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      {bg ? (
        <Img src={staticFile(`photos/potus/${bg}`)} style={{position: 'absolute', width: 1920, height: 1080, objectFit: 'cover', filter: 'blur(14px) saturate(0.6) brightness(0.38)', transform: `scale(${z})`}} />
      ) : (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.5}}>
          {Array.from({length: 7}).map((_, i) => (
            <circle key={i} cx={960} cy={540} r={(160 + i * 170) * (1 + 0.04 * Math.sin((f + i * 12) / 30))} fill="none" stroke="#22324D" strokeWidth={2} strokeDasharray={i === 6 ? '18 12' : undefined} />
          ))}
        </svg>
      )}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '0 120px'}}>
        {kicker && <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 36, color: '#FF5A60', letterSpacing: 5, marginBottom: 20, opacity: prog(f, 0, 6)}}>{kicker}</div>}
        {lines.map((l, i) => (
          <div key={i}>
            <Words line={l} start={at(ev, i, 2 + i * 8)} size={sz} dark align="center" />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- LAYER 0X slam card ---------- */
export const LayerCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const zoomIn = interpolate(f, [0, 12], [2.4, 1], {extrapolateRight: 'clamp', easing: ease});
  const drift = interpolate(f, [0, d], [0, 60]);
  const name = LAYERS[i].replace('THE ', '');
  const bar = prog(f, 8, 8);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(1450 540) scale(${zoomIn})`}>
          {LAYERS.map((_, k) => (
            <circle key={k} r={900 - k * 105} fill="none" stroke={k === i ? C.red : '#22324D'} strokeWidth={k === i ? 10 : 3} strokeDasharray={k === 0 ? '24 14' : undefined} />
          ))}
          <circle r={48} fill="#fff" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 60 + drift, top: 90, fontFamily: fonts.label, fontWeight: 800, fontSize: 900, lineHeight: 1, color: 'transparent', WebkitTextStroke: '4px rgba(255,255,255,0.14)', opacity: prog(f, 2, 6)}}>
        {String(i + 1).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: 150, top: 380}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: '#FF5A60', opacity: prog(f, 4, 5), transform: `translateX(${(1 - prog(f, 4, 8)) * -60}px)`}}>
          LAYER {String(i + 1).padStart(2, '0')} / 08
        </div>
        <div style={{overflow: 'hidden'}}>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 250, lineHeight: 1, color: '#fff', transform: `translateY(${(1 - prog(f, 6, 9)) * 105}%)`}}>{name}</div>
        </div>
        <div style={{height: 16, width: 520, background: C.red, transformOrigin: 'left', transform: `scaleX(${bar})`, marginTop: 10}} />
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: 0.85 * (1 - prog(f, 0, 5))}} />
    </AbsoluteFill>
  );
};

/* ---------- dark radar scope: airspace rings, intruders, intercept, count ---------- */
const Blip: React.FC<{x: number; y: number; c: string; a: number; size?: number}> = ({x, y, c, a, size = 12}) => (
  <g opacity={a}>
    <circle cx={x} cy={y} r={size * 2.2} fill={c} opacity={0.18} />
    <circle cx={x} cy={y} r={size} fill={c} />
  </g>
);
export const Radar: React.FC<{stage: 'outer' | 'diam' | 'inner' | 'intercept' | 'count'; ev?: number[]}> = ({stage, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const cx = 960;
  const cy = 560;
  const RO = 420;
  const RI = 150;
  const sweep = (f * 5) % 360;
  const glow = (bx: number, by: number) => {
    const ang = ((Math.atan2(by - cy, bx - cx) * 180) / Math.PI + 450) % 360;
    const behind = (sweep - ang + 360) % 360;
    return 0.35 + 0.65 * Math.max(0, 1 - behind / 200);
  };
  const outerP = prog(f, 0, 20, easeInOut);
  const innerStart = stage === 'inner' ? at(ev, 0, 10) : 0;
  const innerP = stage === 'outer' || stage === 'diam' ? 0 : prog(f, innerStart, 16, easeInOut);
  const cam = interpolate(f, [0, d], [1, stage === 'count' ? 1.0 : 1.06]);
  // background traffic
  const traffic = Array.from({length: 14}).map((_, k) => {
    const a0 = random(`a${k}`) * Math.PI * 2;
    const r0 = 520 + random(`r${k}`) * 380;
    const v = 0.0016 * (random(`v${k}`) > 0.5 ? 1 : -1);
    const a = a0 + v * f;
    return {x: cx + Math.cos(a) * r0 * 1.25, y: cy + Math.sin(a) * r0 * 0.75};
  });
  // intruder + interceptor
  const iT = stage === 'intercept' ? prog(f, 0, Math.max(30, at(ev, 1, 60)), (x) => x) : 0;
  const ix = interpolate(iT, [0, 1], [cx - 760, cx - 330]);
  const iy = interpolate(iT, [0, 1], [cy - 300, cy - 140]);
  const inside = stage === 'intercept' && Math.hypot(ix - cx, iy - cy) < RO;
  const jT = stage === 'intercept' ? prog(f, at(ev, 1, 60), 26, ease) : 0;
  const jx = interpolate(jT, [0, 1], [cx + 820, ix + 46]);
  const jy = interpolate(jT, [0, 1], [cy + 320, iy - 30]);
  // count
  const nCount = stage === 'count' ? Math.floor(40 * prog(f, at(ev, 0, 20), 46, (x) => x)) : 0;
  return (
    <AbsoluteFill style={{background: SCOPE, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="rgrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#10283A" strokeWidth="2" />
          </pattern>
          <radialGradient id="rglow">
            <stop offset="0%" stopColor="#0F3A4A" stopOpacity="0.9" />
            <stop offset="100%" stopColor={SCOPE} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#rgrid)" />
        <g transform={`translate(${cx} ${cy}) scale(${cam}) translate(${-cx} ${-cy})`}>
          <circle cx={cx} cy={cy} r={760} fill="url(#rglow)" />
          {[200, 330, 560, 700].map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#14384A" strokeWidth={2} />
          ))}
          <line x1={cx - 800} x2={cx + 800} y1={cy} y2={cy} stroke="#14384A" strokeWidth={2} />
          <line x1={cx} x2={cx} y1={cy - 560} y2={cy + 560} stroke="#14384A" strokeWidth={2} />
          {traffic.map((b, k) => (
            <Blip key={k} x={b.x} y={b.y} c={CYAN} a={glow(b.x, b.y) * 0.8} size={7} />
          ))}
          {/* outer ring */}
          <circle cx={cx} cy={cy} r={RO} fill={`rgba(215,38,46,${0.1 * outerP})`} stroke={C.red} strokeWidth={6} strokeDasharray="28 16" pathLength={1000} style={{strokeDashoffset: 0}} opacity={outerP} transform={`rotate(${f * 0.2} ${cx} ${cy})`} />
          {/* inner ring */}
          {innerP > 0 && <circle cx={cx} cy={cy} r={RI * innerP} fill="rgba(215,38,46,0.28)" stroke={C.red} strokeWidth={8} />}
          {/* diameter arrow */}
          {stage === 'diam' && (
            <g opacity={prog(f, 10, 8)}>
              <line x1={cx - RO * prog(f, 10, 16)} x2={cx + RO * prog(f, 10, 16)} y1={cy} y2={cy} stroke="#fff" strokeWidth={5} />
              <line x1={cx - RO} x2={cx - RO} y1={cy - 24} y2={cy + 24} stroke="#fff" strokeWidth={5} />
              <line x1={cx + RO} x2={cx + RO} y1={cy - 24} y2={cy + 24} stroke="#fff" strokeWidth={5} />
            </g>
          )}
          {/* sweep */}
          <g transform={`rotate(${sweep} ${cx} ${cy})`}>
            <path d={`M ${cx} ${cy} L ${cx} ${cy - 760} A 760 760 0 0 0 ${cx - 760 * Math.sin(0.55)} ${cy - 760 * Math.cos(0.55)} Z`} fill={GREEN} opacity={0.1} />
            <line x1={cx} y1={cy} x2={cx} y2={cy - 760} stroke={GREEN} strokeWidth={3} opacity={0.7} />
          </g>
          {stage === 'intercept' && (
            <>
              <Blip x={ix} y={iy} c={inside ? C.red : '#FFC24A'} a={1} size={13} />
              {inside && <circle cx={ix} cy={iy} r={40 + 20 * Math.sin(f / 3)} fill="none" stroke={C.red} strokeWidth={4} />}
              {jT > 0 && (
                <g>
                  <line x1={interpolate(jT, [0, 1], [cx + 820, cx + 820 - (cx + 820 - ix) * 0.6])} y1={interpolate(jT, [0, 1], [cy + 320, cy + 320 - (cy + 320 - iy) * 0.6])} x2={jx} y2={jy} stroke={GREEN} strokeWidth={4} opacity={0.6} />
                  <polygon points={`${jx},${jy - 16} ${jx - 12},${jy + 12} ${jx + 12},${jy + 12}`} fill={GREEN} transform={`rotate(${-62} ${jx} ${jy})`} />
                </g>
              )}
            </>
          )}
          {stage === 'count' &&
            Array.from({length: nCount}).map((_, k) => {
              const a = random(`c${k}`) * Math.PI * 2;
              const r = RI + 30 + random(`cr${k}`) * (RO - RI - 20);
              const bx = cx + Math.cos(a) * r;
              const by = cy + Math.sin(a) * r;
              return <Blip key={k} x={bx} y={by} c={C.red} a={0.95} size={9} />;
            })}
          <circle cx={cx} cy={cy} r={20 + 3 * Math.sin(f / 4)} fill="#fff" />
          <circle cx={cx} cy={cy} r={34 + ((f * 1.2) % 40)} fill="none" stroke="#fff" strokeWidth={2} opacity={1 - ((f * 1.2) % 40) / 40} />
        </g>
      </svg>
      {/* labels */}
      <div style={{position: 'absolute', left: cx + RO * cam + 26, top: cy - 36, opacity: outerP, fontFamily: fonts.label, fontWeight: 800, fontSize: 64, color: '#FF5A60'}}>30 NM</div>
      {innerP > 0 && <div style={{position: 'absolute', left: cx + RI * cam + 18, top: cy - 28, opacity: innerP, fontFamily: fonts.label, fontWeight: 800, fontSize: 48, color: '#FF5A60'}}>10 NM</div>}
      <div style={{position: 'absolute', left: cx - 40, top: cy + 34, fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: 2}}>POTUS</div>
      <div style={{position: 'absolute', right: 50, top: 160, fontFamily: fonts.mono, fontSize: 22, color: GREEN, letterSpacing: 3, textAlign: 'right', lineHeight: 1.5, opacity: 0.85}}>
        TFR ACTIVE
        <br />
        SWEEP {String(Math.floor(sweep)).padStart(3, '0')}°
      </div>
      {stage === 'diam' && (
        <div style={{position: 'absolute', left: 90, top: 170, opacity: prog(f, 8, 8)}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: GREEN, letterSpacing: 4}}>THE OUTERMOST LAYER</div>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 96, color: '#fff', lineHeight: 1}}>60 NM ACROSS</div>
        </div>
      )}
      {stage === 'outer' && (
        <div style={{position: 'absolute', left: 90, top: 170, opacity: prog(f, 8, 8)}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: GREEN, letterSpacing: 4}}>TEMPORARY FLIGHT RESTRICTION</div>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 96, color: '#fff', lineHeight: 1}}>A RESTRICTED RING</div>
        </div>
      )}
      {stage === 'inner' && (
        <div style={{position: 'absolute', left: 90, top: 170, opacity: prog(f, at(ev, 1, 40), 8), transform: `scale(${Math.min(1, pop(f, at(ev, 1, 40), 10))})`, transformOrigin: 'left'}}>
          <div style={{background: C.red, color: '#fff', fontFamily: fonts.label, fontWeight: 800, fontSize: 70, padding: '6px 22px', borderRadius: 6}}>ALMOST EVERY FLIGHT BANNED</div>
        </div>
      )}
      {stage === 'intercept' && (
        <div style={{position: 'absolute', left: 90, top: 170}}>
          <div style={{opacity: prog(f, at(ev, 0, 10), 6), fontFamily: fonts.label, fontWeight: 800, fontSize: 70, color: '#fff'}}>
            <span style={{color: '#FFC24A'}}>FAA</span> WRITES THE RULES
          </div>
          <div style={{opacity: prog(f, at(ev, 1, 50), 6), fontFamily: fonts.label, fontWeight: 800, fontSize: 70, color: '#fff'}}>
            <span style={{color: GREEN}}>MILITARY</span> ENFORCES THEM
          </div>
        </div>
      )}
      {inside && stage === 'intercept' && Math.floor(f / 6) % 2 === 0 && jT < 1 && (
        <div style={{position: 'absolute', left: ix - 200, top: iy - 120, width: 400, textAlign: 'center', fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.red, letterSpacing: 3}}>⚠ TFR VIOLATION</div>
      )}
      {stage === 'count' && (
        <div style={{position: 'absolute', left: 80, top: 150, background: 'rgba(7,16,25,0.85)', padding: '22px 30px', borderLeft: `8px solid ${C.red}`}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 28, color: GREEN, letterSpacing: 3}}>AFTER THE 2025 INAUGURATION</div>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 54, color: '#fff'}}>RINGS AROUND MAR-A-LAGO</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 150, color: '#FF5A60', lineHeight: 1}}>
              {nCount}
              {nCount >= 40 ? '+' : ''}
            </div>
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 50, color: '#fff'}}>NORAD RESPONSES</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- top-down tactical map (Butler schematic) ---------- */
export const Tactical: React.FC<{mode: 'watch' | 'butler' | 'shots'; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const stage = {x: 520, y: 640};
  const roof = {x: 1420, y: 430};
  const snipers = [
    {x: 380, y: 360},
    {x: 760, y: 300},
  ];
  const cam = interpolate(f, [0, d], mode === 'shots' ? [1.12, 1.2] : [1, 1.08]);
  const shots = mode === 'shots' ? Math.min(8, Math.floor(prog(f, at(ev, 0, 10), 48, (x) => x) * 8.99)) : 0;
  const killT = mode === 'shots' ? prog(f, at(ev, 0, 10) + 52, 6) : 0;
  const distP = mode === 'butler' ? prog(f, at(ev, 1, 30), 18, easeInOut) : mode === 'shots' ? 1 : 0;
  const roofOn = mode !== 'watch';
  const flashOn = mode === 'shots' && shots > 0 && shots < 8 && f - at(ev, 0, 10) - Math.floor(((shots - 1) / 8.99) * 48) < 3;
  return (
    <AbsoluteFill style={{background: SCOPE, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="tgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0F2433" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#tgrid)" />
        <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
          {/* field + crowd */}
          <rect x={300} y={520} width={600} height={360} rx={12} fill="#0F2A22" stroke="#1E4A3C" strokeWidth={3} />
          {Array.from({length: 90}).map((_, k) => (
            <circle key={k} cx={330 + random(`x${k}`) * 540} cy={700 + random(`y${k}`) * 160} r={5} fill="#2C5A4C" />
          ))}
          {/* stage */}
          <rect x={stage.x - 60} y={stage.y - 30} width={120} height={60} fill="#1F3550" stroke="#7FA2C8" strokeWidth={3} />
          <circle cx={stage.x} cy={stage.y} r={14 + 2 * Math.sin(f / 4)} fill="#fff" />
          {/* buildings */}
          <rect x={1260} y={330} width={330} height={200} fill={roofOn ? 'rgba(215,38,46,0.16)' : '#15283A'} stroke={roofOn ? C.red : '#2A4560'} strokeWidth={roofOn ? 6 : 3} />
          <rect x={1260} y={560} width={260} height={150} fill="#15283A" stroke="#2A4560" strokeWidth={3} />
          <rect x={300} y={280} width={170} height={150} fill="#15283A" stroke="#2A4560" strokeWidth={3} />
          <rect x={680} y={230} width={170} height={140} fill="#15283A" stroke="#2A4560" strokeWidth={3} />
          {/* sniper sightlines */}
          {snipers.map((s, k) => {
            const sw = Math.sin((f + k * 40) / 40) * 0.5;
            const a = Math.atan2(roof.y - s.y, roof.x - s.x) + (mode === 'watch' ? sw : 0);
            const L = 1300;
            const op = mode === 'watch' ? prog(f, at(ev, 0, 10) - 10 + k * 6, 10) : 0.5;
            return (
              <g key={k} opacity={op}>
                <path d={`M ${s.x} ${s.y} L ${s.x + Math.cos(a - 0.12) * L} ${s.y + Math.sin(a - 0.12) * L} L ${s.x + Math.cos(a + 0.12) * L} ${s.y + Math.sin(a + 0.12) * L} Z`} fill={GREEN} opacity={0.1} />
                <polygon points={`${s.x},${s.y - 18} ${s.x - 15},${s.y + 12} ${s.x + 15},${s.y + 12}`} fill={GREEN} />
              </g>
            );
          })}
          {/* distance */}
          {distP > 0 && (
            <g>
              <line x1={stage.x} y1={stage.y} x2={stage.x + (roof.x - stage.x) * distP} y2={stage.y + (roof.y - stage.y) * distP} stroke="#fff" strokeWidth={4} strokeDasharray="14 10" />
            </g>
          )}
          {roofOn && (
            <g>
              <circle cx={roof.x} cy={roof.y} r={13} fill={C.red} />
              <circle cx={roof.x} cy={roof.y} r={30 + ((f * 1.4) % 40)} fill="none" stroke={C.red} strokeWidth={3} opacity={1 - ((f * 1.4) % 40) / 40} />
            </g>
          )}
          {Array.from({length: shots}).map((_, k) => (
            <line key={k} x1={roof.x} y1={roof.y} x2={stage.x + 60 + random(`s${k}`) * 260} y2={stage.y - 40 + random(`t${k}`) * 160} stroke="#FF5A60" strokeWidth={3} opacity={k === shots - 1 ? 1 : 0.35} />
          ))}
          {killT > 0 && <line x1={snipers[1].x} y1={snipers[1].y} x2={snipers[1].x + (roof.x - snipers[1].x) * killT} y2={snipers[1].y + (roof.y - snipers[1].y) * killT} stroke={GREEN} strokeWidth={5} />}
        </g>
      </svg>
      {flashOn && <AbsoluteFill style={{background: 'rgba(255,60,60,0.10)'}} />}
      <div style={{position: 'absolute', right: 40, bottom: 104, fontFamily: fonts.mono, fontSize: 20, color: '#5E7C93', letterSpacing: 2}}>SCHEMATIC · NOT TO SCALE</div>
      {mode === 'watch' && (
        <div style={{position: 'absolute', left: 90, top: 150, opacity: prog(f, 2, 8)}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: GREEN, letterSpacing: 4}}>HIGH GROUND · LONG-RANGE OPTICS</div>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 110, color: '#fff', lineHeight: 1}}>COUNTER SNIPER TEAM</div>
        </div>
      )}
      {mode === 'butler' && (
        <>
          <div style={{position: 'absolute', left: 90, top: 150, opacity: prog(f, 2, 6)}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 40, color: '#FF5A60', letterSpacing: 4}}>JULY 13, 2024</div>
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 100, color: '#fff', lineHeight: 1}}>BUTLER, PENNSYLVANIA</div>
          </div>
          <div style={{position: 'absolute', left: 960, top: 590, opacity: prog(f, at(ev, 1, 30) + 10, 8), fontFamily: fonts.label, fontWeight: 800, fontSize: 76, color: '#fff', background: 'rgba(7,16,25,0.8)', padding: '0 16px'}}>≈ 147 YARDS</div>
        </>
      )}
      {mode === 'shots' && (
        <>
          <div style={{position: 'absolute', left: 90, top: 140}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 230, color: '#FF5A60', lineHeight: 1}}>{shots}</div>
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 80, color: '#fff'}}>SHOTS FIRED</div>
          </div>
          <div style={{position: 'absolute', left: 1240, top: 230, transform: `rotate(-6deg) scale(${Math.min(1.1, pop(f, 4, 9))})`, border: `8px solid ${C.red}`, color: C.red, fontFamily: fonts.label, fontWeight: 800, fontSize: 84, padding: '0 22px', background: 'rgba(7,16,25,0.6)'}}>NOT SECURED</div>
        </>
      )}
    </AbsoluteFill>
  );
};
