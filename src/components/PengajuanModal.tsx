import React from 'react';
import { GOOGLE_FORM_LINKS } from '../data/formLinks';
import {
  Calendar,
  Clock,
  HeartPulse,
  ExternalLink,
  X,
  FileText,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Employee } from '../types/attendance';

interface PengajuanModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee;
  onRefreshData?: () => void;
}

export const PengajuanModal: React.FC<PengajuanModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'cuti':
        return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'kjk_psw':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'izin_sakit':
        return <HeartPulse className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50/70 hover:bg-emerald-100/70',
          border: 'border-emerald-200 hover:border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/70 hover:bg-amber-100/70',
          border: 'border-amber-200 hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-50/70 hover:bg-blue-100/70',
          border: 'border-blue-200 hover:border-blue-300',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-700/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pusat Pengajuan Online (Google Form)
              </h3>
              <p className="text-xs text-slate-500">
                Layanan permohonan resmi kehadiran, perizinan, dan cuti karyawan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Petunjuk Pengajuan:</span> Silakan
            pilih salah satu formulir resmi Google Form di bawah ini sesuai permohonan Anda. Setelah diisi, data otomatis masuk ke HR untuk direkonsiliasi dengan rekap absensi mesin periode 26–25.
          </div>
        </div>

        {/* 3 Form Cards */}
        <div className="grid grid-cols-1 gap-3.5">
          {GOOGLE_FORM_LINKS.map((item) => {
            const colors = getColorClasses(item.color);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${colors.border} ${colors.bg} relative group`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200/70 shrink-0">
                      {getIcon(item.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {item.examples.map((ex, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200/60 font-medium"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0 pt-2 sm:pt-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all ${colors.button}`}
                    >
                      <span>Buka Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Terhubung langsung dengan respon HR & Rekap Periode 26–25
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
