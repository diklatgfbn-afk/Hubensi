import React, { useState, useMemo } from 'react';
import {
  Employee,
  Period,
  AttendanceDaily,
  LeaveRecord,
  LeaveBalance,
} from '../types/attendance';
import { calculateSummary, reconcileRecord } from '../services/reconciliationService';
import { TabelAbsensi } from '../components/TabelAbsensi';
import { KartuRingkasan } from '../components/KartuRingkasan';
import { PeriodeFilter } from '../components/PeriodeFilter';
import { PrintReportView } from '../components/PrintReportView';
import {
  Users,
  Printer,
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';

interface SupervisorDashboardProps {
  currentSupervisor: Employee;
  allEmployees: Employee[];
  periods: Period[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
  attendanceData: AttendanceDaily[];
  leavesData: LeaveRecord[];
  balancesData: LeaveBalance[];
  onOpenShiftInfo: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  currentSupervisor,
  allEmployees,
  periods,
  selectedPeriodId,
  onSelectPeriod,
  attendanceData,
  leavesData,
  balancesData,
  onOpenShiftInfo,
}) => {
  const [selectedMemberNik, setSelectedMemberNik] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  // Team members where atasan_nik === currentSupervisor.nik
  const teamMembers = useMemo(() => {
    const direct = allEmployees.filter((e) => e.atasan_nik === currentSupervisor.nik);
    if (direct.length > 0) return direct;
    if (currentSupervisor.role === 'hr') {
      return allEmployees.filter((e) => e.nik !== currentSupervisor.nik);
    }
    return allEmployees.filter((e) => e.atasan_nik === 'NIK001'); // WAKIT's team
  }, [allEmployees, currentSupervisor]);

  // Compute summary for each team member
  const teamStats = useMemo(() => {
    return teamMembers.map((member) => {
      const summary = calculateSummary(
        member.nik,
        selectedPeriodId,
        attendanceData,
        leavesData,
        balancesData,
        2026
      );
      const attendanceRate = summary.total_hari_kerja > 0
        ? Math.round((summary.total_hadir / summary.total_hari_kerja) * 100)
        : 0;

      return {
        member,
        summary,
        attendanceRate,
      };
    });
  }, [teamMembers, selectedPeriodId, attendanceData, leavesData, balancesData]);

  // Active inspected member
  const activeMember = useMemo(() => {
    if (!selectedMemberNik) return null;
    return allEmployees.find((e) => e.nik === selectedMemberNik) || null;
  }, [selectedMemberNik, allEmployees]);

  const activeMemberRecords = useMemo(() => {
    if (!activeMember) return [];
    const raw = attendanceData.filter(
      (a) => a.nik === activeMember.nik && a.periode_id === selectedPeriodId
    );
    raw.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return raw.map((r) => reconcileRecord(r, leavesData));
  }, [activeMember, attendanceData, selectedPeriodId, leavesData]);

  const activeMemberSummary = useMemo(() => {
    if (!activeMember) return null;
    return calculateSummary(
      activeMember.nik,
      selectedPeriodId,
      attendanceData,
      leavesData,
      balancesData,
      2026
    );
  }, [activeMember, selectedPeriodId, attendanceData, leavesData, balancesData]);

  // Aggregate metrics
  const teamAggregate = useMemo(() => {
    let totalHadir = 0;
    let totalMenitTelat = 0;
    let totalIzin = 0;
    let totalHariKerja = 0;

    teamStats.forEach((t) => {
      totalHadir += t.summary.total_hadir;
      totalMenitTelat += t.summary.total_menit_telat;
      totalIzin += t.summary.total_izin_cuti_sakit;
      totalHariKerja += t.summary.total_hari_kerja;
    });

    const avgAttendance = totalHariKerja > 0 ? Math.round((totalHadir / totalHariKerja) * 100) : 0;

    return {
      memberCount: teamStats.length,
      avgAttendance,
      totalMenitTelat,
      totalIzin,
    };
  }, [teamStats]);

  const filteredTeamStats = useMemo(() => {
    if (!searchQuery.trim()) return teamStats;
    const q = searchQuery.toLowerCase();
    return teamStats.filter(
      (t) =>
        t.member.nama.toLowerCase().includes(q) ||
        t.member.nik.toLowerCase().includes(q) ||
        (t.member.grup_shift && t.member.grup_shift.toLowerCase().includes(q))
    );
  }, [teamStats, searchQuery]);

  return (
    <div>
      {/* Hidden print view */}
      {activeMember && activeMemberSummary && (
        <PrintReportView
          employee={activeMember}
          period={currentPeriod}
          records={activeMemberRecords}
          summary={activeMemberSummary}
          supervisorName={currentSupervisor.nama}
        />
      )}

      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Supervisi Tim Langsung
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{teamMembers.length} Personel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Dashboard Supervisor — Rekap Tim
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring absensi harian dan perizinan anggota tim di bawah arahan ({currentSupervisor.nama})
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <PeriodeFilter
              periods={periods}
              selectedPeriodId={selectedPeriodId}
              onSelectPeriod={onSelectPeriod}
            />

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Rekap Tim</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r" />
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Anggota Tim
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {teamAggregate.memberCount} <span className="text-xs font-normal text-slate-500">orang</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Di bawah NIK: {currentSupervisor.nik}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r" />
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Kehadiran Tim
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 tabular-nums">
              {teamAggregate.avgAttendance}%
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">Rata-rata siklus 26–25</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600 rounded-r" />
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Total Menit Telat
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {teamAggregate.totalMenitTelat} <span className="text-xs font-normal text-slate-500">mnt</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh anggota</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 relative overflow-hidden shadow-xs">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r" />
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Izin / Cuti / Sakit
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {teamAggregate.totalIzin} <span className="text-xs font-normal text-slate-500">hari</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tercatat resmi dalam sistem</p>
          </div>
        </div>

        {/* Member Drill-down View */}
        {activeMember && activeMemberSummary ? (
          <div className="space-y-4 bg-slate-50 p-4 sm:p-6 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedMemberNik(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Ringkasan Tim</span>
              </button>
              <div className="text-xs text-slate-500">
                Mode Tinjauan Read-Only: <strong className="text-slate-900">{activeMember.nama}</strong>
              </div>
            </div>

            <KartuRingkasan summary={activeMemberSummary} employeeName={activeMember.nama} />

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Detail Absensi 26–25: {activeMember.nama} ({activeMember.nik})
                </h3>
                <span className="text-xs text-slate-500">Shift: Grup {activeMember.grup_shift || '—'}</span>
              </div>
              <TabelAbsensi records={activeMemberRecords} />
            </div>
          </div>
        ) : (
          /* Team Table */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Daftar Rekapitulasi Anggota Tim
                </h2>
                <p className="text-xs text-slate-500">
                  Klik tombol <strong>"Rincian"</strong> untuk melihat log absensi harian
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari anggota tim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3 text-center">Tingkat Disiplin</th>
                    <th className="px-4 py-3 text-right">Kehadiran</th>
                    <th className="px-4 py-3 text-right">Telat (&gt;5m)</th>
                    <th className="px-4 py-3 text-right">Total Telat</th>
                    <th className="px-4 py-3 text-right">Izin/Cuti</th>
                    <th className="px-4 py-3 text-right">Sisa Cuti</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeamStats.map(({ member, summary, attendanceRate }) => {
                    const grade =
                      attendanceRate >= 90
                        ? { label: 'A+ (Optimal)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
                        : attendanceRate >= 75
                        ? { label: 'B (Standar)', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
                        : { label: 'C (Perhatian)', bg: 'bg-rose-50 text-rose-800 border-rose-200' };

                    return (
                      <tr key={member.nik} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{member.nama}</span>
                            {member.status === 'cuti_hamil' && (
                              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                                Cuti Hamil
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                          {member.nik}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {member.grup_shift ? `Grup ${member.grup_shift}` : 'Belum Ada'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${grade.bg}`}>
                            {grade.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                          {summary.total_hadir} <span className="text-slate-400">/ {summary.total_hari_kerja}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                          <span className={summary.total_telat_diatas_toleransi > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                            {summary.total_telat_diatas_toleransi}x
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                          {summary.total_menit_telat > 0 ? (
                            <span className="text-amber-800 font-semibold">
                              {summary.total_menit_telat} mnt
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                          <span className={summary.total_izin_cuti_sakit > 0 ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                            {summary.total_izin_cuti_sakit} hr
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                          <span className="font-bold text-slate-900">{summary.sisa_cuti}</span>
                          <span className="text-slate-400"> / {summary.kuota_cuti}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedMemberNik(member.nik)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rincian</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Menampilkan rekap anggota tim supervisor {currentSupervisor.nama}</span>
              <span>Periode aktif: {currentPeriod.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
