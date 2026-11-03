import React from 'react';
import { S, E } from '../lib/anim';
import * as A from './ep2a';
import * as B from './ep2b';

export type Tr = 'cut' | 'whip' | 'whipL' | 'zoom' | 'fade' | 'slowfade';
export type ShotDef = { at: number; C: React.FC<{ o: number; d: number }>; tr?: Tr; name: string };
const raw: ShotDef[] = [];
const add = (name: string, at: number, C: ShotDef['C'], tr?: Tr) => raw.push({ name, at, C, tr });

// A cold open
add('A1 gym taunt', 0, A.A1);
add('A2 40 vs 45', S('a02') - 0.1, A.A2, 'zoom');
add('A3 arm heat', S('a03') - 0.1, A.A3, 'cut');
add('A4 lift', S('a04') - 0.1, A.A4, 'cut');
add('A5 what', S('a05') - 0.1, A.A5, 'zoom');
// B premise + science
add('B1 title', S('b01') - 0.15, A.B1, 'zoom');
add('B2 a lot', S('b02') - 0.1, A.B2, 'cut');
add('B3 bubbles', S('b03') - 0.1, A.B3, 'whip');
add('B4 1968 class', S('b04') - 0.2, A.B4, 'zoom');
add('B5 bars', S('b06') - 0.1, A.B5, 'whip');
add('B6 pygmalion', S('b07') - 0.1, A.B6, 'cut');
add('B7 flipped', S('b08') - 0.1, A.B7, 'zoom');
// C collecting doubts
add('C1 day one', S('c01') - 0.1, A.C1, 'slowfade');
add('C2 coach looks', S('c02') - 0.1, A.C2, 'whip');
add('C3 coach CU', S('c03') - 0.1, A.C3, 'cut');
add('C4 rope', S('c04') - 0.1, A.C4, 'cut');
add('C5 pickle', S('c05') - 0.1, A.C5, 'whipL');
add('C6 jar boom', S('c06') - 0.1, A.C6, 'cut');
add('C7 car', S('c07') - 0.1, A.C7, 'whip');
add('C8 record', S('c08') - 0.1, A.C8, 'zoom');
add('C9 doubter list', S('c09') - 0.1, A.C9, 'whipL');
add('C10 internet', S('c10') - 0.1, A.C10, 'zoom');
add('C11 fridge', S('c11') - 0.1, A.C11, 'cut');
add('C12 comments', S('c12') - 0.1, A.C12, 'whip');
add('C13 protein', S('c13') - 0.1, A.C13, 'zoom');
add('C14 elephant', S('c14') - 0.1, A.C14, 'whip');
// D belief = weakness
add('D1 viral', S('d01') - 0.2, A.D1, 'zoom');
add('D2 news', S('d02') - 0.1, A.D2, 'cut');
add('D3 believers', S('d03') - 0.1, A.D3, 'whip');
add('D4 kid photo', S('d04') - 0.1, A.D4, 'cut');
add('D5 dad hug', S('d07') - 0.1, A.D5, 'whipL');
add('D6 backpack', S('d09') - 0.1, A.D6, 'cut');
add('D7 love weak', S('d10') - 0.1, A.D7, 'zoom');
add('D8 hiding', S('d11') - 0.1, A.D8, 'cut');
add('D9 hate me', S('d12') - 0.1, A.D9, 'fade');
// E Kyle
add('E1 kyle', S('e01') - 0.2, B.E1, 'slowfade');
add('E2 morning', S('e02') - 0.1, B.E2, 'whip');
add('E3 say it', S('e03') - 0.1, B.E3, 'cut');
add('E4 lockers', S('e05') - 0.1, B.E4, 'zoom');
add('E5 homework', S('e05b') - 0.1, B.E5, 'whipL');
add('E6 weeks', S('e06') - 0.1, B.E6, 'cut');
add('E7a groceries', S('e07') - 0.1, B.E7a, 'whip');
add('E7b swing', S('e07') + 3.6, B.E7b, 'whipL');
add('E8 silence', S('e08') - 0.1, B.E8, 'fade');
add('E9 cant say', S('e09') - 0.1, B.E9, 'cut');
add('E10 worst', S('e10') - 0.1, B.E10, 'cut');
// F fire
add('F1 fire', S('f01') - 0.2, B.F1, 'fade');
add('F2 beam', S('f02') - 0.1, B.F2, 'cut');
add('F3 street', S('f03') - 0.1, B.F3, 'cut');
add('F4 cheer', S('f04') - 0.1, B.F4, 'cut');
add('F5 push', S('f05') - 0.1, B.F5, 'zoom');
add('F6 meter', S('f05b') - 0.1, B.F6, 'cut');
add('F7 kyle in crowd', S('f06') - 0.1, B.F7, 'whip');
add('F8 please', S('f07') - 0.1, B.F8, 'cut');
add('F9 you cant', S('f08') - 0.05, B.F9, 'cut');
add('F10 crying', S('f09') - 0.1, B.F10, 'cut');
add('F11 words', S('f10') - 0.1, B.F11, 'zoom');
add('F12 lift', S('f11') - 0.1, B.F12, 'cut');
// G curb
add('G1 curb', S('g01') - 0.3, B.G1, 'slowfade');
add('G2 didnt mean', S('g02') - 0.1, B.G2, 'cut');
add('G3 nicest', S('g03') - 0.1, B.G3, 'cut');
add('G4 brave', S('g04') - 0.1, B.G4, 'cut');
// H mirror
add('H1 mirror', S('h01') - 0.2, B.H1, 'slowfade');
add('H2 eyes', S('h02') - 0.1, B.H2, 'cut');
add('H3 i cant', S('h03') - 0.1, B.H3, 'zoom');
add('H4 crack', S('h04') - 0.1, B.H4, 'cut');
add('H5 end', S('h05') - 0.2, B.H5, 'fade');

export const SHOTS: ShotDef[] = raw.sort((a, b) => a.at - b.at);
export const _u = E;
