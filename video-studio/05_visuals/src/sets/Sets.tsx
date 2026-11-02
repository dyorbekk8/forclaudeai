import React from 'react';
import { C, FONT_HEAD } from '../lib/theme';
import { Rays } from '../lib/ui';

/* All sets draw into a 1920x1080 SVG space. `px` = parallax camera x (px).
   Floor line is around y = 820 unless noted. */

type SetP = { t: number; px?: number; v?: 'morning' | 'evening' | 'night' | 'sunset' | 'day' };

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="skyMorning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fd3ff" /><stop offset="1" stopColor="#ffe3b8" /></linearGradient>
    <linearGradient id="skyEvening" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2d6b" /><stop offset="0.6" stopColor="#c8607a" /><stop offset="1" stopColor="#ffb07a" /></linearGradient>
    <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1433" /><stop offset="1" stopColor="#2b2f63" /></linearGradient>
    <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9e6b" /><stop offset="1" stopColor="#ffd9a0" /></linearGradient>
    <linearGradient id="woodFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9825a" /><stop offset="1" stopColor="#8a5a3c" /></linearGradient>
    <linearGradient id="hallFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfd6df" /><stop offset="1" stopColor="#9aa6b5" /></linearGradient>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe7b0" stopOpacity="0" /></radialGradient>
    <radialGradient id="warmGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd08a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd08a" stopOpacity="0" /></radialGradient>
    <linearGradient id="navyBG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1a3d" /><stop offset="1" stopColor="#060c20" /></linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.18" /><stop offset="0.5" stopColor="#000" stopOpacity="0" /></linearGradient>
  </defs>
);

const skyFor = (v?: string) => (v === 'evening' ? 'url(#skyEvening)' : v === 'night' ? 'url(#skyNight)' : v === 'sunset' ? 'url(#skySunset)' : 'url(#skyMorning)');

/* ---------------- KITCHEN ---------------- */
export const Kitchen: React.FC<SetP & { noTable?: boolean; jar?: 'full' | 'empty' | 'none' }> = ({ t, px = 0, v = 'morning', noTable, jar = 'none' }) => {
  const wall = v === 'night' ? '#4b4a6b' : v === 'evening' ? '#e8b48c' : '#f6dcb4';
  return (
    <g>
      <Defs />
      <g transform={`translate(${px * 0.6} 0)`}>
        <rect x={-300} y={0} width={2520} height={1080} fill={wall} />
        <rect x={-300} y={0} width={2520} height={1080} fill="url(#wallShade)" />
        {/* window */}
        <g transform="translate(1180 170)">
          <rect x={-14} y={-14} width={468} height={388} rx={10} fill="#fff8ee" />
          <rect x={0} y={0} width={440} height={360} fill={skyFor(v)} />
          {v !== 'night' && <circle cx={330} cy={110} r={48} fill="#fff6c9" opacity={0.95} />}
          {v === 'night' && <circle cx={330} cy={90} r={30} fill="#f3f0ff" />}
          <path d="M 0 270 Q 80 220 160 260 T 320 250 T 440 240 L 440 360 L 0 360 Z" fill={v === 'night' ? '#1b2346' : '#8cc68a'} opacity={0.9} />
          <rect x={213} y={0} width={14} height={360} fill="#fff8ee" />
          <rect x={0} y={173} width={440} height={14} fill="#fff8ee" />
          <rect x={-30} y={366} width={500} height={26} rx={6} fill="#e9d5b8" />
        </g>
        {/* upper cabinets */}
        {[100, 330, 560].map((x) => (
          <g key={x}>
            <rect x={x} y={120} width={210} height={250} rx={10} fill="#5f9e8f" />
            <rect x={x + 16} y={136} width={178} height={218} rx={8} fill="#6fb2a1" />
            <circle cx={x + 180} cy={260} r={6} fill="#e9d5b8" />
          </g>
        ))}
        {/* counter */}
        <rect x={60} y={560} width={760} height={260} fill="#5f9e8f" />
        <rect x={40} y={540} width={800} height={30} rx={6} fill="#efe3cf" />
        {[90, 340, 590].map((x) => <rect key={x} x={x} y={600} width={200} height={190} rx={8} fill="#6fb2a1" />)}
        {/* kettle + plant */}
        <g transform="translate(200 470)"><path d="M 0 70 Q 0 10 50 10 Q 100 10 100 70 Z" fill="#e66b5b" /><rect x={-4} y={64} width={108} height={10} rx={4} fill="#b9473b" /><path d="M 100 40 L 140 20" stroke="#e66b5b" strokeWidth={10} strokeLinecap="round" /></g>
        <g transform="translate(640 440)"><rect x={0} y={60} width={70} height={42} rx={8} fill="#f0c27a" /><path d="M 35 62 Q 0 10 10 -10 M 35 62 Q 40 0 60 -14 M 35 62 Q 70 30 80 10" stroke="#3d8f5a" strokeWidth={9} fill="none" strokeLinecap="round" /></g>
        {/* fridge */}
        <g transform="translate(880 230)">
          <rect x={0} y={0} width={230} height={590} rx={22} fill="#e8eef3" />
          <rect x={0} y={200} width={230} height={8} fill="#c7d0d8" />
          <rect x={196} y={70} width={12} height={90} rx={6} fill="#aeb8c2" />
          <rect x={196} y={240} width={12} height={120} rx={6} fill="#aeb8c2" />
          <rect x={40} y={260} width={60} height={70} fill="#ffd25a" transform="rotate(-6 70 290)" />
          <rect x={110} y={300} width={56} height={56} fill="#9fd3ff" transform="rotate(5 138 328)" />
        </g>
        {/* hanging lamp */}
        <g transform="translate(1580 0)"><rect x={-2} y={0} width={4} height={260} fill="#3a3030" /><path d="M -70 330 Q 0 230 70 330 Z" fill="#e66b5b" /><ellipse cx={0} cy={330} rx={70} ry={10} fill="#ffe8b0" /></g>
        {v === 'night' || v === 'evening' ? <circle cx={1580} cy={420} r={420} fill="url(#lampGlow)" opacity={0.6} /> : null}
      </g>
      {/* floor */}
      <rect x={-300} y={820} width={2520} height={260} fill="url(#woodFloor)" />
      {[...Array(12)].map((_, i) => <rect key={i} x={-300 + i * 220 + (px * 0.9) % 220} y={820} width={3} height={260} fill="#000" opacity={0.08} />)}
      {v === 'morning' && <Rays x={1400} y={170} angle={-35} t={t} opacity={0.2} />}
      {!noTable && <KitchenTable px={px} jar={jar} />}
    </g>
  );
};

export const KitchenTable: React.FC<{ px?: number; jar?: 'full' | 'empty' | 'none' }> = ({ px = 0, jar = 'none' }) => (
        <g transform={`translate(${px * 1.15} 0)`}>
          <rect x={1080} y={690} width={760} height={34} rx={10} fill="#a8683f" />
          <rect x={1120} y={724} width={26} height={180} fill="#8b5232" />
          <rect x={1770} y={724} width={26} height={180} fill="#8b5232" />
          {jar !== 'none' && (
            <g transform="translate(1660 560)">
              <rect x={0} y={20} width={110} height={112} rx={20} fill="#cfe8f5" opacity={0.85} stroke="#fff" strokeWidth={4} />
              <rect x={10} y={4} width={90} height={24} rx={8} fill="#e66b5b" />
              {jar === 'full' && [[30, 100], [70, 104], [50, 76], [28, 66], [78, 72]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={17} fill="#c98a4b" />)}
              {jar === 'empty' && <g><circle cx={40} cy={122} r={3} fill="#c98a4b" /><circle cx={62} cy={124} r={2.5} fill="#c98a4b" /></g>}
              <text x={55} y={60} textAnchor="middle" fontSize={16} fontWeight={700} fill="#8a5a3c" fontFamily={FONT_HEAD}>COOKIES</text>
            </g>
          )}
        </g>
);

/* ---------------- SCHOOL HALLWAY ---------------- */
export const Hallway: React.FC<SetP> = ({ t, px = 0 }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="#e9e1cf" />
    <g transform={`translate(${(px * 0.85) % 1920} 0)`}>
      {[-1, 0, 1].map((k) => (
        <g key={k} transform={`translate(${k * 1920} 0)`}>
          {/* ceiling lights */}
          {[160, 800, 1440].map((x) => <rect key={x} x={x} y={40} width={300} height={22} rx={8} fill="#fffbe8" />)}
          {/* lockers */}
          {[...Array(16)].map((_, i) => (
            <g key={i} transform={`translate(${i * 120} 300)`}>
              <rect x={0} y={0} width={116} height={520} fill={i % 7 === 3 ? '#e2a23a' : '#3d6fd6'} />
              <rect x={10} y={10} width={96} height={500} rx={4} fill={i % 7 === 3 ? '#f0b44c' : '#4b80ea'} />
              {[40, 56, 72].map((y) => <rect key={y} x={30} y={y} width={56} height={6} rx={3} fill="#000" opacity={0.18} />)}
              <rect x={86} y={230} width={10} height={44} rx={4} fill="#d8e1f0" />
            </g>
          ))}
          <rect x={0} y={292} width={1920} height={14} fill="#2c4f9c" />
          {/* poster */}
          <g transform="translate(700 150) rotate(-3)">
            <rect x={0} y={0} width={190} height={120} fill="#ff7a8a" />
            <text x={95} y={72} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>GO OWLS!</text>
          </g>
          <g transform="translate(1500 160) rotate(2)">
            <rect x={0} y={0} width={160} height={110} fill="#7ad4a0" />
            <text x={80} y={66} textAnchor="middle" fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>VOTE!</text>
          </g>
        </g>
      ))}
    </g>
    <rect x={0} y={820} width={1920} height={260} fill="url(#hallFloor)" />
    <rect x={0} y={820} width={1920} height={8} fill="#000" opacity={0.12} />
    {/* floor reflections */}
    {[300, 940, 1580].map((x) => <rect key={x} x={((x + px * 0.85) % 2100 + 2100) % 2100 - 100} y={850} width={240} height={14} rx={7} fill="#fff" opacity={0.25} />)}
  </g>
);

/* ---------------- CLASSROOM ---------------- */
export const Classroom: React.FC<SetP & { board?: string }> = ({ t, px = 0, board = 'Chapter 4' }) => (
  <g>
    <Defs />
    <g transform={`translate(${px * 0.6} 0)`}>
      <rect x={-200} y={0} width={2320} height={1080} fill="#d9e4c8" />
      <rect x={-200} y={0} width={2320} height={1080} fill="url(#wallShade)" />
      <rect x={300} y={140} width={1000} height={440} rx={14} fill="#7a5a3a" />
      <rect x={322} y={162} width={956} height={396} rx={8} fill="#2f5a46" />
      <text x={380} y={260} fontSize={64} fill="#f4f4ea" fontFamily={FONT_HEAD} opacity={0.92}>{board}</text>
      <path d="M 380 300 Q 600 280 820 300" stroke="#f4f4ea" strokeWidth={4} fill="none" opacity={0.6} />
      <text x={380} y={390} fontSize={34} fill="#f4f4ea" fontFamily={FONT_HEAD} opacity={0.55}>pages 112 – 140</text>
      <rect x={1400} y={160} width={340} height={380} rx={8} fill="#fff8ee" />
      <rect x={1414} y={174} width={312} height={352} fill="url(#skyMorning)" />
      <rect x={1563} y={174} width={14} height={352} fill="#fff8ee" />
      <circle cx={180} cy={220} r={60} fill="#fff" stroke="#3a3a3a" strokeWidth={8} />
      <path d={`M 180 220 L 180 180 M 180 220 L ${180 + 30 * Math.cos(t)} ${220 + 30 * Math.sin(t)}`} stroke="#3a3a3a" strokeWidth={6} strokeLinecap="round" />
    </g>
    <rect x={0} y={820} width={1920} height={260} fill="#c79a6c" />
    <Rays x={1570} y={170} angle={-30} t={t} opacity={0.16} />
  </g>
);

export const Desk: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = 820, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-150} width={220} height={22} rx={6} fill="#d79a5c" />
    <rect x={-96} y={-128} width={14} height={128} fill="#555c6a" />
    <rect x={82} y={-128} width={14} height={128} fill="#555c6a" />
  </g>
);

/* ---------------- DINING ROOM ---------------- */
export const Dining: React.FC<SetP & { food?: 'meatloaf' | 'dinner' | 'breakfast' | 'none'; glass?: boolean }> = ({ t, px = 0, v = 'evening', food = 'dinner', glass }) => (
  <g>
    <Defs />
    <g transform={`translate(${px * 0.6} 0)`}>
      <rect x={-200} y={0} width={2320} height={1080} fill={v === 'morning' ? '#f3d8c0' : '#c98b7a'} />
      <rect x={-200} y={0} width={2320} height={500} fill="#000" opacity={v === 'morning' ? 0.0 : 0.12} />
      {/* wainscot */}
      <rect x={-200} y={560} width={2320} height={300} fill={v === 'morning' ? '#e6c3a6' : '#a86d5f'} />
      <rect x={-200} y={556} width={2320} height={10} fill="#fff" opacity={0.35} />
      {/* frames */}
      {[[260, 180, 170, 130], [480, 150, 120, 160], [1460, 170, 200, 140]].map(([x, y, w, h], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={h} rx={6} fill="#5a3b2b" /><rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill={['#9fd3ff', '#ffd25a', '#8cc68a'][i]} /></g>
      ))}
      {/* window */}
      <g transform="translate(820 140)">
        <rect x={-12} y={-12} width={344} height={344} rx={8} fill="#fff1e2" />
        <rect x={0} y={0} width={320} height={320} fill={skyFor(v === 'morning' ? 'morning' : 'night')} />
        {v !== 'morning' && [...Array(14)].map((_, i) => <circle key={i} cx={(i * 97) % 320} cy={(i * 53) % 200} r={2} fill="#fff" opacity={0.7} />)}
        <rect x={153} y={0} width={14} height={320} fill="#fff1e2" />
      </g>
    </g>
    {/* pendant lamp */}
    <g transform={`translate(${960 + px * 0.9} 0)`}>
      <rect x={-2} y={0} width={4} height={300} fill="#2b2222" />
      <path d="M -90 380 Q 0 260 90 380 Z" fill="#f2c14e" />
      {v !== 'morning' && <circle cx={0} cy={460} r={520} fill="url(#lampGlow)" opacity={0.55} />}
    </g>
    <rect x={0} y={860} width={1920} height={220} fill="#6e4636" />
    {/* table */}
    <g transform={`translate(${px * 1.1} 0)`}>
      <rect x={380} y={700} width={1160} height={40} rx={10} fill="#f4efe6" />
      <rect x={400} y={738} width={1120} height={30} fill="#e3dccf" />
      <rect x={440} y={760} width={30} height={200} fill="#5a3b2b" />
      <rect x={1450} y={760} width={30} height={200} fill="#5a3b2b" />
      {food !== 'none' && (
        <g>
          {[620, 960, 1300].map((x) => <ellipse key={x} cx={x} cy={700} rx={92} ry={18} fill="#fff" stroke="#d9d2c4" strokeWidth={3} />)}
          {food === 'meatloaf' && (
            <g transform="translate(960 640)">
              <rect x={-110} y={0} width={220} height={66} rx={20} fill="#6d5546" />
              <rect x={-110} y={0} width={220} height={18} rx={9} fill="#8a4b3a" />
              <path d="M -60 -24 q 10 -16 0 -30 M 0 -26 q 10 -16 0 -30 M 60 -24 q 10 -16 0 -30" stroke="#9aa3b5" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
              <g transform={`translate(${60 + Math.sin(t * 7) * 40} ${-60 + Math.cos(t * 9) * 20})`}><circle r={6} fill="#222" /><ellipse cx={-6} cy={-6} rx={7} ry={4} fill="#fff" opacity={0.8} /><ellipse cx={6} cy={-6} rx={7} ry={4} fill="#fff" opacity={0.8} /></g>
            </g>
          )}
          {food === 'dinner' && (
            <g>
              <ellipse cx={960} cy={668} rx={70} ry={32} fill="#e8a24a" />
              <ellipse cx={940} cy={660} rx={24} ry={12} fill="#7bc46b" />
            </g>
          )}
          {food === 'breakfast' && (
            <g>
              <ellipse cx={1300} cy={688} rx={56} ry={16} fill="#ffe08a" />
              <circle cx={1300} cy={684} r={14} fill="#ffb93a" />
              <rect x={600} y={630} width={46} height={64} rx={8} fill="#fff" stroke="#d9d2c4" strokeWidth={3} />
            </g>
          )}
          {glass && <g transform="translate(1160 610)"><path d="M 0 0 L 52 0 L 46 88 L 6 88 Z" fill="#cfe8f5" opacity={0.7} stroke="#fff" strokeWidth={4} /><rect x={6} y={30} width={40} height={56} fill="#ff9e6b" opacity={0.75} /></g>}
        </g>
      )}
    </g>
  </g>
);

/* ---------------- CARE HOME ROOM (Grandpa) ---------------- */
export const CareRoom: React.FC<SetP & { light?: number; photo?: boolean }> = ({ t, px = 0, v = 'day', light = 1, photo = true }) => {
  const sky = v === 'sunset' ? 'url(#skySunset)' : v === 'night' ? 'url(#skyNight)' : 'url(#skyMorning)';
  return (
    <g>
      <Defs />
      <g transform={`translate(${px * 0.55} 0)`}>
        <rect x={-200} y={0} width={2320} height={1080} fill={v === 'night' ? '#4c4a66' : '#e8d9c2'} />
        {/* wallpaper stripes */}
        {[...Array(30)].map((_, i) => <rect key={i} x={-200 + i * 80} y={0} width={36} height={820} fill="#fff" opacity={0.08} />)}
        <rect x={-200} y={0} width={2320} height={1080} fill="url(#wallShade)" />
        {/* window with tree */}
        <g transform="translate(1180 150)">
          <rect x={-16} y={-16} width={512} height={472} rx={10} fill="#fbf3e6" />
          <rect x={0} y={0} width={480} height={440} fill={sky} />
          <g transform={`translate(330 ${300 + Math.sin(t * 0.7) * 3})`}>
            <rect x={-12} y={0} width={24} height={160} fill="#6b4a33" />
            <circle cx={0} cy={-30} r={110} fill={v === 'sunset' ? '#d98a4a' : '#5fae6a'} />
            <circle cx={-70} cy={10} r={70} fill={v === 'sunset' ? '#c97a3a' : '#4f9e5a'} />
            <circle cx={70} cy={0} r={80} fill={v === 'sunset' ? '#e09a5a' : '#6fbe7a'} />
          </g>
          {v === 'sunset' && <circle cx={120} cy={330} r={60} fill="#fff1c0" opacity={0.95} />}
          <rect x={233} y={0} width={14} height={440} fill="#fbf3e6" />
          <rect x={0} y={213} width={480} height={14} fill="#fbf3e6" />
          {/* curtains */}
          <path d="M -40 -30 Q -10 200 -50 470 L -120 470 L -120 -30 Z" fill="#c86b6b" />
          <path d="M 520 -30 Q 490 200 530 470 L 600 470 L 600 -30 Z" fill="#c86b6b" />
        </g>
        {/* nightstand + lamp + photo */}
        <g transform="translate(330 560)">
          <rect x={0} y={0} width={260} height={260} rx={10} fill="#8a5a3c" />
          <rect x={20} y={110} width={220} height={8} fill="#6b4530" />
          <circle cx={130} cy={70} r={7} fill="#e8c38a" />
          <g transform="translate(50 -170)">
            <rect x={24} y={60} width={12} height={110} fill="#c9b08a" />
            <path d="M -20 70 L 80 70 L 60 0 L 0 0 Z" fill="#f4e2c0" />
            <circle cx={30} cy={60} r={160} fill="url(#lampGlow)" opacity={0.35 * light} />
          </g>
          {photo && <PhotoFrame x={150} y={-150} s={0.85} />}
        </g>
        {/* calendar */}
        <g transform="translate(760 200)">
          <rect x={0} y={0} width={170} height={190} rx={8} fill="#fff" />
          <rect x={0} y={0} width={170} height={46} rx={8} fill={C.red} />
          <text x={85} y={33} textAnchor="middle" fontSize={24} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>SATURDAY</text>
          {[...Array(12)].map((_, i) => <rect key={i} x={14 + (i % 4) * 38} y={62 + Math.floor(i / 4) * 40} width={28} height={28} rx={4} fill="#e8e3da" />)}
        </g>
      </g>
      <rect x={0} y={820} width={1920} height={260} fill="#9b7656" />
      <rect x={0} y={820} width={1920} height={260} fill="#000" opacity={0.08} />
      {v !== 'night' && <Rays x={1420} y={170} angle={-38} t={t} opacity={0.22 * light} color={v === 'sunset' ? '#ffcf99' : '#fff2cc'} />}
    </g>
  );
};

export const PhotoFrame: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={60} r={170} fill="url(#warmGlow)" opacity={glow} />}
    <rect x={-80} y={-10} width={160} height={190} rx={8} fill="#c9a24a" />
    <rect x={-66} y={4} width={132} height={162} fill="#f6e3c8" />
    {/* Rosie portrait */}
    <rect x={-66} y={4} width={132} height={162} fill="#e7b9b0" opacity={0.5} />
    <g fill="#e8e8ee">{[[-34, 46], [-14, 30], [12, 30], [34, 46], [-38, 70], [38, 70]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={20} />)}</g>
    <circle cx={0} cy={78} r={34} fill={C.ink} />
    <path d="M -14 74 Q -9 68 -4 74 M 4 74 Q 9 68 14 74" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -8 92 Q 0 99 8 92" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -40 166 Q -40 120 0 116 Q 40 120 40 166 Z" fill={C.rosie} />
    {[-18, -9, 0, 9, 18].map((a) => <circle key={a} cx={a} cy={122 + Math.abs(a) * 0.25} r={3.4} fill="#fff" />)}
  </g>
);

export const Armchair: React.FC<{ x: number; y?: number; s?: number; col?: string }> = ({ x, y = 820, s = 1, col = '#5b7fb0' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-330} width={190} height={250} rx={40} fill={col} />
    <rect x={-160} y={-120} width={300} height={70} rx={24} fill={col} />
    <rect x={-150} y={-160} width={290} height={60} rx={22} fill={shade(col)} />
    <rect x={90} y={-200} width={70} height={150} rx={26} fill={col} />
    <rect x={-170} y={-200} width={60} height={150} rx={24} fill={col} />
    <rect x={-150} y={-52} width={18} height={52} fill="#4a3426" />
    <rect x={120} y={-52} width={18} height={52} fill="#4a3426" />
  </g>
);
const shade = (c: string) => c === '#5b7fb0' ? '#4c6c99' : c;

/* ---------------- DATA / INFOGRAPHIC BACKGROUND ---------------- */
export const DataBG: React.FC<{ t: number; grid?: boolean; tint?: string }> = ({ t, grid = true, tint }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="url(#navyBG)" />
    {tint && <rect x={0} y={0} width={1920} height={1080} fill={tint} opacity={0.18} />}
    {grid && (
      <g opacity={0.09} stroke="#7fb4ff" strokeWidth={1}>
        {[...Array(25)].map((_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} />)}
        {[...Array(14)].map((_, i) => <line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} />)}
      </g>
    )}
    {[...Array(26)].map((_, i) => {
      const x = (i * 263 + t * (8 + (i % 5) * 3)) % 1920;
      const y = (i * 151 - t * (5 + (i % 3) * 2) + 2000) % 1080;
      return <circle key={i} cx={x} cy={y} r={1.5 + (i % 3)} fill="#9fd3ff" opacity={0.25} />;
    })}
  </g>
);

/* ---------------- BATHROOM MIRROR ---------------- */
export const Bathroom: React.FC<SetP> = ({ t }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="#cfe6ea" />
    {[...Array(20)].map((_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={1080} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />)}
    {[...Array(11)].map((_, i) => <line key={'h' + i} x1={0} y1={i * 100} x2={1920} y2={i * 100} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />)}
    <rect x={560} y={110} width={800} height={640} rx={40} fill="#e9f6f8" stroke="#b9c8cc" strokeWidth={16} />
    <rect x={590} y={140} width={740} height={580} rx={28} fill="#d6eef2" />
    <path d="M 640 200 L 760 160 M 650 260 L 860 180" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.6} />
    <rect x={460} y={800} width={1000} height={60} rx={12} fill="#f4f8f9" />
    <rect x={0} y={860} width={1920} height={220} fill="#9cbcc2" />
  </g>
);

/* ---------------- BUS DOOR ---------------- */
export const BusDoor: React.FC<SetP> = ({ t, px = 0 }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="url(#skyMorning)" />
    <g transform={`translate(${px * 0.3} 0)`}>
      {[0, 300, 650, 1000, 1400].map((x, i) => <rect key={x} x={x} y={420 - (i % 3) * 60} width={240} height={500} fill="#c9b3a0" opacity={0.55} />)}
    </g>
    <rect x={700} y={140} width={1400} height={720} rx={50} fill="#ffc531" />
    <rect x={700} y={700} width={1400} height={50} fill="#2a2a2a" />
    <rect x={760} y={210} width={300} height={600} rx={18} fill="#2c3b4f" />
    <rect x={780} y={230} width={120} height={560} rx={8} fill="#7fb6d9" opacity={0.75} />
    <rect x={920} y={230} width={120} height={560} rx={8} fill="#7fb6d9" opacity={0.75} />
    <rect x={1120} y={210} width={700} height={240} rx={18} fill="#7fb6d9" />
    <text x={1470} y={540} textAnchor="middle" fontSize={64} fontWeight={700} fill="#2a2a2a" fontFamily={FONT_HEAD}>SCHOOL BUS</text>
    <rect x={0} y={860} width={1920} height={220} fill="#8a8f99" />
    <rect x={0} y={860} width={1920} height={14} fill="#ddd" />
  </g>
);

/* ---------------- STAIRS ---------------- */
export const Stairs: React.FC<SetP> = ({ t }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="#e7d4bc" />
    <rect x={0} y={0} width={1920} height={1080} fill="url(#wallShade)" />
    {[...Array(9)].map((_, i) => (
      <g key={i}>
        <rect x={300 + i * 150} y={880 - i * 70} width={1920} height={70} fill={i % 2 ? '#a5734f' : '#b07c56'} />
        <rect x={300 + i * 150} y={880 - i * 70} width={1920} height={8} fill="#fff" opacity={0.25} />
      </g>
    ))}
    <rect x={0} y={880} width={1920} height={200} fill="#9a6a48" />
    <path d="M 300 760 L 1650 130" stroke="#6b4530" strokeWidth={14} strokeLinecap="round" />
    {[...Array(9)].map((_, i) => <rect key={i} x={360 + i * 150} y={790 - i * 70 - 100} width={8} height={110} fill="#6b4530" />)}
  </g>
);

/* ---------------- DMV ---------------- */
export const DMV: React.FC<SetP> = ({ t }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="#d8dde3" />
    <rect x={0} y={120} width={1920} height={110} fill="#2f4f7f" />
    <text x={960} y={196} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD} letterSpacing={6}>DRIVER LICENSES</text>
    <rect x={0} y={600} width={1920} height={60} fill="#b9c2cc" />
    <rect x={0} y={660} width={1920} height={420} fill="#8e99a6" />
    <g transform="translate(1500 300)"><rect x={0} y={0} width={220} height={120} rx={10} fill="#111" /><text x={110} y={82} textAnchor="middle" fontSize={64} fill={C.red} fontFamily={FONT_HEAD} fontWeight={700}>A-41</text></g>
  </g>
);

/* ---------------- WEDDING / DANCE (flashback) ---------------- */
export const Ballroom: React.FC<SetP & { arch?: boolean }> = ({ t, arch }) => (
  <g>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill="#4a3550" />
    {[...Array(40)].map((_, i) => {
      const x = (i * 211) % 1920, y = 60 + ((i * 97) % 300);
      return <circle key={i} cx={x} cy={y} r={5 + (i % 3) * 2} fill="#ffe7a0" opacity={0.4 + 0.4 * Math.abs(Math.sin(t * 1.5 + i))} />;
    })}
    {arch && (
      <g transform="translate(960 830)">
        <path d="M -330 0 L -330 -420 Q 0 -700 330 -420 L 330 0" stroke="#f4e2c0" strokeWidth={36} fill="none" />
        {[...Array(14)].map((_, i) => {
          const a = Math.PI * (i / 13);
          return <circle key={i} cx={-Math.cos(a) * 330} cy={-420 - Math.sin(a) * 200} r={30} fill={i % 2 ? '#f2a0b8' : '#fff'} />;
        })}
      </g>
    )}
    <rect x={0} y={830} width={1920} height={250} fill="#6b4a3a" />
    {[...Array(10)].map((_, i) => <rect key={i} x={i * 200} y={830} width={100} height={250} fill="#000" opacity={0.08} />)}
  </g>
);

/* ---------------- BACKDROP: plain gradient for close-ups ---------------- */
export const Backdrop: React.FC<{ a: string; b: string; t?: number }> = ({ a, b }) => {
  const id = `bd${a}${b}`.replace(/[^a-zA-Z0-9]/g, '');
  return (
  <g>
    <defs>
      <radialGradient id={id} cx="0.5" cy="0.45" r="0.75"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill={`url(#${id})`} />
  </g>
  );
};
