import React from 'react';
import { C, FONT_HEAD } from '../lib/theme';

/* EP03 sets + props. 1920x1080 space, floor around y = 830-860. */

/* ---------------- outdoor basketball court ---------------- */
export const Court: React.FC<{ t: number; px?: number; hoop?: boolean }> = ({ t, px = 0, hoop = true }) => (
  <g>
    <defs>
      <linearGradient id="ctSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fb7ff" /><stop offset="1" stopColor="#e6f3ff" /></linearGradient>
      <linearGradient id="ctFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9724a" /><stop offset="1" stopColor="#a8492d" /></linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#ctSky)" />
    <circle cx={1600} cy={150} r={80} fill="#fff5c4" />
    <circle cx={1600} cy={150} r={160} fill="#fff5c4" opacity={0.25} filter="url(#glowF)" />
    <g transform={`translate(${px * 0.2} 0)`} opacity={0.6}>
      {[...Array(9)].map((_, i) => <ellipse key={i} cx={-60 + i * 260} cy={640} rx={170} ry={120} fill="#5fa35a" />)}
    </g>
    {/* fence */}
    <g transform={`translate(${px * 0.5} 0)`}>
      {[...Array(30)].map((_, i) => <line key={i} x1={-200 + i * 80} y1={420} x2={-200 + i * 80} y2={720} stroke="#6b7a8c" strokeWidth={5} />)}
      {[...Array(8)].map((_, i) => <line key={'h' + i} x1={-200} y1={430 + i * 40} x2={2300} y2={430 + i * 40} stroke="#6b7a8c" strokeWidth={2} opacity={0.5} />)}
    </g>
    <rect x={0} y={700} width={1920} height={380} fill="url(#ctFloor)" />
    <path d="M -100 940 Q 960 760 2020 940" stroke="#fff" strokeWidth={8} fill="none" opacity={0.75} />
    <line x1={0} y1={720} x2={1920} y2={720} stroke="#fff" strokeWidth={6} opacity={0.7} />
    {hoop && (
      <g transform={`translate(${1650 + px * 0.8} 0)`}>
        <rect x={-10} y={300} width={20} height={430} fill="#4a5262" />
        <rect x={-120} y={230} width={240} height={160} rx={8} fill="#f3f6fa" stroke="#c43c2b" strokeWidth={8} />
        <rect x={-50} y={300} width={100} height={70} fill="none" stroke="#c43c2b" strokeWidth={6} />
        <ellipse cx={0} cy={395} rx={70} ry={12} fill="none" stroke="#e8532e" strokeWidth={8} />
        {[...Array(7)].map((_, i) => <line key={i} x1={-66 + i * 22} y1={400} x2={-40 + i * 13} y2={470} stroke="#fff" strokeWidth={3} opacity={0.8} />)}
      </g>
    )}
  </g>
);

export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number; op?: number }> = ({ x, y, r = 40, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
    <circle r={r} fill="#ee7a2b" />
    <circle r={r} fill="url(#gHead)" />
    <path d={`M ${-r} 0 L ${r} 0 M 0 ${-r} L 0 ${r} M ${-r * 0.7} ${-r * 0.7} Q 0 0 ${-r * 0.7} ${r * 0.7} M ${r * 0.7} ${-r * 0.7} Q 0 0 ${r * 0.7} ${r * 0.7}`} stroke="#3a1c0c" strokeWidth={r * 0.07} fill="none" />
  </g>
);

/* ---------------- kid bedroom (day / night / dark) ---------------- */
export const KidRoom: React.FC<{ t: number; v?: 'day' | 'night' | 'dark' | 'dawn'; px?: number; bed?: boolean; notes?: number }> = ({ t, v = 'day', px = 0, bed = true, notes = 0 }) => {
  const wall = v === 'day' ? '#a9c6e8' : v === 'dawn' ? '#7f8fb8' : '#1d2340';
  const dark = v === 'dark' ? 0.78 : v === 'night' ? 0.25 : 0;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={wall} />
      {[...Array(14)].map((_, i) => <rect key={i} x={i * 140} y={0} width={70} height={840} fill="#fff" opacity={0.05} />)}
      <g transform={`translate(${px * 0.4} 0)`}>
        {/* window */}
        <g transform="translate(260 170)">
          <rect x={0} y={0} width={380} height={380} rx={10} fill={v === 'day' ? '#bfe6ff' : v === 'dawn' ? '#ffb48a' : '#0e1533'} stroke="#f2f2f2" strokeWidth={18} />
          <line x1={190} y1={0} x2={190} y2={380} stroke="#f2f2f2" strokeWidth={12} />
          <line x1={0} y1={190} x2={380} y2={190} stroke="#f2f2f2" strokeWidth={12} />
          {v !== 'day' && [...Array(16)].map((_, i) => <circle key={i} cx={(i * 71) % 360 + 10} cy={(i * 47) % 360 + 10} r={2} fill="#fff" opacity={0.7} />)}
          {v === 'day' && <circle cx={300} cy={80} r={40} fill="#fff6c9" />}
        </g>
        {/* posters */}
        <rect x={820} y={200} width={170} height={230} rx={8} fill="#ff7a59" transform="rotate(-4 905 315)" />
        <path d="M 860 300 L 905 240 L 950 300 Z" fill="#fff" opacity={0.85} transform="rotate(-4 905 315)" />
        <rect x={1030} y={230} width={200} height={140} rx={8} fill="#4fd8ff" transform="rotate(3 1130 300)" />
        <text x={1130} y={315} textAnchor="middle" fontSize={44} fontWeight={700} fill="#0b1530" fontFamily={FONT_HEAD} transform="rotate(3 1130 300)">GG</text>
        {/* shelf + desk */}
        <rect x={1500} y={330} width={300} height={16} fill="#8a5a3c" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1515 + i * 40} y={262 + (i % 2) * 10} width={30} height={68 - (i % 2) * 10} fill={['#e5483d', '#ffd25a', '#4dffb0', '#7b5cff', '#ff7aa8'][i]} />)}
        {bed && (
          <g transform="translate(980 700)">
            <rect x={-420} y={-40} width={840} height={150} rx={20} fill="#6d4a33" />
            <rect x={-400} y={-90} width={800} height={110} rx={30} fill="#f1f1f6" />
            <rect x={-200} y={-100} width={600} height={120} rx={36} fill="#7b5cff" />
            <rect x={-200} y={-100} width={600} height={120} rx={36} fill="url(#gShadeV)" />
            <rect x={-390} y={-140} width={170} height={70} rx={30} fill="#ffffff" />
            <rect x={-440} y={-240} width={50} height={350} rx={16} fill="#5a3d2a" />
          </g>
        )}
      </g>
      <rect x={0} y={840} width={1920} height={240} fill={v === 'day' ? '#8a6248' : '#3a2a22'} />
      <rect x={0} y={840} width={1920} height={10} fill="#000" opacity={0.15} />
      {notes > 0 && <NotesWall n={notes} />}
      {dark > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#02030a" opacity={dark} />}
    </g>
  );
};

/* sticky-note wall (count = how many are visible) */
export const NotesWall: React.FC<{ n: number }> = ({ n }) => (
  <g>
    {[...Array(Math.min(140, Math.floor(n)))].map((_, i) => {
      const x = 120 + ((i * 137) % 1680), y = 120 + ((i * 89) % 640);
      const rot = ((i * 37) % 20) - 10;
      const col = ['#ffe066', '#ffb3c6', '#a0e7ff', '#b8f2a6'][i % 4];
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <rect x={-34} y={-34} width={68} height={68} fill={col} />
          <rect x={-34} y={-34} width={68} height={12} fill="#000" opacity={0.06} />
          <path d="M -22 -8 L 20 -8 M -22 6 L 14 6 M -22 20 L 8 20" stroke="#5a4a3a" strokeWidth={3} opacity={0.55} />
        </g>
      );
    })}
  </g>
);

export const StickyNote: React.FC<{ x: number; y: number; s?: number; rot?: number; lines: string[]; col?: string }> = ({ x, y, s = 1, rot = -3, lines, col = '#ffe066' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-300} y={-260} width={620} height={540} fill="#000" opacity={0.25} filter="url(#softShadow)" />
    <rect x={-310} y={-270} width={620} height={540} fill={col} />
    <rect x={-310} y={-270} width={620} height={60} fill="#000" opacity={0.05} />
    {lines.map((l, i) => (
      <text key={i} x={-260} y={-150 + i * 78} fontSize={56} fill="#3a2d1e" fontFamily="'Comic Sans MS', 'Fredoka', cursive" fontWeight={600}>{l}</text>
    ))}
  </g>
);

/* ---------------- dog (Biscuit) ---------------- */
export const Dog: React.FC<{ x: number; y: number; s?: number; t: number; wag?: number; look?: number; facing?: 1 | -1; lying?: boolean; op?: number }> = ({ x, y, s = 1, t, wag = 1, look = 0, facing = 1, lying = true, op = 1 }) => {
  const tail = Math.sin(t * 12) * 26 * wag;
  const breathe = Math.sin(t * 2.4) * 2;
  const fur = '#e2a75a', furD = '#b97c38';
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`} opacity={op}>
      <ellipse cx={0} cy={6} rx={150} ry={16} fill="#000" opacity={0.18} filter="url(#softShadow)" />
      {/* tail */}
      <path d={`M -120 -40 Q -170 ${-80 - tail * 0.4} ${-190} ${-60 - tail}`} stroke={fur} strokeWidth={22} fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx={-10} cy={lying ? -40 : -70} rx={135} ry={lying ? 52 + breathe : 60} fill={fur} />
      <ellipse cx={-10} cy={lying ? -40 : -70} rx={135} ry={lying ? 52 + breathe : 60} fill="url(#gShadeV)" />
      {/* legs */}
      {lying ? (
        <>
          <ellipse cx={90} cy={-6} rx={60} ry={16} fill={furD} />
          <ellipse cx={-90} cy={-6} rx={50} ry={16} fill={furD} />
        </>
      ) : (
        [-90, -50, 50, 90].map((lx, i) => <rect key={i} x={lx - 12} y={-40} width={24} height={44} rx={10} fill={i % 2 ? furD : fur} />)
      )}
      {/* head */}
      <g transform={`translate(${120} ${lying ? -70 : -120}) rotate(${look * 12})`}>
        <ellipse cx={0} cy={0} rx={62} ry={56} fill={fur} />
        <ellipse cx={0} cy={0} rx={62} ry={56} fill="url(#gHead)" />
        <ellipse cx={52} cy={18} rx={34} ry={24} fill="#f0c78e" />
        <ellipse cx={80} cy={8} rx={12} ry={9} fill="#2a1a10" />
        <ellipse cx={-34} cy={-6} rx={22} ry={46} fill={furD} transform="rotate(18 -34 -6)" />
        <ellipse cx={18} cy={-12} rx={9} ry={11} fill="#1b1b1b" />
        <circle cx={21} cy={-15} r={3} fill="#fff" />
        <path d="M 52 36 Q 64 46 76 36" stroke="#2a1a10" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <rect x={70} y={lying ? -62 : -112} width={50} height={14} rx={6} fill="#e5483d" />
      <circle cx={100} cy={lying ? -46 : -96} r={8} fill="#ffd25a" />
    </g>
  );
};

/* ---------------- truck ---------------- */
export const Truck: React.FC<{ x: number; y: number; s?: number; col?: string; blur?: number }> = ({ x, y, s = 1, col = '#d94436', blur = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {blur > 0 && [1, 2, 3].map((i) => <rect key={i} x={-380 + i * 70} y={-330} width={760} height={300} rx={20} fill={col} opacity={0.12 * blur} />)}
    <rect x={-380} y={-330} width={520} height={280} rx={16} fill="#eef1f5" />
    <rect x={-380} y={-330} width={520} height={280} rx={16} fill="url(#gShadeV)" />
    <rect x={150} y={-280} width={230} height={230} rx={24} fill={col} />
    <rect x={190} y={-260} width={150} height={90} rx={12} fill="#9fd0ff" />
    <rect x={150} y={-280} width={230} height={230} rx={24} fill="url(#gShadeV)" />
    <rect x={360} y={-110} width={40} height={30} rx={8} fill="#ffe28a" />
    <circle cx={385} cy={-95} r={50} fill="#ffe28a" opacity={0.35} filter="url(#glowF)" />
    {[-260, 40, 270].map((wx) => (
      <g key={wx}><circle cx={wx} cy={-40} r={52} fill="#1a1a1f" /><circle cx={wx} cy={-40} r={22} fill="#8a8f99" /></g>
    ))}
  </g>
);

/* ---------------- space diagram ---------------- */
export const Space: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#04060f" />
    {[...Array(140)].map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 151) % 1080} r={(i % 4) * 0.5 + 0.8} fill="#fff" opacity={0.25 + 0.5 * Math.abs(Math.sin(i * 7.1 + t * (i % 3)))} />)}
  </g>
);
export const Earth: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.25} fill="#4fa8ff" opacity={0.25} filter="url(#glowF)" />
    <circle r={r} fill="#2f7fe0" />
    <path d={`M ${-r * 0.6} ${-r * 0.3} q ${r * 0.3} ${-r * 0.4} ${r * 0.6} ${-r * 0.1} q ${r * 0.1} ${r * 0.4} ${-r * 0.2} ${r * 0.5} q ${-r * 0.3} 0 ${-r * 0.4} ${-r * 0.4} Z`} fill="#4dbf6a" />
    <path d={`M ${r * 0.2} ${r * 0.2} q ${r * 0.3} ${-r * 0.1} ${r * 0.5} ${r * 0.2} q ${-r * 0.1} ${r * 0.3} ${-r * 0.4} ${r * 0.3} Z`} fill="#4dbf6a" />
    <circle r={r} fill="url(#gHead)" />
    <path d={`M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${r * 0.55} ${r} 0 0 0 0 ${-r}`} fill="#000" opacity={0.35} />
  </g>
);
export const Moon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#d9dbe2" />
    {[[-0.3, -0.2, 0.2], [0.3, 0.25, 0.15], [0.05, 0.45, 0.1], [-0.4, 0.35, 0.08]].map(([a, b, c], i) => <circle key={i} cx={a * r} cy={b * r} r={c * r} fill="#b4b7c2" />)}
    <circle r={r} fill="url(#gHead)" />
  </g>
);
export const Sun: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.8} fill="#ffb347" opacity={0.25 + 0.05 * Math.sin(t * 3)} filter="url(#glowF)" />
    <circle r={r} fill="#ffcf4a" />
    <circle r={r * 0.75} fill="#ffe58a" />
  </g>
);

/* ---------------- living room (party) ---------------- */
export const Living: React.FC<{ t: number; px?: number; party?: number; ghost?: boolean; v?: 'day' | 'evening' }> = ({ t, px = 0, party = 0, v = 'day' }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill={v === 'day' ? '#f0d9b5' : '#c99a78'} />
    {[...Array(12)].map((_, i) => <rect key={i} x={i * 170} y={0} width={4} height={840} fill="#000" opacity={0.04} />)}
    <g transform={`translate(${px * 0.4} 0)`}>
      <g transform="translate(1450 160)">
        <rect x={0} y={0} width={340} height={300} rx={8} fill={v === 'day' ? '#bfe6ff' : '#3b2d6b'} stroke="#fff" strokeWidth={16} />
        <line x1={170} y1={0} x2={170} y2={300} stroke="#fff" strokeWidth={10} />
      </g>
      <rect x={200} y={250} width={240} height={170} rx={6} fill="#5a4129" />
      <rect x={215} y={265} width={210} height={140} rx={4} fill="#ffb48a" />
      <circle cx={320} cy={335} r={36} fill="#7b5cff" opacity={0.6} />
      {/* sofa */}
      <g transform="translate(560 830)">
        <rect x={0} y={-230} width={620} height={150} rx={40} fill="#4f6fb0" />
        <rect x={-30} y={-120} width={680} height={120} rx={30} fill="#5b7fc4" />
        <rect x={-30} y={-120} width={680} height={120} rx={30} fill="url(#gShadeV)" />
      </g>
    </g>
    <rect x={0} y={830} width={1920} height={250} fill="#9a6a48" />
    <ellipse cx={960} cy={940} rx={600} ry={70} fill="#c94f4f" opacity={0.55} />
    {party > 0 && <Balloons t={t} k={party} />}
  </g>
);

export const Balloons: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <g opacity={Math.min(1, k)}>
    {[[260, 300, '#ff5a7a'], [380, 230, '#ffd25a'], [500, 320, '#4fd8ff'], [1300, 260, '#7b5cff'], [1420, 330, '#4dffb0'], [1180, 340, '#ff8a3d']].map(([x, y, c], i) => {
      const yy = (y as number) + Math.sin(t * 1.4 + i) * 10 + (1 - k) * 400;
      return (
        <g key={i}>
          <path d={`M ${x} ${yy + 70} q 14 60 -6 140`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />
          <ellipse cx={x as number} cy={yy} rx={52} ry={66} fill={c as string} />
          <ellipse cx={(x as number) - 16} cy={yy - 22} rx={12} ry={18} fill="#fff" opacity={0.4} />
        </g>
      );
    })}
  </g>
);

export const Cake: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; candles?: number }> = ({ x, y, s = 1, t, lit = 1, candles = 15 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-40} width={340} height={30} rx={14} fill="#e9eef5" />
    <rect x={-140} y={-170} width={280} height={140} rx={16} fill="#ff9fb5" />
    <path d="M -140 -150 q 35 30 70 0 t 70 0 t 70 0 t 70 0" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" />
    {[...Array(Math.min(candles, 9))].map((_, i) => {
      const cx = -112 + i * 28;
      return (
        <g key={i}>
          <rect x={cx - 5} y={-215} width={10} height={45} rx={3} fill={['#4fd8ff', '#ffd25a', '#7b5cff'][i % 3]} />
          {lit > 0 && (
            <g opacity={lit}>
              <ellipse cx={cx} cy={-228 + Math.sin(t * 20 + i) * 1.5} rx={7} ry={13} fill="#ffb347" />
              <ellipse cx={cx} cy={-225} rx={3.5} ry={7} fill="#fff6c9" />
              <circle cx={cx} cy={-228} r={24} fill="#ffcf7a" opacity={0.25} filter="url(#glowF)" />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/* ---------------- hospital room ---------------- */
export const Hospital: React.FC<{ t: number; px?: number; scan?: boolean }> = ({ t, px = 0 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#dfe9ee" />
    <rect x={0} y={560} width={1920} height={10} fill="#b9cad3" />
    <rect x={0} y={570} width={1920} height={270} fill="#cfdde4" />
    <g transform={`translate(${px * 0.4} 0)`}>
      {/* monitor */}
      <g transform="translate(1500 220)">
        <rect x={0} y={0} width={300} height={200} rx={14} fill="#1b2230" />
        <rect x={14} y={14} width={272} height={172} rx={8} fill="#0b1220" />
        <path d={`M 20 110 ${[...Array(26)].map((_, i) => `L ${20 + i * 10} ${110 - ((i + Math.floor(t * 8)) % 9 === 0 ? 60 : (i + Math.floor(t * 8)) % 9 === 1 ? -25 : 0)}`).join(' ')}`} stroke={C.mint} strokeWidth={4} fill="none" />
        <rect x={140} y={200} width={20} height={300} fill="#8b97a6" />
      </g>
      {/* x-ray lightbox */}
      <g transform="translate(240 180)">
        <rect x={0} y={0} width={420} height={300} rx={10} fill="#e9f6ff" stroke="#9fb0bd" strokeWidth={10} />
        <ellipse cx={210} cy={140} rx={110} ry={120} fill="none" stroke="#7fa8c7" strokeWidth={10} />
        <path d="M 150 120 q 60 -60 120 0 M 140 170 q 70 40 140 0" stroke="#7fa8c7" strokeWidth={8} fill="none" />
        <text x={210} y={285} textAnchor="middle" fontSize={22} fontWeight={700} fill="#4f6b80" fontFamily={FONT_HEAD}>BRAIN · NORMAL</text>
      </g>
    </g>
    <rect x={0} y={840} width={1920} height={240} fill="#b8c7cf" />
  </g>
);

/* ---------------- mirror close-up (bathroom) ---------------- */
export const MirrorFrame: React.FC<{ id: string; children?: React.ReactNode; x?: number; y?: number; w?: number; h?: number }> = ({ id, children, x = 560, y = 110, w = 800, h = 700 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#cfe6ea" />
    {[...Array(20)].map((_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={1080} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />)}
    {[...Array(11)].map((_, i) => <line key={'h' + i} x1={0} y1={i * 100} x2={1920} y2={i * 100} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />)}
    <defs><clipPath id={id}><rect x={x + 30} y={y + 30} width={w - 60} height={h - 60} rx={28} /></clipPath></defs>
    <rect x={x} y={y} width={w} height={h} rx={40} fill="#e9f6f8" stroke="#b9c8cc" strokeWidth={16} />
    <rect x={x + 30} y={y + 30} width={w - 60} height={h - 60} rx={28} fill="#b9d8e2" />
    <g clipPath={`url(#${id})`}>
      <rect x={x} y={y} width={w} height={h} fill="#cfe2e8" />
      {[...Array(8)].map((_, i) => <line key={i} x1={x + i * 100} y1={y} x2={x + i * 100} y2={y + h} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />)}
      {children}
      <path d={`M ${x + 90} ${y + 90} L ${x + 230} ${y + 40} M ${x + 80} ${y + 170} L ${x + 330} ${y + 60}`} stroke="#fff" strokeWidth={16} strokeLinecap="round" opacity={0.35} />
    </g>
    <rect x={x - 100} y={y + h + 20} width={w + 200} height={70} rx={14} fill="#f4f8f9" />
    <rect x={0} y={y + h + 90} width={1920} height={400} fill="#9cbcc2" />
  </g>
);

/* phone with a viral video */
export const ViralPhone: React.FC<{ x: number; y: number; s?: number; t: number; views: number; children?: React.ReactNode }> = ({ x, y, s = 1, t, views, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-210} y={-400} width={420} height={800} rx={50} fill="#111" />
    <rect x={-190} y={-370} width={380} height={740} rx={34} fill="#0e0f14" />
    <defs><clipPath id="vpClip"><rect x={-190} y={-300} width={380} height={300} /></clipPath></defs>
    <rect x={-190} y={-300} width={380} height={300} fill="#2a3350" />
    <g clipPath="url(#vpClip)">{children}</g>
    <rect x={-190} y={-6} width={380 * ((t * 0.3) % 1)} height={6} fill="#ff3b3b" />
    <text x={-170} y={50} fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>The boy who lives</text>
    <text x={-170} y={84} fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>8 minutes in the past 😳</text>
    <text x={-170} y={130} fontSize={30} fontWeight={700} fill={C.gold} fontFamily={FONT_HEAD}>{Math.round(views).toLocaleString('en-US')} views</text>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-170} y={170 + i * 46} width={340 - (i % 2) * 90} height={30} rx={10} fill="#22252f" />)}
  </g>
);
