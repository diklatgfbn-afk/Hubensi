export type EmployeeStatus = 'aktif' | 'resign' | 'cuti_hamil';
export type UserRole = 'karyawan' | 'supervisor' | 'hr';
export type ShiftGroup = 'A' | 'B' | 'C' | null;

export interface Employee {
  nik: string;
  username: string;
  nama: string;
  nama_alias?: string | null;
  password_hash: string;
  grup_shift: ShiftGroup;
  status: EmployeeStatus;
  role: UserRole;
  atasan_nik: string | null;
  email?: string | null;
  created_at: string;
  jabatan?: string;
}

export interface Period {
  id: string; // e.g., '2026-09'
  tanggal_mulai: string; // YYYY-MM-DD
  tanggal_selesai: string; // YYYY-MM-DD
  label: string; // e.g., '26 Agu – 25 Sep 2026'
}

export interface AttendanceDaily {
  id: string;
  nik: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  shift_terdeteksi: string | null;
  menit_telat: number;
  status_raw: string | null;
  periode_id: string;
  imported_at: string;
  catatan?: string;
}

export interface LeaveRecord {
  id: string;
  nik: string;
  tanggal: string; // YYYY-MM-DD
  jenis: 'izin_cuti_sakit';
  keterangan: string;
  created_by: string;
  created_at: string;
}

export interface LeaveBalance {
  nik: string;
  tahun: number;
  kuota: number;
  terpakai: number;
}

export interface LeaveApplication {
  id: string;
  nik: string;
  employee_name: string;
  application_type: 'izin' | 'cuti' | 'sakit';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export type FinalStatusType = 
  | 'Hadir'
  | 'Izin / Cuti / Sakit'
  | 'Alfa'
  | 'Tidak Ada Absen Masuk'
  | 'Tidak Ada Absen Pulang'
  | string;

export interface ReconciledAttendanceRecord extends AttendanceDaily {
  status_final: FinalStatusType;
  is_leave: boolean;
  leave_keterangan?: string;
}

export interface AttendanceSummary {
  total_hadir: number;
  total_telat_diatas_toleransi: number;
  total_telat_toleransi: number;
  total_menit_telat: number;
  total_izin_cuti_sakit: number;
  total_alfa: number;
  total_hari_kerja: number;
  total_tidak_absen_pulang: number;
  sisa_cuti: number;
  kuota_cuti: number;
}
