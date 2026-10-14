import React from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

interface ShiftInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftInfoModal: React.FC<ShiftInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Aturan Jam Kerja & Ketentuan Absensi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kebijakan operasional shift dan cuti tahunan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          {/* Shift Groups */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Grup Jadwal Kerja (Shift)
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Grup A</div>
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">Senin – Jumat:</span> 07:30 – 15:30 WIB<br />
                  <span className="font-medium text-slate-800">Sabtu:</span> 07:30 – 15:00 WIB
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Anggota: WAKIT, LISNA, WULAN, YUNITA, GUPITA, PRISCA, WASIS, PUJI, RAHMAN, RIKA, ANJAS, SHARA, RIFAH, DIKA, TYAS, MARUF, AZMI, dhila, endah, huda, rizky, zulfi, icha.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Grup B</div>
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">Senin – Jumat:</span> Pagi 06:00 – 14:00 WIB / Siang 09:00 – 17:00 WIB<br />
                  <span className="font-medium text-slate-800">Sabtu:</span> Pagi 06:00 – 14:00 WIB / Siang 08:00 – 16:00 WIB
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Anggota: PRAS, cesar.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">Grup C</div>
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">Selasa & Kamis:</span> Pagi 07:30 – 15:30 WIB / Siang 09:00 – 16:00 WIB<br />
                  <span className="font-medium text-slate-800">Senin, Rabu, Jumat:</span> 07:30 – 15:30 WIB<br />
                  <span className="font-medium text-slate-800">Sabtu:</span> 07:30 – 15:00 WIB
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Anggota: MAYA, CITRA, ROSSY, fifi, FARDA, SITA, devi, jihan, PUPUT, FINA, LINA, wulan n, nur.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-700 mb-1">Belum Dikonfirmasi</div>
                <div className="text-[11px] text-slate-500">
                  TITIK, naufal, siti (dalam proses penugasan oleh HR).
                </div>
              </div>
            </div>
          </div>

          {/* Tolerance & Special Rules */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Aturan Toleransi & Kebijakan Khusus
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">Toleransi Keterlambatan:</strong> Keterlambatan masuk hingga <strong>5 menit (≤ 5 menit)</strong> masuk dalam masa toleransi tanpa dikenakan pinalti. Keterlambatan di atas 5 menit dihitung sebagai pelanggaran jam masuk.
              </li>
              <li>
                <strong className="text-slate-800">Bulan Ramadan:</strong> Jam pulang dimajukan 1 jam lebih awal tanpa dikenakan sanksi absensi.
              </li>
              <li>
                <strong className="text-slate-800">Absen Pulang:</strong> Tidak wajib absen pulang jika ada penugasan luar, tanpa dikenakan sanksi.
              </li>
              <li>
                <strong className="text-slate-800">Potongan Finansial (Rp):</strong> Tidak ditampilkan pada portal publik/karyawan (hanya rekap menit & hari).
              </li>
            </ul>
          </div>

          {/* Leave Quota Rules */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Ketentuan Hak Cuti & Izin
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">Kuota Cuti Tahunan:</strong> 12 hari kerja per tahun kalender (Januari – Desember 2026).
              </li>
              <li>
                <strong className="text-slate-800">Cuti Melahirkan/Hamil:</strong> Mengurangi kuota cuti tahunan (seperti pada status cuti hamil Gupita).
              </li>
              <li>
                <strong className="text-slate-800">Status Rekonsiliasi:</strong> Hari yang terdaftar izin/cuti/sakit otomatis berstatus <em>Izin / Cuti / Sakit</em> meskipun karyawan tidak sengaja melakukan scan absensi mesin.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
