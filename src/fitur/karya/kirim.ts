// Validasi formulir Kirim Karya. Dipakai di browser (langkah 2 dan 3) dan di server action.
import { z } from 'zod';

export const BATAS_BERKAS_BYTE = 5 * 1024 * 1024;

export const skemaKirimKarya = z
  .object({
    jenis: z.enum(['tulisan', 'desain']),
    judul: z.string().trim().min(1, 'Judul wajib diisi.').max(150, 'Judul maksimal 150 karakter.'),
    isi: z.string().trim().max(20000, 'Isi terlalu panjang.').optional().default(''),
    namaPanggung: z.string().trim().min(1, 'Nama panggung wajib diisi.').max(50, 'Nama panggung maksimal 50 karakter.'),
    kontak: z.string().trim().min(3, 'Kontak wajib diisi, supaya redaksi bisa menghubungimu.').max(120),
    buatanSendiri: z.literal(true, { message: 'Centang bahwa karya ini buatan sendiri.' }),
    orangTuaTahu: z.boolean().default(false),
    tampilkanIdentitas: z.boolean().default(false),
    sekolah: z.string().trim().max(100).optional(),
    namaLengkap: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jenis === 'tulisan' && data.isi.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Isi tulisan wajib diisi.', path: ['isi'] });
    }
  });

export type InputKirimKarya = z.input<typeof skemaKirimKarya>;
export type DataKirimKarya = z.output<typeof skemaKirimKarya>;

export function pesanBerkasTerlaluBesar(ukuranByte: number): string | null {
  return ukuranByte > BATAS_BERKAS_BYTE ? 'Berkas lebih dari 5 MB. Kecilkan dulu, ya.' : null;
}
