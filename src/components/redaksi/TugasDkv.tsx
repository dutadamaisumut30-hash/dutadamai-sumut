'use client';

import { useState } from 'react';
import { pindahStatus, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';
import { ITEM_PAPAN_CONTOH, type ItemPapan } from '@/lib/papan-contoh';

const HARI_INI = '2026-11-19';
const AWAL: ItemPapan[] = ITEM_PAPAN_CONTOH.filter(
  (i) => i.status === 'menunggu_desain' || i.status === 'didesain',
);

export function TugasDkv() {
  const [items, setItems] = useState<ItemPapan[]>(AWAL);
  const [pesan, setPesan] = useState('');

  function majukan(id: string, ke: StatusTulisan) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const hasil = pindahStatus({ dari: item.status, ke, peran: 'dkv' });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
    setPesan(ke === 'didesain'
      ? `"${item.judul}" sekarang kamu kerjakan.`
      : `"${item.judul}" dikirim ke Review akhir.`);
  }

  const baru = items.filter((i) => i.status === 'menunggu_desain');
  const dikerjakan = items.filter((i) => i.status === 'didesain');

  return (
    <>
      <div className="warn">Pratinjau tanpa login. Perubahan di sini belum tersimpan ke database.</div>
      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      <section style={{ marginTop: 18 }}>
        <h2>Tugas baru <span className="muted">({baru.length})</span></h2>
        <p className="muted">{KOLOM.menunggu_desain.deskripsi}</p>
        <div className="grid3">
          {baru.map((i) => (
            <TugasKartu key={i.id} item={i} aksi={
              <button type="button" className="btn" onClick={() => majukan(i.id, 'didesain')}>Ambil tugas</button>
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
            <TugasKartu key={i.id} item={i} aksi={
              <button type="button" className="btn" onClick={() => majukan(i.id, 'review_akhir')}>Kirim ke review akhir</button>
            } />
          ))}
          {dikerjakan.length === 0 && <p className="muted">Belum ada tugas yang kamu kerjakan.</p>}
        </div>
      </section>
    </>
  );
}

function TugasKartu({ item, aksi }: { item: ItemPapan; aksi: React.ReactNode }) {
  const telat = labelTelat(item.tenggat, HARI_INI);
  return (
    <div className={`card pad${telat ? ' late' : ''}`}>
      <span className="tagl">{item.rubrik}</span>
      <h3 style={{ margin: '6px 0' }}>{item.judul}</h3>
      <p className="muted" style={{ margin: 0 }}>
        Tenggat {formatTanggalPendek(item.tenggat)}
        {telat && <> · <span style={{ color: 'var(--red)', fontWeight: 700 }}>{telat}</span></>}
      </p>
      <div style={{ marginTop: 12 }}>{aksi}</div>
    </div>
  );
}
