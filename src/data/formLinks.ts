export interface GoogleFormLink {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  url: string;
  category: 'cuti' | 'kjk_psw' | 'izin_sakit';
  color: 'emerald' | 'amber' | 'blue';
  examples: string[];
}

export const GOOGLE_FORM_LINKS: GoogleFormLink[] = [
  {
    id: 'form-cuti',
    title: 'Pengajuan Cuti',
    shortTitle: '1. Form Cuti',
    badge: 'Cuti Tahunan / Melahirkan',
    description:
      'Gunakan formulir ini untuk mengajukan cuti tahunan (kuota 12 hari/tahun), cuti melahirkan/hamil, atau cuti alasan penting.',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdJQc7h8Bg64-rInwH2bAW355CUFAoDclkowhrOysygsVEhcA/viewform',
    category: 'cuti',
    color: 'emerald',
    examples: ['Cuti Tahunan', 'Cuti Melahirkan', 'Cuti Alasan Penting'],
  },
  {
    id: 'form-kjk-psw',
    title: 'Pengajuan KJK & PSW',
    shortTitle: '2. Form KJK, PSW',
    badge: 'Keluar di Jam Kerja / Pulang Sebelum Waktunya',
    description:
      'Gunakan formulir ini untuk permohonan KJK (Keluar di Jam Kerja) dan PSW (Pulang Sebelum Waktunya).',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSchWqi65oF5pOFLQCFR_oEen5SFwict35zwHZbuy_X8UBpTvw/viewform',
    category: 'kjk_psw',
    color: 'amber',
    examples: ['KJK (Keluar di Jam Kerja)', 'PSW (Pulang Sebelum Waktunya)'],
  },
  {
    id: 'form-izin-sakit',
    title: 'Pengajuan Izin & Sakit',
    shortTitle: '3. Form Izin & Sakit',
    badge: 'Izin Tidak Masuk / Sakit',
    description:
      'Gunakan formulir ini untuk pemberitahuan izin tidak masuk kerja karena urusan mendesak atau ketidakhadiran karena kondisi sakit.',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeSIM2unCogTNQDrbo9r0LLqTuZYNzrYfnq5lMbVVjRZ_H1yw/viewform',
    category: 'izin_sakit',
    color: 'blue',
    examples: ['Izin Tidak Masuk', 'Sakit Tanpa Surat Dokter', 'Sakit dengan Surat Dokter'],
  },
];
