import React from 'react';
import { Character, P, Pose } from '../lib/Character';

/* EP02 cast — consistent identity colours */
export const COL = { theo: '#e5483d', kyle: '#3d7a4f', coach: '#7a8494', dad: '#5b7fb0', sis: '#ff7aa8', patel: '#c86b85' };

type CP = { t: number; x: number; y?: number; scale?: number; facing?: 1 | -1; pose?: Pose; expr?: any; mouth?: any; talking?: boolean; look?: [number, number]; tilt?: number; tears?: number; sweat?: boolean; rim?: string; bob?: number; height?: number; blush?: boolean };
const base = (p: CP) => ({ t: p.t, x: p.x, y: p.y ?? 830, scale: p.scale ?? 2.4, facing: p.facing, pose: p.pose ?? P.stand, expr: p.expr ?? 'neutral', mouth: p.mouth ?? 'none', talking: p.talking, look: p.look, tilt: p.tilt, tears: p.tears, sweat: p.sweat, rim: p.rim, bob: p.bob, blush: p.blush });

export const Theo: React.FC<CP> = (p) => <Character {...base(p)} seed={1} hair="eli" age={15} outfit={COL.theo} pants="#2b3350" height={p.height ?? 0.97} />;
export const Kyle: React.FC<CP> = (p) => <Character {...base(p)} seed={7} hair="sam" outfit={COL.kyle} pants="#22252e" height={p.height ?? 1.12} />;
export const Coach: React.FC<CP> = (p) => <Character {...base(p)} seed={5} hair="none" outfit={COL.coach} pants="#4a5160" height={p.height ?? 1.1} />;
export const Dad: React.FC<CP> = (p) => <Character {...base(p)} seed={9} hair="none" outfit={COL.dad} pants="#3a3f4c" glasses height={p.height ?? 1.08} />;
export const Sis: React.FC<CP> = (p) => <Character {...base(p)} seed={16} hair="nora" outfit={COL.sis} dress height={p.height ?? 0.72} />;
export const Patel: React.FC<CP> = (p) => <Character {...base(p)} seed={13} hair="rosie" outfit={COL.patel} dress cane height={p.height ?? 0.95} />;

/** whistle for the coach */
export const Whistle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -14 -40 Q 0 -10 14 -40" stroke="#c0392b" strokeWidth={3} fill="none" /><rect x={-10} y={-12} width={20} height={12} rx={4} fill="#c8cdd6" /></g>
);
