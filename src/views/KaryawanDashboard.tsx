import React, { useState, useMemo } from 'react';
import {
  Employee,
  Period,
  AttendanceDaily,
  LeaveRecord,
  LeaveBalance,
  LeaveApplication,
} from '../types/attendance';
import { calculateSummary, reconcileRecord } from '../services/reconciliationService';
import { TabelAbsensi } from '../components/TabelAbsensi';
import { PeriodeFilter } from '../components/PeriodeFilter';
import { PrintReportView } from '../components/PrintReportView';
import { DonutChart, DonutSegment } from '../components/DonutChart';
import { CircularProgress } from '../components/CircularProgress';
import {
  Printer,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  CalendarCheck,
  PieChart,
  FileText,
  Plus,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { PengajuanModal } from '../components/PengajuanModal';
import { GOOGLE_FORM_LINKS } from '../data/formLinks';

interface KaryawanDashboardProps {
  employee: Employee;
  periods: Period[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
  attendanceData: AttendanceDaily[];
  leavesData: LeaveRecord[];
  balancesData: LeaveBalance[];
  supervisorName?: string;
  onOpenShiftInfo: () => void;
  applications: LeaveApplication[];
  onRefreshData: () => void;
}

export const KaryawanDashboard: React.FC<KaryawanDashboardProps> = ({
  employee,
  periods,
  selectedPeriodId,
  onSelectPeriod,
  attendanceData,
  leavesData,
  balancesData,
  supervisorName,
  onOpenShiftInfo,
  applications,
  onRefreshData,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  // Reconciled attendance records for this employee and period
  const reconciledRecords = useMemo(() => {
    const raw = attendanceData.filter(
      (a) => a.nik === employee.nik && a.periode_id === selectedPeriodId
    );
    raw.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return raw.map((r) => reconcileRecord(r, leavesData));
  }, [attendanceData, employee.nik, selectedPeriodId, leavesData]);

  // Monthly summary
  const summary = useMemo(() => {
    return calculateSummary(
      employee.nik,
      selectedPeriodId,
      attendanceData,
      leavesData,
      balancesData,
      2026
    );
  }, [employee.nik, selectedPeriodId, attendanceData, leavesData, balancesData]);

  // My leave history
  const myLeaves = useMemo(() => {
    return leavesData.filter((l) => l.nik === employee.nik);
  }, [leavesData, employee.nik]);

  // Donut chart segments
  const donutSegments: DonutSegment[] = useMemo(() => {
    return [
      { label: 'Tepat Waktu', value: summary.total_hadir, color: '#059669' },
      { label: 'Telat Toleransi (≤5m)', value: summary.total_telat_toleransi, color: '#d97706' },
      { label: 'Telat Pelanggaran (>5m)', value: summary.total_telat_diatas_toleransi, color: '#dc2626' },
      { label: 'Izin / Cuti / Sakit', value: summary.total_izin_cuti_sakit, color: '#1e40af' },
      { label: 'Alfa', value: summary.total_alfa, color: '#ef4444' },
      { label: 'Tanpa Absen Pulang', value: summary.total_tidak_absen_pulang, color: '#8b5cf6' },
    ];
  }, [summary]);

  // Avatar initials
  const initials = employee.nama
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Hidden print report view */}
      <PrintReportView
        employee={employee}
        period={currentPeriod}
        records={reconciledRecords}
        summary={summary}
        supervisorName={supervisorName}
      />

      <div className="no-print space-y-6">
        {/* Welcome Banner */}
        <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-emerald-600 to-blue-500" />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  Status: {employee.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Selamat Datang, {employee.nama}!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Laporan kehadiran siklus <strong className="text-slate-800">{currentPeriod.label}</strong> berbasis rekapitulasi data mesin absen.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <PeriodeFilter
                periods={periods}
                selectedPeriodId={selectedPeriodId}
                onSelectPeriod={onSelectPeriod}
              />

              <button
                onClick={() => setShowApplyModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Izin/Cuti</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                title="Cetak atau unduh sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card & Donut Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Profile Information */}
            <div className="lg:col-span-5 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-700/20 shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {employee.nama}
                  </h2>
                  <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                    {employee.nik}
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Shift {employee.grup_shift ? `Grup ${employee.grup_shift}` : 'Belum Ada'}
                  </span>
                  <span>·</span>
                  <span>Atasan: <strong className="text-slate-700">{supervisorName || '—'}</strong></span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {reconciledRecords.length} hari kerja tercatat dalam siklus ini
                </p>
              </div>
            </div>

            {/* Right: Interactive Donut Chart */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <PieChart className="w-4 h-4 text-blue-700" />
                <span>Distribusi Status Kehadiran</span>
              </div>
              <DonutChart segments={donutSegments} totalLabel="Hari Aktif" size={170} />
            </div>
          </div>
        </div>

        {/* KPI Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Hari Tercatat */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r" />
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Hari Tercatat</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {summary.total_hari_kerja}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total log absensi terdata</p>
          </div>

          {/* Card 2: Tepat Waktu */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r" />
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Tepat Waktu</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {summary.total_hadir}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              {summary.total_hari_kerja > 0
                ? `${Math.round((summary.total_hadir / summary.total_hari_kerja) * 100)}% dari total hari`
                : '0%'}
            </p>
          </div>

          {/* Card 3: Keterlambatan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600 rounded-r" />
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Terlambat</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {summary.total_menit_telat} <span className="text-xs font-normal text-slate-500">mnt</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              <strong className="text-amber-800">{summary.total_telat_diatas_toleransi}x</strong> &gt;5m · {summary.total_telat_toleransi}x toleransi
            </p>
          </div>

          {/* Card 4: Izin / Cuti / Sakit */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r" />
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Izin / Cuti / Sakit</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {summary.total_izin_cuti_sakit} <span className="text-xs font-normal text-slate-500">hari</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Alfa: <strong className={summary.total_alfa > 0 ? 'text-rose-600' : 'text-slate-600'}>{summary.total_alfa} hari</strong>
            </p>
          </div>
        </div>

        {/* 6-Metric Status Breakdown Strip */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Ringkasan Status Kehadiran Siklus 26–25
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                {summary.total_hadir}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Tepat Waktu</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {summary.total_telat_toleransi}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Telat Toleransi (≤5m)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
                {summary.total_telat_diatas_toleransi}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Telat Pelanggaran (&gt;5m)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-purple-700 tabular-nums">
                {summary.total_tidak_absen_pulang}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Tanpa Absen Pulang</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                {summary.total_izin_cuti_sakit}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Izin / Cuti / Sakit</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
                {summary.total_alfa}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-1">Alfa (Tanpa Berita)</div>
            </div>
          </div>
        </div>

        {/* Leave Quota Visual Gauge & History */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-700" />
              <span>Sisa Cuti Tahunan (Kalender Jan–Des 2026)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Sesuai PRD: Kuota 12 hari/tahun
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <CircularProgress
              sisa={summary.sisa_cuti}
              kuota={summary.kuota_cuti}
              terpakai={summary.kuota_cuti - summary.sisa_cuti}
              size={150}
            />

            {/* Leave History List */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Riwayat Pengambilan Cuti/Izin ({myLeaves.length} hari)
              </h4>
              {myLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Belum ada penggunaan cuti terdata tahun ini.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {myLeaves.map((l) => (
                    <div key={l.id} className="py-1.5 flex items-center justify-between">
                      <span className="font-mono text-slate-800 font-medium">{l.tanggal}</span>
                      <span className="text-slate-600 truncate max-w-[180px]">{l.keterangan}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portal Formulir Pengajuan (Google Form Resmi) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Layanan Pengajuan Mandiri (Google Form Resmi)</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih formulir sesuai keperluan Anda. Pengajuan resmi langsung diproses dan disinkronkan ke rekap HR.
              </p>
            </div>

            <button
              onClick={() => setShowApplyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Menu Pengajuan Lengkap</span>
            </button>
          </div>

          {/* 3 Interactive Google Form Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {GOOGLE_FORM_LINKS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.color === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {item.shortTitle.split('.')[0]}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/70">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-xs"
                  >
                    <span>Isi Formulir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Absensi 26–25 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Rincian Absensi Harian Mesin ({currentPeriod.label})</span>
            </h2>
            <span className="text-xs text-slate-500">
              {reconciledRecords.length} hari tercatat
            </span>
          </div>

          <TabelAbsensi records={reconciledRecords} />
        </div>
      </div>

      {/* Modal Pengajuan Google Form Resmi */}
      <PengajuanModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        employee={employee}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};
