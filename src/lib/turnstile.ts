// Verifikasi Cloudflare Turnstile di sisi server. Gagal tertutup: tanpa token atau secret, hasilnya false.
export type CekTurnstile = (opsi: { token: string; secret: string; ip?: string }) => Promise<boolean>;

export const cekTurnstile: CekTurnstile = async (opsi) => {
  if (!opsi.token || !opsi.secret) return false;
  const body = new URLSearchParams({ secret: opsi.secret, response: opsi.token });
  if (opsi.ip) body.set('remoteip', opsi.ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
};
