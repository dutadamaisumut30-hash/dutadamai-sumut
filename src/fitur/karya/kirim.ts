// Validasi formulir Kirim Karya. Dipakai di browser (langkah 2 dan 3) dan di server action.
import { z } from 'zod';

export const BATAS_BERKAS_BYTE = 5 * 1024 * 1024;
export const TIPE_BERKAS_DIIZINKAN = ['image/jpeg', 'image/png'] as const;

const skemaBerkas = z.object({
  nama: z.string().trim().min(1, 'Nama berkas kosong.').max(200),
  tipe: z.enum(TIPE_BERKAS_DIIZINKAN, {
    errorMap: () => ({ message: 'Berkas desain harus JPG atau PNG.' }),
  }),
  ukuranByte: z
    .number()
    .int()
    .positive('Ukuran berkas tidak valid.')
    .max(BATAS_BERKAS_BYTE, 'Berkas lebih dari 5 MB. Kecilkan dulu, ya.'),
});

export const skemaKirimKarya = z
  .object({
    jenis: z.enum(['tulisan', 'desain']),
    judul: z.string().trim().min(1, 'Judul wajib diisi.').max(150, 'Judul maksimal 150 karakter.'),
    isi: z.string().trim().max(20000, 'Isi terlalu panjang.').optional().default(''),
    berkas: skemaBerkas.optional(),
    namaPanggung: z.string().trim().min(1, 'Nama panggung wajib diisi.').max(50, 'Nama panggung maksimal 50 karakter.'),
    kontak: z.string().trim().min(3, 'Kontak wajib diisi, supaya redaksi bisa menghubungimu.').max(120),
    buatanSendiri: z.literal(true, { message: 'Centang bahwa karya ini buatan sendiri.' }),
    dibawahUmur18: z.boolean().default(false),
    orangTuaTahu: z.boolean().default(false),
    tampilkanIdentitas: z.boolean().default(false),
    sekolah: z.string().trim().max(100).optional(),
    namaLengkap: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jenis === 'tulisan' && data.isi.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Isi tulisan wajib diisi.', path: ['isi'] });
    }
    // Celah yang diperbaiki: desain tanpa berkas dulu lolos validasi server.
    if (data.jenis === 'desain' && !data.berkas) {
      ctx.addIssue({ code: 'custom', message: 'Unggah berkas desainmu dulu.', path: ['berkas'] });
    }
    // Celah yang diperbaiki: tidak ada aturan untuk peserta di bawah 18 tahun.
    if (data.dibawahUmur18 && !data.orangTuaTahu) {
      ctx.addIssue({
        code: 'custom',
        message: 'Karya dari peserta di bawah 18 tahun wajib disetujui orang tua atau wali.',
        path: ['orangTuaTahu'],
      });
    }
  });

export type InputKirimKarya = z.input<typeof skemaKirimKarya>;
export type DataKirimKarya = z.output<typeof skemaKirimKarya>;

export function pesanBerkasTerlaluBesar(ukuranByte: number): string | null {
  return ukuranByte > BATAS_BERKAS_BYTE ? 'Berkas lebih dari 5 MB. Kecilkan dulu, ya.' : null;
}
