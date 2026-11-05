import React from 'react';
import { FONT_HEAD } from '../lib/theme';

/* EP02 sets — richer lighting: gradients, light pools, rays, bokeh, layered parallax. */

type P = { t: number; px?: number; blur?: boolean };
const Blur: React.FC<{ on?: boolean; children: React.ReactNode; strong?: boolean }> = ({ on, children, strong }) => (on ? <g filter={`url(#${strong ? 'dofStrong' : 'dof'})`}>{children}</g> : <>{children}</>);

const Rays: React.FC<{ x: number; y: number; ang: number; n?: number; len?: number; col?: string; op?: number; t: number }> = ({ x, y, ang, n = 4, len = 1100, col = '#fff2cf', op = 0.16, t }) => (
  <g style={{ mixBlendMode: 'screen' }}>
    <defs><linearGradient id={`r${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity={op * 1.6} /><stop offset="1" stopColor={col} stopOpacity={0} /></linearGradient></defs>
    {[...Array(n)].map((_, i) => (
      <path key={i} transform={`translate(${x + i * 120} ${y}) rotate(${ang})`} d={`M -40 0 L 60 0 L 260 ${len} L -120 ${len} Z`} fill={`url(#r${x}${y})`} opacity={0.6 + 0.4 * Math.sin(t * 0.7 + i)} />
    ))}
  </g>
);

/* ---------------- SCHOOL GYM ---------------- */
export const Gym: React.FC<P & { rope?: 'up' | 'snapped' | 'none'; bar?: boolean }> = ({ t, px = 0, blur, rope = 'up', bar = true }) => (
  <g>
    <defs>
      <linearGradient id="gymWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9b18d" /><stop offset="1" stopColor="#a88d69" /></linearGradient>
      <linearGradient id="gymFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d39a5a" /><stop offset="1" stopColor="#9c6633" /></linearGradient>
    </defs>
    <Blur on={blur}>
      <g transform={`translate(${px * 0.5} 0)`}>
        <rect x={-300} y={0} width={2520} height={820} fill="url(#gymWall)" />
        {/* high windows */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${-80 + i * 470} 60)`}>
            <rect x={0} y={0} width={300} height={190} rx={6} fill="#e9f3ff" />
            <rect x={10} y={10} width={280} height={170} fill="#a9d4ff" />
            {[1, 2, 3].map((k) => <rect key={k} x={10 + k * 70} y={10} width={6} height={170} fill="#e9f3ff" />)}
            <rect x={10} y={92} width={280} height={6} fill="#e9f3ff" />
          </g>
        ))}
        {/* banners */}
        {[['#c0392b', 'STATE 1998'], ['#2c5aa0', 'GO OWLS'], ['#2f8a57', 'CHAMPS']].map(([c, txt], i) => (
          <g key={i} transform={`translate(${260 + i * 620} 300)`}>
            <path d="M 0 0 L 170 0 L 170 150 L 85 185 L 0 150 Z" fill={c as string} />
            <text x={85} y={90} textAnchor="middle" fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT_HEAD}>{txt}</text>
          </g>
        ))}
        {/* bleachers */}
        <g transform="translate(1250 520)">
          {[0, 1, 2, 3].map((r) => <rect key={r} x={-r * 30} y={r * 70} width={900 + r * 60} height={26} rx={6} fill={r % 2 ? '#7a5a3a' : '#8a6a46'} />)}
        </g>
        {/* climbing rope */}
        {rope !== 'none' && (
          <g transform="translate(560 0)">
            <rect x={-40} y={0} width={80} height={24} fill="#5a4a3a" />
            <path d={rope === 'up' ? `M 0 20 Q ${Math.sin(t * 1.3) * 8} 400 ${Math.sin(t) * 6} 760` : 'M 0 20 L 0 260 M -6 260 l -12 10 M 6 262 l 14 8'} stroke="#c9a46a" strokeWidth={14} fill="none" strokeLinecap="round" />
            {rope === 'up' && [...Array(14)].map((_, i) => <path key={i} d={`M -7 ${60 + i * 50} l 14 10`} stroke="#9a7a48" strokeWidth={3} />)}
          </g>
        )}
        {/* basketball hoop */}
        <g transform="translate(1720 160)">
          <rect x={-80} y={0} width={160} height={110} rx={6} fill="#fff" stroke="#c0392b" strokeWidth={6} />
          <rect x={-30} y={40} width={60} height={44} fill="none" stroke="#c0392b" strokeWidth={5} />
          <ellipse cx={0} cy={125} rx={44} ry={9} fill="none" stroke="#e67e22" strokeWidth={6} />
        </g>
      </g>
    </Blur>
    <rect x={0} y={820} width={1920} height={260} fill="url(#gymFloor)" />
    {[...Array(14)].map((_, i) => <rect key={i} x={((i * 160 + px * 0.9) % 2240) - 160} y={820} width={3} height={260} fill="#000" opacity={0.08} />)}
    <path d="M -100 940 Q 960 880 2020 940" stroke="#fff" strokeWidth={6} fill="none" opacity={0.5} />
    <ellipse cx={960} cy={900} rx={700} ry={50} fill="url(#pool)" />
    <Rays x={140} y={150} ang={-25} n={5} t={t} />
    {bar && <Barbell x={1180 + px * 1.0} y={820} />}
  </g>
);

export const Barbell: React.FC<{ x: number; y: number; lift?: number; s?: number }> = ({ x, y, lift = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y - lift}) scale(${s})`}>
    <ellipse cx={0} cy={6 + lift} rx={200} ry={10} fill="#000" opacity={0.25 * (1 - Math.min(1, lift / 300))} filter="url(#softShadow)" />
    <rect x={-220} y={-52} width={440} height={10} rx={5} fill="#c8cdd6" />
    {[-1, 1].map((k) => (
      <g key={k} transform={`translate(${k * 170} -47)`}>
        <rect x={-14} y={-48} width={28} height={96} rx={6} fill="#2b2f3a" />
        <rect x={k > 0 ? 14 : -30} y={-38} width={16} height={76} rx={5} fill="#3b4150" />
        <rect x={-14} y={-48} width={6} height={96} fill="#fff" opacity={0.15} />
      </g>
    ))}
  </g>
);

/* ---------------- SUBURBAN STREET (day / dusk / night / fire) ---------------- */
export const Street: React.FC<P & { v?: 'day' | 'dusk' | 'night' | 'fire'; gym?: boolean }> = ({ t, px = 0, blur, v = 'day', gym }) => {
  const sky = v === 'day' ? ['#8cc8ff', '#dff1ff'] : v === 'dusk' ? ['#4b3b7a', '#ff9e7a'] : v === 'fire' ? ['#1a0f22', '#7a2a1a'] : ['#0b1230', '#2b3466'];
  const house = v === 'day' ? 1 : 0.55;
  return (
    <g>
      <defs><linearGradient id={`sky${v}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
      <Blur on={blur}>
        <rect x={0} y={0} width={1920} height={1080} fill={`url(#sky${v})`} />
        {v !== 'day' && [...Array(40)].map((_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 73) % 380} r={1.6} fill="#fff" opacity={0.6} />)}
        {v === 'day' && <circle cx={1550} cy={170} r={70} fill="#fff6c9" />}
        {/* far skyline */}
        <g transform={`translate(${px * 0.2} 0)`} opacity={0.5}>
          {[...Array(14)].map((_, i) => <rect key={i} x={-100 + i * 160} y={420 - (i * 37) % 160} width={120} height={400} fill={v === 'day' ? '#9db6d4' : '#1c2350'} />)}
        </g>
        {/* houses */}
        <g transform={`translate(${px * 0.6} 0)`}>
          {[0, 1, 2, 3, 4].map((i) => {
            const cols = ['#e8c39e', '#9fc5b8', '#d9a7a7', '#c7b9e0', '#e6d69a'];
            const isGym = gym && i === 2;
            return (
              <g key={i} transform={`translate(${-60 + i * 430} 0)`} opacity={house}>
                {isGym ? (
                  <g>
                    <rect x={0} y={380} width={420} height={420} fill="#8a6a56" />
                    <path d="M -20 390 L 210 300 L 440 390 Z" fill="#5a4034" />
                    <text x={210} y={440} textAnchor="middle" fontSize={34} fontWeight={700} fill="#f1e2c8" fontFamily={FONT_HEAD}>OLD GYM</text>
                    <rect x={160} y={620} width={100} height={180} fill="#2b1d16" />
                  </g>
                ) : (
                  <g>
                    <rect x={40} y={480} width={320} height={320} fill={cols[i]} />
                    <path d="M 20 490 L 200 360 L 380 490 Z" fill="#6b4a3a" />
                    <rect x={170} y={640} width={70} height={160} fill="#5a3b2b" />
                    {[80, 270].map((wx) => <g key={wx}><rect x={wx} y={540} width={70} height={70} fill={v === 'day' ? '#bfe0ff' : '#ffd98a'} /><rect x={wx + 32} y={540} width={6} height={70} fill="#fff" opacity={0.6} /></g>)}
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* street lamps */}
        {v !== 'day' && [300, 1100, 1800].map((x) => (
          <g key={x} transform={`translate(${x + px * 0.8} 0)`}>
            <rect x={-5} y={420} width={10} height={420} fill="#2b2f3a" />
            <path d="M -5 420 Q 30 400 50 420" stroke="#2b2f3a" strokeWidth={10} fill="none" />
            <circle cx={50} cy={430} r={14} fill="#ffe7a8" />
            <circle cx={50} cy={430} r={120} fill="#ffe7a8" opacity={0.18} filter="url(#glowF)" />
          </g>
        ))}
      </Blur>
      <rect x={0} y={800} width={1920} height={280} fill={v === 'day' ? '#7d8796' : '#2a2e3a'} />
      <rect x={0} y={800} width={1920} height={30} fill={v === 'day' ? '#b9c2cc' : '#4a4f5c'} />
      {[...Array(8)].map((_, i) => <rect key={i} x={((i * 280 + px) % 2240) - 160} y={940} width={140} height={10} rx={5} fill="#f5d66b" opacity={0.7} />)}
    </g>
  );
};

/* fire + smoke layer */
export const Fire: React.FC<{ t: number; x: number; y: number; w?: number; h?: number; k?: number }> = ({ t, x, y, w = 400, h = 300, k = 1 }) => (
  <g transform={`translate(${x} ${y})`} style={{ mixBlendMode: 'screen' }} opacity={k}>
    <ellipse cx={0} cy={-h * 0.3} rx={w} ry={h * 0.8} fill="#ff7a2a" opacity={0.35} filter="url(#glowF)" />
    {[...Array(14)].map((_, i) => {
      const ph = (t * 1.6 + i * 0.37) % 1;
      const fx = ((i * 97) % w) - w / 2 + Math.sin(t * 5 + i) * 10;
      const fh = h * (0.5 + 0.5 * ((i * 53) % 10) / 10) * (1 - ph * 0.3);
      return <path key={i} d={`M ${fx - 34} 0 Q ${fx - 20} ${-fh * 0.6} ${fx + Math.sin(t * 7 + i) * 14} ${-fh} Q ${fx + 22} ${-fh * 0.55} ${fx + 34} 0 Z`} fill={i % 3 ? '#ffb347' : '#ff5e3a'} opacity={0.85 - ph * 0.4} />;
    })}
    {[...Array(8)].map((_, i) => {
      const ph = (t * 0.35 + i * 0.13) % 1;
      return <circle key={'s' + i} cx={((i * 131) % w) - w / 2 + ph * 60} cy={-h - ph * 420} r={60 + ph * 90} fill="#2a2228" opacity={0.5 * (1 - ph)} style={{ mixBlendMode: 'normal' }} />;
    })}
  </g>
);

/* ---------------- DRIVEWAY + CAR ---------------- */
export const Car: React.FC<{ x: number; y: number; lift?: number; rot?: number; col?: string; s?: number }> = ({ x, y, lift = 0, rot = 0, col = '#3a6fd8', s = 1 }) => (
  <g>
    <ellipse cx={x} cy={y + 4} rx={300 * s} ry={18 * s} fill="#000" opacity={0.3 * Math.max(0, 1 - lift / 400)} filter="url(#softShadow)" />
    <g transform={`translate(${x} ${y - lift}) rotate(${rot}) scale(${s})`}>
      <path d="M -290 -40 L -270 -110 Q -250 -130 -200 -134 L -120 -138 L -60 -210 Q -40 -230 0 -230 L 140 -230 Q 180 -228 200 -200 L 250 -138 L 280 -128 Q 300 -120 300 -90 L 300 -40 Z" fill={col} />
      <path d="M -40 -200 L 0 -218 L 120 -218 L 160 -150 L -90 -150 Z" fill="#cfe8ff" />
      <path d="M 50 -218 L 50 -150" stroke={col} strokeWidth={10} />
      <path d="M -290 -40 L 300 -40 L 300 -60 L -290 -60 Z" fill="#000" opacity={0.18} />
      <path d="M -270 -110 L 280 -110" stroke="#fff" strokeOpacity={0.25} strokeWidth={6} />
      {[-180, 190].map((wx) => <g key={wx}><circle cx={wx} cy={-40} r={50} fill="#1c1e24" /><circle cx={wx} cy={-40} r={24} fill="#9aa3b5" /></g>)}
      <rect x={270} y={-112} width={26} height={16} rx={4} fill="#fff3b0" />
    </g>
  </g>
);

export const Driveway: React.FC<P> = ({ t, px = 0, blur }) => (
  <g>
    <Blur on={blur}>
      <rect x={0} y={0} width={1920} height={1080} fill="#bfe0ff" />
      <g transform={`translate(${px * 0.4} 0)`}>
        <rect x={200} y={300} width={1100} height={520} fill="#e8c39e" />
        <path d="M 160 310 L 750 120 L 1340 310 Z" fill="#7a4f3a" />
        <rect x={700} y={480} width={520} height={340} fill="#d9dde3" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={700} y={500 + i * 64} width={520} height={4} fill="#aab2bd" />)}
        <rect x={300} y={430} width={160} height={150} fill="#bfe0ff" stroke="#fff" strokeWidth={10} />
        <g transform="translate(1500 380)"><rect x={-14} y={0} width={28} height={440} fill="#6b4a33" /><circle cx={0} cy={-20} r={150} fill="#5fae6a" /><circle cx={-90} cy={40} r={100} fill="#4f9e5a" /></g>
      </g>
    </Blur>
    <rect x={0} y={820} width={1920} height={260} fill="#9aa0aa" />
    <rect x={0} y={820} width={1920} height={14} fill="#c9ced6" />
    <Rays x={1300} y={-40} ang={30} n={3} t={t} op={0.12} />
  </g>
);

/* ---------------- BEDROOM MIRROR (night) ---------------- */
export const Bedroom: React.FC<P & { crack?: number; lights?: number }> = ({ t, crack = 0, lights = 1 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#252a40" />
    {[...Array(16)].map((_, i) => <rect key={i} x={i * 130} y={0} width={60} height={820} fill="#fff" opacity={0.025} />)}
    <g transform="translate(250 180)">
      <rect x={0} y={0} width={360} height={420} fill="#0d1433" stroke="#3a4060" strokeWidth={14} />
      {[...Array(20)].map((_, i) => <circle key={i} cx={(i * 67) % 340 + 10} cy={(i * 41) % 260 + 10} r={1.5} fill="#fff" opacity={0.6} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 110} y={300} width={90} height={110} fill={lights > 0.5 ? '#ffd98a' : '#141a2e'} opacity={0.8} />)}
    </g>
    <circle cx={1650} cy={300} r={260} fill="#ffcf8a" opacity={0.18 * lights} filter="url(#glowF)" />
    <g transform="translate(1650 250)"><path d="M -60 0 L 60 0 L 40 -70 L -40 -70 Z" fill="#e8c38a" opacity={0.4 + 0.6 * lights} /><rect x={-6} y={0} width={12} height={160} fill="#5a4a3a" /></g>
    {/* mirror */}
    <g transform="translate(1100 520)">
      <rect x={-230} y={-330} width={460} height={660} rx={30} fill="#5a4129" />
      <rect x={-205} y={-305} width={410} height={610} rx={20} fill="#8fa6c4" />
      <rect x={-205} y={-305} width={410} height={610} rx={20} fill="#000" opacity={0.25} />
      <path d="M -150 -260 L -60 -300 M -170 -180 L -20 -260" stroke="#fff" strokeWidth={14} opacity={0.12} strokeLinecap="round" />
      {crack > 0 && (
        <g stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={Math.min(1, crack * 2)}>
          {[0, 50, 110, 170, 230, 290].map((a, i) => {
            const L = 320 * Math.min(1, crack);
            const r = (a * Math.PI) / 180;
            return <path key={i} d={`M 0 -40 L ${Math.cos(r) * L * 0.4} ${-40 + Math.sin(r) * L * 0.4} L ${Math.cos(r + 0.2) * L} ${-40 + Math.sin(r + 0.2) * L}`} />;
          })}
        </g>
      )}
    </g>
    <rect x={0} y={860} width={1920} height={220} fill="#1a1d2c" />
    <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={(1 - lights) * 0.55} />
  </g>
);

/* elephant silhouette for the scale beat */
export const Elephant: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = '#7fb4ff' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={col}>
    <ellipse cx={0} cy={-150} rx={170} ry={110} />
    <circle cx={150} cy={-190} r={80} />
    <path d="M 210 -170 Q 260 -60 230 30 L 205 30 Q 225 -60 185 -140 Z" />
    <path d="M 110 -240 Q 60 -150 120 -110 Q 150 -160 140 -230 Z" opacity={0.7} />
    {[-110, -40, 50, 110].map((lx) => <rect key={lx} x={lx - 25} y={-80} width={50} height={110} rx={14} />)}
  </g>
);
