import React from 'react';
import { S, E } from '../lib/anim';
import { A1, A2, A3, A4, A5, A6a, A6b, A6c, B1, B7 } from './actA';
import { B2, B3, B4, B5, B6 } from './dataviz';
import { C1, C2, C3, C4, C5, C6, C8, C9, C10, C11, C12 } from './actC';
import { E1, E2, E3, E4, E5, E6, E7, E8, E8b, E9, E10, E11 } from './actE';
import { F1, F2, F3, F4, F5, F6, F7 } from './actF';
import { G1, G2, G3, G4, G5, G5b, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15 } from './actG';
import { H1, H2, H3, H4, I1, I2, I3, I4, I5 } from './actH';
import { D1, D2, D3, D4, D5, D6, D7, D8, D9, D10 } from './actD';

export type Tr = 'cut' | 'whip' | 'whipL' | 'zoom' | 'fade' | 'slowfade';
export type ShotDef = { at: number; C: React.FC<{ o: number; d: number }>; tr?: Tr; name: string };

/* Shot list — `at` is the global start time (s). Each shot runs until the next one. */
const raw: Omit<ShotDef, 'name'>[] & { name?: string }[] = [];
const add = (name: string, at: number, C: ShotDef['C'], tr?: Tr) => raw.push({ name, at, C, tr } as any);

// ACT 0 — cold open
add('A1 kitchen', 0, A1);
add('A2 pop CU', S('a03') - 0.15, A2);
add('A3 hoodie', S('a04') - 0.1, A3, 'cut');
add('A4 chin hair', S('a05') - 0.1, A4, 'zoom');
add('A5 15->16', S('a06') - 0.15, A5);
// ACT 1 — premise
add('A6a title', S('b01') - 0.3, A6a, 'zoom');
add('A6b mind/body', S('b02') - 0.1, A6b, 'whip');
add('A6c no going back', S('b03') - 0.15, A6c, 'cut');
add('B1 the math', S('b04') - 0.2, B1, 'whip');
add('B2 survey', S('b05') - 0.15, B2, 'zoom');
add('B3 1.65', S('b06') - 0.15, B3, 'cut');
add('B4 chart', S('b07') - 0.1, B4, 'whip');
add('B5 six of ten', S('b08') - 0.2, B5, 'whipL');
add('B6 one in twenty', S('b10') - 0.1, B6, 'cut');
add('B7 rule', S('b11') - 0.1, B7, 'zoom');

// ACT 2 — honesty comedy
add('C1 day one', S('c01') - 0.1, C1, 'slowfade');
add('C2 sam asks', S('c02') - 0.1, C2, 'zoom');
add('C3 a decision', S('c03') - 0.15, C3, 'cut');
add('C4 chapter four', S('c04') - 0.2, C4, 'whip');
add('C5 detention', S('c05') - 0.05, C5, 'cut');
add('C6 meatloaf', S('c06') - 0.2, C6, 'whipL');
add('C8 trust', S('c08') - 0.2, C8, 'whip');
add('C9 ask eli text', S('c09') - 0.1, C9, 'zoom');
add('C10 ask eli shirt', S('c10') - 0.1, C10, 'whip');
add('C11 queue', S('c11') - 0.1, C11, 'whipL');
add('C12 only one', S('c12') - 0.1, C12, 'zoom');
// ACT 3 — the slip
add('D1 reflex lies', S('d01') - 0.2, D1, 'fade');
add('D2 cookie', S('d02') - 0.1, D2, 'cut');
add('D3 pop 17', S('d04') - 0.1, D3, 'cut');
add('D4 bump 18', S('d05') - 0.1, D4, 'whip');
add('D5 aunt 19', S('d06') + 0.6, D5, 'whipL');
add('D6 10th grade', S('d08') + 0.6, D6, 'zoom');
add('D7 shave', S('d10') - 0.1, D7, 'cut');
add('D8 bus ID', S('d10') + 1.7, D8, 'whip');
add('D9 mom stares', S('d11') - 0.1, D9, 'cut');
add('D10 cant say fine', S('d13') - 0.2, D10, 'cut');

// ACT 4 — Grandpa
add('E1 saturday', S('e01') - 0.3, E1, 'slowfade');
add('E2 polaroids', S('e02') - 0.1, E2, 'whip');
add('E3 name', S('e03') - 0.1, E3, 'cut');
add('E4 rosie?', S('e04') - 0.2, E4, 'cut');
add('E5 photo', S('e06') - 0.1, E5, 'fade');
add('E6 truth', S('e07') - 0.2, E6, 'cut');
add('E7 cries', S('e09') - 0.1, E7, 'cut');
add('E8 dementia', S('e11') - 0.3, E8, 'fade');
add('E8b scale', S('e13') - 0.15, E8b, 'whip');
add('E9 again', S('e14') - 0.2, E9, 'fade');
add('E10 decision', E('e15') + 0.15, E10, 'cut');
add('E11 pop 20 smile', S('e17') - 0.1, E11, 'cut');
// ACT 5 — spending years
add('F1 calendar', S('f01') - 0.3, F1, 'zoom');
add('F2 21 hums', S('f02') - 0.1, F2, 'cut');
add('F3 25 combs', S('f03') - 0.1, F3, 'whip');
add('F4 30 stairs', S('f04') - 0.1, F4, 'whipL');
add('F5 36 gray hair', S('f05') - 0.1, F5, 'whip');
add('F6 mom asks', S('f07') - 0.1, F6, 'cut');
add('F7 window', S('f08') - 0.1, F7, 'fade');
// ACT 6 — twist
add('G1 41', S('g01') - 0.15, G1, 'zoom');
add('G2 really looks', S('g02') - 0.1, G2, 'cut');
add('G3 curse', S('g04') - 0.1, G3, 'cut');
add('G4 wait what', S('g05') - 0.1, G4, 'zoom');
add('G5 wedding', S('g06') - 0.1, G5, 'slowfade');
add('G5b wedding close', S('g07') - 0.1, G5b, 'cut');
add('G6 dancer', S('g08') - 0.2, G6, 'whip');
add('G7 farm', S('g09') - 0.1, G7, 'whipL');
add('G8 not tired', S('g10') - 0.1, G8, 'whip');
add('G9 for others', S('g11') - 0.1, G9, 'fade');
add('G10 spent years', S('g12') - 0.2, G10, 'slowfade');
add('G11 tell truth', S('g13') - 0.2, G11, 'cut');
add('G12 no', S('g15') - 0.25, G12, 'cut');
add('G13 hands', S('g16') - 0.1, G13, 'cut');
add('G14 go live', S('g17') - 0.1, G14, 'cut');
add('G15 kindest lie', S('g18') - 0.1, G15, 'fade');
// ACT 7 — resolution
add('H1 15/41', S('h01') - 0.4, H1, 'slowfade');
add('H2 DMV', S('h02') - 0.1, H2, 'whip');
add('H3 friends', S('h03') - 0.1, H3, 'whipL');
add('H4 truth now', S('h04') - 0.1, H4, 'fade');
// ACT 8 — cliffhanger
add('I1 glass', S('i01') - 0.3, I1, 'fade');
add('I2 nope', S('i02') - 0.1, I2, 'cut');
add('I3 breathe', S('i04') - 0.1, I3, 'cut');
add('I4 gray hair', S('i05') - 0.1, I4, 'cut');
add('I5 end card', S('i07') - 0.2, I5, 'fade');

export const SHOTS: ShotDef[] = (raw as ShotDef[]).sort((a, b) => a.at - b.at);
export const _unused = E;
