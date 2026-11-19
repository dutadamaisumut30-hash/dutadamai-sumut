'use client';

import Link from 'next/link';
import { useState } from 'react';
import { pindahStatus, STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { adalahMundur, formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { ITEM_PAPAN_CONTOH, type ItemPapan } from '@/lib/papan-contoh';

// Pratinjau memakai tanggal tetap. Nanti diganti jam dari server.
const HARI_INI = '2026-11-19';

const NAMA_PERAN: Record<Exclude<Peran, 'publik'>, string> = {
  blogger: 'Blogger',
  dkv: 'DKV',
  editor: 'Editor',
  admin: 'Admin',
};

type MundurTertunda = { id: string; ke: StatusTulisan } | null;

export function PapanRedaksi() {
  const [items, setItems] = useState<ItemPapan[]>(ITEM_PAPAN_CONTOH);
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('editor');
  const [pesan, setPesan] = useState('');
  const [seret, setSeret] = useState<string | null>(null);
  const [sasaran, setSasaran] = useState<StatusTulisan | null>(null);
  const [mundur, setMundur] = useState<MundurTertunda>(null);
  const [catatan, setCatatan] = useState('');

  function cariItem(id: string): ItemPapan | undefined {
    return items.find((i) => i.id === id);
  }

  function pindahkan(id: string, ke: StatusTulisan) {
    const item = cariItem(id);
    if (!item || item.status === ke) return;

    if (adalahMundur(item.status, ke)) {
      if (item.status !== 'review_akhir') {
        setPesan('Tulisan hanya bisa mundur dari Review akhir.');
        return;
      }
      if (!bolehAksi(peran, 'ubah_status_review')) {
        setPesan('Hanya Editor dan Admin yang boleh mengembalikan tulisan dari review.');
        return;
      }
      setMundur({ id, ke });
      setCatatan('');
      setPesan('');
      return;
    }

    const hasil = pindahStatus({ dari: item.status, ke, peran });
    if (!hasil.ok) {
      setPesan(hasil.alasan);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
    setPesan(`"${item.judul}" pindah ke ${KOLOM[ke].judul}.`);
  }

  function kembalikanDenganCatatan() {
    if (!mundur) return;
    const item = cariItem(mundur.id);
    if (!item) return;
    const hasil = pindahStatus({ dari: item.status, ke: mundur.ke, peran, catatan });
    if (!hasil.ok) {
      setPesan(hasil.alasan);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === mundur.id ? { ...i, status: mundur.ke } : i)));
    setPesan(`"${item.judul}" dikembalikan ke ${KOLOM[mundur.ke].judul}.`);
    setMundur(null);
    setCatatan('');
  }

  const terbit = items.filter((i) => i.status === 'terbit').length;
  const sedangDikerjakan = items.length - terbit;
  const telat = items.filter((i) => i.status !== 'terbit' && labelTelat(i.tenggat, HARI_INI)).length;
  const itemMundur = mundur ? cariItem(mundur.id) : undefined;

  return (
    <>
      <div className="warn">
        Pratinjau tanpa login. Perpindahan di sini belum tersimpan ke database.
      </div>

      <div className="papan-tools">
        <label htmlFor="peran-pratinjau">Lihat sebagai</label>
        <select
          id="peran-pratinjau"
          value={peran}
          onChange={(e) => {
            setPeran(e.target.value as Exclude<Peran, 'publik'>);
            setMundur(null);
            setPesan('');
          }}
        >
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>

      <div className="papan-ringkas">
        <div className="card pad"><div className="muted">Sedang dikerjakan</div><h2>{sedangDikerjakan}</h2></div>
        <div className="card pad"><div className="muted">Terbit</div><h2>{terbit}</h2></div>
        <div className="card pad" style={{ borderColor: 'var(--red)' }}>
          <div className="muted">Tiket telat</div>
          <h2 style={{ color: 'var(--red)' }}>{telat}</h2>
        </div>
      </div>

      {pesan && <div className="ok" role="status">{pesan}</div>}

      {mundur && itemMundur && (
        <div className="papan-catatan" role="group" aria-label="Catatan pengembalian">
          <strong>Kembalikan &quot;{itemMundur.judul}&quot; ke {KOLOM[mundur.ke].judul}</strong>
          <label htmlFor="catatan-mundur">Catatan wajib (misalnya: bagian kutipan belum jelas)</label>
          <textarea id="catatan-mundur" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          <button type="button" className="btn" onClick={kembalikanDenganCatatan} disabled={!catatan.trim()}>
            Kembalikan
          </button>{' '}
          <button type="button" className="btn btn-ghost" onClick={() => setMundur(null)}>Batal</button>
        </div>
      )}

      <div className="kanban papan-kanban">
        {STATUS_TULISAN.map((k) => (
          <div
            key={k}
            className={`col${sasaran === k ? ' over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setSasaran(k); }}
            onDragLeave={() => setSasaran((s) => (s === k ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setSasaran(null);
              if (seret) pindahkan(seret, k);
              setSeret(null);
            }}
          >
            <div className="tagl">{KOLOM[k].nomor} · {KOLOM[k].judul}</div>
            <div className="muted">{KOLOM[k].deskripsi}</div>

            {items.filter((i) => i.status === k).map((i) => {
              const telatLabel = i.status !== 'terbit' ? labelTelat(i.tenggat, HARI_INI) : null;
              return (
                <div
                  key={i.id}
                  className={`kc${telatLabel ? ' late' : ''}`}
                  draggable
                  onDragStart={() => setSeret(i.id)}
                  onDragEnd={() => { setSeret(null); setSasaran(null); }}
                >
                  <span className="tagl">{i.rubrik}</span>
                  <p style={{ margin: '6px 0' }}><Link href={`/redaksi/tulisan/${i.id}`}>{i.judul}</Link></p>
                  <div>
                    {i.penanggung.map((p) => <span key={p} className="av">{p}</span>)}{' '}
                    {telatLabel
                      ? <span style={{ color: 'var(--red)', fontWeight: 700 }}>{telatLabel}</span>
                      : <span className="muted">Tenggat {formatTanggalPendek(i.tenggat)}</span>}
                  </div>
                  <label className="papan-pindah">
                    <span className="muted">Pindah ke</span>
                    <select
                      aria-label={`Pindah status ${i.judul}`}
                      value={i.status}
                      onChange={(e) => pindahkan(i.id, e.target.value as StatusTulisan)}
                    >
                      {STATUS_TULISAN.map((s) => (
                        <option key={s} value={s}>{KOLOM[s].nomor} · {KOLOM[s].judul}</option>
                      ))}
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
