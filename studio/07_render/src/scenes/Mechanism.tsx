import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {Item, easeInOut, prog} from '../lib';
import {Hand, Label, Shatter, Spray} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';

const Thermo: React.FC<{from: number; to: number; p: number; x: number; y: number; h: number; color?: string}> = ({from, to, p, x, y, h, color = C.heat}) => {
  const v = Math.round(from + (to - from) * p);
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <svg width={120} height={h + 80}>
        <rect x={42} y={10} width={36} height={h} rx={18} fill="#fff" stroke={C.tileBorder} strokeWidth={3} />
        <rect x={50} y={10 + 8 + (h - 16) * (1 - p)} width={20} height={(h - 16) * p} rx={10} fill={color} />
        <circle cx={60} cy={h + 30} r={34} fill={color} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: 140, top: 10 + (h - 16) * (1 - p) - 20, fontFamily: fonts.mono, fontWeight: 700, fontSize: 64, color: C.ink, whiteSpace: 'nowrap'}}>
        {v}°F
      </div>
    </div>
  );
};

/** Macro view of the bulb: liquid expands, bubble shrinks, temperature rises. */
export const BulbMacro: React.FC<{item: Item; e0?: number; e1?: number; t0?: number; t1?: number}> = ({item, e0 = 0, e1 = 0.85, t0 = 70, t1 = 130}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const p = prog(f, 6, d - 18, easeInOut);
  const e = e0 + (e1 - e0) * p;
  const S = 1150;
  const k = S / 200;
  const zoom = interpolate(f, [0, d], [1, 1.06]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 760 - 100 * k, top: 560 - 150 * k, transform: `scale(${zoom})`, transformOrigin: `${100 * k}px ${150 * k}px`}}>
        <Sprinkler bulb={{liquid: item.color, response: item.response}} size={S} expansion={e} glow={p * 0.9} />
      </div>
      {/* bubble callout */}
      <div style={{position: 'absolute', left: 860, top: 150, opacity: prog(f, 18, 10) * (1 - prog(f, d - 30, 10))}}>
        <svg width={260} height={120}>
          <path d="M 10 110 C 60 60, 120 40, 240 30" stroke={C.red} strokeWidth={4} fill="none" strokeDasharray="400" strokeDashoffset={400 * (1 - prog(f, 18, 14))} />
        </svg>
        <Hand size={58} style={{position: 'absolute', left: 250, top: -4, whiteSpace: 'nowrap'}}>
          the bubble
        </Hand>
      </div>
      <Thermo from={t0} to={t1} p={p} x={1460} y={180} h={620} />
    </AbsoluteFill>
  );
};

export const BURST_AT = 0.32;

/** Wide view: bubble gone → glass shatters → plug drops → water. */
export const Burst: React.FC<{item: Item; steps?: string[]}> = ({item, steps = ['BUBBLE GONE', 'GLASS BREAKS', 'WATER FLOWS']}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const T = Math.round(d * BURST_AT);
  const S = 560;
  const k = S / 200;
  const left = 960 - 100 * k;
  const top = 40;
  const e = interpolate(f, [0, T], [0.85, 1], {extrapolateRight: 'clamp'});
  const shake = f > T - 6 && f < T ? Math.sin(f * 3) * 2 : 0;
  const plugY = f > T ? Math.min(900, 0.9 * (f - T) * (f - T)) : 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: left + shake, top}}>
        <Sprinkler bulb={{liquid: item.color, response: item.response}} size={S} expansion={e} broken={f >= T} glow={f < T ? 0.9 : Math.max(0, 0.9 - (f - T) / 20)} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <Shatter t={f - T} color={item.color} cx={960} cy={top + 150 * k} scale={2.2} seed={`b-${item.key}`} />
        {f > T && <rect x={960 - 20} y={top + 82 * k + plugY} width={40} height={22} rx={4} fill="#B9BCC2" opacity={Math.max(0, 1 - plugY / 700)} />}
        <Spray t={f - T - 4} cx={960} cy={top + 244 * k} scale={2.4} seed={`s-${item.key}`} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', gap: 40}}>
        {steps.map((s, i) => {
          const at = i === 0 ? T - 10 : i === 1 ? T : T + 10;
          const on = prog(f, at, 6);
          return (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 40}}>
              <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 52, color: on > 0.5 ? C.ink : C.inkFaint, opacity: 0.35 + 0.65 * on, transform: `scale(${0.94 + 0.06 * on})`}}>{s}</div>
              {i < steps.length - 1 && <div style={{fontFamily: fonts.mono, fontSize: 44, color: C.inkFaint}}>→</div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type Marker = {t: number; color: string; label: string; crossed?: boolean};

/** Horizontal temperature scale: normal ceiling band → margin → break point. */
export const Gauge: React.FC<{item: Item; maxCeil: number; rating: number; lo?: number; hi?: number; markers?: Marker[]; title?: string}> = ({
  item,
  maxCeil,
  rating,
  lo = 50,
  hi,
  markers = [],
  title = 'CEILING TEMPERATURE',
}) => {
  const f = useCurrentFrame();
  const top = hi ?? rating + 60;
  const X0 = 180;
  const X1 = 1740;
  const x = (t: number) => X0 + ((t - lo) / (top - lo)) * (X1 - X0);
  const Y = 560;
  const fill = prog(f, 8, 26, easeInOut);
  const margin = prog(f, 34, 14);
  const mark = prog(f, 46, 12);
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / 25) * 25; t <= top; t += 25) ticks.push(t);
  const markColor = item.key === 'yellow' ? '#D9A800' : item.color;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: X0, top: 230, fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.inkFaint}}>{title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="16" height="16" fill="#fff" />
            <line x1="0" y1="0" x2="0" y2="16" stroke={C.inkFaint} strokeWidth="5" />
          </pattern>
        </defs>
        <rect x={X0} y={Y - 40} width={X1 - X0} height={80} rx={10} fill="#fff" stroke={C.tileBorder} strokeWidth={3} />
        <rect x={X0 + 4} y={Y - 36} width={(x(maxCeil) - X0 - 4) * fill} height={72} rx={8} fill="#9FB7C9" />
        <rect x={x(maxCeil)} y={Y - 36} width={(x(rating) - x(maxCeil)) * margin} height={72} fill="url(#hatch)" opacity={0.7} />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={Y + 46} y2={Y + 60} stroke={C.inkFaint} strokeWidth={3} />
            <text x={x(t)} y={Y + 96} textAnchor="middle" fontFamily={fonts.mono} fontSize={26} fill={C.inkFaint}>
              {t}
            </text>
          </g>
        ))}
        <line x1={x(rating)} x2={x(rating)} y1={Y - 120 + 40 * (1 - mark)} y2={Y + 40} stroke={markColor} strokeWidth={8} opacity={mark} strokeLinecap="round" />
        {markers.map((m, i) => {
          const mp = prog(f, 60 + i * 10, 10);
          return (
            <g key={m.label} opacity={mp}>
              <line x1={x(m.t)} x2={x(m.t)} y1={Y - 110} y2={Y + 40} stroke={m.color} strokeWidth={6} strokeLinecap="round" />
              <text x={x(m.t)} y={Y + 150} textAnchor="middle" fontFamily={fonts.label} fontWeight={800} fontSize={40} fill={m.color}>
                {m.label} {m.t}°F
              </text>
              {m.crossed && (
                <g stroke={C.red} strokeWidth={9} strokeLinecap="round">
                  <line x1={x(m.t) - 32} y1={Y - 150} x2={x(m.t) + 32} y2={Y - 86} />
                  <line x1={x(m.t) + 32} y1={Y - 150} x2={x(m.t) - 32} y2={Y - 86} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: X0 + 24, top: Y - 22, opacity: prog(f, 26, 10)}}>
        <Label size={44} color="#fff">
          NORMAL CEILING · UP TO {maxCeil}°F
        </Label>
      </div>
      <div style={{position: 'absolute', left: (x(maxCeil) + x(rating)) / 2 - 100, top: Y + 120, width: 200, textAlign: 'center', opacity: margin}}>
        <Hand size={56} color={C.inkSoft}>
          margin
        </Hand>
      </div>
      <div style={{position: 'absolute', left: x(rating) - 200, top: Y - 230, width: 400, textAlign: 'center', opacity: mark}}>
        <Label size={64} color={markColor}>
          {item.label} BREAKS
        </Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 6}}>{rating}°F</div>
      </div>
    </AbsoluteFill>
  );
};
