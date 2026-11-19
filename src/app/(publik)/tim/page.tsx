export const metadata = { title: 'Tim' };

// TODO: jumlah anggota belum cocok dengan memori tim ("5 orang"). Konfirmasi sebelum rilis.
const BLOGGER = [
  { nama: 'Nadia Amalia', peran: 'Penulis · Cerita Sumut' },
  { nama: 'Yosua Sinaga', peran: 'Penulis · Opini & Tips Skill' },
];
const EDITOR = [{ nama: 'Putri Lubis', peran: 'Editor · menyeleksi karya masuk dan memoderasi komentar' }];
const DKV = [
  { nama: 'Raka Kurniawan', peran: 'Desainer · cover & ilustrasi' },
  { nama: 'Sarah Manurung', peran: 'Desainer · template kartu bagikan' },
  { nama: 'Aldi Harahap', peran: 'Desainer · infografis' },
];
const IT = [
  { nama: 'Fikri Kesuma', peran: 'Admin · koordinator IT' },
  { nama: 'Jessica Tan', peran: 'Developer · frontend' },
  { nama: 'Bima Pratama', peran: 'Developer · backend' },
];

function Kelompok({ judul, anggota }: { judul: string; anggota: { nama: string; peran: string }[] }) {
  return (
    <>
      <h2 style={{ marginTop: 22 }}>{judul}</h2>
      <div className="card pad">
        {anggota.map((a) => (
          <p key={a.nama} style={{ margin: '6px 0' }}><b>{a.nama}</b> · {a.peran}</p>
        ))}
      </div>
    </>
  );
}

export default function HalamanTim() {
  return (
    <section>
      <div className="kicker">Di balik website</div>
      <h1>Tim</h1>
      <p className="muted">Tiga divisi, satu redaksi. Hanya anggota yang setuju yang profilnya tampil.</p>
      <Kelompok judul="Blogger" anggota={BLOGGER} />
      <Kelompok judul="Editor" anggota={EDITOR} />
      <Kelompok judul="DKV" anggota={DKV} />
      <Kelompok judul="IT" anggota={IT} />
    </section>
  );
}
