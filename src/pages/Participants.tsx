import { useState } from 'react'
import { useDemo, addLog } from '../store'
import { Modal, Tag } from '../ui'
import { CATS, code, type Cat, type Participant } from '../data'

type M = { t: 'add' } | { t: 'detail' | 'edit'; id: number } | null

function PForm({ p, onClose }: { p?: Participant; onClose: () => void }) {
  const { update } = useDemo()
  const [name, setName] = useState(p?.name ?? ''), [cat, setCat] = useState<Cat>(p?.cat ?? 'Umum'), [err, setErr] = useState('')
  const save = () => {
    const n = name.trim()
    if (n.length < 3) return setErr('Nama minimal 3 karakter.')
    update(d => {
      if (p) { const q = d.p.find(x => x.id === p.id)!; q.name = n; q.cat = cat; addLog(d, 'Peserta diubah: ' + n) }
      else { const id = Math.max(...d.p.map(x => x.id)) + 1; d.p.push({ id, name: n, email: 'peserta' + id + '@example.com', cat, in: false, t: null }); addLog(d, 'Peserta ditambah: ' + n) }
    })
    onClose()
  }
  return <Modal onClose={onClose}>
    <h3 style={{ fontSize: 18 }}>{p ? 'Edit peserta' : 'Tambah peserta (simulasi)'}</h3>
    <label>Nama</label><input value={name} onChange={e => setName(e.target.value)} />
    <label>Kategori</label><select value={cat} onChange={e => setCat(e.target.value as Cat)}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
    <div className="err">{err}</div>
    <div className="row"><button className="btn" onClick={save}>Simpan</button><button className="btn alt" onClick={onClose}>Batal</button></div>
  </Modal>
}

export default function Participants() {
  const { s } = useDemo()
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [st, setSt] = useState(''), [pg, setPg] = useState(1), [m, setM] = useState<M>(null)
  const a = s.p.filter(p => (!q || (p.name + p.email).toLowerCase().includes(q.toLowerCase())) && (!cat || p.cat === cat) && (!st || (st === 'in') === p.in))
  const pages = Math.max(1, Math.ceil(a.length / 10)), cur = Math.min(pg, pages)
  const sel = m && m.t !== 'add' ? s.p.find(x => x.id === m.id) : undefined
  return <>
    <div className="row"><h2 style={{ margin: 0 }}>Participants</h2><span className="sp" /><button className="btn" onClick={() => setM({ t: 'add' })}>Tambah Peserta (Simulasi)</button></div>
    <div className="card" style={{ marginTop: 16 }}>
      <div className="fg">
        <div><label style={{ marginTop: 0 }}>Cari</label><input placeholder="Nama atau email…" value={q} onChange={e => { setQ(e.target.value); setPg(1) }} /></div>
        <div><label style={{ marginTop: 0 }}>Kategori</label><select value={cat} onChange={e => { setCat(e.target.value); setPg(1) }}><option value="">Semua</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label style={{ marginTop: 0 }}>Status</label><select value={st} onChange={e => { setSt(e.target.value); setPg(1) }}><option value="">Semua</option><option value="in">Hadir</option><option value="out">Belum hadir</option></select></div>
      </div>
      <div className="tw mt-3"><table className="rt">
        <thead><tr><th>No.</th><th>Nama</th><th>Kategori</th><th>Status</th><th></th></tr></thead>
        <tbody>{a.slice((cur - 1) * 10, cur * 10).map(p => <tr key={p.id}>
          <td data-l="No.">{code(p)}</td><td data-l="Nama">{p.name}</td><td data-l="Kategori">{p.cat}</td><td data-l="Status"><Tag p={p} /></td>
          <td><button className="btn alt sm" onClick={() => setM({ t: 'detail', id: p.id })}>Detail</button></td></tr>)}</tbody>
      </table>{a.length === 0 && <p className="mu">Tidak ada peserta yang cocok dengan filter.</p>}</div>
      <div className="row mt-3"><span className="mu">{a.length} peserta</span><span className="sp" />
        <button className="btn alt sm" disabled={cur <= 1} onClick={() => setPg(cur - 1)}>Sebelumnya</button><span>{cur} / {pages}</span>
        <button className="btn alt sm" disabled={cur >= pages} onClick={() => setPg(cur + 1)}>Berikutnya</button></div>
    </div>
    {m?.t === 'add' && <PForm onClose={() => setM(null)} />}
    {m?.t === 'edit' && sel && <PForm p={sel} onClose={() => setM(null)} />}
    {m?.t === 'detail' && sel && <Modal onClose={() => setM(null)}>
      <h3 style={{ fontSize: 18 }}>{sel.name}</h3><p>No. {code(sel)}<br />{sel.email}<br />Kategori: {sel.cat}</p><p><Tag p={sel} /></p>
      <div className="row"><button className="btn" onClick={() => setM({ t: 'edit', id: sel.id })}>Simulasi Edit</button><button className="btn alt" onClick={() => setM(null)}>Tutup</button></div>
    </Modal>}
  </>
}
