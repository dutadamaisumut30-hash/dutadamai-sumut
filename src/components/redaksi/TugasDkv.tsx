'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { gantiStatus } from '@/fitur/tulisan/actions';
import type { StatusTulisan } from '@/fitur/tulisan/alur-status';
import type { ItemPapanDb } from '@/fitur/tulisan/layanan';
import { formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';

export function TugasDkv({ awal, hariIni }: { awal: ItemPapanDb[]; hariIni: string }) {
  const router = useRouter();
  const [pesan, setPesan] = useState('');
  const [sibuk, mulai] = useTransition();

  function majukan(item: ItemPapanDb, ke: StatusTulisan) {
    mulai(async () => {
      const hasil = await gantiStatus(item.id, ke);
      if (!hasil.ok) return setPesan(hasil.pesan);
      setPesan(ke === 'didesain'
        ? `"${item.judul}" sekarang kamu kerjakan.`
        : `"${item.judul}" dikirim ke Review akhir.`);
      router.refresh();
    });
  }

  const baru = awal.filter((i) => i.status === 'menunggu_desain');
  const dikerjakan = awal.filter((i) => i.status === 'didesain');

  return (
    <>
      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      <section style={{ marginTop: 18 }}>
        <h2>Tugas baru <span className="muted">({baru.length})</span></h2>
        <p className="muted">{KOLOM.menunggu_desain.deskripsi}</p>
        <div className="grid3">
          {baru.map((i) => (
            <TugasKartu key={i.id} item={i} hariIni={hariIni} aksi={
              <button type="button" className="btn" disabled={sibuk} onClick={() => majukan(i, 'didesain')}>Ambil tugas</button>
            } />
          ))}
          {baru.length === 0 && <p className="muted">Tidak ada tugas baru.</p>}
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>Sedang dikerjakan <span className="muted">({dikerjakan.length})</span></h2>
        <p className="muted">{KOLOM.didesain.deskripsi}</p>
        <div className="grid3">
          {dikerjakan.map((i) => (
            <TugasKartu key={i.id} item={i} hariIni={hariIni} aksi={
              <button type="button" className="btn" disabled={sibuk} onClick={() => majukan(i, 'review_akhir')}>Kirim ke review akhir</button>
            } />
          ))}
          {dikerjakan.length === 0 && <p className="muted">Belum ada tugas yang kamu kerjakan.</p>}
        </div>
      </section>
    </>
  );
}

function TugasKartu({ item, hariIni, aksi }: { item: ItemPapanDb; hariIni: string; aksi: React.ReactNode }) {
  const telat = labelTelat(item.tenggat, hariIni);
  return (
    <div className={`card pad${telat ? ' late' : ''}`}>
      <span className="tagl">{item.rubrik}</span>
      <h3 style={{ margin: '6px 0' }}>
        <Link href={`/redaksi/tulisan/${item.id}`}>{item.judul}</Link>
      </h3>
      <p className="muted" style={{ margin: '0 0 6px' }}>Buka judul untuk membaca tulisan dan mengunggah desain.</p>
      <p className="muted" style={{ margin: 0 }}>
        Tenggat {formatTanggalPendek(item.tenggat)}
        {telat && <> · <span style={{ color: 'var(--red)', fontWeight: 700 }}>{telat}</span></>}
      </p>
      <div style={{ marginTop: 12 }}>{aksi}</div>
    </div>
  );
}
