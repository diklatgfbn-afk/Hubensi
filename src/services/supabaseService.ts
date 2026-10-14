import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Employee,
  Period,
  AttendanceDaily,
  LeaveRecord,
  LeaveBalance,
  LeaveApplication,
  Announcement,
} from '../types/attendance';

const SUPABASE_STORAGE_KEY = 'absensi_supabase_credentials_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class SupabaseService {
  private static client: SupabaseClient | null = null;

  static getConfig(): SupabaseConfig {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    // Fallback to env vars
    return {
      url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    };
  }

  static setConfig(config: SupabaseConfig) {
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
    this.client = null; // reset client to re-instantiate
  }

  static getClient(): SupabaseClient | null {
    if (this.client) return this.client;
    const { url, anonKey } = this.getConfig();
    if (!url || !anonKey || url.includes('your-project-ref')) {
      return null;
    }
    try {
      this.client = createClient(url, anonKey);
      return this.client;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  static isConnected(): boolean {
    return this.getClient() !== null;
  }

  /**
   * Test connection to Supabase
   */
  static async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = createClient(url, key);
      const { data, error } = await client.from('periods').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "periods" does not exist') || error.code === '42P01') {
          return {
            success: true,
            message: 'Terkoneksi ke Supabase! Tabel database belum dibuat. Silakan jalankan script SQL Schema di SQL Editor Supabase.',
          };
        }
        return { success: false, message: `Error Supabase: ${error.message}` };
      }
      return { success: true, message: 'Koneksi ke Supabase berhasil dan tabel ditemukan!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Koneksi gagal. Periksa kembali URL dan Anon Key.' };
    }
  }

  /**
   * Synchronize all data from Supabase to local state
   */
  static async pullFromSupabase(): Promise<{
    success: boolean;
    data?: {
      employees: Employee[];
      periods: Period[];
      attendance: AttendanceDaily[];
      leaves: LeaveRecord[];
      balances: LeaveBalance[];
      applications: LeaveApplication[];
      announcements: Announcement[];
    };
    error?: string;
  }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: 'Kredensial Supabase belum dikonfigurasi.' };
    }

    try {
      const [
        { data: employees },
        { data: periods },
        { data: attendance },
        { data: leaves },
        { data: balances },
        { data: applications },
        { data: announcements },
      ] = await Promise.all([
        client.from('employees').select('*'),
        client.from('periods').select('*'),
        client.from('attendance_daily').select('*'),
        client.from('leave_records').select('*'),
        client.from('leave_balance').select('*'),
        client.from('leave_applications').select('*'),
        client.from('announcements').select('*'),
      ]);

      return {
        success: true,
        data: {
          employees: (employees as any[]) || [],
          periods: (periods as any[]) || [],
          attendance: (attendance as any[]) || [],
          leaves: (leaves as any[]) || [],
          balances: (balances as any[]) || [],
          applications: (applications as any[]) || [],
          announcements: (announcements as any[]) || [],
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal sinkronisasi dari Supabase.' };
    }
  }

  /**
   * Push all current data to Supabase
   */
  static async pushToSupabase(payload: {
    employees: Employee[];
    periods: Period[];
    attendance: AttendanceDaily[];
    leaves: LeaveRecord[];
    balances: LeaveBalance[];
  }): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: 'Kredensial Supabase belum dikonfigurasi.' };
    }

    try {
      if (payload.periods.length) {
        await client.from('periods').upsert(payload.periods, { onConflict: 'id' });
      }
      if (payload.employees.length) {
        await client.from('employees').upsert(payload.employees, { onConflict: 'nik' });
      }
      if (payload.balances.length) {
        await client.from('leave_balance').upsert(payload.balances, { onConflict: 'nik,tahun' });
      }
      if (payload.leaves.length) {
        await client.from('leave_records').upsert(payload.leaves, { onConflict: 'nik,tanggal' });
      }
      if (payload.attendance.length) {
        // Upsert in batches of 200
        const batchSize = 200;
        for (let i = 0; i < payload.attendance.length; i += batchSize) {
          const batch = payload.attendance.slice(i, i + batchSize);
          await client.from('attendance_daily').upsert(batch, { onConflict: 'nik,tanggal' });
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengirim data ke Supabase.' };
    }
  }

  /**
   * Full SQL Schema string ready to run in Supabase SQL Editor
   */
  static getSqlSchemaScript(): string {
    return `-- =========================================================
-- SQL SCHEMA ABSENSIHUB / APLIKASI WEB ABSENSI KARYAWAN
-- Jalankan di SQL Editor Supabase (Dashboard -> SQL Editor -> New Query)
-- =========================================================

-- 1. TABEL EMPLOYEES
create table if not exists employees (
  nik text primary key,
  username text unique not null,
  nama text not null,
  nama_alias text,
  password_hash text default 'absensi123',
  grup_shift text,
  status text default 'aktif' check (status in ('aktif','resign','cuti_hamil')),
  role text default 'karyawan' check (role in ('karyawan','supervisor','hr')),
  atasan_nik text references employees(nik),
  email text,
  created_at timestamptz default now()
);

-- 2. TABEL PERIODS
create table if not exists periods (
  id text primary key,
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  label text not null
);

-- 3. TABEL ATTENDANCE_DAILY
create table if not exists attendance_daily (
  id text primary key,
  nik text not null references employees(nik) on delete cascade,
  tanggal date not null,
  hari text,
  jam_masuk text,
  jam_pulang text,
  shift_terdeteksi text,
  menit_telat int default 0,
  status_raw text,
  periode_id text not null references periods(id),
  imported_at timestamptz default now(),
  catatan text,
  unique (nik, tanggal)
);

-- 4. TABEL LEAVE_RECORDS
create table if not exists leave_records (
  id text primary key,
  nik text not null references employees(nik) on delete cascade,
  tanggal date not null,
  jenis text not null default 'izin_cuti_sakit',
  keterangan text,
  created_by text,
  created_at timestamptz default now(),
  unique (nik, tanggal)
);

-- 5. TABEL LEAVE_BALANCE
create table if not exists leave_balance (
  nik text not null references employees(nik) on delete cascade,
  tahun int not null default 2026,
  kuota int not null default 12,
  terpakai int not null default 0,
  primary key (nik, tahun)
);

-- 6. TABEL LEAVE_APPLICATIONS
create table if not exists leave_applications (
  id text primary key,
  nik text not null references employees(nik) on delete cascade,
  employee_name text not null,
  application_type text not null check (application_type in ('izin','cuti','sakit')),
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz default now()
);

-- 7. TABEL ANNOUNCEMENTS
create table if not exists announcements (
  id text primary key,
  title text not null,
  content text not null,
  created_by text default 'HR Management',
  created_at timestamptz default now()
);

-- AKTIFKAN ROW LEVEL SECURITY DENGAN AKSES BUKA UNTUK PUBLIC ANON (Portal Absensi)
alter table employees enable row level security;
alter table periods enable row level security;
alter table attendance_daily enable row level security;
alter table leave_records enable row level security;
alter table leave_balance enable row level security;
alter table leave_applications enable row level security;
alter table announcements enable row level security;

-- Policy Select & Insert/Update untuk Public Anon Key
drop policy if exists "Allow all on employees" on employees;
create policy "Allow all on employees" on employees for all using (true) with check (true);

drop policy if exists "Allow all on periods" on periods;
create policy "Allow all on periods" on periods for all using (true) with check (true);

drop policy if exists "Allow all on attendance_daily" on attendance_daily;
create policy "Allow all on attendance_daily" on attendance_daily for all using (true) with check (true);

drop policy if exists "Allow all on leave_records" on leave_records;
create policy "Allow all on leave_records" on leave_records for all using (true) with check (true);

drop policy if exists "Allow all on leave_balance" on leave_balance;
create policy "Allow all on leave_balance" on leave_balance for all using (true) with check (true);

drop policy if exists "Allow all on leave_applications" on leave_applications;
create policy "Allow all on leave_applications" on leave_applications for all using (true) with check (true);

drop policy if exists "Allow all on announcements" on announcements;
create policy "Allow all on announcements" on announcements for all using (true) with check (true);
`;
  }
}
