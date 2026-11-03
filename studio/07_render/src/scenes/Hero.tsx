import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ITEMS, Item, pop, prog} from '../lib';
import {Chip, Hand, Label} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';
import {GridScene} from './Grid';

const ZOOM = 16;
export const HERO_IN = 14;

const TempReadout: React.FC<{item: Item; f: number; start: number}> = ({item, f, start}) => {
  const m = item.temp.match(/^(\d+)(.*)$/);
  const p = prog(f, start, 22);
  const shown = m ? `${Math.round(parseInt(m[1], 10) * p)}${m[2]}` : item.temp;
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 26, opacity: prog(f, start, 6)}}>
      <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 120, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
      <span style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: 52, color: C.inkFaint}}>{item.tempC}</span>
    </div>
  );
};

export const HeroLayout: React.FC<{item: Item; idx: number; f: number; note?: string; noteAt?: number}> = ({item, idx, f, note, noteAt = 40}) => {
  const s = pop(f, 0, 14);
  const lab = prog(f, 4, 14);
  const darkGlow = item.key === 'black' ? '#6B6B75' : item.color;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 90,
          width: 800,
          height: 900,
          background: `radial-gradient(circle at 50% 46%, ${darkGlow}2E 0%, ${darkGlow}00 62%)`,
        }}
      />
      <div style={{position: 'absolute', left: 330, top: 110, transform: `scale(${0.7 + 0.3 * s})`, transformOrigin: '50% 40%'}}>
        <Sprinkler bulb={item.fusible ? null : {liquid: item.color, response: item.response}} fusible={item.fusible} size={460} />
      </div>
      <div style={{position: 'absolute', left: 1020, top: 250, width: 860}}>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.inkFaint, letterSpacing: 4, opacity: lab}}>
          {String(idx + 1).padStart(2, '0')} / {ITEMS.length}
        </div>
        <div style={{overflow: 'hidden', marginTop: 8}}>
          <Label size={item.label.length > 7 ? 150 : 190} style={{transform: `translateY(${(1 - lab) * 110}%)`}}>
            {item.label}
          </Label>
        </div>
        <div style={{height: 10, width: 300 * prog(f, 8, 16), background: item.key === 'nobulb' ? C.ink : item.color, marginTop: 14, borderRadius: 5}} />
        <div style={{marginTop: 34}}>
          <TempReadout item={item} f={f} start={10} />
        </div>
        <div style={{marginTop: 26, opacity: prog(f, 16, 10), transform: `translateX(${(1 - prog(f, 16, 10)) * -30}px)`}}>
          <Chip size={34}>{item.cls}</Chip>
        </div>
        {note && (
          <div style={{marginTop: 34, opacity: prog(f, noteAt, 10), transform: `rotate(-2deg)`}}>
            <Hand size={54}>{note}</Hand>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Grid push-in to the tile, then the hero card. */
export const Hero: React.FC<{idx: number; note?: string; noteAt?: number}> = ({idx, note, noteAt}) => {
  const f = useCurrentFrame();
  const item = ITEMS[idx];
  const gridOp = 1 - prog(f, ZOOM - 4, 6);
  return (
    <AbsoluteFill>
      {gridOp > 0 && (
        <AbsoluteFill style={{opacity: gridOp}}>
          <GridScene checked={idx} focus={idx} zoomStart={0} zoomLen={ZOOM} anchor="question" />
        </AbsoluteFill>
      )}
      {f >= ZOOM - 4 && (
        <AbsoluteFill style={{opacity: prog(f, ZOOM - 4, 6)}}>
          <HeroLayout item={item} idx={idx} f={f - (ZOOM - 4)} note={note} noteAt={noteAt} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
