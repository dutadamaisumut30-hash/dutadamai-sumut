'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { dbTunggal } from '@/lib/db/tunggal';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { hapusBerkasTulisan, unggahBerkasTulisan } from './layanan';

export async function unggahDesainTulisan(formData: FormData): Promise<{ ok: true } | { ok: false; pesan: string }> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran) || !bolehAksi(peran as Peran, 'unggah_desain')) {
    return { ok: false, pesan: 'Hanya DKV, Editor, dan Admin yang boleh mengunggah desain.' };
  }

  const url = process.env.DATABASE_URL;
  if (!url) return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };

  const tulisanId = String(formData.get('tulisanId') ?? '');
  const file = formData.get('berkas');
  if (!(file instanceof File) || file.size === 0) return { ok: false, pesan: 'Pilih berkas dulu.' };

  const isi = Buffer.from(await file.arrayBuffer());
  return unggahBerkasTulisan(dbTunggal(url), {
    tulisanId,
    nama: file.name,
    mime: file.type,
    isi,
    peran: peran as Peran,
  });
}

export async function hapusBerkasAksi(id: string): Promise<{ ok: true } | { ok: false; pesan: string }> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran)) return { ok: false, pesan: 'Tidak diizinkan.' };
  const url = process.env.DATABASE_URL;
  if (!url) return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };
  return hapusBerkasTulisan(dbTunggal(url), id, peran as Peran);
}
