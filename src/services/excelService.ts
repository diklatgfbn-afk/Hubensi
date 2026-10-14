import * as XLSX from 'xlsx';
import { AttendanceDaily, Employee, Period } from '../types/attendance';

export interface RowAbsensiRaw {
  nama: string;
  tanggal: number;
  hari: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  shift_terdeteksi: string | null;
  menit_telat: number;
  status: string;
}

export interface ParseResult {
  success: boolean;
  importedRecords: AttendanceDaily[];
  unmatchedRows: { row: RowAbsensiRaw; reason: string }[];
  totalParsed: number;
  errorMessage?: string;
}

/**
 * Resolves day number (26–25) to full calendar date YYYY-MM-DD
 * based on period start and end dates.
 */
export function resolveTanggal(
  tgl: number,
  periodeMulai: Date,
  periodeSelesai: Date
): string {
  const tahun = tgl >= 26 ? periodeMulai.getFullYear() : periodeSelesai.getFullYear();
  const bulan = tgl >= 26 ? periodeMulai.getMonth() : periodeSelesai.getMonth();
  // Construct date
  const d = new Date(tahun, bulan, tgl);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Matches an Excel row's name to an Employee's NIK
 * 1. Exact match: employees.nama === row.nama
 * 2. Case-insensitive match: lower(emp.nama) === lower(row.nama)
 * 3. Username match: lower(emp.username) === lower(row.nama)
 * 4. Alias match: lower(emp.nama_alias) === lower(row.nama)
 */
export function matchNameToEmployee(
  rawName: string,
  employees: Employee[]
): Employee | undefined {
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // 1. Exact
  let matched = employees.find((e) => e.nama === trimmed);
  if (matched) return matched;

  // 2. Case-insensitive nama
  matched = employees.find((e) => e.nama.toLowerCase() === lower);
  if (matched) return matched;

  // 3. Username
  matched = employees.find((e) => e.username.toLowerCase() === lower);
  if (matched) return matched;

  // 4. Alias
  matched = employees.find(
    (e) => e.nama_alias && e.nama_alias.toLowerCase() === lower
  );
  if (matched) return matched;

  // 5. Partial match if name has spaces or underscore
  const sanitized = lower.replace(/[_\s]+/g, '');
  matched = employees.find(
    (e) =>
      e.nama.toLowerCase().replace(/[_\s]+/g, '') === sanitized ||
      e.username.toLowerCase().replace(/[_\s]+/g, '') === sanitized
  );
  return matched;
}

/**
 * Parses file buffer of an uploaded Excel file.
 * Expects sheet named "Detail Harian".
 */
export function parseExcelDetailHarian(
  fileBuffer: ArrayBuffer,
  selectedPeriod: Period,
  employees: Employee[]
): ParseResult {
  try {
    const wb = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = 'Detail Harian';
    const sheet = wb.Sheets[sheetName];

    if (!sheet) {
      return {
        success: false,
        importedRecords: [],
        unmatchedRows: [],
        totalParsed: 0,
        errorMessage: `Sheet "${sheetName}" tidak ditemukan dalam file Excel. Pastikan nama sheet adalah "Detail Harian".`,
      };
    }

    const rawRows = XLSX.utils.sheet_to_json<any>(sheet, { defval: null });

    const filteredRows: RowAbsensiRaw[] = [];
    for (const r of rawRows) {
      // Find keys case-insensitively
      const getVal = (name: string) => {
        const key = Object.keys(r).find((k) => k.trim().toLowerCase() === name.toLowerCase());
        return key ? r[key] : null;
      };

      const nama = getVal('Nama');
      const tanggal = getVal('Tanggal');

      if (nama != null && tanggal != null && !isNaN(Number(tanggal))) {
        let jamMasuk = getVal('Jam Masuk');
        let jamPulang = getVal('Jam Pulang');

        // Clean time formatting if decimal or string
        if (typeof jamMasuk === 'number') {
          const totalSecs = Math.round(jamMasuk * 86400);
          const hh = Math.floor(totalSecs / 3600);
          const mm = Math.floor((totalSecs % 3600) / 60);
          jamMasuk = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        }
        if (typeof jamPulang === 'number') {
          const totalSecs = Math.round(jamPulang * 86400);
          const hh = Math.floor(totalSecs / 3600);
          const mm = Math.floor((totalSecs % 3600) / 60);
          jamPulang = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        }

        filteredRows.push({
          nama: String(nama).trim(),
          tanggal: Number(tanggal),
          hari: String(getVal('Hari') ?? '').trim(),
          jam_masuk: jamMasuk ? String(jamMasuk).trim() : null,
          jam_pulang: jamPulang ? String(jamPulang).trim() : null,
          shift_terdeteksi: getVal('Shift Terdeteksi') ? String(getVal('Shift Terdeteksi')).trim() : null,
          menit_telat: Number(getVal('Menit Telat') ?? 0),
          status: String(getVal('Status') ?? '').trim(),
        });
      }
    }

    const periodeMulai = new Date(selectedPeriod.tanggal_mulai);
    const periodeSelesai = new Date(selectedPeriod.tanggal_selesai);

    const importedRecords: AttendanceDaily[] = [];
    const unmatchedRows: { row: RowAbsensiRaw; reason: string }[] = [];

    for (const row of filteredRows) {
      const emp = matchNameToEmployee(row.nama, employees);
      if (!emp) {
        unmatchedRows.push({
          row,
          reason: `Nama "${row.nama}" tidak terdaftar di data karyawan`,
        });
        continue;
      }

      const tanggalStr = resolveTanggal(row.tanggal, periodeMulai, periodeSelesai);

      importedRecords.push({
        id: `att-${selectedPeriod.id}-${emp.nik}-${tanggalStr}`,
        nik: emp.nik,
        tanggal: tanggalStr,
        hari: row.hari,
        jam_masuk: row.jam_masuk,
        jam_pulang: row.jam_pulang,
        shift_terdeteksi: row.shift_terdeteksi,
        menit_telat: row.menit_telat,
        status_raw: row.status,
        periode_id: selectedPeriod.id,
        imported_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      importedRecords,
      unmatchedRows,
      totalParsed: filteredRows.length,
    };
  } catch (err: any) {
    return {
      success: false,
      importedRecords: [],
      unmatchedRows: [],
      totalParsed: 0,
      errorMessage: err.message || 'Gagal memproses file Excel.',
    };
  }
}

/**
 * Generates an Excel template matching "Detail Harian" specification
 */
export function generateSampleExcelWorkbook(
  period: Period,
  employees: Employee[]
): Blob {
  const wb = XLSX.utils.book_new();

  // Create sample rows for Detail Harian
  const rows: any[] = [];
  const start = new Date(period.tanggal_mulai);
  const end = new Date(period.tanggal_selesai);

  const curr = new Date(start);
  const HARI_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Take first 10 employees for sample
  const sampleEmps = employees.slice(0, 15);

  while (curr <= end) {
    const tgl = curr.getDate();
    const hari = HARI_MAP[curr.getDay()];

    if (curr.getDay() !== 0) {
      for (const emp of sampleEmps) {
        rows.push({
          'Nama': emp.nama,
          'Tanggal': tgl,
          'Hari': hari,
          'Jam Masuk': '07:28',
          'Jam Pulang': '15:32',
          'Shift Terdeteksi': emp.grup_shift ? `Grup ${emp.grup_shift}` : 'Grup A',
          'Menit Telat': 0,
          'Status': 'Tepat Waktu',
          'Potongan (Rp)': 0,
        });
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Detail Harian');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
