// ADR 005: kontak pengirim dihapus 30 hari setelah keputusan final (terbit atau ditolak).
export const RETENSI_HARI = 30;

export function tanggalHapusKontak(keputusanFinal: Date): Date {
  return new Date(keputusanFinal.getTime() + RETENSI_HARI * 24 * 60 * 60 * 1000);
}

export function sudahWaktunya(hapusPada: Date, sekarang: Date): boolean {
  return sekarang.getTime() >= hapusPada.getTime();
}
