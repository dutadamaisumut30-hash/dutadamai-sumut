import { describe, expect, it } from 'vitest';
import { pindahSaran } from '@/fitur/saran/alur-saran';

describe('kotak saran', () => {
  it('hanya Editor dan Admin yang boleh memindah saran', () => {
    expect(pindahSaran({ dari: 'baru', ke: 'dibaca', peran: 'editor' }).ok).toBe(true);
    expect(pindahSaran({ dari: 'baru', ke: 'dibaca', peran: 'admin' }).ok).toBe(true);
    expect(pindahSaran({ dari: 'baru', ke: 'dibaca', peran: 'dkv' }).ok).toBe(false);
    expect(pindahSaran({ dari: 'baru', ke: 'dibaca', peran: 'blogger' }).ok).toBe(false);
  });
  it('urutan status dijaga', () => {
    expect(pindahSaran({ dari: 'baru', ke: 'ditindak', peran: 'editor' }).ok).toBe(false);
    expect(pindahSaran({ dari: 'dibaca', ke: 'ditindak', peran: 'editor' }).ok).toBe(true);
    expect(pindahSaran({ dari: 'ditindak', ke: 'dibaca', peran: 'editor' }).ok).toBe(false);
    expect(pindahSaran({ dari: 'diarsip', ke: 'baru', peran: 'admin' }).ok).toBe(false);
    expect(pindahSaran({ dari: 'ditindak', ke: 'diarsip', peran: 'editor' }).ok).toBe(true);
  });
});
