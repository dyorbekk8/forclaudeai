import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {Chip, CountUp, DateStamp, Hand, Icon, Label, RedStamp} from '../components/ui';
import {Stick} from '../armor/assets';

const at = (ev: number[] | undefined, i: number, fb = 0) => (ev && ev[i] !== undefined ? ev[i] : fb);
const NAVY = '#1F2A44';

export const LAYERS = ['THE SKY', 'THE ADVANCE', 'THE ROOFTOPS', 'THE CHECKPOINT', 'THE MOTORCADE', 'THE BEAST', 'THE SHIFT', 'THE LAST LAYER'];
const SHORT = ['SKY', 'ADV', 'ROOF', 'CHECK', 'CAR', 'BEAST', 'SHIFT', 'LAST'];

export const HUD: React.FC<{step: number}> = ({step}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 40, top: 30, background: NAVY, color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '8px 18px', borderRadius: 4}}>
        HOW PRESIDENTIAL PROTECTION ACTUALLY WORKS
      </div>
      {step >= 0 && (
        <div style={{position: 'absolute', right: 40, top: 30, background: C.red, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, letterSpacing: 2, padding: '8px 18px', borderRadius: 4}}>
          LAYER {String(step + 1).padStart(2, '0')} / 08
        </div>
      )}
      <div style={{position: 'absolute', left: 28, bottom: 18, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(246,245,241,0.92)', padding: '8px 14px 6px', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.18)'}}>
        {SHORT.map((s, i) => {
          const on = i === step;
          const done = step >= 0 && i < step;
          return (
            <div key={s} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <div style={{width: 74 - i * 6, height: 74 - i * 6, borderRadius: '50%', border: `${on ? 6 : 4}px solid ${on ? C.red : done ? C.ink : '#D9D5CA'}`, transform: on ? `scale(${1 + 0.06 * Math.sin(f / 6)})` : 'none'}} />
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 14, color: on ? C.red : done ? C.ink : C.inkFaint}}>{s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Concentric layers around POTUS; camera dives to ring `focus` (−1 = all). */
export const Rings: React.FC<{focus: number; from?: number; outro?: boolean}> = ({focus, from, outro}) => {
  const f = useCurrentFrame();
  const R = (i: number) => 1500 - i * 175;
  const scaleOf = (i: number) => (i < 0 ? 0.33 : 0.5 * (1500 / R(i)) * 0.9);
  const t = prog(f, 0, 26, easeInOut);
  const s0 = scaleOf(from ?? focus);
  const s1 = scaleOf(focus);
  const s = s0 + (s1 - s0) * t;
  const rot = interpolate(f, [0, 300], [0, 6]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#EFECE3'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960 560) scale(${s}) rotate(${rot})`}>
          {LAYERS.map((l, i) => {
            const active = i === focus;
            const done = outro || focus < 0 || i < focus;
            return (
              <g key={l}>
                <circle r={R(i)} fill={active ? '#FFFFFF' : i % 2 ? '#F6F5F1' : '#ECE8DE'} stroke={active ? C.red : done ? C.ink : C.tileBorder} strokeWidth={(active ? 14 : 6) / s} strokeDasharray={i === 0 ? `${40 / s} ${24 / s}` : undefined} />
              </g>
            );
          })}
          <circle r={70} fill={NAVY} />
          <text y={18} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={52} fill="#fff">
            POTUS
          </text>
          {LAYERS.map((l, i) => (
            <text key={`t${i}`} x={0} y={-R(i) + 70} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={Math.max(36, 70 - i * 3)} fill={i === focus ? C.red : C.inkSoft} transform={`rotate(${-rot})`}>
              {i + 1}. {l}
            </text>
          ))}
        </g>
      </svg>
      {focus >= 0 && !outro && (
        <div style={{position: 'absolute', right: 110, top: 170, opacity: prog(f, 20, 10), textAlign: 'right'}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: C.inkFaint}}>LAYER {focus + 1}</div>
          <Label size={110} color={C.red}>
            {LAYERS[focus].replace('THE ', '')}
          </Label>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Jet: React.FC<{size?: number; color?: string}> = ({size = 120, color = '#4A5560'}) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 100 50">
    <path d="M 0 25 L 70 20 L 100 25 L 70 30 Z" fill={color} />
    <path d="M 40 21 L 55 2 L 62 2 L 58 21 Z M 40 29 L 55 48 L 62 48 L 58 29 Z" fill={color} />
    <path d="M 4 24 L 12 12 L 16 12 L 14 23 Z M 4 26 L 12 38 L 16 38 L 14 27 Z" fill={color} />
  </svg>
);
const Plane: React.FC<{size?: number}> = ({size = 90}) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 100 50">
    <path d="M 0 25 L 80 22 Q 100 25 80 28 Z" fill="#8A9099" />
    <rect x="40" y="2" width="10" height="46" rx="3" fill="#8A9099" />
    <rect x="6" y="14" width="6" height="22" rx="2" fill="#8A9099" />
  </svg>
);

/** Airspace rings top-down; stage: 'outer' | 'inner' | 'intercept' | 'count'. */
export const Airspace: React.FC<{stage: string; ev?: number[]}> = ({stage, ev}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const outer = stage !== 'x';
  const innerOn = stage !== 'outer';
  const px = interpolate(f, [0, d], [100, 640]);
  const py = interpolate(f, [0, d], [220, 470]);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <pattern id="mapgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D9E3EA" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="#EEF3F6" />
        <rect width="1920" height="1080" fill="url(#mapgrid)" />
        {outer && <circle cx={960} cy={560} r={440 * prog(f, 0, 18, easeInOut)} fill="rgba(215,38,46,0.08)" stroke={C.red} strokeWidth={6} strokeDasharray="30 18" />}
        {innerOn && <circle cx={960} cy={560} r={150 * prog(f, stage === 'inner' ? at(ev, 0, 10) : 0, 16, easeInOut)} fill="rgba(215,38,46,0.22)" stroke={C.red} strokeWidth={8} />}
        <circle cx={960} cy={560} r={22} fill={NAVY} />
      </svg>
      <div style={{position: 'absolute', left: 960 + 450, top: 560 - 40, opacity: prog(f, 10, 8)}}>
        <Label size={64} color={C.red}>30 NM</Label>
      </div>
      {innerOn && (
        <div style={{position: 'absolute', left: 960 + 160, top: 560 - 30, opacity: prog(f, stage === 'inner' ? at(ev, 0, 10) + 10 : 0, 8)}}>
          <Label size={48} color={C.red}>10 NM</Label>
        </div>
      )}
      {stage === 'inner' && (
        <div style={{position: 'absolute', left: 140, top: 160, opacity: prog(f, at(ev, 1, 40), 10)}}>
          <Chip size={46} color={C.red}>ALMOST EVERY FLIGHT BANNED</Chip>
        </div>
      )}
      {(stage === 'intercept' || stage === 'count') && (
        <>
          <div style={{position: 'absolute', left: px, top: py}}>
            <Plane />
          </div>
          <div style={{position: 'absolute', left: interpolate(f, [0, d], [-300, px - 140]), top: py - 70}}>
            <Jet />
          </div>
        </>
      )}
      {stage === 'intercept' && (
        <div style={{position: 'absolute', left: 140, top: 150, display: 'flex', flexDirection: 'column', gap: 18}}>
          <div style={{opacity: prog(f, at(ev, 0, 4), 8)}}>
            <Chip size={46}>FAA · WRITES THE RULES</Chip>
          </div>
          <div style={{opacity: prog(f, at(ev, 1, 40), 8)}}>
            <Chip size={46} color={C.red}>MILITARY · ENFORCES WITH JETS</Chip>
          </div>
        </div>
      )}
      {stage === 'count' && (
        <div style={{position: 'absolute', left: 100, top: 130, background: 'rgba(255,255,255,0.94)', padding: '24px 34px', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}>
          <DateStamp date="AFTER THE 2025 INAUGURATION" place="RINGS AROUND MAR-A-LAGO" f={f} delay={2} big />
          <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 10, opacity: prog(f, at(ev, 0, 30), 8)}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 160, color: C.red, lineHeight: 1}}>
              <CountUp to={40} f={f} start={at(ev, 0, 30)} len={20} suffix="+" />
            </div>
            <Label size={66}>PLANES · NORAD RESPONSES</Label>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Advance team checklist. */
export const Checklist: React.FC<{items: {icon: React.ComponentProps<typeof Icon>['name']; l: string}[]; ev?: number[]; title?: string}> = ({items, ev, title}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {title && (
        <div style={{position: 'absolute', top: 140, opacity: prog(f, 0, 8)}}>
          <Label size={80}>{title}</Label>
        </div>
      )}
      <div style={{display: 'flex', gap: 40, marginTop: 40}}>
        {items.map((it, i) => {
          const s = at(ev, i, i * 12);
          const p = pop(f, s, 12);
          const chk = prog(f, s + 8, 6);
          return (
            <div key={it.l} style={{width: 360, height: 420, background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', transform: `scale(${0.85 + 0.15 * Math.min(1, p)})`, opacity: Math.min(1, p)}}>
              <Icon name={it.icon} size={190} />
              <Label size={54} style={{marginTop: 20}}>
                {it.l}
              </Label>
              <svg width={80} height={80} viewBox="0 0 40 40" style={{position: 'absolute', top: 16, right: 16, opacity: chk}}>
                <circle cx="20" cy="20" r="18" fill="#2E9E4F" />
                <path d="M 11 21 L 17 27 L 29 14" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Two duration chips: campaign event vs foreign trip. */
export const LeadTime: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const bar = (label: string, days: string, w: number, s: number, red?: boolean) => (
    <div style={{marginBottom: 70, opacity: prog(f, s, 8)}}>
      <Label size={58} color={C.inkSoft}>
        {label}
      </Label>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 12}}>
        <div style={{height: 80, width: w * prog(f, s, 20, easeInOut), background: red ? C.red : C.ink, borderRadius: 8}} />
        <Label size={80} color={red ? C.red : C.ink}>
          {days}
        </Label>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{padding: '0 220px', justifyContent: 'center'}}>
      {bar('CAMPAIGN EVENT · ADVANCE TEAM ARRIVES', '3–5 DAYS EARLY', 260, at(ev, 0, 4))}
      {bar('FOREIGN TRIP', 'UP TO A MONTH', 1100, at(ev, 1, 50), true)}
    </AbsoluteFill>
  );
};

/** Stage vs rooftop side view with distance and sightline. mode: watch | butler | shots */
export const Rooftop: React.FC<{mode: string; ev?: number[]}> = ({mode, ev}) => {
  const f = useCurrentFrame();
  const ground = 860;
  const shots = mode === 'shots' ? Math.min(8, Math.floor(prog(f, at(ev, 0, 10), 50) * 8)) : 0;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={ground} width={1920} height={220} fill="#D8D2C2" />
        <rect x={180} y={ground - 70} width={360} height={70} fill="#6B675E" />
        <rect x={210} y={ground - 90} width={300} height={20} fill={NAVY} />
        <circle cx={360} cy={ground - 140} r={18} fill={NAVY} />
        <rect x={350} y={ground - 122} width={20} height={34} fill={NAVY} />
        <rect x={1300} y={ground - 260} width={460} height={260} fill="#B9B4A6" stroke="#6B675E" strokeWidth={4} />
        <path d="M 1300 600 L 1530 560 L 1760 600" fill="#9C9A93" stroke="#6B675E" strokeWidth={4} />
        {mode === 'watch' && (
          <g>
            <rect x={60} y={ground - 420} width={140} height={420} fill="#A7A39A" stroke="#6B675E" strokeWidth={4} />
            <circle cx={130} cy={ground - 450} r={16} fill={C.ink} />
            <rect x={120} y={ground - 434} width={20} height={20} fill={C.ink} />
            <polygon points={`150,${ground - 450} 1900,${ground - 700} 1900,${ground - 100}`} fill="rgba(46,158,79,0.12)" opacity={prog(f, at(ev, 0, 10), 10)} />
          </g>
        )}
        {mode !== 'watch' && (
          <g>
            <circle cx={1530} cy={540} r={14} fill={C.red} />
            <rect x={1522} y={552} width={16} height={18} fill={C.red} />
            <line x1={400} x2={1500} y1={ground + 70} y2={ground + 70} stroke={C.red} strokeWidth={6} opacity={prog(f, at(ev, 1, 30), 10)} />
            <line x1={400} x2={400} y1={ground + 50} y2={ground + 90} stroke={C.red} strokeWidth={6} opacity={prog(f, at(ev, 1, 30), 10)} />
            <line x1={1500} x2={1500} y1={ground + 50} y2={ground + 90} stroke={C.red} strokeWidth={6} opacity={prog(f, at(ev, 1, 30), 10)} />
            {Array.from({length: shots}).map((_, i) => (
              <line key={i} x1={1520} y1={548} x2={420 + i * 6} y2={ground - 140 + i * 4} stroke={C.red} strokeWidth={2} opacity={0.6} />
            ))}
          </g>
        )}
      </svg>
      {mode === 'watch' && (
        <div style={{position: 'absolute', left: 260, top: 200, opacity: prog(f, 4, 8)}}>
          <Label size={80}>COUNTER SNIPER TEAM</Label>
          <Hand size={60} color={C.inkSoft}>
            long-range optics · high ground
          </Hand>
        </div>
      )}
      {mode === 'butler' && (
        <>
          <div style={{position: 'absolute', left: 140, top: 140}}>
            <DateStamp date="JULY 13, 2024" place="BUTLER, PENNSYLVANIA" f={f} delay={2} big />
          </div>
          <div style={{position: 'absolute', left: 820, top: ground + 100, opacity: prog(f, at(ev, 1, 30), 10)}}>
            <Label size={66} color={C.red}>≈ 147 YARDS</Label>
          </div>
        </>
      )}
      {mode === 'shots' && (
        <>
          <div style={{position: 'absolute', left: 1280, top: 340}}>
            <RedStamp text="NOT SECURED" f={f} delay={4} size={80} rotate={-6} />
          </div>
          <div style={{position: 'absolute', left: 140, top: 160}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 200, color: C.red, lineHeight: 1}}>{shots}</div>
            <Label size={70}>SHOTS FIRED</Label>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** Walk-through magnetometer with people passing. */
export const Magnetometer: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const who = ['STAFF', 'GUESTS', 'REPORTERS'];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={880} width={1920} height={200} fill="#D8D2C2" />
        <rect x={830} y={360} width={50} height={520} fill="#5E646E" />
        <rect x={1040} y={360} width={50} height={520} fill="#5E646E" />
        <rect x={830} y={330} width={260} height={50} fill="#4A4F57" />
        <circle cx={960} cy={355} r={12} fill={Math.floor(f / 10) % 2 ? '#2E9E4F' : '#9BE3B0'} />
      </svg>
      {who.map((w, i) => {
        const s = at(ev, i, i * 20);
        const x = interpolate(f, [s, s + 60], [300, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={w} style={{position: 'absolute', left: x, top: 560, opacity: f >= s ? 1 : 0}}>
            <Stick size={320} color={i === 2 ? C.inkSoft : C.ink} />
            <div style={{position: 'absolute', top: -60, left: -20}}>
              <Chip size={34}>{w}</Chip>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 140, top: 140, opacity: prog(f, 0, 8)}}>
        <Label size={80}>MAGNETOMETER</Label>
        <div style={{fontFamily: fonts.mono, fontSize: 30, color: C.inkSoft}}>SECRET SERVICE UNIFORMED DIVISION</div>
      </div>
      <div style={{position: 'absolute', right: 150, top: 150}}>
        <RedStamp text="NO EXCEPTIONS" f={f} delay={at(ev, 3, 90)} size={90} rotate={-8} />
      </div>
    </AbsoluteFill>
  );
};

const Vehicle: React.FC<{kind: string}> = ({kind}) => {
  const body = kind === 'ambulance' ? '#F4F4F2' : kind === 'police' ? '#F4F4F2' : '#16161A';
  const w = kind === 'limo' ? 300 : kind === 'police' ? 170 : 230;
  return (
    <svg width={w} height={120} viewBox={`0 0 ${w} 120`}>
      <rect x={4} y={36} width={w - 8} height={56} rx={14} fill={body} stroke="#16161A" strokeWidth={4} />
      <rect x={w * 0.2} y={10} width={w * 0.55} height={36} rx={10} fill={body} stroke="#16161A" strokeWidth={4} />
      <rect x={w * 0.25} y={16} width={w * 0.2} height={22} rx={4} fill="#8FB3CC" />
      <rect x={w * 0.5} y={16} width={w * 0.2} height={22} rx={4} fill="#8FB3CC" />
      {kind === 'police' && <rect x={w * 0.4} y={2} width={30} height={10} fill={C.red} />}
      {kind === 'ambulance' && <path d={`M ${w * 0.45} 50 h 24 M ${w * 0.45 + 12} 38 v 24`} stroke={C.red} strokeWidth={8} />}
      {kind === 'limo' && (
        <>
          <rect x={w * 0.84} y={30} width={10} height={16} fill="#2F6FD6" />
          <rect x={w * 0.88} y={30} width={10} height={16} fill={C.red} />
        </>
      )}
      <circle cx={w * 0.22} cy={96} r={18} fill="#2B2F36" />
      <circle cx={w * 0.78} cy={96} r={18} fill="#2B2F36" />
    </svg>
  );
};

/** Convoy driving across; labels pop on events. */
export const Motorcade: React.FC<{ev?: number[]; focus?: 'cat'}> = ({ev, focus}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const x = interpolate(f, [0, d], [1900, -700]);
  const list: [string, string][] = [
    ['police', 'POLICE'],
    ['suv', ''],
    ['limo', 'POTUS'],
    ['suv', 'COUNTER ASSAULT'],
    ['suv', ''],
    ['ambulance', 'AMBULANCE'],
  ];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={560} width={1920} height={260} fill="#6B675E" />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={((i * 160 - f * 12) % 2240) - 160} y={684} width={90} height={12} fill="#F3EFE2" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: x, top: 580, display: 'flex', gap: 40, alignItems: 'flex-end'}}>
        {list.map(([k, l], i) => (
          <div key={i} style={{position: 'relative'}}>
            <Vehicle kind={k} />
            {l && (
              <div style={{position: 'absolute', top: -70, left: 0, opacity: focus === 'cat' ? (l === 'COUNTER ASSAULT' ? 1 : 0.3) : 1}}>
                <Chip size={30} color={l === 'POTUS' ? C.red : C.ink}>
                  {l}
                </Chip>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 140, top: 150, display: 'flex', flexDirection: 'column', gap: 16}}>
        {focus === 'cat' ? (
          <>
            <Label size={90}>COUNTER ASSAULT TEAM</Label>
            <Label size={66} color={C.red} style={{opacity: prog(f, at(ev, 0, 30), 10)}}>
              THEY FIGHT · EVERYONE ELSE GETS HIM OUT
            </Label>
          </>
        ) : (
          ['ROADS CLOSED', 'OWN COUNTER ASSAULT TEAM', 'AN AMBULANCE'].map((t, i) => (
            <div key={t} style={{opacity: prog(f, at(ev, i, i * 20), 8)}}>
              <Chip size={44} color={i === 2 ? C.red : C.ink}>
                {t}
              </Chip>
            </div>
          ))
        )}
      </div>
    </AbsoluteFill>
  );
};

/** The Beast side view with callouts. */
export const Beast: React.FC<{labels: string[]; ev?: number[]; stamp?: boolean; blood?: boolean}> = ({labels, ev, stamp, blood}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={820} width={1920} height={260} fill="#D8D2C2" />
        <g transform={`translate(260 ${430 + (1 - pop(f, 0, 14)) * 80})`}>
          <path d="M 40 300 L 40 200 Q 60 160 160 150 L 330 90 Q 380 70 520 70 L 820 70 Q 900 70 960 140 L 1180 160 Q 1260 170 1270 230 L 1270 300 Z" fill="#111316" stroke="#000" strokeWidth={6} />
          <path d="M 360 110 L 520 90 L 520 160 L 330 160 Z M 560 90 L 800 90 Q 860 95 900 150 L 560 160 Z" fill="#3E5566" />
          <rect x={540} y={170} width={14} height={120} fill="#2B2F36" />
          <circle cx={260} cy={310} r={70} fill="#2B2F36" />
          <circle cx={260} cy={310} r={34} fill="#6B6F76" />
          <circle cx={1040} cy={310} r={70} fill="#2B2F36" />
          <circle cx={1040} cy={310} r={34} fill="#6B6F76" />
          <rect x={1180} y={130} width={12} height={34} fill="#2F6FD6" />
          <rect x={1196} y={130} width={12} height={34} fill={C.red} />
          {blood && (
            <g transform="translate(1120 190)" opacity={prog(f, at(ev, 0, 20), 8)}>
              <rect x={0} y={0} width={70} height={90} rx={12} fill={C.red} stroke="#fff" strokeWidth={4} />
              <rect x={28} y={-18} width={14} height={20} fill="#fff" />
            </g>
          )}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 140, top: 130, display: 'flex', flexDirection: 'column', gap: 16}}>
        {labels.map((l, i) => (
          <div key={l} style={{opacity: prog(f, at(ev, i, 10 + i * 20), 8), transform: `translateX(${(1 - prog(f, at(ev, i, 10 + i * 20), 8)) * -30}px)`}}>
            <Chip size={48} color={i === labels.length - 1 ? C.red : C.ink}>
              {l}
            </Chip>
          </div>
        ))}
      </div>
      {stamp && (
        <div style={{position: 'absolute', right: 140, top: 130}}>
          <RedStamp text="CLASSIFIED" f={f} delay={8} size={100} rotate={-8} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Code-name cards. */
export const CodeNames: React.FC<{ev?: number[]; who?: boolean}> = ({ev, who}) => {
  const f = useCurrentFrame();
  const list = [
    ['RENEGADE', 'BARACK OBAMA'],
    ['MOGUL', 'DONALD TRUMP'],
    ['CELTIC', 'JOE BIDEN'],
  ];
  if (who)
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 60}}>
        <div style={{width: 600, height: 460, background: '#fff', border: `5px solid ${C.ink}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <Label size={84}>SECRET SERVICE</Label>
          <svg width={600} height={460} style={{position: 'absolute', left: 0, top: 0}}>
            <g stroke={C.red} strokeWidth={14} strokeLinecap="round" opacity={prog(f, at(ev, 0, 10), 6)}>
              <line x1={80} y1={80} x2={520} y2={380} />
              <line x1={520} y1={80} x2={80} y2={380} />
            </g>
          </svg>
        </div>
        <div style={{width: 640, height: 460, background: '#fff', border: `5px solid ${C.red}`, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: prog(f, at(ev, 1, 40), 8)}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.inkSoft}}>THE LIST IS KEPT BY</div>
          <Label size={70} color={C.red} style={{textAlign: 'center'}}>
            WHITE HOUSE COMMUNICATIONS AGENCY
          </Label>
        </div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 50}}>
      {list.map(([c, n], i) => {
        const p = pop(f, at(ev, i, i * 20), 12);
        return (
          <div key={c} style={{width: 500, height: 520, background: NAVY, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - Math.min(1, p)) * 80}px) rotateY(${(1 - Math.min(1, p)) * 90}deg)`, opacity: Math.min(1, p)}}>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: '#9FB0C8', letterSpacing: 4}}>CODE NAME</div>
            <Label size={110} color="#fff" style={{marginTop: 10}}>
              {c}
            </Label>
            <div style={{height: 4, width: 200, background: C.red, margin: '20px 0'}} />
            <Label size={46} color="#C9D3E2">
              {n}
            </Label>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 1981: agent spreads his body in front of the president. phase 0 date card, 1 shield. */
export const Shield: React.FC<{phase: 0 | 1; ev?: number[]}> = ({phase, ev}) => {
  const f = useCurrentFrame();
  const hit = phase === 1 && f >= at(ev, 1, 50);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: hit ? Math.max(0, 1 - (f - at(ev, 1, 50)) / 8) * 0.8 : 0}} />
      <div style={{position: 'absolute', left: 1180, top: 300}}>
        <Stick size={460} color={NAVY} />
        <div style={{position: 'absolute', top: -60, left: 40}}>
          <Chip size={34} color={NAVY}>
            PRESIDENT
          </Chip>
        </div>
      </div>
      {phase === 1 && (
        <div style={{position: 'absolute', left: interpolate(f, [0, 24], [1500, 1000], {extrapolateRight: 'clamp'}), top: 290}}>
          <svg width={360} height={480} viewBox="0 0 100 160">
            <circle cx="50" cy="20" r="13" stroke={C.red} strokeWidth="7" fill="none" />
            <line x1="50" y1="34" x2="50" y2="90" stroke={C.red} strokeWidth="7" />
            <path d="M 50 50 L 2 36 M 50 50 L 98 36 M 50 90 L 30 150 M 50 90 L 70 150" stroke={C.red} strokeWidth="7" strokeLinecap="round" fill="none" />
          </svg>
          <div style={{position: 'absolute', top: -60, left: 80}}>
            <Chip size={34} color={C.red}>
              AGENT
            </Chip>
          </div>
        </div>
      )}
      {phase === 1 &&
        Array.from({length: 4}).map((_, i) => {
          const s = at(ev, 0, 10) + i * 6;
          const x = interpolate(f, [s, s + 10], [0, 960], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return f > s && f < s + 12 ? <div key={i} style={{position: 'absolute', left: x, top: 470 + i * 20, width: 60, height: 6, background: '#C8743C', borderRadius: 3}} /> : null;
        })}
      <div style={{position: 'absolute', left: 140, top: 160, width: 820}}>
        {phase === 0 ? (
          <>
            <DateStamp date="MARCH 30, 1981" place="WASHINGTON HILTON" f={f} delay={2} big />
            <Label size={84} color={C.red} style={{marginTop: 24, opacity: prog(f, at(ev, 0, 40), 10)}}>
              SHOTS FIRED AT REAGAN
            </Label>
          </>
        ) : (
          <>
            <Label size={84}>AGENT TIM McCARTHY</Label>
            <Label size={70} color={C.inkSoft} style={{marginTop: 10, opacity: prog(f, at(ev, 0, 10), 8)}}>
              SPREAD HIS BODY IN FRONT
            </Label>
            <Label size={84} color={C.red} style={{marginTop: 10, opacity: hit ? 1 : 0}}>
              SHOT IN THE CHEST
            </Label>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Spinning coin → lands; "HE LOST". */
export const CoinFlip: React.FC<{ev?: number[]}> = ({ev}) => {
  const f = useCurrentFrame();
  const s = at(ev, 1, 30);
  const spin = f < s ? 0 : Math.min(1, (f - s) / 36);
  const y = f < s ? 0 : -Math.sin(spin * Math.PI) * 360;
  const sx = Math.abs(Math.cos(spin * Math.PI * 7));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', left: 140, top: 160, width: 760}}>
        <Label size={90} color={C.ink} style={{opacity: prog(f, at(ev, 0, 0), 8)}}>
          HE SURVIVED.
        </Label>
        <Label size={66} color={C.inkSoft} style={{marginTop: 14, opacity: prog(f, at(ev, 1, 30), 8)}}>
          HE WASN'T SCHEDULED TO WORK
        </Label>
        <Label size={110} color={C.red} style={{marginTop: 20, opacity: spin >= 1 ? 1 : 0}}>
          HE LOST A COIN FLIP
        </Label>
      </div>
      <div style={{position: 'absolute', left: 1280, top: 480, transform: `translateY(${y}px) scaleX(${0.15 + 0.85 * sx})`}}>
        <svg width={300} height={300} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="#C9A24A" stroke="#7A5A1C" strokeWidth="4" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#7A5A1C" strokeWidth="2" />
          <text x="50" y="62" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize="34" fill="#7A5A1C">
            25¢
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
