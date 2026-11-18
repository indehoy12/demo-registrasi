import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { useDemo, addLog } from '../store'
import { QR, Tag } from '../ui'
import { code, now } from '../data'

export default function Scan() {
  const { s, update, notify } = useDemo()
  const [q, setQ] = useState('')
  const vid = useRef<HTMLVideoElement>(null), stream = useRef<MediaStream | null>(null), raf = useRef(0)

  const scan = (c: string, cam = false) => {
    const retry = cam ? start : undefined, p = s.p.find(x => code(x) === c.trim())
    if (!p) return notify({ ok: false, title: 'Tidak Valid', msg: 'QR Code tidak dikenali atau tidak berlaku untuk acara ini.', retry })
    if (p.in) return notify({ ok: false, title: 'Sudah Digunakan', msg: 'Tiket ini sudah digunakan untuk check-in.', retry })
    update(d => { const x = d.p.find(y => y.id === p.id)!; x.in = true; x.t = now(); addLog(d, 'Check-in: ' + x.name) })
    notify({ ok: true, title: 'Berhasil', msg: 'Check-in berhasil. Selamat datang, ' + p.name + '.', retry })
  }
  const latest = useRef(scan); latest.current = scan

  const stop = () => {
    cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach(t => t.stop()); stream.current = null
    if (vid.current) { vid.current.srcObject = null; vid.current.hidden = true }
  }
  useEffect(() => stop, []) // kamera dimatikan saat keluar halaman

  const start = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera')
      stop()
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      stream.current = st
      const v = vid.current!; v.srcObject = st; v.hidden = false; await v.play()
      const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true })!
      const tick = () => {
        if (!stream.current) return
        if (v.videoWidth) {
          c.width = v.videoWidth; c.height = v.videoHeight; x.drawImage(v, 0, 0)
          const d = x.getImageData(0, 0, c.width, c.height), r = jsQR(d.data, d.width, d.height)
          if (r && r.data) { stop(); latest.current(r.data, true); return }
        }
        raf.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      stop(); notify({ ok: false, title: 'Kamera Tidak Tersedia', msg: 'Izin kamera ditolak atau perangkat tidak mendukung. Gunakan Simulasi Cepat atau Check-in Manual.' })
    }
  }

  const sim = (k: 'ok' | 'used' | 'bad') => {
    if (k === 'bad') return scan('INVALID-000')
    const u = k === 'ok' ? sample : s.p.find(x => x.in)
    if (u) scan(code(u))
    else notify({ ok: false, title: k === 'used' ? 'Belum Ada Data' : 'Semua Sudah Hadir', msg: k === 'used' ? 'Belum ada peserta yang check-in.' : 'Gunakan Reset Demo untuk mengulang.' })
  }
  const manual = (id: number) => {
    const p = s.p.find(x => x.id === id)!
    if (p.in) notify({ ok: false, title: 'Check-in Ganda Ditolak', msg: p.name + ' sudah check-in sebelumnya.' }); else scan(code(p))
  }
  const found = q ? s.p.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [], sample = s.p.find(x => x.id === s.last && !x.in) ?? s.p.find(x => !x.in)

  return <>
    <h2>QR Check-in</h2>
    <div className="two">
      <div className="card"><h3>Metode A — Kamera</h3>
        <p className="mu">Arahkan kamera ke QR tiket demo. Kamera hanya aktif saat Anda menekan tombol.</p>
        <div className="row"><button className="btn" onClick={start}>Aktifkan Kamera</button><button className="btn alt" onClick={stop}>Matikan</button></div>
        <video ref={vid} hidden playsInline muted />
        {sample && <div className="qrs" style={{ marginTop: 14 }}><QR text={code(sample)} /><div><b>{sample.id === s.last ? 'Tiket Anda (baru didaftarkan)' : 'QR contoh'}</b><br /><span className="mu">{sample.name}<br />{code(sample)}</span></div></div>}
      </div>
      <div className="card"><h3>Metode B — Simulasi Cepat</h3>
        <p className="mu">Tanpa kamera atau perangkat kedua. Pilih hasil yang ingin dicoba.</p>
        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <button className="btn" onClick={() => sim('ok')}>Simulasikan QR Valid</button>
          <button className="btn alt" onClick={() => sim('used')}>Simulasikan QR Sudah Digunakan</button>
          <button className="btn alt" onClick={() => sim('bad')}>Simulasikan QR Tidak Valid</button>
        </div>
      </div>
    </div>
    <div className="card" style={{ marginTop: 16 }}><h3>Check-in Manual</h3>
      <input placeholder="Cari nama peserta…" value={q} onChange={e => setQ(e.target.value)} />
      {found.length > 0 && <div className="tw mt-3"><table className="rt"><tbody>{found.map(p => <tr key={p.id}>
        <td data-l="Nama">{p.name}</td><td data-l="Status"><Tag p={p} /></td><td><button className="btn sm" onClick={() => manual(p.id)}>Check-in</button></td></tr>)}</tbody></table></div>}
    </div>
  </>
}
