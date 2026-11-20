// Mereset 2FA satu akun. Dijalankan Admin di komputer sendiri, tidak lewat web.
// Pemakaian (PowerShell):
//   $env:DATABASE_URL="..."; npx tsx scripts/reset-2fa.ts email@contoh.id
import { eq } from 'drizzle-orm';
import { buatDb } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';

const email = process.argv[2];
const url = process.env.DATABASE_URL;

if (!email || !url) {
  console.error('Butuh: DATABASE_URL dan argumen <email>');
  process.exit(1);
}

const jalankan = async () => {
  const db = buatDb(url);
  const [pengguna] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
  if (!pengguna) throw new Error(`Akun ${email} tidak ditemukan.`);
  await db.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, pengguna.id));
  await db.update(schema.user).set({ twoFactorEnabled: false }).where(eq(schema.user.id, pengguna.id));
  console.log(`2FA untuk ${email} sudah direset. Akun bisa login dengan kata sandi, lalu aktifkan 2FA lagi.`);
};

jalankan()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Gagal mereset 2FA:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
