// Enam langkah alur Kirim Karya (rancangan halaman 6) dengan satu keputusan:
// 1 formulir, 2 cek otomatis, 3 antrean redaksi, 4 layak terbit?,
// 5a redaksi menghubungi kontak (ya), 5b dikembalikan dengan catatan (tidak), 6 terbit.

export type TahapKarya = 'formulir' | 'antrean' | 'keputusan' | 'dihubungi' | 'dikembalikan' | 'terbit';
export type StatusLangkah = 'selesai' | 'aktif' | 'belum' | 'cabang';

export interface LangkahSeleksi {
  id: '1' | '2' | '3' | '4' | '5a' | '5b' | '6';
  label: string;
  status: StatusLangkah;
}

const LABEL: Record<LangkahSeleksi['id'], string> = {
  '1': 'Formulir terkirim',
  '2': 'Cek otomatis spam dan file',
  '3': 'Antrean redaksi, dinilai editor',
  '4': 'Layak terbit?',
  '5a': 'Redaksi menghubungi kontakmu',
  '5b': 'Dikembalikan dengan catatan',
  '6': 'Terbit di rubrik Karya Pelajar',
};

const TABEL: Record<TahapKarya, { selesai: LangkahSeleksi['id'][]; aktif: LangkahSeleksi['id'] | null }> = {
  formulir: { selesai: ['1'], aktif: '2' },
  antrean: { selesai: ['1', '2'], aktif: '3' },
  keputusan: { selesai: ['1', '2', '3'], aktif: '4' },
  dihubungi: { selesai: ['1', '2', '3', '4'], aktif: '5a' },
  dikembalikan: { selesai: ['1', '2', '3', '4'], aktif: '5b' },
  terbit: { selesai: ['1', '2', '3', '4', '5a', '6'], aktif: null },
};

export function progresKarya(tahap: TahapKarya): LangkahSeleksi[] {
  const { selesai, aktif } = TABEL[tahap];
  const ids: LangkahSeleksi['id'][] = ['1', '2', '3', '4', '5a', '5b', '6'];
  return ids.map((id) => {
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
