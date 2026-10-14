import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  totalLabel?: string;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  totalLabel = 'Total Hari',
  size = 180,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // SVG dimensions
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((seg, i) => {
              if (seg.value === 0) return null;
              const percent = seg.value / total;
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += percent;

              const isHovered = hoveredIdx === i;

              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
        </svg>

        {/* Center Text */}
        <div className="absolute text-center pointer-events-none select-none">
          {hoveredIdx !== null && segments[hoveredIdx] ? (
            <>
              <div className="font-bold text-lg text-slate-900 font-mono tabular-nums leading-none">
                {segments[hoveredIdx].value}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[90px] mt-0.5">
                {segments[hoveredIdx].label}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {total > 0 ? `${Math.round((segments[hoveredIdx].value / total) * 100)}%` : '0%'}
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-xl text-slate-900 font-mono tabular-nums leading-none">
                {total}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">
                {totalLabel}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend List */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs flex-1 min-w-[200px]">
        {segments.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div
              key={seg.label}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredIdx === i ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate text-slate-800">{seg.label}</span>
              </div>
              <span className="font-mono tabular-nums font-medium text-slate-700 ml-2">
                {seg.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
