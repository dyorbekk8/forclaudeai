import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import edl from './edl.json';
import {C, fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {Hand, Label, Paper, RedStamp} from '../components/ui';
import {Perimeter} from '../prison/scenes';

type W = {w: string; f: number};

/** Big word-by-word captions: groups of up to 3 words, current word highlighted. */
const Captions: React.FC<{words: W[]}> = ({words}) => {
  const f = useCurrentFrame();
  let cur = 0;
  words.forEach((w, i) => {
    if (f >= w.f) cur = i;
  });
  const g0 = Math.floor(cur / 3) * 3;
  const group = words.slice(g0, g0 + 3);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1330, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18}}>
      {group.map((w, i) => {
        const idx = g0 + i;
        const on = idx === cur;
        const shown = f >= w.f;
        return (
          <div
            key={idx}
            style={{
              fontFamily: fonts.label,
              fontWeight: 800,
              fontSize: 112,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              color: on ? '#fff' : C.ink,
              background: on ? C.red : 'transparent',
              padding: '0 14px',
              borderRadius: 12,
              opacity: shown ? 1 : 0.18,
              transform: on ? `scale(${1 + 0.08 * (1 - prog(f, w.f, 5))})` : 'none',
            }}
          >
            {w.w}
          </div>
        );
      })}
    </div>
  );
};

const Top: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: '#2B2F36', color: '#F3EFE2', fontFamily: fonts.label, fontWeight: 800, fontSize: 44, letterSpacing: 3, padding: '10px 26px', borderRadius: 6}}>PRISON SECURITY LEVELS</div>
  </div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 10], [1.35, 1], {extrapolateRight: 'clamp', easing: easeInOut});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(0, 1 - f / 6)}} />
      <div style={{position: 'absolute', left: 40, top: 520, transform: `scale(${z})`, transformOrigin: '50% 50%'}}>
        <Perimeter kind="adx" w={1000} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: prog(f, 4, 6)}}>
        <Label size={150}>ADX FLORENCE</Label>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 40, color: C.red, letterSpacing: 4, marginTop: 6}}>FLORENCE, COLORADO</div>
      </div>
    </AbsoluteFill>
  );
};

const NoEscapes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 40, top: 520}}>
        <Perimeter kind="adx" w={1000} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
        <RedStamp text={'ZERO\nESCAPES'} f={f} delay={10} size={150} rotate={-8} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
        <Label size={90} color={C.inkSoft}>
          SINCE 1994
        </Label>
      </div>
    </AbsoluteFill>
  );
};

const BANDS = [
  {l: 'HIGH', c: C.red},
  {l: 'MEDIUM', c: '#E07A2E'},
  {l: 'LOW', c: '#E3B23C'},
  {l: 'MINIMUM', c: '#5E9E45'},
];

const Bands: React.FC<{f: number; mode: 'q' | 'x'}> = ({f, mode}) => (
  <div style={{position: 'absolute', left: 140, right: 140, top: 330, display: 'flex', flexDirection: 'column', gap: 22}}>
    {BANDS.map((b, i) => {
      const p = mode === 'q' ? pop(f, 4 + (3 - i) * 4, 12) : 1;
      const hi = b.l === 'HIGH';
      return (
        <div key={b.l} style={{position: 'relative', height: 200, background: b.c, borderRadius: 16, display: 'flex', alignItems: 'center', paddingLeft: 40, transform: `scaleX(${Math.min(1, p)})`, transformOrigin: 'left', opacity: mode === 'x' && !hi ? 0.35 : 1, boxShadow: hi && mode === 'q' ? `0 0 0 ${8 + 4 * Math.sin(f / 4)}px ${C.ink}` : 'none'}}>
          <Label size={110} color="#fff">
            {b.l}
          </Label>
          {hi && mode === 'q' && f > 30 && (
            <div style={{position: 'absolute', right: 40, top: 10}}>
              <Hand size={170} color="#fff">
                ?
              </Hand>
            </div>
          )}
          {hi && mode === 'x' && (
            <svg width={800} height={200} style={{position: 'absolute', left: 0, top: 0}}>
              <g stroke="#fff" strokeWidth={22} strokeLinecap="round" opacity={prog(f, 2, 6)}>
                <line x1={40} y1={30} x2={760} y2={170} />
                <line x1={760} y1={30} x2={40} y2={170} />
              </g>
            </svg>
          )}
        </div>
      );
    })}
  </div>
);

const LadderQ: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bands f={f} mode="q" />
    </AbsoluteFill>
  );
};

const Admin: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bands f={f} mode="x" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, 12, 9, 0.6) * 1})`}}>
        <div style={{background: C.ink, padding: '34px 50px', borderRadius: 18, border: `10px solid ${C.red}`}}>
          <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 40, color: '#F3EFE2', letterSpacing: 4, textAlign: 'center'}}>OFFICIALLY</div>
          <Label size={120} color="#fff">
            ADMINISTRATIVE
          </Label>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Ninety: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 4, 34, easeInOut) * 0.9;
  const R = 300;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 380, top: 300, width: 760, height: 760}}>
        <svg width={760} height={760}>
          <circle cx={380} cy={380} r={R} stroke="#E6E3DC" strokeWidth={90} fill="none" />
          <circle cx={380} cy={380} r={R} stroke={C.red} strokeWidth={90} fill="none" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform="rotate(-90 380 380)" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.mono, fontWeight: 700, fontSize: 210, color: C.ink}}>{Math.round(p * 100)}%</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1100, textAlign: 'center', opacity: prog(f, 40, 10)}}>
        <Label size={80} color={C.inkSoft}>
          NOT FOR THEIR CRIME
        </Label>
      </div>
    </AbsoluteFill>
  );
};

const Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const back = prog(f, d - 14, 14);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: 1 - back}}>
        <Label size={120}>SENT THERE FOR</Label>
        <Label size={150} color={C.red} style={{marginTop: 10}}>
          HOW THEY BEHAVED
        </Label>
        <Label size={120} style={{marginTop: 10}}>
          INSIDE
        </Label>
        <div style={{marginTop: 60, display: 'flex', justifyContent: 'center'}}>
          <RedStamp text="OTHER PRISONS" f={f} delay={30} size={90} rotate={-6} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 40, top: 520, opacity: back, transform: `scale(${1.35 - 0.35 * back})`}}>
        <Perimeter kind="adx" w={1000} />
      </div>
    </AbsoluteFill>
  );
};

const M: Record<string, React.FC> = {Hook, NoEscapes, LadderQ, Admin, Ninety, Payoff};

export const ShortPrison: React.FC = () => {
  const shots = (edl as any).shots as {id: string; scene: string; props: {words: W[]}; from: number; dur: number}[];
  return (
    <Paper>
      {shots.map((s, i) => {
        const Comp = M[s.scene];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur + (i < shots.length - 1 ? 3 : 0)}>
            <AbsoluteFill style={{background: C.paper}}>
              <Comp />
              <Captions words={s.props.words} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Top />
    </Paper>
  );
};
