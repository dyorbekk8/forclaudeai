import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ITEMS, easeInOut, pop, prog} from '../lib';
import {Hand, Label, RedStamp, Spray, Tile} from '../components/ui';
import {Sprinkler} from '../components/Sprinkler';

export const TW = 250;
export const TH = 330;
const GAP = 22;
const LEFT = 96;
const TOP = 199;
export const ANCHOR = {x: LEFT + 5 * TW + 4 * GAP + 30, y: TOP, w: 360, h: 2 * TH + GAP};

export const tilePos = (i: number) =>
  i < 5 ? {x: LEFT + i * (TW + GAP), y: TOP} : {x: LEFT + (TW + GAP) / 2 + (i - 5) * (TW + GAP), y: TOP + TH + GAP};

export type AnchorMode = 'hidden' | 'question' | 'one' | 'stamp';

const AnchorTile: React.FC<{mode: AnchorMode; f: number; appear: number; stampAt: number}> = ({mode, f, appear, stampAt}) => {
  if (mode === 'hidden') return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: ANCHOR.x,
        top: ANCHOR.y,
        width: ANCHOR.w,
        height: ANCHOR.h,
        background: '#fff',
        border: `4px solid ${C.red}`,
        borderRadius: 12,
        opacity: appear,
        transform: `scale(${0.9 + 0.1 * appear})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {mode === 'question' && <Hand size={300}>?</Hand>}
      {mode === 'one' && (
        <>
          <Label size={330} color={C.red}>
            1
          </Label>
          <Label size={56} style={{marginTop: 10}}>
            ONE
          </Label>
        </>
      )}
      {mode === 'stamp' && (
        <>
          <svg width={ANCHOR.w} height={460} viewBox={`0 0 ${ANCHOR.w} 460`} style={{position: 'absolute', top: 40}}>
            <Spray t={f} cx={ANCHOR.w / 2} cy={268} scale={0.9} seed="anchor" />
          </svg>
          <div style={{position: 'absolute', top: 30}}>
            <Sprinkler bulb={{liquid: '#D9262B'}} broken size={160} />
          </div>
          <Label size={60} style={{position: 'absolute', bottom: 170}}>
            ONE
          </Label>
          <div style={{position: 'absolute', bottom: 70}}>
            <RedStamp text="ONLY ONE OPENS" f={f} delay={stampAt} size={44} rotate={-8} />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Full grid of 9 tiles + anchor.
 * intro: tiles pop in. zoomTo: camera pushes into tile `focus` starting at zoomStart.
 */
export const GridScene: React.FC<{
  checked?: number;
  focus?: number;
  intro?: boolean;
  anchor?: AnchorMode;
  zoomStart?: number;
  zoomLen?: number;
  stampAt?: number;
  caption?: React.ReactNode;
}> = ({checked = 0, focus, intro = false, anchor = 'question', zoomStart, zoomLen = 16, stampAt = 10, caption}) => {
  const f = useCurrentFrame();
  const tiles = ITEMS.slice(0, 9);
  let transform = 'none';
  let fadeOthers = 0;
  if (focus !== undefined && zoomStart !== undefined) {
    const z = prog(f, zoomStart, zoomLen, easeInOut);
    const p = focus < 9 ? tilePos(focus) : {x: ANCHOR.x, y: ANCHOR.y};
    const w = focus < 9 ? TW : ANCHOR.w;
    const h = focus < 9 ? TH : ANCHOR.h;
    const cx = p.x + w / 2;
    const cy = p.y + h / 2;
    const s = interpolate(z, [0, 1], [1, 3.1]);
    const tx = interpolate(z, [0, 1], [0, 960 - cx * s]);
    const ty = interpolate(z, [0, 1], [0, 540 - cy * s]);
    transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    fadeOthers = z;
  }
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform}}>
        {tiles.map((it, i) => {
          const p = tilePos(i);
          const ap = intro ? pop(f, 4 + i * 4, 12) : 1;
          const isFocus = focus === i;
          const state = isFocus ? 'active' : i < checked ? 'done' : focus !== undefined ? 'dim' : 'normal';
          return (
            <div key={it.key} style={{position: 'absolute', left: p.x, top: p.y, opacity: isFocus ? 1 : 1 - fadeOthers}}>
              <Tile item={it} w={TW} h={TH} state={state} appear={Math.min(1, ap)} />
            </div>
          );
        })}
        <div style={{opacity: focus === 9 ? 1 : 1 - fadeOthers}}>
          <AnchorTile mode={anchor} f={f} appear={intro ? Math.min(1, pop(f, 4 + 9 * 4 + 6, 10)) : 1} stampAt={stampAt} />
        </div>
      </div>
      {caption && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center', opacity: prog(f, 20, 12)}}>
          {caption}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const GridIntroTitle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 96, top: 92, opacity: prog(f, 2, 12)}}>
      <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: C.red, letterSpacing: 4}}>NFPA 13 · GLASS BULB CODE</div>
    </div>
  );
};
