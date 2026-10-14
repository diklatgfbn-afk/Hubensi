import React, { useState, useMemo } from 'react';
import { ReconciledAttendanceRecord } from '../types/attendance';
import { Search, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TabelAbsensiProps {
  records: ReconciledAttendanceRecord[];
  onEditRecord?: (record: ReconciledAttendanceRecord) => void;
  canEdit?: boolean;
}

export const TabelAbsensi: React.FC<TabelAbsensiProps> = ({
  records,
  onEditRecord,
  canEdit = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Status filter
      if (statusFilter === 'hadir' && !r.status_final.includes('Hadir')) return false;
      if (statusFilter === 'telat' && !r.status_final.startsWith('Telat')) return false;
      if (statusFilter === 'izin' && r.status_final !== 'Izin / Cuti / Sakit') return false;
      if (statusFilter === 'alfa' && r.status_final !== 'Alfa') return false;
      if (statusFilter === 'absen-tidak-lengkap' && 
          !r.status_final.includes('Tidak Ada Absen')) return false;

      // Search query filter (matches date, day, shift, or note)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTgl = r.tanggal.toLowerCase().includes(q);
        const matchHari = r.hari.toLowerCase().includes(q);
        const matchShift = (r.shift_terdeteksi || '').toLowerCase().includes(q);
        const matchStatus = r.status_final.toLowerCase().includes(q);
        const matchKet = (r.leave_keterangan || '').toLowerCase().includes(q);
        if (!matchTgl && !matchHari && !matchShift && !matchStatus && !matchKet) {
          return false;
        }
      }

      return true;
    });
  }, [records, statusFilter, searchQuery]);

  // Status visual styling helper: clean text with subtle dot/badge tag
  const getStatusBadge = (status: string, isLeave: boolean, leaveKet?: string) => {
    if (isLeave || status === 'Izin / Cuti / Sakit') {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            Izin / Cuti / Sakit
          </span>
          {leaveKet && (
            <span className="text-[11px] text-slate-500 italic mt-0.5 max-w-[200px] truncate" title={leaveKet}>
              {leaveKet}
            </span>
          )}
        </div>
      );
    }

    if (status === 'Alfa') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          Alfa (Tanpa Keterangan)
        </span>
      );
    }

    if (status.includes('(toleransi)')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          {status}
        </span>
      );
    }

    if (status.startsWith('Telat')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
          {status}
        </span>
      );
    }

    if (status.includes('Tidak Ada Absen Masuk')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
          Tidak Ada Absen Masuk
        </span>
      );
    }

    if (status.includes('Tidak Ada Absen Pulang')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          Tidak Ada Absen Pulang
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        Hadir Tepat Waktu
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="no-print p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('hadir')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'hadir'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hadir
          </button>
          <button
            onClick={() => setStatusFilter('telat')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'telat'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Telat
          </button>
          <button
            onClick={() => setStatusFilter('izin')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'izin'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Izin/Cuti
          </button>
          <button
            onClick={() => setStatusFilter('alfa')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'alfa'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Alfa
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tanggal atau status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Tanggal</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Hari</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Jam Masuk</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Jam Pulang</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Shift Terdeteksi</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-right">Menit Telat</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Status Final</th>
              {canEdit && (
                <th scope="col" className="no-print px-4 py-3 text-right whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada data absensi untuk filter yang dipilih.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const isLateOverTolerance = r.menit_telat > 5;
                const isLateTolerance = r.menit_telat > 0 && r.menit_telat <= 5;

                return (
                  <tr
                    key={r.id || `${r.nik}-${r.tanggal}`}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      r.status_final === 'Alfa' ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Tanggal */}
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-900 font-medium whitespace-nowrap">
                      {r.tanggal}
                    </td>

                    {/* Hari */}
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                      {r.hari}
                    </td>

                    {/* Jam Masuk */}
                    <td className="px-4 py-2.5 font-mono tabular-nums text-right text-slate-800 whitespace-nowrap">
                      {r.jam_masuk ? (
                        <span className={isLateOverTolerance ? 'text-amber-700 font-semibold' : ''}>
                          {r.jam_masuk}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Jam Pulang */}
                    <td className="px-4 py-2.5 font-mono tabular-nums text-right text-slate-800 whitespace-nowrap">
                      {r.jam_pulang ? (
                        <span>{r.jam_pulang}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Shift */}
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {r.shift_terdeteksi || 'Reguler'}
                      </span>
                    </td>

                    {/* Menit Telat */}
                    <td className="px-4 py-2.5 font-mono tabular-nums text-right whitespace-nowrap">
                      {r.menit_telat > 0 ? (
                        <span
                          className={`font-medium ${
                            isLateOverTolerance
                              ? 'text-amber-700 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          +{r.menit_telat} mnt
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    {/* Status Final */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {getStatusBadge(r.status_final, r.is_leave, r.leave_keterangan)}
                    </td>

                    {/* Aksi edit (HR only) */}
                    {canEdit && (
                      <td className="no-print px-4 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onEditRecord?.(r)}
                          className="text-xs text-slate-500 hover:text-slate-900 font-medium hover:underline"
                        >
                          Koreksi
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <span>Menampilkan {filteredRecords.length} dari {records.length} hari dalam periode</span>
        <span className="text-slate-400">Aturan toleransi: ≤5 menit tanpa pinalti</span>
      </div>
    </div>
  );
};
