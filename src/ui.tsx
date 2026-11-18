import { useEffect, useId, type ReactNode } from 'react'
import qrcode from 'qrcode-generator'
import type { Participant } from './data'

export const CONSULT_URL = 'https://sumberrejekitech.web.id'

export function Modal({ onClose, children, className = '' }: { onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}><div className={'mbox ' + className} role="dialog" aria-modal="true">{children}</div></div>
}

// Satu-satunya ikon di aplikasi: centang hijau dan silang merah
export function Mark({ ok, size = 14 }: { ok: boolean; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ok ? 'var(--ok)' : 'var(--er)'} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
  </svg>
}
export const Big = ({ ok }: { ok: boolean }) => <div className={'big ' + (ok ? 'ok' : 'er')}><Mark ok={ok} size={38} /></div>

export const Tag = ({ p }: { p: Participant }) =>
  <span className={'tag ' + (p.in ? 'ok' : 'no')}><Mark ok={p.in} size={12} />{p.in ? 'Hadir ' + (p.t ?? '') : 'Belum hadir'}</span>

// QR dirender sebagai SVG (tanpa dangerouslySetInnerHTML)
export function QR({ text }: { text: string }) {
  const q = qrcode(0, 'M'); q.addData(text); q.make()
  const n = q.getModuleCount(), cells = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cells.push(<rect key={r * n + c} x={c} y={r} width={1} height={1} />)
  return <svg viewBox={`-4 -4 ${n + 8} ${n + 8}`} shapeRendering="crispEdges" role="img" aria-label="QR Code demo"><rect x={-4} y={-4} width={n + 8} height={n + 8} fill="#fff" />{cells}</svg>
}

export interface BarItem { l: string; v: number; max: number; n: string }
export const Bars = ({ items }: { items: BarItem[] }) => <div>{items.map(i =>
  <div className="brow" key={i.l}><span>{i.l}</span><div className="bar"><i style={{ width: (i.max ? Math.round((i.v / i.max) * 100) : 0) + '%' }} /></div><span>{i.n}</span></div>)}
</div>

// Watermark: pola logo berulang, miring. SVG (bukan latar CSS) agar ikut tercetak.
export function WmImg({ page }: { page?: boolean }) {
  const L = page ? 190 : 84, id = 'wm' + useId().replace(/:/g, ''), h = L * 0.197
  return <svg className={page ? 'wmp' : 'wmi'} aria-hidden="true" focusable="false">
    <defs><pattern id={id} width={L * 2.2} height={L * 1.2} patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
      <image href="/watermark.png" x={L * 0.05} y={L * 0.1} width={L} height={h} />
      <image href="/watermark.png" x={L * 1.1} y={L * 0.7} width={L} height={h} />
    </pattern></defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
}

export const Cta = () => <div className="card row">
  <div><h3>Tertarik dengan sistem seperti ini?</h3><span className="mu">Fitur asli dapat disesuaikan dengan kebutuhan acara Anda.</span></div>
  <span className="sp" />
  <a className="btn" href={CONSULT_URL} target="_blank" rel="noopener noreferrer">Konsultasi Sekarang</a>
</div>
