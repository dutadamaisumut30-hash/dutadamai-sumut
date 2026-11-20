// Membuat akun tim dengan peran. Dipakai Admin di komputer sendiri, tidak lewat web.
// Pemakaian (PowerShell):
//   $env:DATABASE_URL="..."; $env:AKUN_KATA_SANDI="..."; npx tsx scripts/buat-akun.ts email@contoh.id "Nama Lengkap" editor
import { eq } from 'drizzle-orm';
import { buatDb } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import { buatAuth } from '../src/lib/auth/konfigurasi';

const [email, nama, peran] = process.argv.slice(2);
const sandi = process.env.AKUN_KATA_SANDI;
const url = process.env.DATABASE_URL;

if (!email || !nama || !peran || !sandi || !url) {
  console.error('Butuh: DATABASE_URL, AKUN_KATA_SANDI, dan argumen: <email> <nama> <peran>');
  process.exit(1);
}
if (!(schema.PERAN_TIM as readonly string[]).includes(peran)) {
  console.error(`Peran tidak dikenal. Pilih: ${schema.PERAN_TIM.join(', ')}`);
  process.exit(1);
}

const db = buatDb(url);
const auth = buatAuth({
  db,
  schema: schema as unknown as Record<string, unknown>,
  secret: process.env.BETTER_AUTH_SECRET ?? 'skrip-lokal-saja-minimal-32-karakter-0123456789',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  izinDaftar: true,
});

const jalankan = async () => {
  await auth.api.signUpEmail({ body: { email, password: sandi, name: nama } });
  await db.update(schema.user).set({ peran }).where(eq(schema.user.email, email));
  console.log(`Akun ${email} dibuat dengan peran ${peran}.`);
};

jalankan()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Gagal membuat akun:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
