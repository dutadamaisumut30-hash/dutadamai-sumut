// Konfigurasi Better Auth: login email dan kata sandi, 2FA (TOTP), dan peran tim (ADR 002).
// Dipisah dari src/lib/auth.ts agar tes bisa membuatnya dengan database PGlite.
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';

export const PERAN_DEFAULT = 'blogger';

export function buatAuth(opsi: {
  db: unknown;
  schema: Record<string, unknown>;
  secret: string;
  baseURL: string;
  /** Pendaftaran publik ditutup. Hanya skrip pembuatan akun pertama yang boleh mengaktifkannya. */
  izinDaftar?: boolean;
}) {
  return betterAuth({
    database: drizzleAdapter(opsi.db as never, { provider: 'pg', schema: opsi.schema }),
    secret: opsi.secret,
    baseURL: opsi.baseURL,
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',').map((x) => x.trim()).filter(Boolean),
    // Batasi tebakan kata sandi: 5 percobaan masuk per menit per alamat IP (aktif di produksi).
    rateLimit: { window: 60, max: 60, customRules: { '/sign-in/email': { window: 60, max: 5 }, '/two-factor/verify-totp': { window: 60, max: 5 } } },
    emailAndPassword: { enabled: true, minPasswordLength: 12, disableSignUp: !opsi.izinDaftar },
    plugins: [twoFactor({ issuer: 'DutaDamai Sumut' })],
    user: {
      additionalFields: {
        // Satu peran per akun (ADR 002). Hanya diisi oleh Admin, tidak dari form pendaftaran.
        peran: { type: 'string', required: false, input: false },
      },
    },
  });
}
