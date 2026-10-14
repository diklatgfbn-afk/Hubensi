import React, { useState } from 'react';
import { Employee } from '../types/attendance';
import {
  Fingerprint,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ParticleBackground } from '../components/ParticleBackground';

interface LoginViewProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ employees, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const found = employees.find(
        (emp) =>
          emp.username.toLowerCase() === cleanUsername ||
          emp.nama.toLowerCase() === cleanUsername ||
          emp.nik.toLowerCase() === cleanUsername
      );

      if (!found) {
        setIsLoading(false);
        setError('Nama, username, atau NIK tidak terdaftar di sistem.');
        return;
      }

      if (password !== 'absensi123' && password !== found.password_hash) {
        setIsLoading(false);
        setError('Kata sandi salah. Password bawaan seluruh karyawan adalah: absensi123');
        return;
      }

      setIsLoading(false);
      onLogin(found);
    }, 400);
  };

  const handleQuickLogin = (uname: string) => {
    const found = employees.find((emp) => emp.username === uname);
    if (found) {
      onLogin(found);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Interactive Background Layer */}
      <ParticleBackground />

      {/* Top Header */}
      <header className="relative z-10 w-full py-5 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/25">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
              AbsensiHub
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Enterprise Portal 26–25</span>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
          Sistem Rekapitulasi Excel
        </span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md">
          {/* Decorative ambient aura */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Login Card */}
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl border border-slate-200/80 shadow-xl p-8 sm:p-10 transition-shadow duration-300 hover:shadow-2xl">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Portal Absensi Karyawan
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Masuk ke akun Anda untuk meninjau data absensi, keterlambatan, dan sisa cuti periode 26–25
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Username / Nama / NIK
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: maruf, wakit, lisna"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-white/90 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-blue-700 font-medium">
                    Default: absensi123
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-11 bg-white/90 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-600 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                  Ingat sesi saya di perangkat ini
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-700/25 hover:shadow-xl hover:shadow-blue-700/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Testing Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Akses Cepat Pengujian:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('maruf')}
                  className="p-2.5 text-left border border-slate-200/90 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-700">MARUF (HR)</div>
                  <div className="text-[10px] text-slate-500">Super Admin HR</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('wakit')}
                  className="p-2.5 text-left border border-slate-200/90 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700">WAKIT (SPV)</div>
                  <div className="text-[10px] text-slate-500">Supervisor Tim</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('lisna')}
                  className="p-2.5 text-left border border-slate-200/90 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-700">LISNA</div>
                  <div className="text-[10px] text-slate-500">Karyawan Grup A</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('gupita')}
                  className="p-2.5 text-left border border-slate-200/90 rounded-xl hover:border-rose-500 hover:bg-rose-50/50 transition-all group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-rose-700">GUPITA</div>
                  <div className="text-[10px] text-slate-500">Status Cuti Hamil</div>
                </button>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-5 text-center text-[11px] text-slate-400">
              Dilindungi enkripsi sesi &amp; aturan toleransi mesin 5 menit
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 px-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 bg-white/40 backdrop-blur-md">
        <p>&copy; 2026 AbsensiHub Enterprise · Rekapitulasi Periode 26–25</p>
        <div className="flex gap-4">
          <span className="text-slate-400">Bantuan IT: Helpdesk Internal</span>
        </div>
      </footer>
    </div>
  );
};
