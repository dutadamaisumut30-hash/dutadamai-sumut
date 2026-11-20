// Satu koneksi database per proses server. Dipakai oleh server action.
import { buatDb } from './index';

let tunggal: ReturnType<typeof buatDb> | null = null;

export function dbTunggal(url: string): ReturnType<typeof buatDb> {
  tunggal ??= buatDb(url);
  return tunggal;
}
