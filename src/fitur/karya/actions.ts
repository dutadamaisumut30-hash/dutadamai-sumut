'use server';

// TODO(database): simpan karya ke tabel `karya`, enkripsi kontak (KONTAK_ENCRYPTION_KEY),
// cek Turnstile, batas laju per IP (hash), filter kata, dan kode lacak tersimpan.
// Sampai database siap, aksi ini hanya memvalidasi dan membuat kode.

import { buatKodeLacak } from '@/lib/kode-lacak';
import { skemaKirimKarya } from './kirim';

export type HasilKirim = { ok: true; kode: string } | { ok: false; pesan: string };

export async function kirimKarya(input: unknown): Promise<HasilKirim> {
  const hasil = skemaKirimKarya.safeParse(input);
  if (!hasil.success) {
    return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  }
  return { ok: true, kode: buatKodeLacak() };
}
