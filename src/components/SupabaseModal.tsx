import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { StorageService } from '../services/storageService';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = SupabaseService.getConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'URL Supabase dan Anon Key wajib diisi.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const result = await SupabaseService.testConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      SupabaseService.setConfig({ url, anonKey });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SupabaseService.getSqlSchemaScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushData = async () => {
    if (!url || !anonKey) {
      alert('Harap masukkan kredensial Supabase terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    const payload = {
      employees: StorageService.getEmployees(),
      periods: StorageService.getPeriods(),
      attendance: StorageService.getAttendance(),
      leaves: StorageService.getLeaves(),
      balances: StorageService.getBalances(),
    };

    const res = await SupabaseService.pushToSupabase(payload);
    setIsSyncing(false);
    if (res.success) {
      alert('Berhasil mengunggah seluruh data (41 karyawan, periode, dan absensi) ke database Supabase!');
      onSyncComplete();
    } else {
      alert(`Gagal mengirim data: ${res.error}. Pastikan tabel SQL sudah dibuat di Supabase SQL Editor.`);
    }
  };

  const handlePullData = async () => {
    setIsSyncing(true);
    const res = await SupabaseService.pullFromSupabase();
    setIsSyncing(false);
    if (res.success && res.data) {
      if (res.data.employees.length) StorageService.setEmployees(res.data.employees);
      if (res.data.periods.length) StorageService.setPeriods(res.data.periods);
      if (res.data.attendance.length) StorageService.setAttendance(res.data.attendance);
      if (res.data.leaves.length) StorageService.setLeaves(res.data.leaves);
      if (res.data.balances.length) StorageService.setBalances(res.data.balances);
      alert('Berhasil mengambil data terbaru dari Supabase!');
      onSyncComplete();
    } else {
      alert(`Gagal sinkronisasi data: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Integrasi Database Cloud (Supabase)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sinkronisasi data terpusat secara real-time antar semua perangkat karyawan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Guide Steps */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Langkah Singkat Pengaturan:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Buka <strong>supabase.com</strong> dan buat project gratis (Free tier).</li>
              <li>Di Dashboard Supabase $\rightarrow$ <strong>Project Settings</strong> $\rightarrow$ <strong>API</strong>, salin <em>Project URL</em> dan <em>anon public key</em>.</li>
              <li>Buka <strong>SQL Editor</strong> di Supabase, salin script SQL di bawah ini dan klik <strong>Run</strong>.</li>
            </ol>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project URL Supabase
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value.trim())}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Anon Public Key (anon key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value.trim())}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isTesting ? 'Menguji...' : 'Tes & Simpan Kredensial'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* SQL Schema Copy Button */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Script SQL Schema Database</p>
                <p className="text-[11px] text-slate-400">Tabel: employees, attendance_daily, leave_records, dll.</p>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL Schema</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Data Sync Actions */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="font-semibold text-slate-900">Aksi Sinkronisasi Data:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePushData}
                disabled={isSyncing}
                className="p-3 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all"
              >
                <UploadCloud className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="font-bold text-slate-900">Upload Data ke Cloud</div>
                <div className="text-[10px] text-slate-500">Kirim 41 data karyawan ke Supabase</div>
              </button>

              <button
                type="button"
                onClick={handlePullData}
                disabled={isSyncing}
                className="p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all"
              >
                <DownloadCloud className="w-5 h-5 text-blue-600 mb-1" />
                <div className="font-bold text-slate-900">Tarik Data dari Cloud</div>
                <div className="text-[10px] text-slate-500">Ambil data terbaru dari Supabase</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
