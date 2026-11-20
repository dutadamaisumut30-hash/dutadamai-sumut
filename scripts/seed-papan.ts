// Mengisi rubrik dan data contoh papan redaksi ke database. Aman dijalankan ulang (dilewati jika sudah ada).
// Pemakaian (PowerShell): $env:DATABASE_URL="..."; npx tsx scripts/seed-papan.ts
import { buatDb } from '../src/lib/db';
import { rubrik, tulisan } from '../src/lib/db/schema';
import { ITEM_PAPAN_CONTOH } from '../src/lib/papan-contoh';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Butuh DATABASE_URL');
  process.exit(1);
}

const RUBRIK_SEED = [
  { slug: 'cerita-sumut', nama: 'Cerita Sumut' },
  { slug: 'opini-pelajar', nama: 'Opini Pelajar' },
  { slug: 'profil-duta', nama: 'Profil Duta' },
  { slug: 'tips-skill', nama: 'Tips Skill' },
  { slug: 'di-balik-layar', nama: 'Di Balik Layar' },
];

const jalankan = async () => {
  const db = buatDb(url);
  await db
    .insert(rubrik)
    .values(RUBRIK_SEED.map((r) => ({ ...r, deskripsi: `Rubrik ${r.nama}` })))
    .onConflictDoNothing();
  const slugDari = Object.fromEntries(RUBRIK_SEED.map((r) => [r.nama, r.slug]));
  await db
    .insert(tulisan)
    .values(
      ITEM_PAPAN_CONTOH.map((i) => ({
        slug: `contoh-${i.id}`,
        judul: i.judul,
        rubrikSlug: slugDari[i.rubrik],
        status: i.status,
        tenggat: i.tenggat,
        penanggung: i.penanggung,
      })),
    )
    .onConflictDoNothing();
  console.log('Data contoh papan redaksi sudah dimasukkan.');
};

jalankan()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Gagal mengisi data contoh:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
