import React from 'react';
import { Stage, Cam, Badge, BigText } from '../lib/ui';
import { Character, P } from '../lib/Character';
import { DataBG } from '../sets/Sets';
import { C, FONT_HEAD, FONT_BODY } from '../lib/theme';
import { tw, ease, pop, clamp01 } from '../lib/anim';
import { useShot, ShotFC } from '../lib/shot';

/* tiny person glyph */
export const Person: React.FC<{ x: number; y: number; s?: number; col?: string; glow?: number; op?: number }> = ({ x, y, s = 1, col = '#5f7ab8', glow = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    {glow > 0 && <circle cx={0} cy={-26} r={46} fill={col} opacity={0.25 * glow} />}
    <circle cx={0} cy={-46} r={12} fill={col} />
    <path d="M -17 0 L -17 -18 Q -17 -32 0 -32 Q 17 -32 17 -18 L 17 0 Z" fill={col} />
  </g>
);

const Source: React.FC<{ t: number; text: string }> = ({ t, text }) => (
  <text x={60} y={1040} fontSize={24} fill="#8fa3c8" opacity={tw(t, 0.5, 1, 0, 0.85)} fontFamily={FONT_BODY} fontWeight={800}>{text}</text>
);
const SRC = 'Source: Serota, Levine & Boster (2010), Human Communication Research';

/* B2 — 1,000 American adults survey */
