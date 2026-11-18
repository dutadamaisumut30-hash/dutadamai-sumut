// Kode lacak untuk pelajar tanpa akun. Huruf I, L, O dan angka 0, 1 dilewati agar tidak tertukar.
import { randomInt } from 'node:crypto';

const KARAKTER = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const POLA = new RegExp(`^[${KARAKTER}]{4}-[${KARAKTER}]{4}$`);

export function buatKodeLacak(): string {
  let kode = '';
  for (let i = 0; i < 8; i++) kode += KARAKTER[randomInt(KARAKTER.length)];
  return `${kode.slice(0, 4)}-${kode.slice(4)}`;
}

export function kodeLacakValid(kode: string): boolean {
  return POLA.test(kode.toUpperCase());
}
