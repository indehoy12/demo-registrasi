import { useState } from 'react'
import { useDemo } from '../store'
import { Modal } from '../ui'
import { stats } from '../data'

export default function Event() {
  const { s, update } = useDemo(), e = s.event, st = stats(s.p)
  const [open, setOpen] = useState(false), [f, setF] = useState({ name: e.name, date: e.date, loc: e.loc })
  const save = () => {
    update(d => { d.event.name = f.name.trim() || d.event.name; d.event.date = f.date.trim() || d.event.date; d.event.loc = f.loc.trim() || d.event.loc })
    setOpen(false)
  }
  return <>
    <div className="row"><h2 style={{ margin: 0 }}>Event</h2><span className="sp" />
      <button className="btn" onClick={() => { setF({ name: e.name, date: e.date, loc: e.loc }); setOpen(true) }}>Edit Informasi Acara</button></div>
    <div className="card hero mt-4"><h1>{e.name}</h1><p className="lead">{e.date} · {e.loc}</p>
      <p className="mu">Sistem ini hanya untuk satu acara ini. Tidak ada acara lain yang dapat ditambahkan.</p></div>
    <div className="grid">
      {([[e.quota, 'Kuota'], [st.total, 'Terdaftar'], [st.inn, 'Sudah hadir'], [Math.max(0, e.quota - st.total), 'Sisa kuota']] as const)
        .map(([v, l]) => <div className="card stat" key={l}><b>{v}</b><span>{l}</span></div>)}
    </div>
    <div className="card"><h3>Preview formulir pendaftaran</h3>
      <div className="fg"><div><label style={{ marginTop: 0 }}>Nama lengkap</label><input disabled /></div><div><label style={{ marginTop: 0 }}>Email</label><input disabled /></div></div>
      <label>Kategori</label><input disabled value="Umum" style={{ maxWidth: 280 }} /></div>
    {open && <Modal onClose={() => setOpen(false)}>
      <h3 style={{ fontSize: 18 }}>Edit Informasi Acara</h3>
      <label>Nama</label><input value={f.name} onChange={x => setF({ ...f, name: x.target.value })} />
      <label>Tanggal</label><input value={f.date} onChange={x => setF({ ...f, date: x.target.value })} />
      <label>Lokasi</label><input value={f.loc} onChange={x => setF({ ...f, loc: x.target.value })} />
      <div className="row" style={{ marginTop: 18 }}><button className="btn" onClick={save}>Simpan</button><button className="btn alt" onClick={() => setOpen(false)}>Batal</button></div>
    </Modal>}
  </>
}
