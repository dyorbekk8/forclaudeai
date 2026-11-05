/* "Every Letter in a Military Aircraft Name Explained" — rebuilt in the channel's best-performing template
   (carrier shirts video): cream page, top chapter bar with progress dots, left illustration card,
   right numbered feature cards, gauge/stat card, chapter summary with chip row, and a caption pill that
   shows the exact sentence being spoken. Every visual change happens on a sentence or word boundary. */
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import edl from './edl.json';
import {fonts} from '../theme';
import {easeInOut, pop, prog} from '../lib';
import {Plane, Kind} from '../aircraft/assets';

const BG = '#F3EEE3';
const CARD = '#FBF8F2';
const INK = '#1B1B1F';
const SOFT = '#5A5A62';
const LINE = '#D9D2C3';
const PAL = ['#C0392B', '#2F6FB5', '#B8860B', '#2E8B57', '#7D4FB5', '#B35A1F', '#1F7A8C', '#8E44AD'];

type Item = {letter: string; name: string; cat: string; kind: Kind; example: string; features: {t: string; s: string}[]; stat: {v: string; l: string}};
type Shot = {id: string; kind: 'grid' | 'card' | 'summary' | 'text' | 'outro'; item: number; from: number; dur: number; feat: number[]; title?: string; body?: string};
type Cap = {from: number; to: number; text: string};
const E = edl as unknown as {total: number; items: Item[]; shots: Shot[]; caps: Cap[]; itemStarts: number[]};
const colorOf = (i: number) => PAL[i % PAL.length];

const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({children, style, color}) => (
  <div style={{background: CARD, border: `3px solid ${color ?? LINE}`, borderRadius: 18, boxShadow: '0 10px 28px rgba(60,45,20,0.08)', ...style}}>{children}</div>
);

/* ---------- top chapter bar ---------- */
const TopBar: React.FC<{item: number}> = ({item}) => {
  const f = useCurrentFrame();
  const it = item >= 0 ? E.items[item] : null;
  const c = item >= 0 ? colorOf(item) : INK;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 26, height: 64, background: '#fff', borderRadius: 12, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 18}}>
      <div style={{background: c, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, padding: '4px 12px', borderRadius: 6}}>
        {it ? `${String(item + 1).padStart(2, '0')} / ${E.items.length}` : 'THE SYSTEM'}
      </div>
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 32, color: INK}}>{it ? `${it.letter}  ·  ${it.name}` : 'Every Letter in a Military Aircraft Name'}</div>
      {it && <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 20, color: SOFT}}>{it.cat}</div>}
      <div style={{flex: 1}} />
      <div style={{display: 'flex', gap: 7}}>
        {E.items.map((_, i) => (
          <div key={i} style={{width: i === item ? 26 : 12, height: 12, borderRadius: 6, background: i < item || item < 0 ? colorOf(i) : i === item ? c : '#DDD6C8', opacity: i < item ? 0.55 : 1, transition: 'none', transform: i === item ? `scaleY(${1 + 0.15 * Math.sin(f / 7)})` : 'none'}} />
        ))}
      </div>
    </div>
  );
};

/* ---------- caption pill (exact sentence) ---------- */
const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const cap = E.caps.find((c) => f >= c.from && f < c.to);
  if (!cap) return null;
  const a = Math.min(prog(f, cap.from, 5), 1 - prog(f, cap.to - 4, 4));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{maxWidth: 1500, background: '#26272B', color: '#fff', fontFamily: fonts.body, fontWeight: 700, fontSize: 30, lineHeight: 1.3, padding: '12px 30px', borderRadius: 10, textAlign: 'center'}}>{cap.text}</div>
    </div>
  );
};

/* ---------- grid of every letter; camera flies into the current tile ---------- */
const COLS = 8;
const TW = 196;
const TH = 196;
const GAP = 18;
const tilePos = (i: number) => {
  const rows = Math.ceil(E.items.length / COLS);
  const W = COLS * TW + (COLS - 1) * GAP;
  const H = rows * TH + (rows - 1) * GAP;
  const x0 = (1920 - W) / 2;
  const y0 = 140 + (860 - H) / 2;
  return {x: x0 + (i % COLS) * (TW + GAP), y: y0 + Math.floor(i / COLS) * (TH + GAP)};
};
const Grid: React.FC<{item: number; dur: number; zoom?: boolean}> = ({item, dur, zoom = true}) => {
  const f = useCurrentFrame();
  const p = tilePos(Math.max(0, item));
  const cx = p.x + TW / 2;
  const cy = p.y + TH / 2;
  const zIn = zoom && item >= 0 ? prog(f, Math.max(4, dur - 26), 22, easeInOut) : 0;
  const s = 1 + 1.9 * zIn;
  const tx = (960 - cx) * zIn;
  const ty = (560 - cy) * zIn;
  return (
    <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>
      {E.items.map((it, i) => {
        const q = tilePos(i);
        const on = i === item;
        const done = item < 0 || i < item;
        return (
          <div key={i} style={{position: 'absolute', left: q.x, top: q.y, width: TW, height: TH, background: CARD, borderRadius: 16, border: `${on ? 5 : 2}px solid ${on ? colorOf(i) : LINE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: on || done ? 1 : 0.55, boxShadow: on ? `0 0 0 ${6 + 3 * Math.sin(f / 6)}px ${colorOf(i)}22` : 'none'}}>
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 88, lineHeight: 1, color: on || done ? colorOf(i) : SOFT}}>{it.letter}</div>
            <Plane kind={it.kind} size={70} rotate={-90} color={on ? INK : '#6B6F76'} />
            <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 22, color: INK, textAlign: 'center', lineHeight: 1}}>{it.name.toUpperCase()}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- item card + numbered features ---------- */
const ItemCard: React.FC<{item: number; feat: number[]}> = ({item, feat}) => {
  const f = useCurrentFrame();
  const it = E.items[item];
  const c = colorOf(item);
  const pin = Math.min(1, pop(f, 0, 14));
  return (
    <AbsoluteFill>
      <Card color={c} style={{position: 'absolute', left: 80, top: 130, width: 640, height: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30, transform: `scale(${0.97 + 0.03 * pin})`}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 64, color: INK}}>{it.name.toUpperCase()}</div>
        <div style={{position: 'relative', width: 460, height: 460, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `${c}1F`}} />
          <div style={{position: 'absolute', left: 30, top: 10, fontFamily: fonts.label, fontWeight: 800, fontSize: 150, color: c, opacity: 0.9}}>{it.letter}</div>
          <Plane kind={it.kind} size={360} rotate={-90 + 3 * Math.sin(f / 30)} color="#4A505A" />
        </div>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 70, color: c, marginTop: 12}}>{it.example}</div>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, color: SOFT}}>{it.cat}</div>
      </Card>
      {it.features.map((ft, k) => {
        const s = feat[k] ?? 10 + k * 30;
        const p = Math.min(1, pop(f, s, 12));
        const vis = Math.max(0.3 * prog(f, k * 3, 8), p);
        return (
          <Card key={k} color={p > 0.5 ? c : LINE} style={{position: 'absolute', left: 780, top: 150 + k * 258, width: 1060, height: 220, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px', opacity: vis, transform: `translateX(${(1 - p) * 24}px)`}}>
            <div style={{width: 74, height: 74, borderRadius: 12, background: p > 0.5 ? c : '#CFC7B6', color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{String(k + 1).padStart(2, '0')}</div>
            <div>
              <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 58, color: INK, lineHeight: 1}}>{ft.t}</div>
              <div style={{fontFamily: fonts.body, fontSize: 30, color: SOFT, marginTop: 8}}>{ft.s}</div>
            </div>
          </Card>
        );
      })}
      {/* connector lines from the illustration to each feature */}
      <svg width={1920} height={1080} style={{position: 'absolute', pointerEvents: 'none'}}>
        {it.features.map((_, k) => {
          const s = feat[k] ?? 10 + k * 30;
          const p = prog(f, s, 10);
          const y = 150 + k * 258 + 110;
          return <line key={k} x1={560} y1={530} x2={560 + (780 - 560) * p} y2={530 + (y - 530) * p} stroke={c} strokeWidth={3} opacity={0.7 * p} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- chapter summary: big stat gauge + chip row ---------- */
const Summary: React.FC<{item: number}> = ({item}) => {
  const f = useCurrentFrame();
  const it = E.items[item];
  const c = colorOf(item);
  const g = prog(f, 4, 26, easeInOut);
  return (
    <AbsoluteFill>
      <Card color={c} style={{position: 'absolute', left: 80, top: 130, width: 1180, height: 800, padding: '40px 50px'}}>
        <div style={{display: 'inline-block', background: c, color: '#fff', fontFamily: fonts.mono, fontWeight: 700, fontSize: 20, padding: '6px 12px', borderRadius: 6}}>
          {String(item + 1).padStart(2, '0')} / {E.items.length} · SUMMARY
        </div>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 84, color: INK, marginTop: 18, lineHeight: 1}}>
          {it.letter} — {it.name}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 50, marginTop: 40}}>
          <svg width={330} height={230} viewBox="0 0 330 230">
            <path d="M 25 205 A 140 140 0 0 1 305 205" fill="none" stroke="#E4DDCF" strokeWidth={26} strokeLinecap="round" />
            <path d="M 25 205 A 140 140 0 0 1 305 205" fill="none" stroke={c} strokeWidth={26} strokeLinecap="round" pathLength={100} strokeDasharray={`${78 * g} 100`} />
            <text x={165} y={190} textAnchor="middle" fontFamily="Barlow Condensed" fontWeight={800} fontSize={it.stat.v.length > 3 ? 70 : 96} fill={INK}>
              {it.stat.v}
            </text>
          </svg>
          <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 52, color: SOFT, maxWidth: 560, lineHeight: 1.1, opacity: prog(f, 10, 8)}}>{it.stat.l.toUpperCase()}</div>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 50}}>
          {E.items.map((x, i) => {
            const st = i < item ? 'DONE' : i === item ? 'ACTIVE' : 'NEXT';
            return (
              <div key={i} style={{width: 82, height: 74, borderRadius: 10, background: i <= item ? colorOf(i) : '#E6E0D3', color: i <= item ? '#fff' : '#9A9384', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: i < item ? 0.75 : 1, transform: i === item ? `scale(${1.06 + 0.03 * Math.sin(f / 6)})` : 'none'}}>
                <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 38, lineHeight: 1}}>{x.letter}</div>
                <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 11}}>{st}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card color={c} style={{position: 'absolute', left: 1300, top: 130, width: 540, height: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Plane kind={it.kind} size={380} rotate={-90 + 3 * Math.sin(f / 28)} color="#4A505A" />
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 80, color: c}}>{it.example}</div>
      </Card>
    </AbsoluteFill>
  );
};

/* ---------- plain text card for the closing system notes ---------- */
const TextCard: React.FC<{title: string; body: string}> = ({title, body}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Card style={{width: 1500, padding: '60px 70px', transform: `scale(${0.97 + 0.03 * Math.min(1, pop(f, 0, 14))})`}}>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 96, color: INK, lineHeight: 1}}>{title}</div>
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 60, color: PAL[0], marginTop: 24, lineHeight: 1.1, opacity: prog(f, 10, 8)}}>{body}</div>
      </Card>
    </AbsoluteFill>
  );
};

export const MainAircraft2: React.FC = () => {
  const f = useCurrentFrame();
  const curItem = (() => {
    let it = -1;
    E.shots.forEach((s) => {
      if (f >= s.from) it = s.item;
    });
    return it;
  })();
  const cam = 1.01 + 0.006 * Math.sin(f / 240);
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        {E.shots.map((s) => (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur + 8}>
            <Fade>
              {s.kind === 'grid' && <Grid item={s.item} dur={s.dur} />}
              {s.kind === 'outro' && <Grid item={-1} dur={s.dur} zoom={false} />}
              {s.kind === 'card' && <ItemCard item={s.item} feat={s.feat} />}
              {s.kind === 'summary' && <Summary item={s.item} />}
              {s.kind === 'text' && <TextCard title={s.title ?? ''} body={s.body ?? ''} />}
            </Fade>
          </Sequence>
        ))}
      </AbsoluteFill>
      <TopBar item={curItem} />
      <Caption />
    </AbsoluteFill>
  );
};

const Fade: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: BG, opacity: interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
