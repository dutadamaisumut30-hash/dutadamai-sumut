// Kerangka ringan saat halaman menunggu data dari database.
export default function Memuat() {
  return (
    <div className="kerangka" aria-busy="true" aria-label="Memuat halaman">
      <div className="kerangka-baris" style={{ width: '30%', height: 14 }} />
      <div className="kerangka-baris" style={{ width: '70%', height: 36, marginTop: 14 }} />
      <div className="kerangka-baris" style={{ width: '100%', height: 14, marginTop: 22 }} />
      <div className="kerangka-baris" style={{ width: '92%', height: 14 }} />
      <div className="kerangka-baris" style={{ width: '80%', height: 14 }} />
    </div>
  );
}
