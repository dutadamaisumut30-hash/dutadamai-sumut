// ADR 005: kontak pengirim dihapus 30 hari setelah keputusan final (terbit atau ditolak).
// Untuk karya yang perlu revisi, kontak disimpan sampai pengirim menutup karya,
// atau 30 hari tanpa respons. Yang lebih dulu berlaku.
export const RETENSI_HARI = 30;
const MS_PER_HARI = 24 * 60 * 60 * 1000;

export function tanggalHapusKontak(keputusanFinal: Date): Date {
  return new Date(keputusanFinal.getTime() + RETENSI_HARI * MS_PER_HARI);
}

export function tanggalHapusKontakRevisi(input: { terakhirRespons: Date; ditutupPada?: Date }): Date {
  const batasDiam = new Date(input.terakhirRespons.getTime() + RETENSI_HARI * MS_PER_HARI);
  if (!input.ditutupPada) return batasDiam;
  return input.ditutupPada.getTime() < batasDiam.getTime() ? input.ditutupPada : batasDiam;
}

export function sudahWaktunya(hapusPada: Date, sekarang: Date): boolean {
  return sekarang.getTime() >= hapusPada.getTime();
}
