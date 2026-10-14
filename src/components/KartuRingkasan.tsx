import React from 'react';
import { AttendanceSummary } from '../types/attendance';
import { CalendarCheck, Clock, UserCheck, AlertCircle } from 'lucide-react';

interface KartuRingkasanProps {
  summary: AttendanceSummary;
  employeeName?: string;
}

export const KartuRingkasan: React.FC<KartuRingkasanProps> = ({ summary, employeeName }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Sisa Cuti */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 transition-shadow hover:border-slate-300">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">Sisa Cuti Tahunan</span>
          <CalendarCheck className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.sisa_cuti}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            dari {summary.kuota_cuti} hari
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Kuota kalender Jan–Des 2026
        </div>
      </div>

      {/* Keterlambatan */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 transition-shadow hover:border-slate-300">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">Keterlambatan</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.total_menit_telat}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            menit
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-amber-700 font-mono tabular-nums font-medium">
            {summary.total_telat_diatas_toleransi} hari &gt;5 mnt
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-mono tabular-nums">
            {summary.total_telat_toleransi} toleransi (≤5 mnt)
          </span>
        </div>
      </div>

      {/* Izin / Cuti / Sakit */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 transition-shadow hover:border-slate-300">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">Izin / Cuti / Sakit</span>
          <AlertCircle className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.total_izin_cuti_sakit}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            hari
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Terdata melalui input resmi HR
        </div>
      </div>

      {/* Total Hadir */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 transition-shadow hover:border-slate-300">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">Kehadiran</span>
          <UserCheck className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {summary.total_hadir}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            dari {summary.total_hari_kerja} hari kerja
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          <span className={summary.total_alfa > 0 ? 'text-red-600 font-medium font-mono tabular-nums' : 'text-slate-400'}>
            Alfa: {summary.total_alfa} hari
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">
            {summary.total_hari_kerja > 0
              ? `${Math.round(((summary.total_hadir) / summary.total_hari_kerja) * 100)}% kehadiran`
              : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
