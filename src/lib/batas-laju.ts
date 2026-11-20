import { createHmac } from 'crypto';
import { headers } from 'next/headers';

// Batas laju sederhana di memori (satu proses server). IP tidak disimpan mentah, hanya HMAC-nya.
const riwayat = new Map<string, number[]>();

// Di produksi kunci wajib ada. Fallback hanya untuk pengembangan lokal.
function kunciDevSaja(): string {
  if (process.env.NODE_ENV === 'production') throw new Error('KONTAK_ENCRYPTION_KEY wajib diisi di produksi.');
  return 'pengembangan-lokal';
}

export function kunciIp(ip: string, aksi: string): string {
  const rahasia = process.env.KONTAK_ENCRYPTION_KEY ?? kunciDevSaja();
  const hash = createHmac('sha256', rahasia).update(ip).digest('hex');
  return `${aksi}:${hash}`;
}

// Mengembalikan true jika permintaan masih di bawah batas dalam jendela waktu.
export function izinkan(kunci: string, maks: number, jendelaMs: number, sekarang = Date.now()): boolean {
  const awal = sekarang - jendelaMs;
  const lama = (riwayat.get(kunci) ?? []).filter((t) => t > awal);
  if (lama.length >= maks) {
    riwayat.set(kunci, lama);
    return false;
  }
  lama.push(sekarang);
  riwayat.set(kunci, lama);
  if (riwayat.size > 10000) {
    for (const [k, v] of riwayat) if (v.every((t) => t <= awal)) riwayat.delete(k);
  }
  return true;
}

export async function ambilIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return h.get('x-real-ip') ?? 'tidak-diketahui';
}
