import React, { useState } from 'react';
import { Employee, AppNotification } from '../types/attendance';
import {
  Fingerprint,
  Bell,
  Clock,
  LogOut,
  User,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Lock,
  ChevronDown,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentUser: Employee;
  currentView: 'karyawan' | 'supervisor' | 'hr';
  onNavigate: (view: 'karyawan' | 'supervisor' | 'hr') => void;
  onOpenShiftInfo: () => void;
  onLogout: () => void;
  allEmployees: Employee[];
  notifications: AppNotification[];
  onMarkAllNotificationsRead: () => void;
  onChangePasswordClick: () => void;
  onOpenPengajuanModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenShiftInfo,
  onLogout,
  allEmployees,
  notifications,
  onMarkAllNotificationsRead,
  onChangePasswordClick,
  onOpenPengajuanModal,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const roleLabel = {
    karyawan: 'Karyawan',
    supervisor: 'Supervisor Tim',
    hr: 'Super Admin HR',
  }[currentUser.role];

  // Helper for avatar initials
  const initials = currentUser.nama
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Palette color based on name
  const palette = ['#1e40af', '#059669', '#6366f1', '#0ea5e9', '#d97706'];
  const avatarBg = palette[currentUser.nik.charCodeAt(currentUser.nik.length - 1) % palette.length];

  return (
    <header className="no-print bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  AbsensiHub
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                  Periode 26–25
                </span>
              </div>
              <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {currentUser.role === 'hr' ? 'HR & Payroll Portal' : 'Employee Portal'}
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-semibold">
            <button
              onClick={() => onNavigate('karyawan')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                currentView === 'karyawan'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Presensi Saya</span>
            </button>

            {(currentUser.role === 'supervisor' || currentUser.role === 'hr') && (
              <button
                onClick={() => onNavigate('supervisor')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentView === 'supervisor'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Rekap Tim</span>
              </button>
            )}

            {currentUser.role === 'hr' && (
              <button
                onClick={() => onNavigate('hr')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentView === 'hr'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin HR</span>
              </button>
            )}

            <button
              onClick={onOpenShiftInfo}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 rounded-lg hover:bg-slate-100/60"
              title="Ketentuan jadwal shift dan aturan toleransi"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Aturan Shift</span>
            </button>

            {onOpenPengajuanModal && (
              <button
                onClick={onOpenPengajuanModal}
                className="px-2.5 py-1.5 text-blue-700 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-colors flex items-center gap-1.5 rounded-xl cursor-pointer"
                title="Buka Formulir Pengajuan Cuti, KJK/PSW, Izin & Sakit (Google Form)"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Form Pengajuan</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Sync Status Pill */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift: {currentUser.grup_shift ? `Grup ${currentUser.grup_shift}` : 'Reguler'}</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">Notifikasi Sistem</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-blue-700 hover:underline font-medium"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">Tidak ada notifikasi</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 transition-colors ${n.is_read ? 'bg-white' : 'bg-blue-50/40'}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                              {n.type === 'success' ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              ) : n.type === 'warning' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: avatarBg }}
                >
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.nama}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-tight">
                    {currentUser.nik}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-500">{roleLabel} · {currentUser.nik}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Shift {currentUser.grup_shift ? `Grup ${currentUser.grup_shift}` : 'Belum Dikonfirmasi'}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    {onOpenPengajuanModal && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenPengajuanModal();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-700" />
                          <span>Form Pengajuan (Google Form)</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onChangePasswordClick();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ganti Kata Sandi</span>
                    </button>

                    <hr className="my-1 border-slate-100" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
