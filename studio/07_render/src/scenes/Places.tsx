import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, fonts} from '../theme';
import {ITEMS, easeInOut, itemByKey, pop, prog} from '../lib';
import {Chip, Hand, Icon, Label, RedStamp, Shatter, Spray} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';

const HeatWaves: React.FC<{x: number; y: number; w: number; h: number; f: number; color?: string; n?: number}> = ({x, y, w, h, f, color = C.heat, n = 5}) => (
  <g opacity={0.75}>
    {Array.from({length: n}).map((_, i) => {
      const cx = x + (w / (n + 1)) * (i + 1);
      const off = ((f * 2 + i * 23) % h) / h;
      const yy = y + h * (1 - off);
      const op = Math.sin(off * Math.PI);
      return (
        <path
          key={i}
          d={`M ${cx} ${yy} q 12 -18 0 -36 q -12 -18 0 -36`}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={op}
        />
      );
    })}
  </g>
);

const ReadChip: React.FC<{text: string; f: number; at: number; color?: string}> = ({text, f, at, color = C.heat}) => {
  const p = pop(f, at, 12);
  return (
    <div style={{transform: `scale(${p})`, display: 'inline-block'}}>
      <Chip color={color} size={40}>
        {text}
      </Chip>
    </div>
  );
};

/** Two panels: skylight in sun | attic under a bare roof. */
export const SkylightAttic: React.FC<{item: string}> = ({item}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const it = itemByKey(item);
  const second = Math.round(d * 0.42);
  const panel = (kind: 'sky' | 'attic', start: number) => {
    const p = prog(f, start, 14);
    return (
      <div style={{width: 780, height: 760, background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 16, position: 'relative', overflow: 'hidden', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
        <svg width={780} height={760} style={{position: 'absolute'}}>
          {kind === 'sky' ? (
            <>
              <rect x={0} y={0} width={780} height={240} fill="#E9F2F8" />
              <rect x={0} y={230} width={780} height={26} fill="#C9C4B8" />
              <rect x={290} y={230} width={200} height={26} fill="#BFE0F5" stroke="#8FB3CC" strokeWidth={3} />
              <polygon points={`290,256 490,256 ${640},760 ${140},760`} fill="#FFE9A8" opacity={0.45} />
              <g transform="translate(330 40)">
                <circle cx={60} cy={60} r={56} fill="#FFC93C" />
              </g>
            </>
          ) : (
            <>
              <rect x={0} y={0} width={780} height={760} fill="#FBF7EE" />
              <polygon points="0,250 390,30 780,250" fill="#8C6B4B" />
              <polygon points="30,250 390,58 750,250" fill="#F7EAD6" />
              <rect x={0} y={250} width={780} height={22} fill="#C9C4B8" />
              <g transform="translate(560 -10)">
                <circle cx={60} cy={60} r={50} fill="#FFC93C" />
              </g>
            </>
          )}
          <HeatWaves x={120} y={kind === 'sky' ? 300 : 100} w={540} h={160} f={f} />
        </svg>
        <div style={{position: 'absolute', left: 300, top: kind === 'sky' ? 256 : 272}}>
          <Sprinkler bulb={{liquid: it.color}} size={180} glow={0.25 + 0.2 * Math.sin(f / 8)} />
        </div>
        <div style={{position: 'absolute', left: 30, bottom: 30}}>
          <Label size={54}>{kind === 'sky' ? 'UNDER A SKYLIGHT' : 'IN AN ATTIC'}</Label>
        </div>
        <div style={{position: 'absolute', right: 30, bottom: 34}}>
          <ReadChip text="> 100°F" f={f} at={start + 18} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{flexDirection: 'row', gap: 60, alignItems: 'center', justifyContent: 'center'}}>
      {panel('sky', 0)}
      {panel('attic', second)}
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', opacity: prog(f, Math.round(d * 0.75), 12)}}>
        <Hand size={64}>no fire anywhere</Hand>
      </div>
    </AbsoluteFill>
  );
};

/** Unit heater blowing hot air at a ceiling head. */
export const Heater: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const blue = itemByKey('blue');
  const badAt = Math.round(d * 0.62);
  const bad = prog(f, badAt, 12);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={150} width={1920} height={30} fill="#C9C4B8" />
        <line x1={240} x2={240} y1={180} y2={430} stroke="#7B818B" strokeWidth={10} />
        <line x1={480} x2={480} y1={180} y2={430} stroke="#7B818B" strokeWidth={10} />
        <g transform="translate(200 430)">
          <rect x={0} y={0} width={320} height={210} rx={14} fill="#5E646E" />
          <rect x={300} y={20} width={30} height={170} rx={6} fill="#4A4F57" />
          {Array.from({length: 7}).map((_, i) => (
            <line key={i} x1={312} x2={318} y1={34 + i * 22} y2={34 + i * 22} stroke="#2E3238" strokeWidth={8} />
          ))}
          <circle cx={150} cy={105} r={70} fill="#4A4F57" />
          <g transform={`rotate(${f * 24} 150 105)`}>
            {[0, 90, 180, 270].map((r) => (
              <ellipse key={r} cx={150} cy={70} rx={16} ry={34} fill="#80868F" transform={`rotate(${r} 150 105)`} />
            ))}
          </g>
        </g>
        {Array.from({length: 8}).map((_, i) => {
          const t = ((f * 1.5 + i * 12) % 96) / 96;
          const x = 540 + t * 360;
          const y = 540 - t * 300 + Math.sin(t * 8 + i) * 16;
          return <path key={i} d={`M ${x} ${y} q 18 -14 36 0`} stroke={C.heat} strokeWidth={7} fill="none" strokeLinecap="round" opacity={Math.sin(t * Math.PI)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 820, top: 180}}>
        <Sprinkler bulb={{liquid: blue.color}} size={220} glow={0.5} />
      </div>
      <div style={{position: 'absolute', left: 180, top: 680}}>
        <Label size={54}>INDUSTRIAL UNIT HEATER</Label>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 230, width: 700}}>
        <ReadChip text="CEILING UP TO 225°F" f={f} at={12} />
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 50, opacity: bad}}>
          <div style={{position: 'relative'}}>
            <Sprinkler bulb={{liquid: '#D9262B'}} size={150} />
            <svg width={200} height={200} style={{position: 'absolute', left: -25, top: 30}}>
              <g stroke={C.red} strokeWidth={12} strokeLinecap="round">
                <line x1={20} y1={20} x2={180} y2={180} />
                <line x1={180} y1={20} x2={20} y2={180} />
              </g>
            </svg>
          </div>
          <div>
            <Label size={68} color={C.red}>RED 155°F</Label>
            <Hand size={56} color={C.inkSoft} style={{marginTop: 10}}>
              a leak waiting to happen
            </Hand>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const rows = [
  {cls: 'ORDINARY', ceil: '100°F', bulbs: ['orange', 'red']},
  {cls: 'INTERMEDIATE', ceil: '150°F', bulbs: ['yellow', 'green']},
  {cls: 'HIGH', ceil: '225°F', bulbs: ['blue']},
  {cls: 'EXTRA HIGH', ceil: '300°F', bulbs: ['purple']},
  {cls: 'VERY EXTRA & ULTRA', ceil: 'hotter', bulbs: ['black']},
];

const BulbPill: React.FC<{color: string; h?: number}> = ({color, h = 70}) => (
  <svg width={h * 0.34} height={h} viewBox="0 0 20 60">
    <rect x={2} y={2} width={16} height={56} rx={8} fill={color} />
    <rect x={5} y={8} width={3} height={40} rx={1.5} fill="#fff" opacity={0.6} />
  </svg>
);

export const ClassTable: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const step = Math.max(6, Math.round((d * 0.7) / rows.length));
  return (
    <AbsoluteFill style={{padding: '140px 220px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '560px 420px 520px', fontFamily: fonts.mono, fontWeight: 700, fontSize: 28, color: C.inkFaint, letterSpacing: 3, paddingBottom: 18, borderBottom: `3px solid ${C.ink}`}}>
        <div>CLASS</div>
        <div>CEILING UP TO</div>
        <div>BULB BREAKS AT</div>
      </div>
      {rows.map((r, i) => {
        const p = prog(f, 6 + i * step, 10);
        return (
          <div key={r.cls} style={{display: 'grid', gridTemplateColumns: '560px 420px 520px', alignItems: 'center', height: 140, borderBottom: `2px solid ${C.tileBorder}`, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
            <Label size={58}>{r.cls}</Label>
            <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 52, color: C.inkSoft}}>{r.ceil}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              {r.bulbs.map((b) => {
                const it = itemByKey(b);
                return (
                  <div key={b} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <BulbPill color={it.color} />
                    <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 44, color: C.ink}}>{it.temp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Green 200°F vs water boiling at 212°F. */
export const Boil: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const green = itemByKey('green');
  const lo = 150;
  const hi = 225;
  const p = prog(f, 6, d * 0.7, easeInOut);
  const temp = lo + (hi - lo) * p;
  const Y0 = 900;
  const Y1 = 160;
  const y = (t: number) => Y0 - ((t - lo) / (hi - lo)) * (Y0 - Y1);
  const broke = temp >= 200;
  const boils = temp >= 212;
  const T = Math.round(6 + (d * 0.7 * (200 - lo)) / (hi - lo));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={900} y={Y1 - 20} width={60} height={Y0 - Y1 + 40} rx={30} fill="#fff" stroke={C.tileBorder} strokeWidth={4} />
        <rect x={912} y={y(temp)} width={36} height={Y0 - y(temp) + 10} rx={18} fill={C.heat} />
        {[150, 175, 200, 212, 225].map((t) => (
          <g key={t}>
            <line x1={968} x2={995} y1={y(t)} y2={y(t)} stroke={C.inkFaint} strokeWidth={4} />
          </g>
        ))}
        <line x1={600} x2={1260} y1={y(200)} y2={y(200)} stroke={green.color} strokeWidth={5} strokeDasharray="14 10" />
        <line x1={600} x2={1260} y1={y(212)} y2={y(212)} stroke="#4FA3E0" strokeWidth={5} strokeDasharray="14 10" />
        <Shatter t={f - T} color={green.color} cx={480} cy={y(200) - 10} scale={1.2} seed="boil" />
      </svg>
      <div style={{position: 'absolute', left: 1030, top: y(temp) - 34, fontFamily: fonts.mono, fontWeight: 700, fontSize: 60, color: C.ink}}>{Math.round(temp)}°F</div>
      <div style={{position: 'absolute', left: 360, top: y(200) - 230}}>
        <Sprinkler bulb={{liquid: green.color}} size={160} broken={broke} />
      </div>
      <div style={{position: 'absolute', left: 120, top: y(200) + 16}}>
        <Label size={50} color={green.color}>GREEN BREAKS · 200°F</Label>
      </div>
      <div style={{position: 'absolute', left: 1330, top: y(212) - 190, opacity: 0.5 + 0.5 * prog(f, T, 10)}}>
        <Icon name="pot" size={170} color={boils ? C.ink : C.inkFaint} />
      </div>
      <div style={{position: 'absolute', left: 1300, top: y(212) + 16}}>
        <Label size={50} color="#2B7BB9">WATER BOILS · 212°F</Label>
      </div>
    </AbsoluteFill>
  );
};

/** 0–700°F scale with every rating, black covers 400–650. */
export const RangeBar: React.FC = () => {
  const f = useCurrentFrame();
  const X0 = 140;
  const X1 = 1780;
  const x = (t: number) => X0 + (t / 700) * (X1 - X0);
  const Y = 560;
  const band = prog(f, 10, 24, easeInOut);
  const m500 = prog(f, 44, 12);
  const colored = ITEMS.slice(0, 6);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={X0} x2={X1} y1={Y} y2={Y} stroke={C.ink} strokeWidth={6} />
        {[0, 100, 200, 300, 400, 500, 600, 700].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={Y} y2={Y + 24} stroke={C.ink} strokeWidth={4} />
            <text x={x(t)} y={Y + 70} textAnchor="middle" fontFamily={fonts.mono} fontWeight={700} fontSize={32} fill={C.inkSoft}>
              {t}°F
            </text>
          </g>
        ))}
        {colored.map((it, i) => {
          const t = parseInt(it.temp, 10);
          const p = prog(f, 2 + i * 3, 8);
          return <circle key={it.key} cx={x(t)} cy={Y - 50} r={22 * p} fill={it.color} stroke="#fff" strokeWidth={4} />;
        })}
        <rect x={x(400)} y={Y - 150} width={(x(650) - x(400)) * band} height={70} rx={8} fill="#1B1B1F" />
        <line x1={x(500)} x2={x(500)} y1={Y - 160} y2={Y} stroke={C.red} strokeWidth={6} opacity={m500} />
      </svg>
      <div style={{position: 'absolute', left: x(400), top: Y - 250, opacity: band}}>
        <Label size={64}>BLACK · 400°F → 650°F</Label>
      </div>
      <div style={{position: 'absolute', left: x(500) - 160, top: Y + 110, width: 320, textAlign: 'center', opacity: m500}}>
        <Hand size={56}>one common rating: 500°F</Hand>
      </div>
      <div style={{position: 'absolute', left: X0, top: Y + 110, opacity: prog(f, 20, 12)}}>
        <Label size={40} color={C.inkSoft}>EVERY OTHER COLOR = ONE NUMBER</Label>
      </div>
    </AbsoluteFill>
  );
};

export const IconRow: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const names: ('oven' | 'heater' | 'factory')[] = ['oven', 'heater', 'factory'];
  const labels = ['OVENS', 'HEATERS', 'INDUSTRIAL PROCESSES'];
  const stampAt = Math.round(d * 0.66);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 70, marginTop: -80}}>
        {names.map((n, i) => {
          const p = pop(f, 4 + i * 8, 12);
          return (
            <div key={n} style={{width: 420, height: 420, background: '#fff', border: `3px solid ${C.tileBorder}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * p})`, opacity: p, position: 'relative'}}>
              <svg width={420} height={180} style={{position: 'absolute', top: 0}}>
                <HeatWaves x={60} y={10} w={300} h={150} f={f + i * 10} n={4} />
              </svg>
              <Icon name={n} size={200} />
              <Label size={44} style={{marginTop: 20}}>
                {labels[i]}
              </Label>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 110}}>
        <RedStamp text="A WARNING ABOUT THE ROOM" f={f} delay={stampAt} size={70} rotate={-4} />
      </div>
    </AbsoluteFill>
  );
};

/** One head: bulb code vs frame code callouts, frame gets painted red. */
export const FrameCode: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const paintAt = Math.round(d * 0.45);
  const paint = prog(f, paintAt, 16);
  const purple = itemByKey('purple');
  const frameColor = paint > 0.02 ? `rgba(215,38,46,${paint})` : null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 660, top: 40}}>
        <div style={{position: 'relative'}}>
          <Sprinkler bulb={{liquid: purple.color}} size={400} />
          {frameColor && (
            <div style={{position: 'absolute', left: 0, top: 0}}>
              <Sprinkler bulb={{liquid: purple.color}} size={400} frameColor="#D7262E" style={{opacity: paint}} />
            </div>
          )}
        </div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M 600 420 L 848 420" stroke={C.ink} strokeWidth={4} opacity={prog(f, 10, 10)} />
        <circle cx={852} cy={420} r={8} fill={C.ink} opacity={prog(f, 10, 10)} />
        <path d="M 912 330 L 1310 330" stroke={C.red} strokeWidth={4} opacity={prog(f, paintAt, 10)} />
        <circle cx={908} cy={330} r={8} fill={C.red} opacity={prog(f, paintAt, 10)} />
      </svg>
      <div style={{position: 'absolute', left: 170, top: 380, textAlign: 'right', width: 420, opacity: prog(f, 10, 10)}}>
        <Label size={64}>BULB CODE</Label>
        <div style={{fontFamily: fonts.body, fontSize: 32, color: C.inkSoft, marginTop: 6}}>the liquid</div>
      </div>
      <div style={{position: 'absolute', left: 1330, top: 290, opacity: prog(f, paintAt, 10)}}>
        <Label size={64} color={C.red}>FRAME CODE</Label>
        <div style={{fontFamily: fonts.body, fontSize: 32, color: C.inkSoft, marginTop: 6}}>a different list</div>
      </div>
    </AbsoluteFill>
  );
};

/** Two heads side by side. */
export const Compare: React.FC<{
  left: {liquid: string; frame?: string; response?: 'standard' | 'quick'; title: string; sub: string; dim?: string};
  right: {liquid: string; frame?: string; response?: 'standard' | 'quick'; title: string; sub: string; dim?: string};
  mid?: string;
  midAt?: number;
  verdict?: string;
  verdictAt?: number;
}> = ({left, right, mid = '≠', midAt = 0.3, verdict, verdictAt = 0.7}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const side = (s: typeof left, x: number, delay: number) => {
    const p = pop(f, delay, 13);
    return (
      <div style={{position: 'absolute', left: x, top: 60, width: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 40}px)`}}>
        <div style={{position: 'relative'}}>
          <Sprinkler bulb={{liquid: s.liquid, response: s.response}} frameColor={s.frame ?? null} size={330} />
          {s.dim && (
            <div style={{position: 'absolute', left: 250, top: 230, opacity: prog(f, delay + 14, 10)}}>
              <svg width={40} height={180}>
                <line x1={6} x2={34} y1={4} y2={4} stroke={C.red} strokeWidth={4} />
                <line x1={20} x2={20} y1={4} y2={176} stroke={C.red} strokeWidth={3} strokeDasharray="6 6" />
              </svg>
              <div style={{position: 'absolute', left: 46, top: 60, fontFamily: fonts.mono, fontWeight: 700, fontSize: 46, color: C.red, whiteSpace: 'nowrap'}}>{s.dim}</div>
            </div>
          )}
        </div>
        <Label size={74} style={{marginTop: -10}}>
          {s.title}
        </Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 36, color: C.inkSoft, marginTop: 10}}>{s.sub}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {side(left, 220, 0)}
      {side(right, 1100, 6)}
      <div style={{position: 'absolute', left: 860, top: 380, width: 200, textAlign: 'center', fontFamily: fonts.label, fontWeight: 800, fontSize: 200, color: C.red, transform: `scale(${pop(f, Math.round(d * midAt), 10)})`}}>{mid}</div>
      {verdict && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
          <RedStamp text={verdict} f={f} delay={Math.round(d * verdictAt)} size={66} rotate={-3} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Thin vs thick bulb heating; thin breaks first. */
export const Race: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const red = '#D9262B';
  const tThin = Math.round(d * 0.3);
  const tThick = Math.round(d * 0.58);
  const head = (x: number, T: number, quick: boolean, title: string) => {
    const e = interpolate(f, [0, T], [0, 1], {extrapolateRight: 'clamp'});
    const S = 330;
    const k = S / 200;
    return (
      <>
        <div style={{position: 'absolute', left: x, top: 40}}>
          <Sprinkler bulb={{liquid: red, response: quick ? 'quick' : 'standard'}} size={S} expansion={e} broken={f >= T} glow={f < T ? e : 0} />
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
          <Shatter t={f - T} color={red} cx={x + 100 * k} cy={40 + 150 * k} scale={1.4} seed={`race${quick}`} />
          <Spray t={f - T - 4} cx={x + 100 * k} cy={40 + 244 * k} scale={1.5} seed={`racesp${quick}`} intensity={0.8} />
        </svg>
        <div style={{position: 'absolute', left: x - 100, width: S + 200, top: 780, textAlign: 'center'}}>
          <Label size={60}>{title}</Label>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 44, color: f >= T ? C.red : C.inkFaint, marginTop: 10}}>
            {f >= T ? (quick ? 'OPENS FIRST' : 'OPENS SECOND') : 'HEATING…'}
          </div>
        </div>
      </>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: prog(f, 0, 10)}}>
        <Chip color={C.heat} size={36}>
          SAME FIRE · SAME RATING
        </Chip>
      </div>
      {head(400, tThick, false, 'STANDARD · 5 mm')}
      {head(1180, tThin, true, 'QUICK · 3 mm')}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', opacity: prog(f, tThick + 10, 12)}}>
        <Hand size={58}>color = when · thickness = how fast</Hand>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Corridor ceiling with 6 heads, fire under one.
 * mode 'mythReal': first half movie (all open, MYTH stamp), second half reality (one opens).
 * mode 'deluge': all open at once.  mode 'real': only one opens (with optional caption).
 */
export const CeilingRow: React.FC<{mode: 'mythReal' | 'deluge' | 'real'; caption?: string}> = ({mode, caption}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const N = 6;
  const xs = Array.from({length: N}).map((_, i) => 210 + i * 300);
  const FIRE = 2;
  const split = Math.round(d * 0.42);
  const phase: 'movie' | 'real' | 'deluge' = mode === 'deluge' ? 'deluge' : mode === 'real' ? 'real' : f < split ? 'movie' : 'real';
  const lf = phase === 'real' && mode === 'mythReal' ? f - split : f;
  const openAt = phase === 'real' ? 26 : 14;
  const isOpen = (i: number) => (phase === 'real' ? i === FIRE : true);
  const S = 150;
  const k = S / 200;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={80} width={1920} height={40} fill="#C9C4B8" />
        <line x1={0} x2={1920} y1={950} y2={950} stroke={C.tileBorder} strokeWidth={6} />
        {phase !== 'deluge' &&
          Array.from({length: 7}).map((_, i) => {
            const t = ((lf * 2 + i * 20) % 120) / 120;
            const x = xs[FIRE] + 75 + Math.sin(t * 8 + i) * 40;
            const y = 900 - t * 640;
            return <circle key={i} cx={x} cy={y} r={30 + t * 60} fill={C.heat} opacity={0.14 * Math.sin(t * Math.PI)} />;
          })}
        {xs.map((x, i) =>
          isOpen(i) ? (
            <g key={i}>
              {phase !== 'deluge' && <Shatter t={lf - openAt} color="#D9262B" cx={x + 100 * k} cy={120 + 150 * k} scale={0.9} seed={`row${i}${phase}`} />}
              <Spray t={lf - openAt - 3} cx={x + 100 * k} cy={120 + 244 * k} scale={1.15} seed={`rowsp${i}${phase}`} intensity={0.75} />
            </g>
          ) : null,
        )}
        {phase === 'real' &&
          Array.from({length: 4}).map((_, i) => {
            const x = ((lf * 4 + i * 520) % 2400) - 300;
            return (
              <g key={`sm${i}`} transform={`translate(${x} ${300 + (i % 2) * 40}) scale(2.2)`} opacity={0.25}>
                <path d="M 20 80 c -12 0 -12 -18 0 -18 c 0 -14 20 -14 22 -4 c 6 -10 24 -6 22 6 c 12 0 12 16 0 16 Z" fill="#8A8A92" />
              </g>
            );
          })}
      </svg>
      {xs.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 120}}>
          <Sprinkler bulb={phase === 'deluge' ? null : {liquid: '#D9262B'}} size={S} broken={phase === 'deluge' || (isOpen(i) && lf >= openAt)} />
        </div>
      ))}
      {phase !== 'deluge' && (
        <div style={{position: 'absolute', left: xs[FIRE] - 10, top: 760}}>
          <Icon name="fire" size={190} />
        </div>
      )}
      <div style={{position: 'absolute', left: 80, bottom: 40}}>
        {phase === 'movie' && <Label size={70} color={C.inkSoft}>IN THE MOVIES</Label>}
        {phase === 'real' && <Label size={70}>{caption ?? 'IN REAL LIFE'}</Label>}
        {phase === 'deluge' && (
          <div>
            <Label size={70}>DELUGE SYSTEM</Label>
            <Hand size={52} color={C.inkSoft} style={{marginTop: 6}}>
              open heads · all discharge at once
            </Hand>
          </div>
        )}
      </div>
      {phase === 'movie' && (
        <div style={{position: 'absolute', right: 120, bottom: 60}}>
          <RedStamp text="MYTH" f={f} delay={openAt + 22} size={120} rotate={-12} />
        </div>
      )}
      {phase === 'deluge' && (
        <div style={{position: 'absolute', right: 120, bottom: 60}}>
          <RedStamp text="THE EXCEPTION" f={f} delay={Math.round(d * 0.5)} size={80} rotate={-8} />
        </div>
      )}
      {phase === 'real' && mode === 'mythReal' && (
        <div style={{position: 'absolute', right: 120, bottom: 70, opacity: prog(lf, openAt + 20, 12)}}>
          <Chip color={C.ink} size={40}>
            HEAT, NOT SMOKE
          </Chip>
        </div>
      )}
    </AbsoluteFill>
  );
};
