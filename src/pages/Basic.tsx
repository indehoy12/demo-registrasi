import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../store'
import { CATS, stats, type Participant } from '../data'
import { Bars, Cta, Modal, WmImg, type BarItem } from '../ui'

const attend = (p: Participant[]): BarItem[] => CATS.map(c => { const a = p.filter(x => x.cat === c), h = a.filter(x => x.in).length; return { l: c, v: h, max: a.length, n: `${h}/${a.length} · ${a.length ? Math.round((h / a.length) * 100) : 0}%` } })
const regs = (p: Participant[]): BarItem[] => { const m = Math.max(1, ...CATS.map(c => p.filter(x => x.cat === c).length)); return CATS.map(c => { const n = p.filter(x => x.cat === c).length; return { l: c, v: n, max: m, n: String(n) } }) }
const hours = (p: Participant[]): BarItem[] => {
  const m: Record<string, number> = {}
  p.filter(x => x.in && x.t).forEach(x => { const h = x.t!.slice(0, 2) + ':00'; m[h] = (m[h] || 0) + 1 })
  const e = Object.entries(m).sort(([a], [b]) => a.localeCompare(b)), mx = Math.max(1, ...e.map(x => x[1]))
  return e.map(([l, v]) => ({ l, v, max: mx, n: String(v) }))
}

export function Home() {
  const cards: [string, string, string, string][] = [
    ['/overview', 'Admin Preview', 'Lihat statistik peserta, grafik, dan aktivitas terbaru.', 'Jelajahi Dashboard'],
    ['/register', 'Participant Registration', 'Isi formulir pendaftaran dan dapatkan tiket QR demo.', 'Coba Registrasi Peserta'],
    ['/scan', 'QR Check-in Simulation', 'Scan dengan kamera atau pakai simulasi tanpa kamera.', 'Coba QR Check-in'],
  ]
  return <>
    <div className="card hero">
      <span className="badge">DEMO</span>
      <h1>Event Registration &amp; QR Check-in</h1>
      <p className="lead">Coba bagaimana sistem pendaftaran peserta, tiket QR, dan check-in bekerja dalam satu aplikasi.</p>
      <p className="mu">Ini adalah aplikasi demonstrasi Sumber Rejeki Tech. Seluruh data yang ditampilkan merupakan data contoh.</p>
    </div>
    <div className="feat">{cards.map(([to, t, d, b]) => <div className="card" key={to}><h3>{t}</h3><p className="mu">{d}</p><Link className="btn" to={to}>{b}</Link></div>)}</div>
    <div className="card"><h3>Alur yang bisa Anda coba</h3>
      <ol className="steps"><li>Pendaftaran</li><li>Tiket QR</li><li>Scan</li><li>Check-in</li><li>Dashboard &amp; laporan</li></ol></div>
    <Cta />
  </>
}

function Ring({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 50
  return <svg viewBox="0 0 120 120" role="img" aria-label={`Kehadiran ${pct}%`}>
    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg)" strokeWidth="14" />
    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ac)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 60 60)" />
  </svg>
}

export function Dashboard() {
  const { s } = useDemo(), ps = s.p, st = stats(ps)
  return <>
    <div style={{ marginBottom: 14 }}><h2 style={{ margin: 0 }}>Dashboard</h2><span className="mu">{s.event.name}</span></div>
    <div className="grid">
      {([[st.total, 'Total peserta'], [st.inn, 'Sudah check-in'], [st.out, 'Belum hadir'], [st.pct + '%', 'Persentase kehadiran']] as const)
        .map(([v, l]) => <div className="card stat" key={l}><b>{v}</b><span>{l}</span></div>)}
    </div>
    <div className="two">
      <div className="card"><h3>Grafik kehadiran</h3><div className="gauge"><Ring pct={st.pct} /><div><b>{st.pct}%</b><span className="mu">{st.inn} dari {st.total} peserta hadir</span></div></div></div>
      <div className="card"><h3>Grafik registrasi per kategori</h3><Bars items={regs(ps)} /></div>
    </div>
    <div className="two">
      <div className="card"><h3>Kehadiran per kategori</h3><Bars items={attend(ps)} /></div>
      <div className="card"><h3>Check-in per jam</h3><Bars items={hours(ps)} /></div>
    </div>
    <div className="two">
      <div className="card"><h3>Aktivitas terbaru</h3>
        <ul>{s.log.length ? s.log.map((l, i) => <li key={i}><b>{l.t}</b> — {l.x}</li>) : <li className="mu">Belum ada aktivitas. Coba registrasi atau check-in.</li>}</ul></div>
      <div className="card"><h3>Acara</h3><p>{s.event.name}<br /><span className="mu">{s.event.date} · {s.event.loc}</span></p></div>
    </div>
  </>
}

export function Reports() {
  const { s } = useDemo()
  const [cat, setCat] = useState(''), [prev, setPrev] = useState(false)
  const ps = s.p.filter(p => (!cat || p.cat === cat)), st = stats(ps)
  return <>
    <div className="row"><h2 style={{ margin: 0 }}>Reports</h2><span className="sp" />
      <button className="btn" onClick={() => setPrev(true)}>Preview Laporan</button>
      <button className="btn alt" disabled title="Nonaktif pada demo">Ekspor (nonaktif di demo)</button></div>
    <div className="card" style={{ marginTop: 16 }}><label style={{ marginTop: 0 }}>Filter kategori</label>
      <select value={cat} onChange={e => setCat(e.target.value)} style={{ maxWidth: 280 }}><option value="">Semua kategori</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="grid">
      {([[st.total, 'Registrasi'], [st.inn, 'Check-in'], [st.pct + '%', 'Kehadiran']] as const).map(([v, l]) => <div className="card stat" key={l}><b>{v}</b><span>{l}</span></div>)}
    </div>
    <div className="two">
      <div className="card"><h3>Kehadiran berdasarkan kategori</h3><Bars items={attend(ps)} /></div>
      <div className="card"><h3>Grafik kehadiran per jam</h3><Bars items={hours(ps)} /></div>
    </div>
    {prev && <Modal onClose={() => setPrev(false)} className="wm"><WmImg />
      <h3 style={{ fontSize: 18 }}>Preview Laporan (Demo)</h3>
      <p className="mu">{s.event.name} · {new Date().toLocaleDateString('id-ID')} · {cat || 'Semua kategori'}</p>
      <div className="tw"><table><thead><tr><th>Kategori</th><th>Total</th><th>Hadir</th><th>%</th></tr></thead><tbody>
        {CATS.filter(c => !cat || c === cat).map(c => { const a = ps.filter(x => x.cat === c), h = a.filter(x => x.in).length; return <tr key={c}><td>{c}</td><td>{a.length}</td><td>{h}</td><td>{a.length ? Math.round((h / a.length) * 100) : 0}%</td></tr> })}
        <tr><td><b>Total</b></td><td><b>{st.total}</b></td><td><b>{st.inn}</b></td><td><b>{st.pct}%</b></td></tr></tbody></table></div>
      <div className="row" style={{ marginTop: 16 }}><button className="btn" onClick={() => setPrev(false)}>Tutup</button></div>
    </Modal>}
  </>
}

export function About() {
  return <>
    <h2>About Demo</h2>
    <div className="card"><p>Ini adalah demo interaktif Sumber Rejeki Tech. Beberapa hal yang perlu diketahui:</p>
      <ul>
        <li>Semua data adalah data contoh dan hanya tersimpan di browser Anda selama sesi.</li>
        <li>Tidak ada login, pembayaran, atau pengiriman email dan WhatsApp sungguhan.</li>
        <li>Ekspor laporan dinonaktifkan pada demo.</li>
        <li>Pada aplikasi asli, fitur dapat disesuaikan dengan kebutuhan Anda.</li>
      </ul></div>
    <Cta />
  </>
}
