// Verifikasi Cloudflare Turnstile di sisi server. Gagal tertutup: tanpa token atau secret, hasilnya false.
export async function cekTurnstile(opsi: {
  token: string;
  secret: string;
  ip?: string;
  fetchFn?: typeof fetch;
}): Promise<boolean> {
  if (!opsi.token || !opsi.secret) return false;
  const body = new URLSearchParams({ secret: opsi.secret, response: opsi.token });
  if (opsi.ip) body.set('remoteip', opsi.ip);
  const fetchFn = opsi.fetchFn ?? fetch;
  const res = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}
