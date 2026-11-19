'use server';

// TODO(database): simpan karya ke tabel `karya`, enkripsi kontak (KONTAK_ENCRYPTION_KEY),
// cek Turnstile, batas laju per IP (hash), filter kata, dan kode lacak tersimpan.
// Selama BACKEND_SIAP false, aksi ini hanya memvalidasi dan TIDAK membuat kode lacak,
// karena karya belum tersimpan dan kode tanpa data akan menyesatkan pelajar.

import { buatKodeLacak } from '@/lib/kode-lacak';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { skemaKirimKarya } from './kirim';

export type HasilKirim = { ok: true; kode: string } | { ok: false; pesan: string };

export async function kirimKarya(input: unknown): Promise<HasilKirim> {
  const hasil = skemaKirimKarya.safeParse(input);
  if (!hasil.success) {
    return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  }
  if (!BACKEND_SIAP) {
    return { ok: false, pesan: PESAN_BELUM_TERSAMBUNG };
  }
  // TODO(database): simpan karya dulu, baru kembalikan kode yang sudah tersimpan.
  return { ok: true, kode: buatKodeLacak() };
}
