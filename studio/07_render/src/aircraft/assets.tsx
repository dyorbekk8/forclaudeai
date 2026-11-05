import React from 'react';

/** Top-down aircraft silhouettes, nose up, viewBox 0 0 200 200. Original simplified shapes. */
export type Kind = 'fighter' | 'stealth' | 'wing' | 'cargo' | 'a10' | 'heli' | 'tilt' | 'drone' | 'jumbo' | 'blackbird' | 'u2' | 'trainer' | 'hornet';

const P: Record<Kind, React.ReactNode> = {
  fighter: <path d="M100 4 L106 22 L110 52 L116 62 L116 84 L172 126 L172 138 L116 126 L114 150 L140 174 L138 186 L110 172 L106 182 L94 182 L90 172 L62 186 L60 174 L86 150 L84 126 L28 138 L28 126 L84 84 L84 62 L90 52 L94 22 Z" />,
  stealth: <path d="M100 20 L118 70 L180 150 L150 156 L130 148 L118 168 L100 158 L82 168 L70 148 L50 156 L20 150 L82 70 Z" />,
  wing: <path d="M100 40 L190 130 L170 140 L150 132 L130 146 L115 136 L100 146 L85 136 L70 146 L50 132 L30 140 L10 130 Z" />,
  cargo: (
    <g>
      <path d="M92 10 Q100 2 108 10 L110 170 L134 178 L134 188 L100 184 L66 188 L66 178 L90 170 Z" />
      <path d="M4 70 L196 70 L196 84 L4 84 Z" />
      {[24, 58, 142, 176].map((x) => (
        <rect key={x} x={x - 6} y={56} width={12} height={22} rx={3} />
      ))}
    </g>
  ),
  a10: (
    <g>
      <path d="M96 10 L104 10 L106 150 L100 160 L94 150 Z" />
      <path d="M8 74 L192 74 L192 90 L8 90 Z" />
      <rect x={70} y={112} width={16} height={34} rx={7} />
      <rect x={114} y={112} width={16} height={34} rx={7} />
      <path d="M60 160 L140 160 L140 170 L60 170 Z" />
      <rect x={56} y={150} width={8} height={30} />
      <rect x={136} y={150} width={8} height={30} />
    </g>
  ),
  heli: (
    <g>
      <ellipse cx={100} cy={80} rx={20} ry={40} />
      <rect x={96} y={110} width={8} height={74} />
      <rect x={84} y={178} width={32} height={8} rx={3} />
      <rect x={6} y={77} width={188} height={6} rx={3} transform="rotate(20 100 80)" opacity={0.7} />
      <rect x={6} y={77} width={188} height={6} rx={3} transform="rotate(-70 100 80)" opacity={0.7} />
    </g>
  ),
  tilt: (
    <g>
      <path d="M94 14 Q100 6 106 14 L108 160 L126 172 L126 180 L100 176 L74 180 L74 172 L92 160 Z" />
      <rect x={30} y={84} width={140} height={12} />
      <circle cx={30} cy={90} r={30} fillOpacity={0.35} />
      <circle cx={170} cy={90} r={30} fillOpacity={0.35} />
      <rect x={24} y={76} width={12} height={28} rx={4} />
      <rect x={164} y={76} width={12} height={28} rx={4} />
    </g>
  ),
  drone: (
    <g>
      <path d="M96 30 Q100 20 104 30 L106 150 L100 158 L94 150 Z" />
      <path d="M2 88 L198 84 L198 92 L2 96 Z" />
      <path d="M100 150 L132 176 L128 180 L100 160 L72 180 L68 176 Z" />
      <rect x={96} y={158} width={8} height={16} />
    </g>
  ),
  jumbo: (
    <g>
      <path d="M92 6 Q100 -2 108 6 L110 176 L100 190 L90 176 Z" />
      <path d="M108 70 L196 130 L196 140 L108 110 Z M92 70 L4 130 L4 140 L92 110 Z" />
      <path d="M108 160 L140 176 L140 182 L106 176 Z M92 160 L60 176 L60 182 L94 176 Z" />
      {[40, 66, 134, 160].map((x) => (
        <rect key={x} x={x - 5} y={x < 100 ? 104 - (x - 40) * 0.3 : 104 - (160 - x) * 0.3} width={10} height={20} rx={4} />
      ))}
    </g>
  ),
  blackbird: <path d="M100 2 L104 40 L108 70 L150 120 L160 160 L130 168 L118 186 L100 180 L82 186 L70 168 L40 160 L50 120 L92 70 L96 40 Z" />,
  u2: (
    <g>
      <path d="M96 20 Q100 10 104 20 L106 160 L100 170 L94 160 Z" />
      <path d="M0 80 L200 80 L200 88 L0 88 Z" />
      <path d="M72 160 L128 160 L128 166 L72 166 Z" />
    </g>
  ),
  trainer: (
    <g>
      <path d="M94 20 Q100 10 106 20 L108 160 L100 168 L92 160 Z" />
      <path d="M16 82 L184 82 L184 98 L16 98 Z" />
      <path d="M70 156 L130 156 L130 166 L70 166 Z" />
      <rect x={90} y={8} width={20} height={4} rx={2} />
    </g>
  ),
  hornet: <path d="M100 6 L106 40 L108 72 L118 76 L168 116 L168 128 L112 118 L112 146 L136 166 L136 176 L106 170 L100 186 L94 170 L64 176 L64 166 L88 146 L88 118 L32 128 L32 116 L82 76 L92 72 L94 40 Z" />,
};

export const Plane: React.FC<{kind: Kind; size?: number; color?: string; rotate?: number; style?: React.CSSProperties}> = ({kind, size = 300, color = '#3E4A55', rotate = 0, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.16))', transform: `rotate(${rotate}deg)`, ...style}}>
    <g fill={color} stroke="#16161A" strokeWidth={2.5} strokeLinejoin="round">
      {P[kind]}
    </g>
  </svg>
);

/** The six slots of a Mission-Design-Series name. */
export const SLOTS = ['STATUS', 'MODIFIED MISSION', 'BASIC MISSION', 'VEHICLE TYPE', 'DESIGN NUMBER', 'SERIES'] as const;
export const SHORT = ['STATUS', 'MOD', 'BASIC', 'TYPE', 'NUMBER', 'SERIES'];
export const SLOT_COLORS = ['#7A5BC4', '#E07A1F', '#D7262E', '#2F6FD1', '#16161A', '#2E9E4F'];
