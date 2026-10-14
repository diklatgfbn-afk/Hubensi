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
  AppNotification,
} from '../types/attendance';
import {
  SEED_EMPLOYEES,
  SEED_PERIODS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_RECORDS,
  INITIAL_LEAVE_BALANCES,
} from '../data/seedData';
import { expandDateRange } from './reconciliationService';

const STORAGE_KEYS = {
  EMPLOYEES: 'absensi_employees_v1',
  PERIODS: 'absensi_periods_v1',
  ATTENDANCE: 'absensi_attendance_v1',
  LEAVES: 'absensi_leaves_v1',
  BALANCES: 'absensi_balances_v1',
  CURRENT_USER: 'absensi_current_user_v1',
  APPLICATIONS: 'absensi_applications_v1',
  ANNOUNCEMENTS: 'absensi_announcements_v1',
  NOTIFICATIONS: 'absensi_notifications_v1',
};

const INITIAL_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'app-1',
    nik: 'NIK003',
    employee_name: 'PUPUT',
    application_type: 'sakit',
    start_date: '2026-09-10',
    end_date: '2026-09-11',
    reason: 'Sakit demam, surat keterangan dokter terlampir',
    status: 'approved',
    admin_note: 'Disetujui oleh HRD (Surat Dokter Valid)',
    created_at: '2026-09-09T08:30:00Z',
  },
  {
    id: 'app-2',
    nik: 'NIK002',
    employee_name: 'LISNA',
    application_type: 'izin',
    start_date: '2026-09-15',
    end_date: '2026-09-15',
    reason: 'Keperluan keluarga mendesak di luar kota',
    status: 'approved',
    admin_note: 'Disetujui oleh HRD',
    created_at: '2026-09-14T09:00:00Z',
  },
  {
    id: 'app-3',
    nik: 'NIK006',
    employee_name: 'PRAS',
    application_type: 'cuti',
    start_date: '2026-10-18',
    end_date: '2026-10-19',
    reason: 'Cuti tahunan untuk renovasi rumah',
    status: 'pending',
    created_at: '2026-10-10T11:20:00Z',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Ketentuan Jam Kerja Bulan Ramadan & Penyesuaian Pulang',
    content: 'Diberitahukan kepada seluruh karyawan bahwa selama bulan Ramadan jam kepulangan dimajukan 1 jam lebih awal tanpa dikenakan sanksi absensi. Tetap jaga produktivitas.',
    created_by: 'HR Management',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Reminder Siklus Rekap Absensi Periode 26–25',
    content: 'Batas akhir pengajuan perizinan dan koreksi absensi untuk siklus berjalan adalah tanggal 25 setiap bulannya untuk validasi rekapitulasi HR.',
    created_by: 'HR Management',
    created_at: '2026-09-20T10:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Sinkronisasi Absensi Berhasil',
    message: 'Data absensi mesin siklus 26 Agu – 25 Sep 2026 telah berhasil direkonsiliasi.',
    type: 'success',
    is_read: false,
    created_at: '2026-09-26T07:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'Pengajuan Cuti Disetujui',
    message: 'Pengajuan cuti/sakit untuk NIK003 (PUPUT) telah disetujui HRD.',
    type: 'info',
    is_read: false,
    created_at: '2026-09-10T10:00:00Z',
  },
];

export class StorageService {
  static getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      this.setEmployees(SEED_EMPLOYEES);
      return SEED_EMPLOYEES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_EMPLOYEES;
    }
  }

  static setEmployees(employees: Employee[]) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  static getPeriods(): Period[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIODS);
    if (!raw) {
      this.setPeriods(SEED_PERIODS);
      return SEED_PERIODS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PERIODS;
    }
  }

  static setPeriods(periods: Period[]) {
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
  }

  static getAttendance(): AttendanceDaily[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      this.setAttendance(INITIAL_ATTENDANCE);
      return INITIAL_ATTENDANCE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  }

  static setAttendance(attendance: AttendanceDaily[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }

  static getLeaves(): LeaveRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!raw) {
      this.setLeaves(INITIAL_LEAVE_RECORDS);
      return INITIAL_LEAVE_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LEAVE_RECORDS;
    }
  }

  static setLeaves(leaves: LeaveRecord[]) {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  }

  static getBalances(): LeaveBalance[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BALANCES);
    if (!raw) {
      this.setBalances(INITIAL_LEAVE_BALANCES);
      return INITIAL_LEAVE_BALANCES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LEAVE_BALANCES;
    }
  }

  static setBalances(balances: LeaveBalance[]) {
    localStorage.setItem(STORAGE_KEYS.BALANCES, JSON.stringify(balances));
  }

  static getCurrentUser(): Employee | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Default to supervisor 'wakit' or HR 'maruf' for immediate testing if not logged in
      const defaultUser = SEED_EMPLOYEES.find((e) => e.username === 'wakit') || SEED_EMPLOYEES[0];
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: Employee | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  /**
   * Upsert attendance daily records (match by nik and tanggal)
   */
  static upsertAttendance(newRecords: AttendanceDaily[]) {
    const existing = this.getAttendance();
    const map = new Map<string, AttendanceDaily>();

    existing.forEach((r) => {
      map.set(`${r.nik}__${r.tanggal}`, r);
    });

    newRecords.forEach((r) => {
      map.set(`${r.nik}__${r.tanggal}`, r);
    });

    const updated = Array.from(map.values());
    this.setAttendance(updated);
    return updated;
  }

  /**
   * Input leave / cuti per date range. Splits per date automatically (PRD Section 7.5 & 8.3)
   */
  static addLeaveRange(
    nik: string,
    startDateStr: string,
    endDateStr: string,
    keterangan: string,
    createdBy: string = 'HR Admin'
  ): { addedCount: number; dates: string[] } {
    const dates = expandDateRange(startDateStr, endDateStr);
    const leaves = this.getLeaves();
    const existingMap = new Map<string, LeaveRecord>();

    leaves.forEach((l) => existingMap.set(`${l.nik}__${l.tanggal}`, l));

    let addedCount = 0;
    const now = new Date().toISOString();

    dates.forEach((tgl) => {
      const key = `${nik}__${tgl}`;
      existingMap.set(key, {
        id: `leave-${nik}-${tgl}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nik,
        tanggal: tgl,
        jenis: 'izin_cuti_sakit',
        keterangan: keterangan || 'Izin / Cuti / Sakit',
        created_by: createdBy,
        created_at: now,
      });
      addedCount++;
    });

    const updated = Array.from(existingMap.values());
    this.setLeaves(updated);
    return { addedCount, dates };
  }

  /**
   * Delete leave record by ID
   */
  static deleteLeaveRecord(id: string) {
    const leaves = this.getLeaves().filter((l) => l.id !== id);
    this.setLeaves(leaves);
    return leaves;
  }

  /**
   * Update leave quota for an employee in a given year
   */
  static updateLeaveQuota(nik: string, year: number, newQuota: number) {
    const balances = this.getBalances();
    const idx = balances.findIndex((b) => b.nik === nik && b.tahun === year);
    if (idx >= 0) {
      balances[idx].kuota = newQuota;
    } else {
      balances.push({
        nik,
        tahun: year,
        kuota: newQuota,
        terpakai: 0,
      });
    }
    this.setBalances(balances);
  }

  /**
   * Update employee details (shift group, status, role, atasan_nik)
   */
  static updateEmployee(
    nik: string,
    patch: Partial<{
      nama: string;
      nama_alias: string | null;
      grup_shift: ShiftGroup;
      status: EmployeeStatus;
      role: UserRole;
      atasan_nik: string | null;
    }>
  ) {
    const emps = this.getEmployees();
    const idx = emps.findIndex((e) => e.nik === nik);
    if (idx >= 0) {
      emps[idx] = { ...emps[idx], ...patch };
      this.setEmployees(emps);

      // If current user is the one updated, sync session
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.nik === nik) {
        this.setCurrentUser(emps[idx]);
      }
    }
  }

  static getApplications(): LeaveApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      this.setApplications(INITIAL_APPLICATIONS);
      return INITIAL_APPLICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  static setApplications(apps: LeaveApplication[]) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  }

  static addApplication(app: Omit<LeaveApplication, 'id' | 'created_at' | 'status'>): LeaveApplication {
    const apps = this.getApplications();
    const newApp: LeaveApplication = {
      ...app,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    apps.unshift(newApp);
    this.setApplications(apps);
    return newApp;
  }

  static updateApplicationStatus(id: string, status: 'approved' | 'rejected', adminNote?: string) {
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx >= 0) {
      apps[idx].status = status;
      if (adminNote) apps[idx].admin_note = adminNote;
      this.setApplications(apps);

      // If approved, automatically insert into leave records!
      if (status === 'approved') {
        const app = apps[idx];
        this.addLeaveRange(app.nik, app.start_date, app.end_date, `${app.application_type.toUpperCase()}: ${app.reason}`);
      }
    }
    return apps;
  }

  static deleteApplication(id: string) {
    const apps = this.getApplications().filter((a) => a.id !== id);
    this.setApplications(apps);
    return apps;
  }

  static getAnnouncements(): Announcement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!raw) {
      this.setAnnouncements(INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  static setAnnouncements(announcements: Announcement[]) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }

  static addAnnouncement(title: string, content: string, createdBy: string = 'HR Management') {
    const list = this.getAnnouncements();
    const item: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    };
    list.unshift(item);
    this.setAnnouncements(list);
    return list;
  }

  static deleteAnnouncement(id: string) {
    const list = this.getAnnouncements().filter((a) => a.id !== id);
    this.setAnnouncements(list);
    return list;
  }

  static getNotifications(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      this.setNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  static setNotifications(notifs: AppNotification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static markAllNotificationsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, is_read: true }));
    this.setNotifications(notifs);
    return notifs;
  }

  /**
   * Reset all data back to clean initial seed data
   */
  static resetToSeed() {
    this.setEmployees(SEED_EMPLOYEES);
    this.setPeriods(SEED_PERIODS);
    this.setAttendance(INITIAL_ATTENDANCE);
    this.setLeaves(INITIAL_LEAVE_RECORDS);
    this.setBalances(INITIAL_LEAVE_BALANCES);
    this.setApplications(INITIAL_APPLICATIONS);
    this.setAnnouncements(INITIAL_ANNOUNCEMENTS);
    this.setNotifications(INITIAL_NOTIFICATIONS);
    this.setCurrentUser(SEED_EMPLOYEES[0]);
  }
}
