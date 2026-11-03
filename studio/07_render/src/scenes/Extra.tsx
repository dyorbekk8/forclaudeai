import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {itemByKey, pop, prog} from '../lib';
import {Chip, Hand, Icon, Label, RedStamp, Shatter, Spray} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';

type IconName = React.ComponentProps<typeof Icon>['name'];

/** Real photo with slow push-in, caption chip and credit line. */
export const Photo: React.FC<{src: string; caption?: string; credit: string; focus?: [number, number]; zoom?: [number, number]; side?: string}> = ({
  src,
  caption,
  credit,
  focus = [50, 50],
  zoom = [1.04, 1.16],
  side,
}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const z = interpolate(f, [0, d], zoom);
  const ap = pop(f, 0, 16);
  const full = !side;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: full ? 0 : 120,
          top: full ? 0 : 110,
          width: full ? 1920 : 1080,
          height: full ? 1080 : 860,
          overflow: 'hidden',
          borderRadius: full ? 0 : 18,
          boxShadow: full ? 'none' : '0 24px 60px rgba(0,0,0,0.18)',
          transform: full ? 'none' : `rotate(-1deg) scale(${0.92 + 0.08 * ap})`,
          opacity: full ? 1 : ap,
        }}
      >
        <Img src={staticFile(`photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus[0]}% ${focus[1]}%`, transform: `scale(${z})`, transformOrigin: `${focus[0]}% ${focus[1]}%`}} />
        {full && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}} />}
      </div>
      {side && (
        <div style={{position: 'absolute', left: 1280, top: 0, bottom: 0, width: 560, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: prog(f, 8, 12)}}>
          <Label size={84}>{side}</Label>
        </div>
      )}
      {caption && (
        <div style={{position: 'absolute', left: full ? 80 : 150, bottom: full ? 70 : 140, opacity: prog(f, 6, 10), transform: `translateY(${(1 - prog(f, 6, 10)) * 20}px)`}}>
          <Chip color={full ? '#fff' : C.ink} fg={full ? C.ink : '#fff'} size={44}>
            {caption}
          </Chip>
        </div>
      )}
      <div style={{position: 'absolute', right: 24, bottom: 14, fontFamily: fonts.body, fontSize: 18, color: full ? 'rgba(255,255,255,0.75)' : C.inkFaint}}>{credit}</div>
    </AbsoluteFill>
  );
};

/** Big kinetic words: each line slides up in turn; optional red last line / stamp. */
export const Words: React.FC<{lines: string[]; red?: number[]; stamp?: string; icon?: IconName; size?: number}> = ({lines, red = [], stamp, icon, size = 150}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const step = Math.max(6, Math.round((d * 0.5) / Math.max(1, lines.length)));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 70}}>
      {icon && (
        <div style={{transform: `scale(${pop(f, 0, 12)})`}}>
          <Icon name={icon} size={300} />
        </div>
      )}
      <div style={{textAlign: icon ? 'left' : 'center'}}>
        {lines.map((l, i) => {
          const p = prog(f, i * step, 10);
          return (
            <div key={i} style={{overflow: 'hidden'}}>
              <Label size={size} color={red.includes(i) ? C.red : C.ink} style={{transform: `translateY(${(1 - p) * 105}%)`, lineHeight: 1.08}}>
                {l}
              </Label>
            </div>
          );
        })}
      </div>
      {stamp && (
        <div style={{position: 'absolute', right: 160, bottom: 140}}>
          <RedStamp text={stamp} f={f} delay={Math.round(d * 0.6)} size={90} rotate={-10} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** A vs B with icons and a verdict sign. */
export const Versus: React.FC<{a: {icon: IconName; label: string}; b: {icon: IconName; label: string}; sign?: string; verdict?: string; aBad?: boolean}> = ({a, b, sign = '=', verdict, aBad}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const card = (s: {icon: IconName; label: string}, delay: number, bad?: boolean) => {
    const p = pop(f, delay, 12);
    return (
      <div style={{width: 520, height: 560, background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p), position: 'relative'}}>
        <Icon name={s.icon} size={280} />
        <Label size={72} style={{marginTop: 20}}>
          {s.label}
        </Label>
        {bad && (
          <svg width={520} height={560} style={{position: 'absolute', left: 0, top: 0}}>
            <g stroke={C.red} strokeWidth={16} strokeLinecap="round" opacity={prog(f, Math.round(d * 0.5), 8)}>
              <line x1={80} y1={80} x2={440} y2={480} />
              <line x1={440} y1={80} x2={80} y2={480} />
            </g>
          </svg>
        )}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 90}}>
      {card(a, 0, aBad)}
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 220, color: C.red, transform: `scale(${pop(f, 10, 10)})`}}>{sign}</div>
      {card(b, 6)}
      {verdict && (
        <div style={{position: 'absolute', bottom: 60}}>
          <Hand size={70} color={C.ink}>
            {verdict}
          </Hand>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Close-up of one head with labelled callouts that appear one by one. */
export const MacroCallout: React.FC<{item: string; target: 'bulb' | 'deflector' | 'frame'; labels: string[]; expansion?: number; crack?: boolean}> = ({item, target, labels, expansion = 0, crack}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const it = itemByKey(item);
  const S = target === 'bulb' ? 1150 : 900;
  const k = S / 200;
  const cy = target === 'bulb' ? 150 : target === 'deflector' ? 238 : 140;
  const cx = target === 'frame' ? 72 : 100;
  const z = interpolate(f, [0, d], [1, 1.08]);
  const step = Math.max(8, Math.round((d * 0.55) / labels.length));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 820 - cx * k, top: 540 - cy * k, transform: `scale(${z})`, transformOrigin: `${cx * k}px ${cy * k}px`}}>
        <Sprinkler bulb={it.fusible ? null : {liquid: it.color, response: it.response}} fusible={it.fusible} size={S} expansion={expansion} />
        {crack && (
          <svg width={S} height={S * 1.5} viewBox="0 0 200 300" style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M 96 120 L 101 128 L 97 136 L 103 146 L 99 155" stroke="#fff" strokeWidth={0.9} fill="none" strokeDasharray="60" strokeDashoffset={60 * (1 - prog(f, Math.round(d * 0.3), 12))} />
          </svg>
        )}
      </div>
      <div style={{position: 'absolute', left: 1240, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34}}>
        {labels.map((l, i) => {
          const p = prog(f, 4 + i * step, 10);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{width: 60, height: 6, background: i === labels.length - 1 ? C.red : C.ink, borderRadius: 3}} />
              <Label size={74} color={i === labels.length - 1 ? C.red : C.ink}>
                {l}
              </Label>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Orange head under a skylight going off with no fire. */
export const SunBurst: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const orange = itemByKey('orange');
  const T = Math.round(d * 0.45);
  const S = 360;
  const k = S / 200;
  const L = 780;
  const top = 250;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={0} width={1920} height={230} fill="#E9F2F8" />
        <rect x={0} y={222} width={1920} height={28} fill="#C9C4B8" />
        <rect x={760} y={222} width={400} height={28} fill="#BFE0F5" stroke="#8FB3CC" strokeWidth={3} />
        <polygon points="760,250 1160,250 1420,1080 500,1080" fill="#FFE9A8" opacity={0.45} />
        <circle cx={960} cy={110} r={80 + 6 * Math.sin(f / 6)} fill="#FFC93C" />
        <Shatter t={f - T} color={orange.color} cx={L + 100 * k} cy={top + 150 * k} scale={1.6} seed="sun" />
        <Spray t={f - T - 4} cx={L + 100 * k} cy={top + 244 * k} scale={1.8} seed="sunsp" />
      </svg>
      <div style={{position: 'absolute', left: L, top}}>
        <Sprinkler bulb={{liquid: orange.color}} size={S} broken={f >= T} expansion={Math.min(1, f / T)} glow={f < T ? 0.6 : 0} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 330, opacity: prog(f, 4, 10)}}>
        <Label size={64}>ORANGE · 135°F</Label>
        <Label size={44} color={C.inkSoft} style={{marginTop: 10}}>
          CEILING · 150°F
        </Label>
      </div>
      <div style={{position: 'absolute', right: 140, bottom: 120}}>
        <RedStamp text="NO FIRE" f={f} delay={T + 10} size={100} rotate={-10} />
      </div>
    </AbsoluteFill>
  );
};

/** Short title card used as the first frames: topic named immediately. */
export const TopicOpen: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 26, marginBottom: 40}}>
        {['orange', 'red', 'yellow', 'green', 'blue', 'purple', 'black'].map((k, i) => (
          <div key={k} style={{transform: `translateY(${(1 - Math.min(1, pop(f, i * 2, 12))) * 300}px)`}}>
            <Sprinkler bulb={{liquid: itemByKey(k).color}} size={150} />
          </div>
        ))}
      </div>
      <Label size={120} style={{opacity: prog(f, 10, 8)}}>
        EVERY SPRINKLER COLOR
      </Label>
    </AbsoluteFill>
  );
};

