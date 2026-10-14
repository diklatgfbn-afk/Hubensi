import React, { useState, useMemo } from 'react';
import {
  Employee,
  Period,
  AttendanceDaily,
  LeaveRecord,
  LeaveBalance,
  ShiftGroup,
  EmployeeStatus,
  UserRole,
  LeaveApplication,
  Announcement,
} from '../types/attendance';
import {
  calculateSummary,
  reconcileRecord,
} from '../services/reconciliationService';
import {
  parseExcelDetailHarian,
  generateSampleExcelWorkbook,
  ParseResult,
} from '../services/excelService';
import { StorageService } from '../services/storageService';
import { PeriodeFilter } from '../components/PeriodeFilter';
import { TabelAbsensi } from '../components/TabelAbsensi';
import { PrintReportView } from '../components/PrintReportView';
import {
  Upload,
  Calendar,
  Users,
  Settings,
  Plus,
  Trash2,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Printer,
  Search,
  Eye,
  Edit,
  Save,
  X,
  Megaphone,
  Check,
  Send,
  CloudUpload,
  Layers,
  Clock,
  Shield,
  Database,
  ExternalLink,
  HeartPulse,
  FileText,
} from 'lucide-react';
import { GOOGLE_FORM_LINKS } from '../data/formLinks';

interface AdminDashboardProps {
  currentHR: Employee;
  allEmployees: Employee[];
  periods: Period[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
  attendanceData: AttendanceDaily[];
  leavesData: LeaveRecord[];
  balancesData: LeaveBalance[];
  applications: LeaveApplication[];
  announcements: Announcement[];
  onRefreshData: () => void;
  onOpenSupabaseModal: () => void;
}

type AdminTab =
  | 'recap'
  | 'detail'
  | 'cuti'
  | 'pengajuan'
  | 'pengumuman'
  | 'upload-excel'
  | 'organisasi';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentHR,
  allEmployees,
  periods,
  selectedPeriodId,
  onSelectPeriod,
  attendanceData,
  leavesData,
  balancesData,
  applications,
  announcements,
  onRefreshData,
  onOpenSupabaseModal,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('recap');

  // Filters for employee table
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'nama' | 'hadir' | 'telat' | 'sisa'>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selected employee for detailed sheet drilldown
  const [inspectEmployeeNik, setInspectEmployeeNik] = useState<string | null>(null);

  // Form state for leave input (manual range)
  const [leaveNik, setLeaveNik] = useState<string>(allEmployees[0]?.nik || '');
  const [leaveStartDate, setLeaveStartDate] = useState<string>('2026-09-01');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('2026-09-02');
  const [leaveKeterangan, setLeaveKeterangan] = useState<string>('Izin Keperluan Mendesak');
  const [leaveMessage, setLeaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for editing employee
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state for manual attendance correction
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceDaily | null>(null);

  // Upload Excel state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ParseResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Announcement state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Batch Cuti modal
  const [showBatchCutiModal, setShowBatchCutiModal] = useState(false);
  const [batchCutiDays, setBatchCutiDays] = useState(12);

  // Deduct cuti modal
  const [deductTarget, setDeductTarget] = useState<Employee | null>(null);
  const [deductDays, setDeductDays] = useState(1);
  const [deductReason, setDeductReason] = useState('');

  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  const supervisorsList = useMemo(() => {
    return allEmployees.filter((e) => e.role === 'supervisor' || e.role === 'hr');
  }, [allEmployees]);

  // Summaries for all employees
  const employeeSummaries = useMemo(() => {
    const list = allEmployees.map((emp) => {
      const summary = calculateSummary(
        emp.nik,
        selectedPeriodId,
        attendanceData,
        leavesData,
        balancesData,
        2026
      );
      const atasan = allEmployees.find((a) => a.nik === emp.atasan_nik);
      const attendanceRate = summary.total_hari_kerja > 0
        ? Math.round((summary.total_hadir / summary.total_hari_kerja) * 100)
        : 0;

      return {
        emp,
        summary,
        attendanceRate,
        atasanNama: atasan ? atasan.nama : '—',
      };
    });

    // Filtering
    return list.filter(({ emp }) => {
      if (filterShift !== 'all') {
        if (filterShift === 'none' && emp.grup_shift !== null) return false;
        if (filterShift !== 'none' && emp.grup_shift !== filterShift) return false;
      }
      if (filterStatus !== 'all' && emp.status !== filterStatus) return false;
      if (searchEmployee.trim()) {
        const q = searchEmployee.toLowerCase();
        return (
          emp.nama.toLowerCase().includes(q) ||
          emp.nik.toLowerCase().includes(q) ||
          emp.username.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortField === 'hadir') {
        return sortOrder === 'asc' ? a.summary.total_hadir - b.summary.total_hadir : b.summary.total_hadir - a.summary.total_hadir;
      }
      if (sortField === 'telat') {
        return sortOrder === 'asc' ? a.summary.total_menit_telat - b.summary.total_menit_telat : b.summary.total_menit_telat - a.summary.total_menit_telat;
      }
      if (sortField === 'sisa') {
        return sortOrder === 'asc' ? a.summary.sisa_cuti - b.summary.sisa_cuti : b.summary.sisa_cuti - a.summary.sisa_cuti;
      }
      return sortOrder === 'asc' ? a.emp.nama.localeCompare(b.emp.nama) : b.emp.nama.localeCompare(a.emp.nama);
    });
  }, [allEmployees, selectedPeriodId, attendanceData, leavesData, balancesData, filterShift, filterStatus, searchEmployee, sortField, sortOrder]);

  // Inspected employee details
  const inspectedEmp = useMemo(() => {
    if (!inspectEmployeeNik) return null;
    return allEmployees.find((e) => e.nik === inspectEmployeeNik) || null;
  }, [inspectEmployeeNik, allEmployees]);

  const inspectedRecords = useMemo(() => {
    if (!inspectedEmp) return [];
    const raw = attendanceData.filter(
      (a) => a.nik === inspectedEmp.nik && a.periode_id === selectedPeriodId
    );
    raw.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return raw.map((r) => reconcileRecord(r, leavesData));
  }, [inspectedEmp, attendanceData, selectedPeriodId, leavesData]);

  const inspectedSummary = useMemo(() => {
    if (!inspectedEmp) return null;
    return calculateSummary(
      inspectedEmp.nik,
      selectedPeriodId,
      attendanceData,
      leavesData,
      balancesData,
      2026
    );
  }, [inspectedEmp, selectedPeriodId, attendanceData, leavesData, balancesData]);

  // Submit leave form
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveMessage(null);

    if (!leaveNik || !leaveStartDate || !leaveEndDate) {
      setLeaveMessage({ type: 'error', text: 'Semua kolom wajib diisi.' });
      return;
    }

    if (new Date(leaveStartDate) > new Date(leaveEndDate)) {
      setLeaveMessage({ type: 'error', text: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' });
      return;
    }

    const { addedCount, dates } = StorageService.addLeaveRange(
      leaveNik,
      leaveStartDate,
      leaveEndDate,
      leaveKeterangan,
      currentHR.nama
    );

    setLeaveMessage({
      type: 'success',
      text: `Berhasil menambahkan cuti/izin untuk ${addedCount} hari (${dates[0]} s/d ${dates[dates.length - 1]}). Data langsung sinkron.`,
    });

    onRefreshData();
  };

  const handleDeleteLeave = (id: string) => {
    StorageService.deleteLeaveRecord(id);
    onRefreshData();
  };

  const handleUpdateQuota = (nik: string, newQuota: number) => {
    StorageService.updateLeaveQuota(nik, 2026, newQuota);
    onRefreshData();
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    StorageService.updateEmployee(editingEmployee.nik, {
      nama: editingEmployee.nama,
      nama_alias: editingEmployee.nama_alias,
      grup_shift: editingEmployee.grup_shift,
      status: editingEmployee.status,
      role: editingEmployee.role,
      atasan_nik: editingEmployee.atasan_nik,
    });

    setEditingEmployee(null);
    onRefreshData();
  };

  // Upload Excel handler
  const handleFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      alert('Hanya file Excel (.xlsx / .xls) yang diperbolehkan');
      return;
    }
    setUploadFile(file);
    setUploadResult(null);
  };

  const handleProcessUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadResult(null);

    try {
      const buffer = await uploadFile.arrayBuffer();
      const result = parseExcelDetailHarian(buffer, currentPeriod, allEmployees);
      setUploadResult(result);

      if (result.success && result.importedRecords.length > 0) {
        StorageService.upsertAttendance(result.importedRecords);
        onRefreshData();
      }
    } catch (err: any) {
      setUploadResult({
        success: false,
        importedRecords: [],
        unmatchedRows: [],
        totalParsed: 0,
        errorMessage: err.message || 'Gagal memproses berkas Excel.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Download Sample Excel
  const handleDownloadSample = () => {
    const blob = generateSampleExcelWorkbook(currentPeriod, allEmployees);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Detail_Harian_${currentPeriod.id}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Manual Attendance Correction Save
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionRecord) return;

    StorageService.upsertAttendance([correctionRecord]);
    setCorrectionRecord(null);
    onRefreshData();
  };

  // Batch Cuti
  const handleBatchCuti = () => {
    if (window.confirm(`Terapkan jatah cuti ${batchCutiDays} hari untuk SELURUH 41 karyawan?`)) {
      allEmployees.forEach((emp) => {
        StorageService.updateLeaveQuota(emp.nik, 2026, batchCutiDays);
      });
      setShowBatchCutiModal(false);
      onRefreshData();
    }
  };

  // Deduct cuti execute
  const handleDeductCuti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductTarget) return;

    const todayStr = new Date().toISOString().split('T')[0];
    StorageService.addLeaveRange(
      deductTarget.nik,
      todayStr,
      todayStr,
      deductReason || 'Pemotongan Cuti Tahunan',
      currentHR.nama
    );

    setDeductTarget(null);
    setDeductReason('');
    onRefreshData();
  };

  // Announcement Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    StorageService.addAnnouncement(annTitle, annContent, currentHR.nama);
    setAnnTitle('');
    setAnnContent('');
    setShowAnnModal(false);
    onRefreshData();
  };

  return (
    <div>
      {/* Hidden print view for inspected report */}
      {inspectedEmp && inspectedSummary && (
        <PrintReportView
          employee={inspectedEmp}
          period={currentPeriod}
          records={inspectedRecords}
          summary={inspectedSummary}
          supervisorName={allEmployees.find((a) => a.nik === inspectedEmp.atasan_nik)?.nama}
        />
      )}

      <div className="no-print space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Super Admin HRD
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">Total 41 Personel Perusahaan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Pusat Administrasi &amp; Absensi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola import Excel, kuota cuti tahunan, formulir pengajuan resmi, dan rekonsiliasi data
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <PeriodeFilter
              periods={periods}
              selectedPeriodId={selectedPeriodId}
              onSelectPeriod={onSelectPeriod}
            />

            <button
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Hubungkan ke Database Cloud Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database Cloud (Supabase)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('recap');
              setInspectEmployeeNik(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'recap'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rekap Karyawan (41)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-excel')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'upload-excel'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel Absen</span>
          </button>

          <button
            onClick={() => setActiveTab('cuti')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cuti'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kelola Cuti</span>
          </button>

          <button
            onClick={() => setActiveTab('pengajuan')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pengajuan'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Formulir Pengajuan</span>
          </button>

          <button
            onClick={() => setActiveTab('pengumuman')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pengumuman'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Papan Pengumuman</span>
          </button>

          <button
            onClick={() => setActiveTab('organisasi')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'organisasi'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Shift &amp; Supervisor</span>
          </button>
        </div>

        {/* TAB 1: REKAP KARYAWAN */}
        {activeTab === 'recap' && (
          <div className="space-y-4">
            {inspectedEmp && inspectedSummary ? (
              <div className="space-y-4 bg-slate-50 p-4 sm:p-6 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setInspectEmployeeNik(null)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    ← Kembali ke Daftar Rekap
                  </button>
                  <div className="text-xs text-slate-500">
                    Meninjau Detail: <strong className="text-slate-900">{inspectedEmp.nama}</strong> ({inspectedEmp.nik})
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{inspectedEmp.nama}</div>
                    <div className="text-slate-500">
                      Shift: {inspectedEmp.grup_shift ? `Grup ${inspectedEmp.grup_shift}` : 'Belum Ada'} · Status: {inspectedEmp.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 font-mono tabular-nums">
                    <div>Hadir: <strong className="text-slate-900">{inspectedSummary.total_hadir}</strong>/{inspectedSummary.total_hari_kerja}</div>
                    <div>Telat: <strong className="text-amber-700">{inspectedSummary.total_menit_telat}m</strong></div>
                    <div>Izin/Cuti: <strong className="text-blue-700">{inspectedSummary.total_izin_cuti_sakit}hr</strong></div>
                    <div>Sisa Cuti: <strong className="text-slate-900">{inspectedSummary.sisa_cuti}</strong>/{inspectedSummary.kuota_cuti}</div>
                  </div>
                </div>

                <TabelAbsensi
                  records={inspectedRecords}
                  canEdit={true}
                  onEditRecord={(rec) => setCorrectionRecord(rec)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Search & Filters */}
                <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-500">Grup Shift:</span>
                    <select
                      value={filterShift}
                      onChange={(e) => setFilterShift(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="all">Semua Shift</option>
                      <option value="A">Grup A</option>
                      <option value="B">Grup B</option>
                      <option value="C">Grup C</option>
                      <option value="none">Belum Dikonfirmasi</option>
                    </select>

                    <span className="font-semibold text-slate-500 ml-2">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="all">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="cuti_hamil">Cuti Hamil</option>
                      <option value="resign">Resign</option>
                    </select>
                  </div>

                  <div className="relative w-full md:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama karyawan atau NIK..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Nama Karyawan</th>
                        <th className="px-4 py-3">NIK</th>
                        <th className="px-4 py-3">Grup Shift</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Kehadiran</th>
                        <th className="px-4 py-3 text-right">Telat (&gt;5m)</th>
                        <th className="px-4 py-3 text-right">Total Telat</th>
                        <th className="px-4 py-3 text-right">Izin/Cuti</th>
                        <th className="px-4 py-3 text-right">Sisa Cuti</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employeeSummaries.map(({ emp, summary, attendanceRate }) => {
                        const grade =
                          attendanceRate >= 90
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : attendanceRate >= 70
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200';

                        return (
                          <tr key={emp.nik} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3 font-bold text-slate-900 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{emp.nama}</span>
                                {emp.role === 'hr' && (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">HR</span>
                                )}
                                {emp.role === 'supervisor' && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">SPV</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                              {emp.nik}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                {emp.grup_shift ? `Grup ${emp.grup_shift}` : 'Belum Ada'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${grade}`}>
                                {emp.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                              {summary.total_hadir} <span className="text-slate-400">/{summary.total_hari_kerja}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                              <span className={summary.total_telat_diatas_toleransi > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                                {summary.total_telat_diatas_toleransi}x
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {summary.total_menit_telat > 0 ? (
                                <span className="text-amber-800 font-semibold">
                                  {summary.total_menit_telat} mnt
                                </span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                              <span className={summary.total_izin_cuti_sakit > 0 ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                                {summary.total_izin_cuti_sakit} hr
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                              <span className="font-bold text-slate-900">{summary.sisa_cuti}</span>
                              <span className="text-slate-400"> / {summary.kuota_cuti}</span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => setInspectEmployeeNik(emp.nik)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
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
                  <span>Menampilkan {employeeSummaries.length} dari {allEmployees.length} karyawan</span>
                  <span>Periode Aktif: {currentPeriod.label}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD EXCEL (Detail Harian) */}
        {activeTab === 'upload-excel' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CloudUpload className="w-5 h-5 text-blue-700" />
                    <span>Upload File Absensi Mesin (Sheet: Detail Harian)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Sistem membaca kolom <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Nama</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Tanggal</code> (26–25), <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Jam Masuk</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Jam Pulang</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Menit Telat</code>, dan <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Status</code>. Kolom Potongan Rp diabaikan secara sistemik.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Format Contoh Excel</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files.length) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => document.getElementById('excelFileInput')?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-blue-600 bg-blue-50/70'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                }`}
              >
                <input
                  id="excelFileInput"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {uploadFile ? uploadFile.name : 'Klik atau seret file Excel ke sini'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format: .xlsx atau .xls (Pastikan berisi sheet "Detail Harian")
                </p>

                {uploadFile && (
                  <p className="text-xs text-blue-700 font-mono mt-2 font-medium">
                    Ukuran: {(uploadFile.size / 1024).toFixed(1)} KB — Siap diproses
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleProcessUpload}
                  disabled={!uploadFile || isUploading}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses Baris Data...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Proses &amp; Sinkronkan ke Siklus {currentPeriod.id}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Upload Result Feedback */}
              {uploadResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    uploadResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {uploadResult.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>
                      {uploadResult.success
                        ? `Import Sukses! Berhasil memproses ${uploadResult.importedRecords.length} baris presensi.`
                        : `Gagal: ${uploadResult.errorMessage}`}
                    </span>
                  </div>

                  {uploadResult.unmatchedRows.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200 text-amber-900">
                      <p className="font-semibold">
                        Nama Tidak Dikenal ({uploadResult.unmatchedRows.length} baris):
                      </p>
                      <ul className="list-disc list-inside mt-1 font-mono text-[11px] space-y-0.5">
                        {uploadResult.unmatchedRows.slice(0, 8).map((u, i) => (
                          <li key={i}>
                            Tgl {u.row.tanggal}: "{u.row.nama}" — {u.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA CUTI */}
        {activeTab === 'cuti' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Manajemen Kuota &amp; Sisa Cuti Karyawan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar kuota adalah 12 hari/tahun kalender Jan–Des 2026. Cuti hamil mengurangi kuota tahunan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBatchCutiModal(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Atur Semua (Batch 12 Hari)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Nama Karyawan</th>
                      <th className="px-4 py-3">NIK</th>
                      <th className="px-4 py-3 text-center">Jatah Kuota</th>
                      <th className="px-4 py-3">Status Penggunaan</th>
                      <th className="px-4 py-3 text-right">Sisa Cuti</th>
                      <th className="px-4 py-3 text-center">Aksi Potong / Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allEmployees.map((emp) => {
                      const bal = balancesData.find((b) => b.nik === emp.nik && b.tahun === 2026);
                      const kuota = bal ? bal.kuota : 12;
                      const terpakai = leavesData.filter(
                        (l) => l.nik === emp.nik && new Date(l.tanggal).getFullYear() === 2026
                      ).length;
                      const sisa = Math.max(0, kuota - terpakai);
                      const pct = kuota > 0 ? Math.min(100, Math.round((terpakai / kuota) * 100)) : 0;
                      const sisaColor = sisa <= 2 ? 'text-rose-600' : sisa <= 5 ? 'text-amber-600' : 'text-emerald-700';

                      return (
                        <tr key={emp.nik} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {emp.nama}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                            {emp.nik}
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-900 whitespace-nowrap">
                            {kuota} hari
                          </td>
                          <td className="px-4 py-3 min-w-[180px]">
                            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                              <span>Terpakai {terpakai} hari</span>
                              <span className="font-mono">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold font-mono text-sm ${sisaColor} whitespace-nowrap`}>
                            {sisa} hari
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setDeductTarget(emp);
                                  setDeductDays(1);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                              >
                                Potong Cuti
                              </button>
                              <button
                                onClick={() => handleUpdateQuota(emp.nik, Math.max(0, kuota - 1))}
                                className="w-6 h-6 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleUpdateQuota(emp.nik, kuota + 1)}
                                className="w-6 h-6 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Input Manual Izin Per Rentang (Section 7.5 & 8.3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Input Izin / Cuti Per Rentang Tanggal Manual
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sistem otomatis memecah per tanggal dan menyimpannya ke rekaman perizinan.
              </p>

              {leaveMessage && (
                <div
                  className={`p-3 rounded-xl text-xs mb-4 border ${
                    leaveMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {leaveMessage.text}
                </div>
              )}

              <form onSubmit={handleAddLeave} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Karyawan</label>
                  <select
                    value={leaveNik}
                    onChange={(e) => setLeaveNik(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900"
                  >
                    {allEmployees.map((e) => (
                      <option key={e.nik} value={e.nik}>
                        {e.nama} ({e.nik})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl Mulai</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl Selesai</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sakit, Cuti"
                    value={leaveKeterangan}
                    onChange={(e) => setLeaveKeterangan(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 cursor-pointer shadow-xs"
                  >
                    Simpan Rekaman Izin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: PENGAJUAN (APPLICATIONS APPROVAL WORKFLOW) */}
        {activeTab === 'pengajuan' && (
          <div className="space-y-4">
            {/* Google Forms Official Links Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>Tautan Formulir Pengajuan Resmi (Google Form Perusahaan)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Karyawan mengisi permohonan melalui 3 Google Form resmi di bawah ini. Buka tautan untuk memeriksa formulir atau respon masuk.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {GOOGLE_FORM_LINKS.map((form) => (
                  <div
                    key={form.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            form.color === 'emerald'
                              ? 'bg-emerald-100 text-emerald-800'
                              : form.color === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {form.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1">{form.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {form.description}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-200/60">
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                      >
                        <span>Buka Google Form</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prosedur Rekonsiliasi & Validasi Pengajuan Google Form Resmi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-blue-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  Prosedur Rekonsiliasi &amp; Validasi Pengajuan Karyawan
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                      1
                    </span>
                    <span>Pengajuan Mandiri Karyawan</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Karyawan mengisi permohonan melalui salah satu dari 3 tautan Google Form resmi di atas sesuai keperluannya (Cuti, KJK &amp; PSW, atau Izin &amp; Sakit).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                      2
                    </span>
                    <span>Verifikasi Respon &amp; Dokumen</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    HRD dan Supervisor memeriksa respon Google Form / Spreadsheet untuk memastikan kelengkapan bukti (misal: surat sakit dokter, alasan dinas, atau izin mendesak).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">
                      3
                    </span>
                    <span>Pencatatan ke Tab Kelola Cuti</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Untuk permohonan cuti yang telah disetujui, HR menginput rentang tanggal pada tab <strong>Kelola Cuti</strong> agar otomatis tersinkron ke rekonsiliasi absensi 26–25.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAPAN PENGUMUMAN */}
        {activeTab === 'pengumuman' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Papan Pengumuman Karyawan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publikasikan pengumuman kebijakan absensi, jadwal libur, dan operasional kantor
                </p>
              </div>
              <button
                onClick={() => setShowAnnModal(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Pengumuman</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-700 border border-slate-200 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                    <button
                      onClick={() => {
                        if (confirm('Hapus pengumuman ini?')) {
                          StorageService.deleteAnnouncement(ann.id);
                          onRefreshData();
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{ann.content}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                    <span>Oleh: <strong>{ann.created_by}</strong></span>
                    <span>·</span>
                    <span>{new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SHIFT & SUPERVISOR ORGANISASI */}
        {activeTab === 'organisasi' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Data 41 Karyawan, Shift Kerja, &amp; Relasi Atasan (atasan_nik)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur grup shift (A, B, C), status kerja, nama alias untuk matcher Excel, dan pemetaan atasan
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Nama Alias</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Atasan Langsung</th>
                    <th className="px-4 py-3 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allEmployees.map((emp) => {
                    const atasan = allEmployees.find((a) => a.nik === emp.atasan_nik);
                    return (
                      <tr key={emp.nik} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {emp.nama}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {emp.nik}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                          {emp.username}
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic whitespace-nowrap">
                          {emp.nama_alias || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {emp.grup_shift ? `Grup ${emp.grup_shift}` : 'Belum Ada'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap capitalize">
                          {emp.status.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap uppercase text-[10px] font-bold text-slate-700">
                          {emp.role}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {atasan ? atasan.nama : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setEditingEmployee({ ...emp })}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Batch Cuti */}
        {showBatchCutiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Atur Kuota Cuti Semua Karyawan</h3>
              <p className="text-xs text-slate-500">
                Terapkan kuota hari cuti tahunan serentak untuk seluruh 41 karyawan aktif.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Hari Kuota (Standard: 12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={batchCutiDays}
                  onChange={(e) => setBatchCutiDays(Number(e.target.value))}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchCutiModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBatchCuti}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800"
                >
                  Terapkan ke Semua
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Deduct Cuti */}
        {deductTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Potong Cuti: {deductTarget.nama}
              </h3>
              <form onSubmit={handleDeductCuti} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Hari Dipotong</label>
                  <input
                    type="number"
                    min="1"
                    value={deductDays}
                    onChange={(e) => setDeductDays(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alasan / Keterangan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cuti pribadi mendadak"
                    value={deductReason}
                    onChange={(e) => setDeductReason(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeductTarget(null)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl font-medium text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
                  >
                    Konfirmasi Potong Cuti
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Announcement */}
        {showAnnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Buat Pengumuman Baru</h3>
              <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jadwal Libur Bersama"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Isi Pengumuman</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan detail pengumuman untuk seluruh karyawan..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800"
                  >
                    Terbitkan Pengumuman
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Employee */}
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Data Karyawan: {editingEmployee.nama} ({editingEmployee.nik})
                </h3>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.nama}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, nama: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Alias (untuk matcher nama di Excel)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Wakit S, Wakit-A"
                    value={editingEmployee.nama_alias || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, nama_alias: e.target.value || null })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Grup Shift</label>
                    <select
                      value={editingEmployee.grup_shift || ''}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          grup_shift: (e.target.value as ShiftGroup) || null,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                    >
                      <option value="A">Grup A</option>
                      <option value="B">Grup B</option>
                      <option value="C">Grup C</option>
                      <option value="">Belum Dikonfirmasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Karyawan</label>
                    <select
                      value={editingEmployee.status}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          status: e.target.value as EmployeeStatus,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="cuti_hamil">Cuti Hamil</option>
                      <option value="resign">Resign</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role Sistem</label>
                    <select
                      value={editingEmployee.role}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                    >
                      <option value="karyawan">Karyawan</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="hr">Super Admin HR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Atasan Langsung (atasan_nik)</label>
                    <select
                      value={editingEmployee.atasan_nik || ''}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          atasan_nik: e.target.value || null,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                    >
                      <option value="">Tanpa Atasan</option>
                      {supervisorsList
                        .filter((s) => s.nik !== editingEmployee.nik)
                        .map((s) => (
                          <option key={s.nik} value={s.nik}>
                            {s.nama} ({s.role.toUpperCase()})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Manual Daily Attendance Correction */}
        {correctionRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Koreksi Absensi Tanggal: {correctionRecord.tanggal}
                </h3>
                <button
                  onClick={() => setCorrectionRecord(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCorrection} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Masuk (HH:mm)</label>
                    <input
                      type="text"
                      placeholder="07:30"
                      value={correctionRecord.jam_masuk || ''}
                      onChange={(e) =>
                        setCorrectionRecord({
                          ...correctionRecord,
                          jam_masuk: e.target.value.trim() || null,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Pulang (HH:mm)</label>
                    <input
                      type="text"
                      placeholder="15:30"
                      value={correctionRecord.jam_pulang || ''}
                      onChange={(e) =>
                        setCorrectionRecord({
                          ...correctionRecord,
                          jam_pulang: e.target.value.trim() || null,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Menit Telat</label>
                  <input
                    type="number"
                    min="0"
                    value={correctionRecord.menit_telat}
                    onChange={(e) =>
                      setCorrectionRecord({
                        ...correctionRecord,
                        menit_telat: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Raw Mesin</label>
                  <input
                    type="text"
                    value={correctionRecord.status_raw || ''}
                    onChange={(e) =>
                      setCorrectionRecord({
                        ...correctionRecord,
                        status_raw: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectionRecord(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800"
                  >
                    Simpan Koreksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
