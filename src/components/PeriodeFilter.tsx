import React from 'react';
import { Period } from '../types/attendance';
import { Calendar } from 'lucide-react';

interface PeriodeFilterProps {
  periods: Period[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
}

export const PeriodeFilter: React.FC<PeriodeFilterProps> = ({
  periods,
  selectedPeriodId,
  onSelectPeriod,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
          <Calendar className="w-4 h-4" />
        </div>
        <select
          value={selectedPeriodId}
          onChange={(e) => onSelectPeriod(e.target.value)}
          className="bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-lg pl-8 pr-8 py-2 font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 appearance-none cursor-pointer"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              Periode {p.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
