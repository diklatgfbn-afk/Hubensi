import {
  AttendanceDaily,
  LeaveRecord,
  ReconciledAttendanceRecord,
  AttendanceSummary,
  Employee,
  LeaveBalance,
} from '../types/attendance';

/**
 * Reconciles an attendance record with any matching leave record for that employee and date.
 * Enforces PRD Section 13.1 priority rules:
 * 1. If leave record exists on date -> 'Izin / Cuti / Sakit' (even if clock scan happened)
 * 2. Else if no jam_masuk & no jam_pulang -> 'Alfa'
 * 3. Else if status_raw mentions 'tidak ada absen masuk' -> 'Tidak Ada Absen Masuk'
 * 4. Else if status_raw mentions 'tidak ada absen pulang' -> 'Tidak Ada Absen Pulang'
 * 5. Else if menit_telat > 5 -> 'Telat X menit'
 * 6. Else if menit_telat > 0 -> 'Telat X menit (toleransi)'
 * 7. Else -> 'Hadir'
 */
export function reconcileRecord(
  attendance: AttendanceDaily,
  leaves: LeaveRecord[]
): ReconciledAttendanceRecord {
  const matchingLeave = leaves.find(
    (l) => l.nik === attendance.nik && l.tanggal === attendance.tanggal
  );

  let status_final: string;
  const is_leave = !!matchingLeave;

  if (matchingLeave) {
    status_final = 'Izin / Cuti / Sakit';
  } else if (!attendance.jam_masuk && !attendance.jam_pulang) {
    status_final = 'Alfa';
  } else if (
    attendance.status_raw &&
    attendance.status_raw.toLowerCase().includes('tidak ada absen masuk')
  ) {
    status_final = 'Tidak Ada Absen Masuk';
  } else if (
    attendance.status_raw &&
    attendance.status_raw.toLowerCase().includes('tidak ada absen pulang')
  ) {
    status_final = 'Tidak Ada Absen Pulang';
  } else if (attendance.menit_telat > 5) {
    status_final = `Telat ${attendance.menit_telat} menit`;
  } else if (attendance.menit_telat > 0) {
    status_final = `Telat ${attendance.menit_telat} menit (toleransi)`;
  } else {
    status_final = 'Hadir';
  }

  return {
    ...attendance,
    status_final,
    is_leave,
    leave_keterangan: matchingLeave?.keterangan,
  };
}

/**
 * Computes leave remaining for an employee in a given calendar year (default 2026).
 * Quota defaults to 12 days. Maternity leave (cuti hamil) also reduces the quota.
 */
export function calculateSisaCuti(
  nik: string,
  year: number,
  leaves: LeaveRecord[],
  balances: LeaveBalance[]
): { kuota: number; terpakai: number; sisa: number } {
  const bal = balances.find((b) => b.nik === nik && b.tahun === year);
  const kuota = bal?.kuota ?? 12;

  // Count leave records in that year
  const terpakai = leaves.filter((l) => {
    if (l.nik !== nik) return false;
    const leaveYear = new Date(l.tanggal).getFullYear();
    return leaveYear === year;
  }).length;

  const sisa = Math.max(0, kuota - terpakai);

  return { kuota, terpakai, sisa };
}

/**
 * Calculates monthly summary stats for an employee in a period
 */
export function calculateSummary(
  nik: string,
  periodeId: string,
  attendances: AttendanceDaily[],
  leaves: LeaveRecord[],
  balances: LeaveBalance[],
  year: number = 2026
): AttendanceSummary {
  const filtered = attendances.filter(
    (a) => a.nik === nik && a.periode_id === periodeId
  );

  const reconciled = filtered.map((a) => reconcileRecord(a, leaves));

  let total_hadir = 0;
  let total_telat_diatas_toleransi = 0;
  let total_telat_toleransi = 0;
  let total_menit_telat = 0;
  let total_izin_cuti_sakit = 0;
  let total_alfa = 0;
  let total_tidak_absen_pulang = 0;

  for (const rec of reconciled) {
    if (rec.status_final === 'Hadir') {
      total_hadir++;
    } else if (rec.status_final.startsWith('Telat') && rec.menit_telat > 5) {
      total_telat_diatas_toleransi++;
      total_menit_telat += rec.menit_telat;
    } else if (rec.status_final.includes('(toleransi)')) {
      total_telat_toleransi++;
      total_menit_telat += rec.menit_telat;
    } else if (rec.status_final === 'Izin / Cuti / Sakit') {
      total_izin_cuti_sakit++;
    } else if (rec.status_final === 'Alfa') {
      total_alfa++;
    } else if (rec.status_final === 'Tidak Ada Absen Pulang') {
      total_tidak_absen_pulang++;
      total_hadir++;
    } else if (rec.status_final === 'Tidak Ada Absen Masuk') {
      total_alfa++;
    }
  }

  const { kuota, sisa } = calculateSisaCuti(nik, year, leaves, balances);

  return {
    total_hadir,
    total_telat_diatas_toleransi,
    total_telat_toleransi,
    total_menit_telat,
    total_izin_cuti_sakit,
    total_alfa,
    total_tidak_absen_pulang,
    total_hari_kerja: reconciled.length,
    sisa_cuti: sisa,
    kuota_cuti: kuota,
  };
}

/**
 * Generates an array of date strings between startDate and endDate (inclusive)
 * Format: YYYY-MM-DD
 */
export function expandDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    curr.setDate(curr.getDate() + 1);
  }

  return dates;
}
