import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo, addLog } from '../store'
import { Mark, QR, WmImg } from '../ui'
import { CATS, EMAIL_RE, code, type Cat } from '../data'

export default function Register() {
  const { s, update } = useDemo()
  const [step, setStep] = useState<'land' | 'form' | 'ticket'>('land')
  const [name, setName] = useState('Rina Wulandari'), [email, setEmail] = useState('rina@example.com'), [cat, setCat] = useState<Cat>('Umum')
  const [e1, setE1] = useState(''), [e2, setE2] = useState(''), [last, setLast] = useState<number | null>(null)
  const ev = s.event, lp = s.p.find(x => x.id === last)

  const submit = () => {
    const n = name.trim(), m = email.trim(), b1 = n.length < 3, b2 = !EMAIL_RE.test(m)
    setE1(b1 ? 'Nama minimal 3 karakter.' : ''); setE2(b2 ? 'Format email tidak valid, contoh: nama@example.com' : '')
    if (b1 || b2) return
    const id = Math.max(...s.p.map(x => x.id)) + 1
    update(d => { d.p.push({ id, name: n, email: m, cat, in: false, t: null }); d.last = id; addLog(d, 'Registrasi baru: ' + n) })
    setLast(id); setStep('ticket')
  }

  if (step === 'ticket' && lp) return <>
    <h2 className="row"><Mark ok size={22} /> Pendaftaran Berhasil</h2>
    <p className="mu">Ini tiket QR demo Anda. Pindai di menu QR Check-in untuk mencoba check-in.</p>
    <div className="ticket wm"><WmImg /><span className="badge">DEMO</span>
      <h3 className="mt-2">{ev.name}</h3>
      <p><b>{lp.name}</b><br /><span className="mu">No. Registrasi: {code(lp)}</span></p>
      <QR text={code(lp)} />
      <p className="mu" style={{ fontSize: 12 }}>QR hanya valid untuk simulasi demo</p>
    </div>
    <div className="row center">
      <Link className="btn" to="/scan">Coba Scan Tiket Ini</Link>
      <button className="btn alt" onClick={() => { setStep('land'); setName('Rina Wulandari'); setEmail('rina@example.com'); setLast(null) }}>Daftar Lagi</button>
      <button className="btn alt" onClick={() => window.print()}>Cetak</button>
    </div>
  </>

  if (step === 'land') return <>
    <h2>Halaman Acara</h2>
    <div className="card hero"><span className="badge">DEMO</span><h1>{ev.name}</h1>
      <p className="lead">{ev.date} · {ev.loc}</p>
      <p className="mu">Terdaftar {s.p.length} dari kuota {ev.quota} peserta. Ini adalah acara contoh untuk demo.</p>
      <button className="btn" onClick={() => setStep('form')}>Daftar</button></div>
  </>

  return <>
    <h2>Formulir Pendaftaran</h2>
    <div className="card">
      <h3>{ev.name}</h3>
      <div className="note">Formulir sudah berisi identitas contoh. Anda boleh mengubahnya, tetapi jangan memasukkan data pribadi asli.</div>
      <div className="fg">
        <div><label>Nama lengkap</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Budi Santoso" autoComplete="off" /><div className="err">{e1}</div></div>
        <div><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@example.com" inputMode="email" autoComplete="off" /><div className="err">{e2}</div></div>
      </div>
      <label style={{ marginTop: 0 }}>Kategori</label><select value={cat} onChange={e => setCat(e.target.value as Cat)} style={{ maxWidth: 280 }}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn" onClick={submit}>Daftar</button>
        <button className="btn alt" onClick={() => { setName('Rina Wulandari'); setEmail('rina@example.com'); setE1(''); setE2('') }}>Pulihkan Data Contoh</button>
        <button className="btn alt" onClick={() => setStep('land')}>Kembali</button>
      </div>
    </div>
  </>
}
