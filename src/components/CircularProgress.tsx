import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface CircularProgressProps {
  sisa: number;
  kuota: number;
  terpakai: number;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  sisa,
  kuota,
  terpakai,
  size = 140,
}) => {
  const radius = 56;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const percentage = kuota > 0 ? Math.min(100, Math.round((terpakai / kuota) * 100)) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color = sisa <= 2 ? '#dc2626' : sisa <= 5 ? '#d97706' : '#059669';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Gauge */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg height={size} width={size} className="rotate-[-90deg]">
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center label */}
        <div className="absolute text-center">
          <div className="font-bold text-3xl font-mono tabular-nums leading-none" style={{ color }}>
            {sisa}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            hari tersisa
          </div>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Jatah Kuota 2026:</span>
          </div>
          <span className="font-bold font-mono text-slate-900">{kuota} hari</span>
        </div>

        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/60 border border-amber-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-slate-600">Telah Terpakai:</span>
          </div>
          <span className="font-bold font-mono text-slate-900">{terpakai} hari</span>
        </div>

        {/* Usage Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Tingkat pemakaian cuti</span>
            <span className="font-mono tabular-nums font-semibold">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
