import React from 'react';
import { FormationElement } from '../utils/formationStudioUtils';

const FootVector: React.FC<{ color: string; mirrorX?: boolean; scale?: number }> = ({
  color,
  mirrorX = false,
  scale = 1
}) => {
  const sx = mirrorX ? -scale : scale;
  return (
    <g transform={`scale(${sx}, ${scale})`}>
      <path
        d="M -3.5,11 C -5.5,6 -4.5,0 -5.5,-4.5 C -5.8,-7.5 -2,-9.5 1.8,-8.5 C 5.5,-7.5 6.2,-3.5 4.6,2 C 3.6,6 4.5,10.5 1.2,12.5 C -1.5,13.5 -3,12.5 -3.5,11 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <ellipse cx="4.2" cy="-12.2" rx="2.3" ry="3.1" fill={color} stroke="#ffffff" strokeWidth="0.9" />
      <ellipse cx="0.6" cy="-13" rx="1.6" ry="2.4" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <ellipse cx="-2.3" cy="-12.2" rx="1.4" ry="2.1" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <ellipse cx="-4.8" cy="-10.6" rx="1.25" ry="1.8" fill={color} stroke="#ffffff" strokeWidth="0.8" />
      <ellipse cx="-6.7" cy="-8.4" rx="1.1" ry="1.5" fill={color} stroke="#ffffff" strokeWidth="0.8" />
    </g>
  );
};

const HandVector: React.FC<{ color: string; mirrorX?: boolean; scale?: number }> = ({
  color,
  mirrorX = false,
  scale = 1
}) => {
  const sx = mirrorX ? -scale : scale;
  return (
    <g transform={`scale(${sx}, ${scale})`}>
      <path
        d="M -6,11 C -8,8 -8.5,3 -8.5,-1 L -8.5,-7.5 C -8.5,-9 -6.5,-9 -6.5,-7.5 L -6.5,-1.5 L -5,-1.5 L -5,-10.5 C -5,-12 -2.8,-12 -2.8,-10.5 L -2.8,-2 L -1.2,-2 L -1.2,-12 C -1.2,-13.6 1.1,-13.6 1.1,-12 L 1.1,-2 L 2.7,-2 L 2.7,-10 C 2.7,-11.6 4.9,-11.6 4.9,-10 L 4.9,0.5 L 7.8,-2.8 C 9,-4 10.7,-2.5 9.5,-1.2 L 5.6,4.8 C 4.8,8.5 3.2,11.5 0,12 C -3,12.5 -5,12 -6,11 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </g>
  );
};

export const FormationExtraElementSvg: React.FC<{ el: FormationElement }> = ({ el }) => {
  if (el.type === 'grid_box') {
    const rows = Math.max(1, Math.min(8, el.rows ?? 3));
    const cols = Math.max(1, Math.min(8, el.cols ?? 3));
    const cell = Math.max(12, Math.min(72, el.cellSize ?? 36));
    const mode = el.cellMode || 'empty';
    const totalW = cols * cell;
    const totalH = rows * cell;
    const strokeColor = el.color || '#2563eb';

    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`}>
        <rect
          x={-totalW / 2}
          y={-totalH / 2}
          width={totalW}
          height={totalH}
          rx="4"
          fill={strokeColor}
          fillOpacity="0.06"
          stroke={strokeColor}
          strokeWidth="2.2"
        />
        {Array.from({ length: cols - 1 }, (_, idx) => {
          const lx = -totalW / 2 + (idx + 1) * cell;
          return (
            <line
              key={`v_${idx}`}
              x1={lx}
              y1={-totalH / 2}
              x2={lx}
              y2={totalH / 2}
              stroke={strokeColor}
              strokeWidth="1.6"
            />
          );
        })}
        {Array.from({ length: rows - 1 }, (_, idx) => {
          const ly = -totalH / 2 + (idx + 1) * cell;
          return (
            <line
              key={`h_${idx}`}
              x1={-totalW / 2}
              y1={ly}
              x2={totalW / 2}
              y2={ly}
              stroke={strokeColor}
              strokeWidth="1.6"
            />
          );
        })}
        {mode !== 'empty' &&
          Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cx = -totalW / 2 + c * cell + cell / 2;
              const cy = -totalH / 2 + r * cell + cell / 2;
              const cellIndex = r * cols + c;
              if (mode === 'numbers') {
                return (
                  <text
                    key={`num_${r}_${c}`}
                    x={cx}
                    y={cy + 4.5}
                    fontFamily="sans-serif"
                    fontSize={Math.max(8, Math.round(cell * 0.36))}
                    fontWeight="bold"
                    fill={strokeColor}
                    textAnchor="middle"
                  >
                    {cellIndex + 1}
                  </text>
                );
              }
              const miniScale = Math.max(0.28, (cell / 36) * 0.68);
              return (
                <g key={`hf_${r}_${c}`} transform={`translate(${cx}, ${cy})`}>
                  {cellIndex % 2 === 0 ? (
                    <FootVector color="#2563eb" mirrorX={cellIndex % 4 === 2} scale={miniScale} />
                  ) : (
                    <HandVector color="#ea580c" mirrorX={cellIndex % 4 === 3} scale={miniScale} />
                  )}
                </g>
              );
            })
          )}
        {el.label && (
          <text
            x="0"
            y={-totalH / 2 - 8}
            fontFamily="sans-serif"
            fontSize="11.5"
            fontWeight="bold"
            fill={strokeColor}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'parallel_lines') {
    const count = Math.max(2, Math.min(12, el.lineCount ?? 4));
    const spacing = Math.max(6, Math.min(90, el.lineSpacing ?? 32));
    const length = Math.max(24, Math.min(540, el.lineLength ?? 220));
    const isVert = el.orientation === 'vertical';
    const isDashed = el.lineStyle === 'dashed';
    const strokeColor = el.color || '#0284c7';
    const span = (count - 1) * spacing;
    const hitW = isVert ? span + 20 : length + 12;
    const hitH = isVert ? length + 12 : span + 20;
    const labelY = isVert ? -length / 2 - 9 : -span / 2 - 9;

    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`}>
        {/* Transparent hit area so teacher can easily drag parallel lines */}
        <rect x={-hitW / 2} y={-hitH / 2} width={hitW} height={hitH} fill="transparent" />
        {Array.from({ length: count }, (_, i) => {
          const offset = -span / 2 + i * spacing;
          return isVert ? (
            <line
              key={`pl_${i}`}
              x1={offset}
              y1={-length / 2}
              x2={offset}
              y2={length / 2}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeDasharray={isDashed ? '7,4' : undefined}
              strokeLinecap="round"
            />
          ) : (
            <line
              key={`pl_${i}`}
              x1={-length / 2}
              y1={offset}
              x2={length / 2}
              y2={offset}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeDasharray={isDashed ? '7,4' : undefined}
              strokeLinecap="round"
            />
          );
        })}
        {el.label && (
          <text
            x="0"
            y={labelY}
            fontFamily="sans-serif"
            fontSize="11"
            fontWeight="bold"
            fill={strokeColor}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'foot_left' || el.type === 'foot_right') {
    const s = (el.radius || 16) / 16;
    const col = el.color || '#2563eb';
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <circle cx="0" cy="0" r={16 * s} fill="transparent" />
        <g transform={`scale(1, ${fy})`}>
          <FootVector color={col} mirrorX={el.type === 'foot_right'} scale={s} />
        </g>
        {el.label && (
          <text
            x="0"
            y={Math.round(18 * s + 9)}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'feet_pair') {
    const s = (el.radius || 15) / 16;
    const col = el.color || '#2563eb';
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <rect x={-18 * s} y={-16 * s} width={36 * s} height={32 * s} fill="transparent" />
        <g transform={`scale(1, ${fy})`}>
          <g transform={`translate(${-9 * s}, 0)`}>
            <FootVector color={col} mirrorX={false} scale={s * 0.88} />
          </g>
          <g transform={`translate(${9 * s}, 0)`}>
            <FootVector color={col} mirrorX={true} scale={s * 0.88} />
          </g>
        </g>
        {el.label && (
          <text
            x="0"
            y={Math.round(18 * s + 9)}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'hand_left' || el.type === 'hand_right') {
    const s = (el.radius || 16) / 16;
    const col = el.color || '#ea580c';
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <circle cx="0" cy="0" r={16 * s} fill="transparent" />
        <g transform={`scale(1, ${fy})`}>
          <HandVector color={col} mirrorX={el.type === 'hand_right'} scale={s} />
        </g>
        {el.label && (
          <text
            x="0"
            y={Math.round(18 * s + 9)}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'hands_pair') {
    const s = (el.radius || 15) / 16;
    const col = el.color || '#ea580c';
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <rect x={-22 * s} y={-16 * s} width={44 * s} height={32 * s} fill="transparent" />
        <g transform={`scale(1, ${fy})`}>
          <g transform={`translate(${-11 * s}, 0)`}>
            <HandVector color={col} mirrorX={false} scale={s * 0.85} />
          </g>
          <g transform={`translate(${11 * s}, 0)`}>
            <HandVector color={col} mirrorX={true} scale={s * 0.85} />
          </g>
        </g>
        {el.label && (
          <text
            x="0"
            y={Math.round(18 * s + 9)}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'mat') {
    const w = el.width || 76;
    const h = el.height || 42;
    const col = el.color || '#0284c7';
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx="6"
          fill={col}
          fillOpacity="0.22"
          stroke={col}
          strokeWidth="2.2"
        />
        <line x1={-w / 6} y1={-h / 2 + 2} x2={-w / 6} y2={h / 2 - 2} stroke={col} strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1={w / 6} y1={-h / 2 + 2} x2={w / 6} y2={h / 2 - 2} stroke={col} strokeWidth="1.2" strokeOpacity="0.6" />
        {el.label && (
          <text x="0" y="4" fontFamily="sans-serif" fontSize="10.5" fontWeight="bold" fill={col} textAnchor="middle">
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'hurdle') {
    const w = el.width || 52;
    const h = el.height || 18;
    const col = el.color || '#dc2626';
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} fill="transparent" />
        <rect x={-w / 2} y={-h / 2} width="6" height={h} rx="2" fill="#334155" />
        <rect x={w / 2 - 6} y={-h / 2} width="6" height={h} rx="2" fill="#334155" />
        <rect x={-w / 2 + 2} y="-4" width={w - 4} height="8" rx="2" fill={col} stroke="#ffffff" strokeWidth="1" />
        <line x1={-w / 4} y1="-4" x2={-w / 4 + 4} y2="4" stroke="#ffffff" strokeWidth="2.5" />
        <line x1="0" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="2.5" />
        <line x1={w / 4 - 4} y1="-4" x2={w / 4} y2="4" stroke="#ffffff" strokeWidth="2.5" />
        {el.label && (
          <text
            x="0"
            y={h / 2 + 13}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'goal_gate') {
    const w = el.width || 64;
    const h = el.height || 28;
    const col = el.color || '#16a34a';
    const fx = el.flipX ? -1 : 1;
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <g transform={`scale(${fx}, ${fy})`}>
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx="3"
            fill={col}
            fillOpacity="0.1"
            stroke={col}
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />
          <path
            d={`M ${-w / 2},${h / 2} L ${-w / 2},${-h / 2} L ${w / 2},${-h / 2} L ${w / 2},${h / 2}`}
            fill="none"
            stroke={col}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {el.label && (
          <text
            x="0"
            y={h / 2 + 13}
            fontFamily="sans-serif"
            fontSize="10.5"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'zigzag_path') {
    const w = el.width || 160;
    const h = el.height || 40;
    const col = el.color || '#16a34a';
    const fx = el.flipX ? -1 : 1;
    const fy = el.flipY ? -1 : 1;
    const x0 = -w / 2;
    const seg = w / 4;
    const pts = `${x0},0 ${x0 + seg * 0.7},${-h / 2} ${x0 + seg * 1.8},${h / 2} ${x0 + seg * 2.9},${-h / 2} ${w / 2},0`;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`}>
        <rect x={-w / 2 - 4} y={-h / 2 - 6} width={w + 8} height={h + 12} fill="transparent" />
        <g transform={`scale(${fx}, ${fy})`}>
          <polyline
            points={pts}
            fill="none"
            stroke={col}
            strokeWidth="2.6"
            strokeDasharray="5,3"
            strokeLinejoin="round"
            markerEnd="url(#arrowMarkerStudio)"
          />
        </g>
        {el.label && (
          <text
            x="0"
            y={-h / 2 - 7}
            fontFamily="sans-serif"
            fontSize="10.5"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'jump_arc') {
    const w = el.width || 90;
    const h = el.height || 34;
    const col = el.color || '#ea580c';
    const fx = el.flipX ? -1 : 1;
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`}>
        <rect x={-w / 2 - 4} y={-h / 2 - 6} width={w + 8} height={h + 12} fill="transparent" />
        <g transform={`scale(${fx}, ${fy})`}>
          <path
            d={`M ${-w / 2},${h / 3} Q ${-w / 4},${-h} 0,${h / 3} Q ${w / 4},${-h} ${w / 2},${h / 3}`}
            fill="none"
            stroke={col}
            strokeWidth="2.5"
            strokeDasharray="5,3"
            markerEnd="url(#arrowMarkerOrangeStudio)"
          />
        </g>
        {el.label && (
          <text
            x="0"
            y={-h / 2 - 4}
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'star_target') {
    const r = el.radius || 16;
    const rInner = r * 0.45;
    const col = el.color || '#eab308';
    const starPts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : rInner;
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      starPts.push(`${(Math.cos(ang) * rad).toFixed(1)},${(Math.sin(ang) * rad).toFixed(1)}`);
    }
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <polygon points={starPts.join(' ')} fill={col} stroke="#ffffff" strokeWidth="1.6" />
        {el.label && (
          <text
            x="0"
            y={r + 13}
            fontFamily="sans-serif"
            fontSize="10.5"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'mini_square') {
    const r = el.radius || 15;
    const col = el.color || '#2563eb';
    const fx = el.flipX ? -1 : 1;
    const fy = el.flipY ? -1 : 1;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <g transform={`scale(${fx}, ${fy})`}>
          <rect
            x={-r}
            y={-r}
            width={r * 2}
            height={r * 2}
            rx="3.5"
            fill={col}
            fillOpacity="0.14"
            stroke={col}
            strokeWidth="3.2"
          />
        </g>
        {el.label && (
          <text
            x="0"
            y="4"
            fontFamily="sans-serif"
            fontSize="10.5"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  if (el.type === 'mini_triangle') {
    const r = el.radius || 16;
    const col = el.color || '#ea580c';
    const fx = el.flipX ? -1 : 1;
    const fy = el.flipY ? -1 : 1;
    const h = r * 1.1;
    const w = r * 1.15;
    const pts = `0,${(-h).toFixed(1)} ${w.toFixed(1)},${(h * 0.82).toFixed(1)} ${(-w).toFixed(1)},${(h * 0.82).toFixed(1)}`;
    return (
      <g transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`} filter="url(#shadowStudio)">
        <g transform={`scale(${fx}, ${fy})`}>
          <polygon
            points={pts}
            fill={col}
            fillOpacity="0.14"
            stroke={col}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>
        {el.label && (
          <text
            x="0"
            y="5"
            fontFamily="sans-serif"
            fontSize="10"
            fontWeight="bold"
            fill={col}
            textAnchor="middle"
          >
            {el.label}
          </text>
        )}
      </g>
    );
  }

  return null;
};
