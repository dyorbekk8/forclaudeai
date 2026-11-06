import React from 'react';
/* Original simple icons for nuclear-incident code words (viewBox 0 0 200 200). */
const D: Record<string, React.ReactNode> = {
  flash: (
    <g>
      <circle cx={100} cy={100} r={34} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M ${100 + Math.cos(a) * 46} ${100 + Math.sin(a) * 46} L ${100 + Math.cos(a + 0.12) * 86} ${100 + Math.sin(a + 0.12) * 86} L ${100 + Math.cos(a - 0.12) * 86} ${100 + Math.sin(a - 0.12) * 86} Z`} />;
      })}
    </g>
  ),
  arrow: (
    <g>
      <path d="M 30 170 L 92 108 L 100 116 L 38 178 Z" />
      <path d="M 108 92 L 150 50 L 158 58 L 116 100 Z" />
      <path d="M 150 30 L 178 22 L 170 50 Z" />
      <path d="M 26 150 L 14 186 L 50 174 Z" opacity={0.6} />
    </g>
  ),
  quiver: (
    <g>
      <path d="M 66 40 L 134 40 L 124 184 L 76 184 Z" fillOpacity={0.25} strokeWidth={5} />
      <rect x={60} y={34} width={80} height={14} rx={4} />
      <path d="M 70 110 L 130 110" strokeWidth={4} />
    </g>
  ),
  spear: (
    <g>
      <path d="M 30 180 L 104 106 L 112 114 L 38 188 Z" />
      <path d="M 108 110 Q 118 80 150 62 L 160 72 Q 140 100 112 116 Z" />
      <path d="M 150 62 L 186 30 L 168 76 Z" />
    </g>
  ),
  reactor: (
    <g>
      <circle cx={100} cy={100} r={14} />
      {[0, 60, 120].map((r) => (
        <ellipse key={r} cx={100} cy={100} rx={78} ry={28} fill="none" strokeWidth={9} transform={`rotate(${r} 100 100)`} />
      ))}
    </g>
  ),
  sword: (
    <g>
      <path d="M 100 14 L 112 40 L 108 140 L 92 140 L 88 40 Z" fillOpacity={0.55} />
      <rect x={62} y={138} width={76} height={12} rx={4} />
      <rect x={93} y={150} width={14} height={30} rx={3} />
      <circle cx={100} cy={186} r={8} />
    </g>
  ),
  bomb: (
    <g>
      <path d="M 70 40 Q 100 10 130 40 L 130 140 L 70 140 Z" />
      <path d="M 70 140 L 50 180 L 150 180 L 130 140 Z" fillOpacity={0.6} />
    </g>
  ),
  plane: (
    <g>
      <path d="M 100 8 Q 108 8 108 30 L 108 170 L 100 190 L 92 170 L 92 30 Q 92 8 100 8 Z" />
      <path d="M 108 70 L 196 120 L 196 132 L 108 108 Z M 92 70 L 4 120 L 4 132 L 92 108 Z" />
      <path d="M 108 160 L 140 176 L 140 184 L 106 176 Z M 92 160 L 60 176 L 60 184 L 94 176 Z" />
    </g>
  ),
  silo: (
    <g>
      <rect x={40} y={150} width={120} height={30} fillOpacity={0.4} />
      <path d="M 100 20 Q 116 40 116 60 L 116 160 L 84 160 L 84 60 Q 84 40 100 20 Z" />
    </g>
  ),
};
export const NIcon: React.FC<{kind: string; size?: number; color?: string}> = ({kind, size = 200, color = '#3E4550'}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.15))'}}>
    <g fill={color} stroke="#16161A" strokeWidth={3} strokeLinejoin="round">
      {D[kind] ?? D.bomb}
    </g>
  </svg>
);
