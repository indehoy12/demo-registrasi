import { useEffect, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Provider, useDemo } from './store'
import { Modal, WmImg, CONSULT_URL } from './ui'
import { Home, Dashboard, Reports, About } from './pages/Basic'
import Event from './pages/Event'
import Participants from './pages/Participants'
import Register from './pages/Register'
import Scan from './pages/Scan'

const links: [string, string][] = [['/overview', 'Overview'], ['/event', 'Event'], ['/participants', 'Participants'], ['/register', 'Registration'], ['/scan', 'QR Check-in'], ['/reports', 'Reports'], ['/about', 'About Demo']]
const quick: [string, string][] = [['/overview', 'Overview'], ['/participants', 'Peserta'], ['/register', 'Daftar'], ['/scan', 'Scan'], ['/reports', 'Laporan']]

function Layout() {
  const { reset } = useDemo()
  const [open, setOpen] = useState(false), [confirm, setConfirm] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])
  return <div className={'app' + (open ? ' open' : '')}>
    <WmImg page />
    <header className="top">
      <button className="btn alt sm menu" onClick={() => setOpen(!open)}>Menu</button>
      <Link className="logo" to="/">Sumber Rejeki <span>Tech</span></Link><span className="badge">DEMO</span><span className="sp" />
      <button className="btn alt sm" onClick={() => setConfirm(true)}>Reset Demo</button>
      <a className="btn sm" href={CONSULT_URL} target="_blank" rel="noopener noreferrer"><span className="hide-sm">Kunjungi&nbsp;</span>Website Utama</a>
    </header>
    <div className="banner">Anda sedang menggunakan Demo Sumber Rejeki Tech. Data hanya untuk simulasi.</div>
    <div className="shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <nav className="side">{links.map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}</nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} /><Route path="/overview" element={<Dashboard />} />
          <Route path="/event" element={<Event />} /><Route path="/participants" element={<Participants />} />
          <Route path="/register" element={<Register />} /><Route path="/scan" element={<Scan />} />
          <Route path="/reports" element={<Reports />} /><Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
    <footer className="foot">© 2026 · Dikembangkan oleh <a href={CONSULT_URL} target="_blank" rel="noopener noreferrer">Sumber Rejeki Tech</a></footer>
    <nav className="bnav">{quick.map(([to, l]) => <NavLink key={to} to={to} className={to === '/scan' ? 'go' : undefined}>{l}</NavLink>)}</nav>
    {confirm && <Modal onClose={() => setConfirm(false)}>
      <h3 style={{ fontSize: 18 }}>Reset Demo?</h3><p className="mu">Semua perubahan simulasi akan dihapus dan data kembali ke kondisi awal.</p>
      <div className="row" style={{ marginTop: 16 }}><button className="btn" onClick={() => { reset(); setConfirm(false) }}>Ya, Reset</button><button className="btn alt" onClick={() => setConfirm(false)}>Batal</button></div>
    </Modal>}
  </div>
}

export default function App() {
  return <BrowserRouter><Provider><Layout /></Provider></BrowserRouter>
}
