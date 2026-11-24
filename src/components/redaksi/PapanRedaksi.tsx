'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { gantiStatus } from '@/fitur/tulisan/actions';
import type { ItemPapanDb } from '@/fitur/tulisan/layanan';
import { adalahMundur, formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';


// Penanggung bisa tersimpan sebagai nama lengkap atau inisial. Selalu tampilkan maksimal dua huruf.
function inisial(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return '?';
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return (kata[0][0] + kata[kata.length - 1][0]).toUpperCase();
}

type MundurTertunda = { id: string; ke: StatusTulisan } | null;

export function PapanRedaksi({ awal, hariIni }: { awal: ItemPapanDb[]; hariIni: string }) {
  const [items, setItems] = useState<ItemPapanDb[]>(awal);
  const [pesan, setPesan] = useState('');
  const [seret, setSeret] = useState<string | null>(null);
  const [sasaran, setSasaran] = useState<StatusTulisan | null>(null);
  const [mundur, setMundur] = useState<MundurTertunda>(null);
  const [catatan, setCatatan] = useState('');
  const [sibuk, startTransition] = useTransition();

  function cariItem(id: string): ItemPapanDb | undefined {
    return items.find((i) => i.id === id);
  }

  function kirim(id: string, ke: StatusTulisan, catatanMundur?: string) {
    const item = cariItem(id);
    if (!item) return;
    startTransition(async () => {
      const hasil = await gantiStatus(id, ke, catatanMundur);
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
      setPesan(
        catatanMundur !== undefined
          ? `"${item.judul}" dikembalikan ke ${KOLOM[ke].judul}.`
          : `"${item.judul}" pindah ke ${KOLOM[ke].judul}.`,
      );
      setMundur(null);
      setCatatan('');
    });
  }

  function pindahkan(id: string, ke: StatusTulisan) {
    const item = cariItem(id);
    if (!item || item.status === ke) return;
    if (STATUS_TULISAN.indexOf(ke) - STATUS_TULISAN.indexOf(item.status) > 1) {
      setMundur(null);
      setPesan('Status tidak boleh dilompati. Pindahkan satu langkah ke kolom berikutnya.');
      return;
    }
    if (adalahMundur(item.status, ke)) {
      setMundur({ id, ke });
      setCatatan('');
      setPesan('');
      return;
    }
    kirim(id, ke);
  }

  function kembalikanDenganCatatan() {
    if (!mundur) return;
    kirim(mundur.id, mundur.ke, catatan.trim());
  }

  const terbit = items.filter((i) => i.status === 'terbit').length;
  const sedangDikerjakan = items.length - terbit;
  const telat = items.filter((i) => i.status !== 'terbit' && labelTelat(i.tenggat, hariIni)).length;
  const itemMundur = mundur ? cariItem(mundur.id) : undefined;

  return (
    <>
      <p style={{ margin: '0 0 12px' }}>
        <Link href="/redaksi/tulis" className="btn">+ Tulis draf baru</Link>{' '}
        <span className="muted">Draf baru dibuat di Tulisanku, lalu otomatis muncul di kolom Draf papan ini.</span>
      </p>
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
          <strong>{itemMundur.status === 'terbit' ? 'Tarik dari terbit' : 'Kembalikan'} &quot;{itemMundur.judul}&quot; ke {KOLOM[mundur.ke].judul}</strong>
          <label htmlFor="catatan-mundur">Catatan wajib (misalnya: bagian kutipan belum jelas)</label>
          <textarea id="catatan-mundur" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          <button type="button" className="btn" onClick={kembalikanDenganCatatan} disabled={!catatan.trim() || sibuk}>
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
              const telatLabel = i.status !== 'terbit' ? labelTelat(i.tenggat, hariIni) : null;
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
                  <div className="kc-meta">
                    <span className="av-grup">
                      {i.penanggung.map((p) => <span key={p} className="av" title={p}>{inisial(p)}</span>)}
                    </span>
                    {telatLabel
                      ? <span className="kc-telat">{telatLabel}</span>
                      : <span className="muted kc-tenggat">Tenggat {formatTanggalPendek(i.tenggat)}</span>}
                  </div>
                  <Link href={`/redaksi/tulisan/${i.id}`} className="kc-kelola">Detail, cover, atau hapus →</Link>
                  <label className="papan-pindah">
                    <span className="muted">Pindah ke</span>
                    <select
                      aria-label={`Pindah status ${i.judul}`}
                      value={i.status}
                      disabled={sibuk}
                      onChange={(e) => pindahkan(i.id, e.target.value as StatusTulisan)}
                    >
                      {STATUS_TULISAN.map((s) => {
                        const selisih = STATUS_TULISAN.indexOf(s) - STATUS_TULISAN.indexOf(i.status);
                        // Maju hanya satu langkah. Mundur ke status mana pun boleh (dengan catatan wajib).
                        const boleh = selisih <= 1;
                        return (
                          <option key={s} value={s} disabled={!boleh}>{KOLOM[s].nomor} · {KOLOM[s].judul}</option>
                        );
                      })}
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
