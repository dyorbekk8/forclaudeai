import React from 'react';
import { Character, P, Pose } from '../lib/Character';

/* EP03 cast — identity colours */
export const COL = { you: '#7b5cff', mia: '#ffc531', jake: '#3d9a5f', mom: '#3fb6a8', dad: '#5b7fb0', doc: '#eef2f7' };

export type CP = { t: number; x: number; y?: number; scale?: number; facing?: 1 | -1; pose?: Pose; expr?: any; mouth?: any; talking?: boolean; look?: [number, number]; tilt?: number; tears?: number; sweat?: boolean; rim?: string; bob?: number; height?: number; blush?: boolean; opacity?: number; armsBehind?: boolean; armLen?: number };
const base = (p: CP) => ({ t: p.t, x: p.x, y: p.y ?? 840, scale: p.scale ?? 2.4, facing: p.facing, pose: p.pose ?? P.stand, expr: p.expr ?? 'neutral', mouth: p.mouth ?? 'none', talking: p.talking, look: p.look, tilt: p.tilt, tears: p.tears, sweat: p.sweat, rim: p.rim, bob: p.bob, blush: p.blush, opacity: p.opacity, armsBehind: p.armsBehind, armLen: p.armLen });

export const You: React.FC<CP> = (p) => <Character {...base(p)} seed={2} hair="eli" age={15} outfit={COL.you} pants="#22263a" height={p.height ?? 0.97} />;
export const Mia: React.FC<CP> = (p) => <Character {...base(p)} seed={11} hair="nora" outfit={COL.mia} pants="#3a4a7a" height={p.height ?? 0.68} />;
export const Jake: React.FC<CP> = (p) => <Character {...base(p)} seed={7} hair="samcut" outfit={COL.jake} pants="#22252e" height={p.height ?? 1.02} />;
export const Mom: React.FC<CP> = (p) => <Character {...base(p)} seed={4} hair="mom" outfit={COL.mom} pants="#3a3f4c" dress height={p.height ?? 1.0} />;
export const Dad: React.FC<CP> = (p) => <Character {...base(p)} seed={9} hair="none" outfit={COL.dad} pants="#3a3f4c" glasses height={p.height ?? 1.08} />;
export const Doc: React.FC<CP> = (p) => <Character {...base(p)} seed={5} hair="teacher" outfit={COL.doc} pants="#5a6a80" glasses height={p.height ?? 1.05} />;
