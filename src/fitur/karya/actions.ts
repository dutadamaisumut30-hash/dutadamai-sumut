'use server';

// Server action kirim karya. Hanya aktif jika BACKEND_SIAP true (setelah database, Turnstile, dan batas laju diuji).
import { dbTunggal } from '@/lib/db/tunggal';
import { kunciDariEnv } from '@/lib/kripto-kontak';
import { buatKodeLacak } from '@/lib/kode-lacak';
import { ambilIp, izinkan, kunciIp } from '@/lib/batas-laju';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { cekTurnstile } from '@/lib/turnstile';
import { BATAS_BERKAS_KARYA, layananKirimKarya, type BerkasKirim, type HasilKirim } from './layanan';

export type { HasilKirim };

/** formData berisi: 'data' (JSON formulir), 'turnstile', dan 'berkas' (File, untuk desain). */
export async function kirimKarya(formData: FormData): Promise<HasilKirim> {
  if (!BACKEND_SIAP) return { ok: false, pesan: PESAN_BELUM_TERSAMBUNG };

  const url = process.env.DATABASE_URL;
  const kunciRaw = process.env.KONTAK_ENCRYPTION_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !kunciRaw || !secret) {
    return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };
  }

  const ip = await ambilIp();
  if (!izinkan(kunciIp(ip, 'kirim_karya'), 5, 10 * 60_000)) {
    return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
  }

  let input: unknown;
  try {
    input = JSON.parse(String(formData.get('data') ?? ''));
  } catch {
    return { ok: false, pesan: 'Data formulir tidak terbaca. Muat ulang halaman lalu coba lagi.' };
  }

  let berkas: BerkasKirim | null = null;
  const berkasFile = formData.get('berkas');
  if (berkasFile instanceof File && berkasFile.size > 0) {
    if (berkasFile.size > BATAS_BERKAS_KARYA) {
      return { ok: false, pesan: 'Berkas lebih dari 5 MB. Kecilkan dulu, ya.' };
    }
    berkas = { nama: berkasFile.name, mime: berkasFile.type, isi: Buffer.from(await berkasFile.arrayBuffer()) };
  }

  return layananKirimKarya(input, { turnstile: String(formData.get('turnstile') ?? ''), ip, berkas }, {
    db: dbTunggal(url),
    kunci: kunciDariEnv(kunciRaw),
    secretTurnstile: secret,
    cekTurnstile,
    buatKode: buatKodeLacak,
  });
}
