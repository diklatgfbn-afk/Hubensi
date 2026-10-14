import { Employee, Period, LeaveRecord, LeaveBalance, AttendanceDaily } from '../types/attendance';

export const SEED_PERIODS: Period[] = [
  {
    id: '2026-08',
    tanggal_mulai: '2026-07-26',
    tanggal_selesai: '2026-08-25',
    label: '26 Jul – 25 Agu 2026',
  },
  {
    id: '2026-09',
    tanggal_mulai: '2026-08-26',
    tanggal_selesai: '2026-09-25',
    label: '26 Agu – 25 Sep 2026',
  },
  {
    id: '2026-10',
    tanggal_mulai: '2026-09-26',
    tanggal_selesai: '2026-10-25',
    label: '26 Sep – 25 Okt 2026',
  },
  {
    id: '2026-11',
    tanggal_mulai: '2026-10-26',
    tanggal_selesai: '2026-11-25',
    label: '26 Okt – 25 Nov 2026',
  },
];

export const SEED_EMPLOYEES: Employee[] = [
  { nik: 'NIK001', username: 'wakit', nama: 'WAKIT', grup_shift: 'A', status: 'aktif', role: 'hr', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK002', username: 'lisna', nama: 'LISNA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: 'NIK001', password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK003', username: 'puput', nama: 'PUPUT', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: 'NIK001', password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK004', username: 'fina', nama: 'FINA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: 'NIK001', password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK005', username: 'lina', nama: 'LINA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK006', username: 'pras', nama: 'PRAS', grup_shift: 'B', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK007', username: 'titik', nama: 'TITIK', grup_shift: null, status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK008', username: 'maya', nama: 'MAYA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK009', username: 'naufal', nama: 'naufal', grup_shift: null, status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK010', username: 'citra', nama: 'CITRA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK011', username: 'rossy', nama: 'ROSSY', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK012', username: 'cesar', nama: 'cesar', grup_shift: 'B', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK013', username: 'fifi', nama: 'fifi', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK014', username: 'wulan', nama: 'WULAN', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK015', username: 'farda', nama: 'FARDA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK016', username: 'yunita', nama: 'YUNITA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK017', username: 'gupita', nama: 'GUPITA', grup_shift: 'A', status: 'cuti_hamil', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK018', username: 'prisca', nama: 'PRISCA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK019', username: 'wasis', nama: 'WASIS', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK020', username: 'puji', nama: 'PUJI', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK021', username: 'rahman', nama: 'RAHMAN', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK022', username: 'rika', nama: 'RIKA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK023', username: 'anjas', nama: 'ANJAS', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK024', username: 'shara', nama: 'SHARA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK025', username: 'rifah', nama: 'RIFAH', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK026', username: 'dika', nama: 'DIKA', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK027', username: 'tyas', nama: 'TYAS', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK028', username: 'maruf', nama: 'MARUF', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: 'NIK001', password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK029', username: 'azmi', nama: 'AZMI', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK030', username: 'dhila', nama: 'dhila', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK031', username: 'sita', nama: 'SITA', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK032', username: 'devi', nama: 'devi', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK033', username: 'endah', nama: 'endah', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK034', username: 'huda', nama: 'huda', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK035', username: 'jihan', nama: 'jihan', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK036', username: 'wulan_n', nama: 'wulan n', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK037', username: 'rizky', nama: 'rizky', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK038', username: 'nur', nama: 'nur', grup_shift: 'C', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK039', username: 'siti', nama: 'siti', grup_shift: null, status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK040', username: 'zulfi', nama: 'zulfi', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
  { nik: 'NIK041', username: 'icha', nama: 'icha', grup_shift: 'A', status: 'aktif', role: 'karyawan', atasan_nik: null, password_hash: 'absensi123', created_at: '2026-01-01' },
];

export const INITIAL_LEAVE_BALANCES: LeaveBalance[] = SEED_EMPLOYEES.map(emp => ({
  nik: emp.nik,
  tahun: 2026,
  kuota: 12,
  terpakai: emp.nik === 'NIK017' ? 5 : emp.nik === 'NIK003' ? 2 : 0,
}));

export const INITIAL_LEAVE_RECORDS: LeaveRecord[] = [
  // Gupita (Cuti Hamil)
  {
    id: 'leave-1',
    nik: 'NIK017',
    tanggal: '2026-09-01',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Cuti Hamil & Melahirkan',
    created_by: 'HR Admin',
    created_at: '2026-08-28',
  },
  {
    id: 'leave-2',
    nik: 'NIK017',
    tanggal: '2026-09-02',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Cuti Hamil & Melahirkan',
    created_by: 'HR Admin',
    created_at: '2026-08-28',
  },
  {
    id: 'leave-3',
    nik: 'NIK017',
    tanggal: '2026-09-03',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Cuti Hamil & Melahirkan',
    created_by: 'HR Admin',
    created_at: '2026-08-28',
  },
  {
    id: 'leave-4',
    nik: 'NIK017',
    tanggal: '2026-09-04',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Cuti Hamil & Melahirkan',
    created_by: 'HR Admin',
    created_at: '2026-08-28',
  },
  {
    id: 'leave-5',
    nik: 'NIK017',
    tanggal: '2026-09-05',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Cuti Hamil & Melahirkan',
    created_by: 'HR Admin',
    created_at: '2026-08-28',
  },
  // Puput (Sakit surat dokter)
  {
    id: 'leave-6',
    nik: 'NIK003',
    tanggal: '2026-09-10',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Sakit (Surat Dokter Terlampir)',
    created_by: 'HR Admin',
    created_at: '2026-09-10',
  },
  {
    id: 'leave-7',
    nik: 'NIK003',
    tanggal: '2026-09-11',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Sakit (Pemulihan)',
    created_by: 'HR Admin',
    created_at: '2026-09-10',
  },
  // Lisna izin keperluan keluarga
  {
    id: 'leave-8',
    nik: 'NIK002',
    tanggal: '2026-09-15',
    jenis: 'izin_cuti_sakit',
    keterangan: 'Izin urusan keluarga penting',
    created_by: 'HR Admin',
    created_at: '2026-09-14',
  },
];

const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Generate sample attendance records for a period and list of employees
export function generateSeedAttendance(period: Period, employees: Employee[]): AttendanceDaily[] {
  const records: AttendanceDaily[] = [];
  const start = new Date(period.tanggal_mulai);
  const end = new Date(period.tanggal_selesai);

  // Iterate from start to end date
  const curr = new Date(start);
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const tanggalStr = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const hari = HARI_NAMES[dayOfWeek];

    // For Sundays, usually office off, no attendance generated or mark as off
    if (dayOfWeek === 0) {
      curr.setDate(curr.getDate() + 1);
      continue;
    }

    employees.forEach((emp, empIdx) => {
      // If employee is cuti_hamil (e.g. Gupita), leave records will reconcile it
      const seedVal = (curr.getDate() * 17 + empIdx * 31) % 100;
      let jam_masuk: string | null = null;
      let jam_pulang: string | null = null;
      let shift_terdeteksi: string | null = null;
      let menit_telat = 0;
      let status_raw: string | null = 'Tepat Waktu';

      const shift = emp.grup_shift || 'A';

      if (shift === 'A') {
        shift_terdeteksi = dayOfWeek === 6 ? 'Grup A (Sab 07:30-15:00)' : 'Grup A (Sen-Jum 07:30-15:30)';
        const baseHour = 7;
        const baseMin = 30;

        if (seedVal < 68) {
          // On time or slightly early (07:15 - 07:30)
          const minuteOffset = (seedVal % 15);
          jam_masuk = `07:${String(15 + minuteOffset).padStart(2, '0')}`;
          jam_pulang = dayOfWeek === 6 ? '15:04' : '15:35';
          menit_telat = 0;
          status_raw = 'Tepat Waktu';
        } else if (seedVal < 82) {
          // Minor delay within tolerance (<= 5 mins: 07:31 - 07:35)
          const delay = 1 + (seedVal % 5);
          jam_masuk = `07:${String(baseMin + delay).padStart(2, '0')}`;
          jam_pulang = dayOfWeek === 6 ? '15:02' : '15:32';
          menit_telat = delay;
          status_raw = `Terlambat ${delay} menit (toleransi)`;
        } else if (seedVal < 93) {
          // Real delay (> 5 mins: e.g., 8 - 25 mins)
          const delay = 6 + (seedVal % 20);
          const totalMin = baseMin + delay;
          const h = baseHour + Math.floor(totalMin / 60);
          const m = totalMin % 60;
          jam_masuk = `0${h}:${String(m).padStart(2, '0')}`;
          jam_pulang = dayOfWeek === 6 ? '15:10' : '15:40';
          menit_telat = delay;
          status_raw = `Terlambat ${delay} menit`;
        } else if (seedVal < 96) {
          // Missed clock out
          jam_masuk = '07:28';
          jam_pulang = null;
          menit_telat = 0;
          status_raw = 'Tidak Ada Absen Pulang';
        } else {
          // Absent / Missed scan
          jam_masuk = null;
          jam_pulang = null;
          menit_telat = 0;
          status_raw = 'Tidak Ada Absen Masuk';
        }
      } else if (shift === 'B') {
        // Shift B: Pagi 06:00-14:00 or Siang 09:00-17:00
        const isSiang = seedVal % 2 === 1;
        shift_terdeteksi = isSiang ? 'Grup B Siang (09:00-17:00)' : 'Grup B Pagi (06:00-14:00)';
        if (seedVal < 80) {
          jam_masuk = isSiang ? '08:55' : '05:56';
          jam_pulang = isSiang ? '17:05' : '14:05';
          menit_telat = 0;
          status_raw = 'Tepat Waktu';
        } else if (seedVal < 90) {
          const delay = 3;
          jam_masuk = isSiang ? '09:03' : '06:03';
          jam_pulang = isSiang ? '17:00' : '14:00';
          menit_telat = delay;
          status_raw = `Terlambat ${delay} menit (toleransi)`;
        } else {
          const delay = 12;
          jam_masuk = isSiang ? '09:12' : '06:12';
          jam_pulang = isSiang ? '17:02' : '14:02';
          menit_telat = delay;
          status_raw = `Terlambat ${delay} menit`;
        }
      } else if (shift === 'C') {
        // Shift C
        const isTueThu = dayOfWeek === 2 || dayOfWeek === 4;
        shift_terdeteksi = isTueThu ? 'Grup C (Sel/Kam 07:30-15:30)' : 'Grup C (Sen/Rab/Jum 07:30-15:30)';
        if (seedVal < 85) {
          jam_masuk = '07:25';
          jam_pulang = '15:35';
          menit_telat = 0;
          status_raw = 'Tepat Waktu';
        } else if (seedVal < 92) {
          jam_masuk = '07:34';
          jam_pulang = '15:31';
          menit_telat = 4;
          status_raw = 'Terlambat 4 menit (toleransi)';
        } else {
          jam_masuk = '07:44';
          jam_pulang = '15:30';
          menit_telat = 14;
          status_raw = 'Terlambat 14 menit';
        }
      }

      records.push({
        id: `att-${period.id}-${emp.nik}-${tanggalStr}`,
        nik: emp.nik,
        tanggal: tanggalStr,
        hari,
        jam_masuk,
        jam_pulang,
        shift_terdeteksi,
        menit_telat,
        status_raw,
        periode_id: period.id,
        imported_at: '2026-09-26T00:00:00Z',
      });
    });

    curr.setDate(curr.getDate() + 1);
  }

  return records;
}

export const INITIAL_ATTENDANCE: AttendanceDaily[] = [
  ...generateSeedAttendance(SEED_PERIODS[1], SEED_EMPLOYEES), // 2026-09
  ...generateSeedAttendance(SEED_PERIODS[2], SEED_EMPLOYEES), // 2026-10
];
