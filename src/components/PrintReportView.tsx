import React from 'react';
import { Employee, Period, ReconciledAttendanceRecord, AttendanceSummary } from '../types/attendance';

interface PrintReportViewProps {
  employee: Employee;
  period: Period;
  records: ReconciledAttendanceRecord[];
  summary: AttendanceSummary;
  supervisorName?: string;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  employee,
  period,
  records,
  summary,
  supervisorName,
}) => {
  return (
    <div className="print-only hidden p-8 text-black bg-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              Laporan Rekapitulasi Absensi & Cuti
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Periode Siklus: <strong className="font-semibold text-slate-900">{period.label}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Employee Info Block */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 border border-slate-200 rounded">
        <div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-24 text-slate-500 py-0.5">Nama:</td>
                <td className="font-semibold text-slate-900 py-0.5">{employee.nama}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">NIK:</td>
                <td className="font-mono text-slate-800 py-0.5">{employee.nik}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Status:</td>
                <td className="capitalize text-slate-800 py-0.5">{employee.status.replace('_', ' ')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-28 text-slate-500 py-0.5">Grup Shift:</td>
                <td className="font-medium text-slate-800 py-0.5">
                  {employee.grup_shift ? `Grup ${employee.grup_shift}` : 'Belum Dikonfirmasi'}
                </td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Atasan:</td>
                <td className="text-slate-800 py-0.5">{supervisorName || '—'}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Role Sistem:</td>
                <td className="capitalize text-slate-800 py-0.5">{employee.role}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-4 gap-2 mb-6 border border-slate-300 text-center text-xs divide-x divide-slate-300 py-2 bg-white">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Hadir</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {summary.total_hadir} <span className="text-[10px] font-normal text-slate-500">hari</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Keterlambatan</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {summary.total_menit_telat} <span className="text-[10px] font-normal text-slate-500">mnt ({summary.total_telat_diatas_toleransi}x)</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Izin / Cuti / Sakit</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {summary.total_izin_cuti_sakit} <span className="text-[10px] font-normal text-slate-500">hari</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Cuti 2026</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {summary.sisa_cuti} <span className="text-[10px] font-normal text-slate-500">/ {summary.kuota_cuti} hari</span>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <table className="w-full text-left text-[11px] border-collapse border border-slate-300 mb-8">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
            <th className="border border-slate-300 px-2 py-1.5 w-24">Tanggal</th>
            <th className="border border-slate-300 px-2 py-1.5 w-16">Hari</th>
            <th className="border border-slate-300 px-2 py-1.5 text-right w-16">Masuk</th>
            <th className="border border-slate-300 px-2 py-1.5 text-right w-16">Pulang</th>
            <th className="border border-slate-300 px-2 py-1.5">Shift</th>
            <th className="border border-slate-300 px-2 py-1.5 text-right w-16">Telat</th>
            <th className="border border-slate-300 px-2 py-1.5">Status Akhir</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id || `${r.nik}-${r.tanggal}`} className="border-b border-slate-200">
              <td className="border border-slate-300 px-2 py-1 font-mono">{r.tanggal}</td>
              <td className="border border-slate-300 px-2 py-1">{r.hari}</td>
              <td className="border border-slate-300 px-2 py-1 text-right font-mono">{r.jam_masuk || '—'}</td>
              <td className="border border-slate-300 px-2 py-1 text-right font-mono">{r.jam_pulang || '—'}</td>
              <td className="border border-slate-300 px-2 py-1">{r.shift_terdeteksi || 'Reguler'}</td>
              <td className="border border-slate-300 px-2 py-1 text-right font-mono">
                {r.menit_telat > 0 ? `${r.menit_telat} m` : '0'}
              </td>
              <td className="border border-slate-300 px-2 py-1 font-medium">
                {r.status_final}
                {r.leave_keterangan ? ` (${r.leave_keterangan})` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 text-xs pt-4 print-break-inside-avoid">
        <div className="text-center">
          <p className="text-slate-500 mb-16">Karyawan Yang Bersangkutan,</p>
          <p className="font-bold underline text-slate-900">{employee.nama}</p>
          <p className="text-[10px] text-slate-500">NIK: {employee.nik}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 mb-16">Atasan Langsung / HR Departemen,</p>
          <p className="font-bold underline text-slate-900">{supervisorName || 'HR Management'}</p>
          <p className="text-[10px] text-slate-500">Verifikasi Resmi Sistem</p>
        </div>
      </div>
    </div>
  );
};
