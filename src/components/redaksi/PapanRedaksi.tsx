'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { gantiStatus } from '@/fitur/tulisan/actions';
import type { ItemPapanDb } from '@/fitur/tulisan/layanan';
import { adalahMundur, formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';

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
                      disabled={sibuk}
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
