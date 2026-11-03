import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {CountUp, DateStamp, Hand, Icon, Label, RedStamp, Shatter, Spray} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';

type Line = {big: string; small?: string; at: number; color?: string; count?: {to: number; prefix?: string; suffix?: string}};

/** Dated event card. `at` values are fractions of the beat. */
export const StoryCard: React.FC<{date: string; place: string; icon: React.ComponentProps<typeof Icon>['name']; lines: Line[]; icon2?: React.ComponentProps<typeof Icon>['name']}> = ({
  date,
  place,
  icon,
  icon2,
  lines,
}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const ip = pop(f, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 300, width: 480, height: 480, borderRadius: 24, background: '#fff', border: `3px solid ${C.tileBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${0.8 + 0.2 * ip})`, opacity: ip}}>
        <Icon name={icon} size={icon2 ? 190 : 300} />
        {icon2 && <Icon name={icon2} size={190} />}
      </div>
      <div style={{position: 'absolute', left: 720, top: 0, bottom: 0, width: 1120, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <DateStamp date={date} place={place} f={f} delay={4} big />
        <div style={{height: 4, width: 760 * prog(f, 10, 18), background: C.ink, marginTop: 28, marginBottom: 30}} />
        {lines.map((l, i) => {
          const s = Math.round(l.at * d);
          const p = prog(f, s, 12);
          return (
            <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 24}px)`, marginBottom: 22, display: 'flex', alignItems: 'baseline', gap: 22}}>
              <Label size={l.small ? 150 : 104} color={l.color ?? C.ink}>
                {l.count ? <CountUp to={l.count.to} prefix={l.count.prefix} suffix={l.count.suffix} f={f} start={s} len={20} /> : l.big}
              </Label>
              {l.small && <Label size={58} color={C.inkSoft} weight={700}>{l.small}</Label>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** $106M vs $192K bars. */
export const MoneyBars: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const a = prog(f, 4, 24, easeInOut);
  const bAt = Math.round(d * 0.45);
  const b = prog(f, bAt, 14);
  const W = 1500;
  return (
    <AbsoluteFill style={{padding: '0 210px', justifyContent: 'center'}}>
      <Label size={54} color={C.inkSoft}>THE RESORT</Label>
      <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 110, color: C.ink, marginTop: 6}}>
        <CountUp to={106000000} prefix="$" f={f} start={4} len={24} />
      </div>
      <div style={{height: 70, width: W * a, background: C.ink, borderRadius: 8, marginTop: 14}} />
      <div style={{height: 90}} />
      <div style={{opacity: b}}>
        <Label size={54} color={C.inkSoft}>SPRINKLERS WHERE THERE WERE NONE</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 110, color: C.red, marginTop: 6}}>
          <CountUp to={192000} prefix="$" f={f} start={bAt} len={18} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 14}}>
          <div style={{height: 70, width: Math.max(5, W * (192000 / 106000000)), background: C.red, borderRadius: 2}} />
          <div style={{opacity: prog(f, bAt + 16, 10), transform: 'rotate(-3deg)'}}>
            <Hand size={64}>← 0.18% of the price</Hand>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Quote: React.FC<{text: string; highlight: string; who: string; whoSub: string}> = ({text, highlight, who, whoSub}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const [pre, post] = text.split(highlight);
  const hl = prog(f, Math.round(d * 0.35), 18, easeInOut);
  return (
    <AbsoluteFill style={{padding: '200px 230px', justifyContent: 'center'}}>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 220, color: C.red, lineHeight: 0.6, opacity: prog(f, 0, 8)}}>“</div>
      <div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 74, lineHeight: 1.3, color: C.ink, opacity: prog(f, 4, 12), marginTop: 30}}>
        {pre}
        <span style={{position: 'relative', whiteSpace: 'nowrap'}}>
          <span style={{position: 'absolute', left: -6, right: -6, bottom: 4, height: 28, background: '#FFD9D4', transformOrigin: 'left', transform: `scaleX(${hl})`, zIndex: 0}} />
          <span style={{position: 'relative', color: hl > 0.5 ? C.redDark : C.ink}}>{highlight}</span>
        </span>
        {post}
      </div>
      <div style={{marginTop: 50, opacity: prog(f, 16, 12)}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 44, color: C.ink}}>— {who}</div>
        <div style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: 28, color: C.inkFaint, marginTop: 8}}>{whoSub}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Uniform on a hanger hooked over the sprinkler → glass breaks → flood stats. */
export const Hanger: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const T = 16;
  const S = 380;
  const k = S / 200;
  const L = 260;
  const top = 40;
  const swing = f < T ? Math.sin(f / 3) * 3 : Math.sin(f / 5) * 8 * Math.exp(-(f - T) / 30);
  const fall = f > T + 6 ? Math.min(800, 1.1 * (f - T - 6) ** 2) : 0;
  const s1 = Math.round(d * 0.3);
  const s2 = Math.round(d * 0.52);
  const s3 = Math.round(d * 0.74);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: L, top}}>
        <Sprinkler bulb={{liquid: '#D9262B'}} size={S} broken={f >= T} />
      </div>
      <svg width={1000} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <Shatter t={f - T} color="#D9262B" cx={L + 100 * k} cy={top + 150 * k} scale={1.6} seed="hanger" />
        <Spray t={f - T - 4} cx={L + 100 * k} cy={top + 244 * k} scale={1.7} seed="hanger-s" />
        <g transform={`translate(${L + 100 * k} ${top + 200 * k + fall}) rotate(${swing})`}>
          <path d="M 0 0 a 16 16 0 1 1 16 16 L 0 34" stroke="#555" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M 0 34 L -130 100 L 130 100 Z" stroke="#555" strokeWidth={7} fill="none" strokeLinejoin="round" />
          <path d="M -120 100 L -150 330 L -60 330 L -50 160 L 50 160 L 60 330 L 150 330 L 120 100 Z" fill="#2D3A2E" />
          <path d="M -60 100 L 0 210 L 60 100" fill="#E8E6DF" />
          <rect x="-30" y="160" width="60" height="14" fill="#C9A24A" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-110 + i * 26} y={150} width={20} height={10} fill={['#B22', '#2A5', '#25B'][i]} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1020, top: 260, width: 820}}>
        {[
          {at: s1, big: '10 ROOMS', small: 'flooded'},
          {at: s2, big: '+ KITCHEN', small: '& dining area'},
          {at: s3, big: '≈ $700,000', small: 'sought in a lawsuit', red: true},
        ].map((l) => {
          const p = prog(f, l.at, 12);
          return (
            <div key={l.big} style={{opacity: p, transform: `translateX(${(1 - p) * 40}px)`, marginBottom: 40}}>
              <Label size={110} color={l.red ? C.red : C.ink}>
                {l.big}
              </Label>
              <div style={{fontFamily: fonts.body, fontWeight: 500, fontSize: 40, color: C.inkSoft, marginTop: 4}}>{l.small}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 1874 patent sheet with an ink sketch of the head. */
export const Patent: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const p = pop(f, 0, 16);
  const side = Math.round(d * 0.62);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 90,
          width: 720,
          height: 900,
          background: '#FBF6E9',
          border: '2px solid #D8CFB5',
          boxShadow: '0 20px 50px rgba(0,0,0,0.14)',
          transform: `rotate(-2.5deg) translateY(${(1 - p) * 80}px)`,
          opacity: p,
          padding: 50,
        }}
      >
        <div style={{fontFamily: fonts.mono, fontSize: 28, color: '#5A4A2A', letterSpacing: 3, textAlign: 'center'}}>U.S. PATENT No. 154,076</div>
        <div style={{fontFamily: fonts.mono, fontSize: 24, color: '#7A6A4A', letterSpacing: 2, textAlign: 'center', marginTop: 10}}>PATENTED AUG. 11, 1874</div>
        <div style={{height: 2, background: '#CFC3A0', margin: '26px 0'}} />
        <div style={{marginTop: 20}}>
          {Array.from({length: 22}).map((_, i) => (
            <div key={i} style={{height: 12, borderRadius: 6, background: '#D9CFB4', marginBottom: 16, width: `${[96, 88, 92, 70, 94, 90, 85, 60, 93, 89, 95, 78, 91, 87, 66, 94, 90, 83, 92, 58, 88, 40][i]}%`, opacity: prog(f, 6 + i, 6)}} />
          ))}
        </div>
        <div style={{fontFamily: fonts.mono, fontSize: 26, color: '#3B3226', textAlign: 'right', marginTop: 4, letterSpacing: 2, opacity: prog(f, 30, 12)}}>HENRY S. PARMELEE</div>
      </div>
      <div style={{position: 'absolute', left: 1060, top: 220, width: 760}}>
        <DateStamp date="AUG 11, 1874" place="NEW HAVEN, CONNECTICUT" f={f} delay={8} />
        <div style={{marginTop: 50, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(f, 22, 12)}}>
          <Icon name="piano" size={150} />
          <Label size={58}>A PIANO MAKER</Label>
        </div>
        <div style={{marginTop: 40, opacity: prog(f, side, 12), transform: `translateY(${(1 - prog(f, side, 12)) * 20}px)`}}>
          <Label size={52} color={C.inkSoft} weight={700}>
            PROTECT THE FACTORY
          </Label>
          <Label size={52} color={C.red} weight={800} style={{marginTop: 12}}>
            LOWER THE INSURANCE BILL
          </Label>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "Built to save LIVES" → struck → MONEY stamp. */
export const SaveMoney: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const strike = prog(f, Math.round(d * 0.4), 10);
  const stampAt = Math.round(d * 0.62);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', opacity: prog(f, 0, 8)}}>
        <Label size={84} color={C.inkSoft}>THE FIRST AUTOMATIC SPRINKLER</Label>
        <Label size={84} color={C.inkSoft} style={{marginTop: 14}}>WAS BUILT TO SAVE</Label>
        <div style={{position: 'relative', display: 'inline-block', marginTop: 30}}>
          <Label size={230}>LIVES</Label>
          <div style={{position: 'absolute', left: -20, top: '50%', height: 22, width: `${(100 + 8) * strike}%`, background: C.red, transform: 'rotate(-4deg)', borderRadius: 11}} />
        </div>
        <div style={{position: 'absolute', left: 1210, top: 600}}>
          <RedStamp text="MONEY" f={f} delay={stampAt} size={150} rotate={-12} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Ring: React.FC<{pct: number; f: number; start: number; label: string; color: string}> = ({pct, f, start, label, color}) => {
  const p = prog(f, start, 30, easeInOut) * (pct / 100);
  const R = 190;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: prog(f, start - 4, 8)}}>
      <div style={{position: 'relative', width: 460, height: 460}}>
        <svg width={460} height={460}>
          <circle cx={230} cy={230} r={R} stroke="#E6E3DC" strokeWidth={46} fill="none" />
          <circle cx={230} cy={230} r={R} stroke={color} strokeWidth={46} fill="none" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform="rotate(-90 230 230)" strokeLinecap="butt" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.mono, fontWeight: 700, fontSize: 110, color: C.ink}}>
          {Math.round(p * 100)}%
        </div>
      </div>
      <Label size={56} style={{marginTop: 24}}>
        {label}
      </Label>
    </div>
  );
};

export const StatRings: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 220, marginTop: -30}}>
        <Ring pct={77} f={f} start={Math.round(d * 0.22)} label="JUST ONE SPRINKLER" color={C.red} />
        <Ring pct={97} f={f} start={Math.round(d * 0.66)} label="FIVE OR FEWER" color={C.ink} />
      </div>
      <div style={{position: 'absolute', bottom: 70, fontFamily: fonts.mono, fontSize: 26, color: C.inkFaint, letterSpacing: 2}}>
        U.S. STRUCTURE FIRES WHERE SPRINKLERS OPERATED · 2015–2019 · NFPA
      </div>
    </AbsoluteFill>
  );
};

export const DeathBars: React.FC = () => {
  const f = useCurrentFrame();
  const a = prog(f, 4, 18, easeInOut);
  const b = prog(f, 22, 18, easeInOut);
  const W = 1300;
  return (
    <AbsoluteFill style={{padding: '250px 260px'}}>
      <Label size={44} color={C.inkSoft}>DEATHS PER FIRE · WITHOUT SPRINKLERS</Label>
      <div style={{height: 110, width: W * a, background: C.ink, borderRadius: 8, marginTop: 16}} />
      <div style={{height: 80}} />
      <Label size={44} color={C.inkSoft} style={{opacity: b}}>WITH SPRINKLERS</Label>
      <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 16}}>
        <div style={{height: 110, width: W * 0.11 * b, background: C.red, borderRadius: 8}} />
        <div style={{opacity: prog(f, 36, 10)}}>
          <Label size={110} color={C.red}>≈ 90% LOWER</Label>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 260, fontFamily: fonts.mono, fontSize: 26, color: C.inkFaint, letterSpacing: 2}}>
        CIVILIAN DEATH RATE PER REPORTED FIRE · 2015–2019 · NFPA
      </div>
    </AbsoluteFill>
  );
};

export const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const likeAt = Math.round(d * 0.35);
  const subAt = Math.round(d * 0.55);
  const lk = pop(f, likeAt, 9);
  const sb = f >= subAt + 8;
  const press = interpolate(f, [subAt, subAt + 4, subAt + 8], [1, 0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 60, flexDirection: 'row'}}>
      <div style={{width: 200, height: 200, borderRadius: 100, background: f >= likeAt ? C.ink : '#fff', border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * lk})`, opacity: prog(f, 0, 8)}}>
        <svg viewBox="0 0 100 100" width={110} height={110}>
          <path d="M 30 45 L 30 88 L 16 88 L 16 45 Z M 36 86 L 36 46 L 52 14 C 60 12 64 20 62 28 L 58 42 L 82 42 C 90 42 92 50 89 56 L 80 82 C 78 86 74 88 70 88 Z" fill={f >= likeAt ? '#fff' : C.ink} />
        </svg>
      </div>
      <div style={{padding: '44px 90px', borderRadius: 110, background: sb ? '#E6E3DC' : C.red, transform: `scale(${press})`, opacity: prog(f, 4, 8)}}>
        <Label size={90} color={sb ? C.inkSoft : '#fff'}>
          {sb ? 'SUBSCRIBED' : 'SUBSCRIBE'}
        </Label>
      </div>
    </AbsoluteFill>
  );
};
