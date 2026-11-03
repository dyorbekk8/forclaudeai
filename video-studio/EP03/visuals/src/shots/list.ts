import React from 'react';
import { S, E } from '../lib/anim';
import * as A from './ep3a';
import * as B from './ep3b';

export type Tr = 'cut' | 'whip' | 'whipL' | 'zoom' | 'fade' | 'slowfade' | 'glitch';
export type ShotDef = { at: number; C: React.FC<{ o: number; d: number }>; tr?: Tr; name: string };
const raw: ShotDef[] = [];
const add = (name: string, at: number, C: ShotDef['C'], tr?: Tr) => raw.push({ name, at, C, tr });
const mid = (id: string, x: number) => S(id) + (E(id) - S(id)) * x;

// A cold open
add('A1 bonk', 0, A.A1);
add('A2 now you see it', S('a02') - 0.1, A.A2, 'glitch');
add('A3 split reality', S('a03') - 0.1, A.A3, 'zoom');
add('A4 mia', S('a04') - 0.1, A.A4, 'whip');
add('A5 catching up', S('a05') - 0.1, A.A5, 'cut');
add('A6 lag title', S('a06') - 0.1, A.A6, 'glitch');
add('A7 doubles', S('a07') - 0.1, A.A7, 'zoom');
// B rule + science
add('B1 rule', S('b01') - 0.15, A.B1, 'glitch');
add('B2 ladder', S('b02') - 0.1, A.B2, 'whip');
add('B3 already', S('b03') - 0.1, A.B3, 'zoom');
add('B4a eye brain', S('b04') - 0.1, A.B4a, 'whip');
add('B4b everyone', mid('b04', 0.5), A.B4b, 'zoom');
// C day 1
add('C1 day1', S('c01') - 0.2, A.DayShot(1, '1 SECOND'), 'glitch');
add('C2 high five', mid('c01', 0.55), A.C2, 'whip');
add('C3 jokes', S('c03') - 0.1, A.C3, 'whipL');
add('C4 mia figures', S('c04') - 0.1, A.C4, 'zoom');
add('C5 catch', S('c05') - 0.1, A.C5, 'cut');
add('C6 no catch', S('c06') - 0.1, A.C6, 'cut');
add('C7a soup', S('c07') - 0.1, A.C7a, 'whip');
add('C7b stairs', mid('c07', 0.18), A.C7b, 'whipL');
add('C7c games', mid('c07', 0.36), A.C7c, 'glitch');
add('C8 moon', S('c08') - 0.1, A.C8, 'zoom');
// D day 3-5
add('D1 day3', S('d01') - 0.2, A.DayShot(3, '4 SECONDS'), 'glitch');
add('D2 conversation', S('d02') - 0.1, A.D2, 'whip');
add('D3 day5', S('d03') - 0.2, A.DayShot(5, '16 SECONDS'), 'glitch');
add('D4 curb', S('d04') - 0.1, A.D4, 'slowfade');
add('D5 empty', S('d05') - 0.1, A.D5, 'cut');
add('D6 split truck', S('d06') - 0.1, A.D6, 'glitch');
add('D7a honk', S('d07') - 0.05, A.D7a, 'cut');
add('D7b late view', mid('d07', 0.5), A.D7b, 'glitch');
add('D8 mia promise', S('d08') - 0.1, A.D8, 'fade');
// E day 7
add('E1 day7', S('e01') - 0.2, A.DayShot(7, '64 SECONDS', 'MORE THAN A MINUTE'), 'glitch');
add('E2 hospital', S('e02') - 0.1, A.E2, 'whip');
add('E3 buffering', S('e03') - 0.1, A.E3, 'zoom');
add('E4 mirror empty', S('e04') - 0.1, A.E4, 'whipL');
add('E5 walk in', S('e05') - 0.1, A.E5, 'cut');
add('E6 recording', S('e06') - 0.1, A.E6, 'zoom');
// F day 10
add('F1 day10', S('f01') - 0.2, A.DayShot(10, '8 MIN 32 S', '512 SECONDS'), 'glitch');
add('F2 sunlight', S('f02') - 0.1, A.F2, 'zoom');
add('F3 sun 8 min', S('f03') - 0.1, A.F3, 'whip');
add('F4 viral', S('f04') - 0.1, A.F4, 'zoom');
add('F5a scientists', S('f05') - 0.1, A.F5a, 'whip');
add('F5b one second', mid('f05', 0.55), A.F5b, 'slowfade');
// G day 14
add('G1 day14', S('g01') - 0.2, A.DayShot(14, '2 H 16 MIN'), 'glitch');
add('G2 dark 7am', S('g02') - 0.1, B.G2, 'cut');
add('G3 split clocks', S('g03') - 0.1, B.G3, 'glitch');
add('G4 two times', S('g04') - 0.1, B.G4, 'zoom');
add('G5 steps', S('g05') - 0.1, B.G5, 'whip');
add('G6 mia guides', S('g06') - 0.1, B.G6, 'cut');
// H day 18
add('H1 day18', S('h01') - 0.2, A.DayShot(18, '36 HOURS', 'A DAY AND A HALF'), 'glitch');
add('H2 too late', S('h02') - 0.1, B.H2, 'fade');
add('H3 stairs', S('h03') - 0.1, B.H3, 'cut');
add('H4 asleep', S('h04') - 0.1, B.H4, 'fade');
add('H5 ghosts', S('h05') - 0.1, B.H5, 'slowfade');
// I birthday
add('I1 day22', S('i01') - 0.2, A.DayShot(22, '24 DAYS'), 'glitch');
add('I2 party', S('i02') - 0.1, B.I2, 'whip');
add('I3 calendar', S('i03') - 0.1, B.I3, 'zoom');
add('I4 tuesday', S('i04') - 0.1, B.I4, 'slowfade');
add('I5 candles', S('i05') - 0.1, B.I5, 'fade');
// J Biscuit
add('J1 day26', S('j01') - 0.2, A.DayShot(26, '1 YEAR+', '33,554,432 SECONDS'), 'glitch');
add('J2 room', S('j02') - 0.1, B.J2, 'slowfade');
add('J3 memory', S('j03') - 0.1, B.J3, 'fade');
add('J4 tail', S('j04') - 0.1, B.J4, 'fade');
add('J5 hours', S('j05') - 0.1, B.J5, 'cut');
add('J6 dont stop', S('j06') - 0.1, B.J6, 'fade');
add('J7 stuck', S('j07') - 0.1, B.J7, 'glitch');
// K notes
add('K1 box', S('k01') - 0.1, B.K1, 'slowfade');
add('K2 wall', S('k02') - 0.1, B.K2, 'zoom');
add('K3 note', S('k03') - 0.1, B.K3, 'fade');
add('K4 writing', S('k04') - 0.1, B.K4, 'fade');
add('K5 all reaches', S('k05') - 0.1, B.K5, 'slowfade');
add('K6 hands', S('k06') - 0.1, B.K6, 'fade');
// L twist
add('L1 green', S('l01') - 0.1, B.L1, 'glitch');
add('L3 countdown', S('l03') - 0.1, B.L3, 'cut');
add('L4 zero', S('l04') - 0.05, B.L4, 'cut');
add('L5 minus one', S('l05') - 0.1, B.L5, 'cut');
add('L6 future catch', S('l06') - 0.1, B.L6, 'glitch');
add('L7 end', S('l07') - 0.1, B.L7, 'slowfade');

export const SHOTS = raw.sort((a, b) => a.at - b.at).map((s) => ({ ...s, at: Math.max(0, s.at) }));
