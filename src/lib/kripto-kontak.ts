// Enkripsi kontak pengirim (ADR 005). AES-256-GCM. Format: v1.<iv>.<tag>.<cipher>, semua base64.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITMA = 'aes-256-gcm';

export function kunciDariEnv(raw: string): Buffer {
  const kunci = Buffer.from(raw, 'base64');
  if (kunci.length !== 32) throw new Error('KONTAK_ENCRYPTION_KEY harus 32 byte dalam base64.');
  return kunci;
}

export function enkripsiKontak(teks: string, kunci: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITMA, kunci, iv);
  const hasil = Buffer.concat([cipher.update(teks, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64'), tag.toString('base64'), hasil.toString('base64')].join('.');
}

export function dekripsiKontak(data: string, kunci: Buffer): string {
  const [versi, ivB64, tagB64, cipherB64] = data.split('.');
  if (versi !== 'v1' || !ivB64 || !tagB64 || !cipherB64) throw new Error('Format kontak tidak dikenal.');
  const decipher = createDecipheriv(ALGORITMA, kunci, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(cipherB64, 'base64')), decipher.final()]).toString('utf8');
}
