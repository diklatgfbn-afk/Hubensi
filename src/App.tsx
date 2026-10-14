/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Employee,
  Period,
  AttendanceDaily,
  LeaveRecord,
  LeaveBalance,
  LeaveApplication,
  Announcement,
  AppNotification,
} from './types/attendance';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { ShiftInfoModal } from './components/ShiftInfoModal';
import { LoginView } from './views/LoginView';
import { KaryawanDashboard } from './views/KaryawanDashboard';
import { SupervisorDashboard } from './views/SupervisorDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { SupabaseModal } from './components/SupabaseModal';
import { Lock, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<'karyawan' | 'supervisor' | 'hr'>('karyawan');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('2026-09');
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceDaily[]>([]);
  const [leavesData, setLeavesData] = useState<LeaveRecord[]>([]);
  const [balancesData, setBalancesData] = useState<LeaveBalance[]>([]);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all initial data from storage service
  const refreshAllData = useCallback(() => {
    const emps = StorageService.getEmployees();
    const pers = StorageService.getPeriods();
    const att = StorageService.getAttendance();
    const leaves = StorageService.getLeaves();
    const bals = StorageService.getBalances();
    const user = StorageService.getCurrentUser();
    const apps = StorageService.getApplications();
    const anns = StorageService.getAnnouncements();
    const notifs = StorageService.getNotifications();

    setAllEmployees(emps);
    setPeriods(pers);
    setAttendanceData(att);
    setLeavesData(leaves);
    setBalancesData(bals);
    setCurrentUser(user);
    setApplications(apps);
    setAnnouncements(anns);
    setNotifications(notifs);

    if (user) {
      if (user.role === 'hr') {
        setCurrentView('hr');
      } else if (user.role === 'supervisor') {
        setCurrentView('supervisor');
      } else {
        setCurrentView('karyawan');
      }
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Login handler
  const handleLogin = (employee: Employee) => {
    StorageService.setCurrentUser(employee);
    setCurrentUser(employee);

    if (employee.role === 'hr') {
      setCurrentView('hr');
    } else if (employee.role === 'supervisor') {
      setCurrentView('supervisor');
    } else {
      setCurrentView('karyawan');
    }
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleMarkNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
  };

  // Change password submission
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentUser) return;

    if (oldPassword !== 'absensi123' && oldPassword !== currentUser.password_hash) {
      setPasswordFeedback({ type: 'error', text: 'Password lama tidak sesuai.' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordFeedback({ type: 'error', text: 'Password baru minimal 4 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    // Update password
    const emps = StorageService.getEmployees();
    const idx = emps.findIndex((e) => e.nik === currentUser.nik);
    if (idx >= 0) {
      emps[idx].password_hash = newPassword;
      StorageService.setEmployees(emps);
      StorageService.setCurrentUser(emps[idx]);
      setCurrentUser(emps[idx]);
    }

    setPasswordFeedback({ type: 'success', text: 'Password berhasil diubah!' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback(null);
    }, 1200);
  };

  // Get supervisor name of current user
  const currentSupervisorName = useMemo(() => {
    if (!currentUser || !currentUser.atasan_nik) return undefined;
    const sup = allEmployees.find((e) => e.nik === currentUser.atasan_nik);
    return sup ? sup.nama : undefined;
  }, [currentUser, allEmployees]);

  // If no user is logged in, show LoginView
  if (!currentUser) {
    return <LoginView employees={allEmployees} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Navigation matching AbsensiHub */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenShiftInfo={() => setIsShiftModalOpen(true)}
        onLogout={handleLogout}
        allEmployees={allEmployees}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkNotificationsRead}
        onChangePasswordClick={() => setShowPasswordModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'karyawan' && (
          <KaryawanDashboard
            employee={currentUser}
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelectPeriod={setSelectedPeriodId}
            attendanceData={attendanceData}
            leavesData={leavesData}
            balancesData={balancesData}
            supervisorName={currentSupervisorName}
            onOpenShiftInfo={() => setIsShiftModalOpen(true)}
            applications={applications}
            onRefreshData={refreshAllData}
          />
        )}

        {currentView === 'supervisor' && (
          <SupervisorDashboard
            currentSupervisor={currentUser}
            allEmployees={allEmployees}
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelectPeriod={setSelectedPeriodId}
            attendanceData={attendanceData}
            leavesData={leavesData}
            balancesData={balancesData}
            onOpenShiftInfo={() => setIsShiftModalOpen(true)}
          />
        )}

        {currentView === 'hr' && (
          <AdminDashboard
            currentHR={currentUser}
            allEmployees={allEmployees}
            periods={periods}
            selectedPeriodId={selectedPeriodId}
            onSelectPeriod={setSelectedPeriodId}
            attendanceData={attendanceData}
            leavesData={leavesData}
            balancesData={balancesData}
            applications={applications}
            announcements={announcements}
            onRefreshData={refreshAllData}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-700">AbsensiHub Enterprise · Periode 26–25</span>
          <span className="text-slate-400">
            Sistem Informasi Presensi &amp; Rekonsiliasi Otomatis Mesin Absen Excel
          </span>
        </div>
      </footer>

      {/* Shift Rules & Policies Modal */}
      <ShiftInfoModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />

      {/* Supabase Integration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncComplete={refreshAllData}
      />

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ganti Kata Sandi</h3>
                  <p className="text-[11px] text-slate-500">Perbarui kredensial akun Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {passwordFeedback.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password lama (default: absensi123)"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 4 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 shadow-xs"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
