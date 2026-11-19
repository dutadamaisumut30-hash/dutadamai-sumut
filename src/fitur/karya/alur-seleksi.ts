// Tujuh baris tampilan alur Kirim Karya (rancangan halaman 6) dengan keputusan di cabang:
// 1 formulir, 2 cek otomatis, 3 antrean redaksi, 4 layak terbit?,
// 5a redaksi menghubungi kontak (sebelum terbit), 5b dikembalikan dengan catatan, 6 terbit.
// Tahap "ditolak" tidak tampil di alur, tapi menentukan mulai retensi kontak 30 hari (ADR 005).

export const TAHAP_KARYA = ['formulir', 'antrean', 'keputusan', 'dihubungi', 'dikembalikan', 'terbit', 'ditolak'] as const;
export type TahapKarya = (typeof TAHAP_KARYA)[number];
export type StatusLangkah = 'selesai' | 'aktif' | 'belum' | 'cabang';

export type IdLangkah = '1' | '2' | '3' | '4' | '5a' | '5b' | '6';
export const ID_LANGKAH: IdLangkah[] = ['1', '2', '3', '4', '5a', '5b', '6'];

export interface LangkahSeleksi {
  id: IdLangkah;
  label: string;
  status: StatusLangkah;
}

const LABEL: Record<IdLangkah, string> = {
  '1': 'Formulir terkirim',
  '2': 'Cek otomatis spam dan file',
  '3': 'Antrean redaksi, dinilai editor',
  '4': 'Layak terbit?',
  '5a': 'Redaksi menghubungi kontakmu',
  '5b': 'Dikembalikan dengan catatan',
  '6': 'Terbit di rubrik Karya Pelajar',
};

const TABEL: Record<TahapKarya, { selesai: IdLangkah[]; aktif: IdLangkah | null }> = {
  formulir: { selesai: ['1'], aktif: '2' },
  antrean: { selesai: ['1', '2'], aktif: '3' },
  keputusan: { selesai: ['1', '2', '3'], aktif: '4' },
  dihubungi: { selesai: ['1', '2', '3', '4'], aktif: '5a' },
  dikembalikan: { selesai: ['1', '2', '3', '4'], aktif: '5b' },
  terbit: { selesai: ['1', '2', '3', '4', '5a', '6'], aktif: null },
  ditolak: { selesai: ['1', '2', '3', '4'], aktif: null },
};

/** Daftar langkah tanpa status, dipakai saat data tahap belum tersedia dari database. */
export function daftarLangkah(): { id: IdLangkah; label: string }[] {
  return ID_LANGKAH.map((id) => ({ id, label: LABEL[id] }));
}

export function progresKarya(tahap: TahapKarya): LangkahSeleksi[] {
  const { selesai, aktif } = TABEL[tahap];
  return ID_LANGKAH.map((id) => {
    let status: StatusLangkah;
    if (selesai.includes(id)) status = 'selesai';
    else if (aktif === id) status = 'aktif';
    else status = id === '5b' ? 'cabang' : 'belum';
    return { id, label: LABEL[id], status };
  });
}

export function karyaBolehDikirimUlang(tahap: TahapKarya): boolean {
  return tahap === 'dikembalikan';
}
