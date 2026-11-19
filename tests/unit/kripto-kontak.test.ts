import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { dekripsiKontak, enkripsiKontak, kunciDariEnv } from '@/lib/kripto-kontak';

const kunci = randomBytes(32);

describe('enkripsi kontak (ADR 005)', () => {
  it('bisa didekripsi kembali dengan kunci yang sama', () => {
    const data = enkripsiKontak('@rani.medan', kunci);
    expect(data).not.toContain('rani');
    expect(dekripsiKontak(data, kunci)).toBe('@rani.medan');
  });
  it('setiap enkripsi menghasilkan teks berbeda (IV acak)', () => {
    expect(enkripsiKontak('sama', kunci)).not.toBe(enkripsiKontak('sama', kunci));
  });
  it('gagal jika kunci salah atau data diubah', () => {
    const data = enkripsiKontak('kontak', kunci);
    expect(() => dekripsiKontak(data, randomBytes(32))).toThrow();
    const rusak = data.slice(0, -4) + 'AAAA';
    expect(() => dekripsiKontak(rusak, kunci)).toThrow();
  });
  it('kunci harus 32 byte', () => {
    expect(() => kunciDariEnv(randomBytes(16).toString('base64'))).toThrow(/32 byte/);
    expect(kunciDariEnv(randomBytes(32).toString('base64'))).toHaveLength(32);
  });
});
