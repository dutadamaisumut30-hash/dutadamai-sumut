// Data contoh sementara. Diganti query database setelah skema siap (tahap backend).

export type NamaRubrik = 'Cerita Sumut' | 'Opini Pelajar' | 'Profil Duta' | 'Tips Skill' | 'Di Balik Layar';

export interface Rubrik {
  slug: string;
  nama: NamaRubrik;
  deskripsi: string;
}

export interface Tulisan {
  slug: string;
  judul: string;
  ringkasan: string;
  rubrik: NamaRubrik;
  penulis: string;
  desainer?: string;
  developer?: string;
  menitBaca: number;
  tanggalTampil: string;
  warna: 'ph-warm' | 'ph-blue' | 'ph-rose' | '';
  isi: string[];
}

export interface KaryaContoh {
  id: string;
  jenis: 'tulisan' | 'desain';
  judul: string;
  oleh: string;
  kutipan?: string;
  gambar?: string;
  warna: 'ph-warm' | 'ph-blue' | 'ph-rose' | '';
}

export const RUBRIK: Rubrik[] = [
  { slug: 'cerita-sumut', nama: 'Cerita Sumut', deskripsi: 'Kisah nyata hidup berdampingan, dari kampung sampai sekolah.' },
  { slug: 'opini-pelajar', nama: 'Opini Pelajar', deskripsi: 'Pendapat anak muda Sumut, dari kiriman pelajar dan tim.' },
  { slug: 'profil-duta', nama: 'Profil Duta', deskripsi: 'Kenalan dengan anggota Duta Damai dan karya mereka.' },
  { slug: 'tips-skill', nama: 'Tips Skill', deskripsi: 'Literasi digital yang praktis: cek fakta, bikin konten, dan lainnya.' },
  { slug: 'di-balik-layar', nama: 'Di Balik Layar', deskripsi: 'Cara kami membuat tulisan, desain, dan website ini.' },
];

export const TULISAN: Tulisan[] = [
  {
    slug: 'satu-kampung-tiga-rumah-ibadah',
    judul: 'Satu kampung, tiga rumah ibadah, satu dapur umum',
    ringkasan: 'Cara warga di pinggir Medan bergantian memasak untuk acara besar tetangganya, apa pun agamanya.',
    rubrik: 'Cerita Sumut',
    penulis: 'Nadia Amalia',
    desainer: 'Raka Kurniawan',
    developer: 'Fikri Kesuma',
    menitBaca: 5,
    tanggalTampil: '12 Nov 2026',
    warna: 'ph-warm',
    isi: [
      'Setiap kali ada pesta di kampung ini, asap dapur umum naik dari halaman yang sama.',
      'Yang memasak tetap orang-orang yang sama. Ibu-ibu pengajian, anggota paduan suara gereja, dan pemuda vihara di ujung gang berbagi tugas.',
      'Menu disesuaikan dengan tamu. Peralatan masak dipisah dan diberi tanda supaya semua orang bisa makan dengan tenang.',
    ],
  },
  {
    slug: 'pasar-pagi-titik-temu-tiga-suku',
    judul: 'Pasar pagi yang jadi titik temu tiga suku',
    ringkasan: 'Batak, Melayu, dan Tionghoa berbagi lapak sejak subuh.',
    rubrik: 'Cerita Sumut',
    penulis: 'Nadia Amalia',
    desainer: 'Sarah Manurung',
    developer: 'Bima Pratama',
    menitBaca: 4,
    tanggalTampil: '15 Nov 2026',
    warna: 'ph-blue',
    isi: ['Batak, Melayu, dan Tionghoa berbagi lapak sejak subuh.'],
  },
  {
    slug: 'toleransi-kerja-harian',
    judul: 'Toleransi itu kerja harian, bukan tema lomba',
    ringkasan: 'Toleransi tidak hanya muncul saat lomba pidato. Ia hidup di hal-hal kecil sehari-hari.',
    rubrik: 'Opini Pelajar',
    penulis: 'Yosua Sinaga',
    menitBaca: 3,
    tanggalTampil: '13 Nov 2026',
    warna: 'ph-rose',
    isi: ['Toleransi tidak hanya muncul saat lomba pidato. Ia hidup di hal-hal kecil sehari-hari.'],
  },
  {
    slug: 'cek-fakta-5-langkah',
    judul: 'Cek fakta dalam 5 langkah sebelum kamu teruskan pesan',
    ringkasan: 'Langkah sederhana supaya tidak ikut menyebarkan hoaks.',
    rubrik: 'Tips Skill',
    penulis: 'Yosua Sinaga',
    developer: 'Jessica Tan',
    menitBaca: 6,
    tanggalTampil: '10 Nov 2026',
    warna: 'ph-blue',
    isi: ['Langkah sederhana supaya tidak ikut menyebarkan hoaks.'],
  },
  {
    slug: 'dari-ruang-kelas-ke-panggung',
    judul: 'Dari ruang kelas ke panggung: Duta Damai asal Siantar',
    ringkasan: 'Kisah anggota Duta Damai dari ruang kelas sampai ke panggung.',
    rubrik: 'Profil Duta',
    penulis: 'Putri Lubis',
    menitBaca: 4,
    tanggalTampil: '18 Nov 2026',
    warna: 'ph-warm',
    isi: ['Kisah anggota Duta Damai dari ruang kelas sampai ke panggung.'],
  },
];

export const KARYA: KaryaContoh[] = [
  { id: 'k1', jenis: 'desain', judul: 'Poster: Beda itu biasa', oleh: '@senjakuning', warna: 'ph-warm' },
  { id: 'k2', jenis: 'tulisan', judul: 'Cerpen: Pesan Berantai', oleh: 'Dimas, SMA di Binjai', kutipan: 'Grup kelas kami hampir pecah gara-gara satu hoaks.', warna: '' },
  { id: 'k3', jenis: 'desain', judul: 'Infografis: Kenali hoaks', oleh: '@pixelpagi', warna: 'ph-blue' },
  { id: 'k4', jenis: 'tulisan', judul: 'Puisi: Rumah Kami Berpintu Banyak', oleh: '@lautdanau', kutipan: 'Ada azan, ada lonceng, ada dupa di gang yang sama.', warna: '' },
  { id: 'k5', jenis: 'desain', judul: 'Ilustrasi: Pasar Petisah', oleh: '@rintik.art', warna: 'ph-rose' },
  { id: 'k6', jenis: 'tulisan', judul: 'Opini: Ruang aman di sekolah', oleh: '@kertasbiru', kutipan: 'Teman beda agama itu bukan topik, mereka teman.', warna: '' },
];


export function cariRubrik(slug: string): Rubrik | undefined {
  return RUBRIK.find((r) => r.slug === slug);
}

export function tulisanPerRubrik(nama: NamaRubrik): Tulisan[] {
  return TULISAN.filter((t) => t.rubrik === nama);
}
