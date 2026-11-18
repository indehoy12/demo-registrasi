export const CATS = ['Umum', 'VIP', 'Pembicara', 'Mahasiswa'] as const
export type Cat = (typeof CATS)[number]
export interface Participant { id: number; name: string; email: string; cat: Cat; in: boolean; t: string | null }
export interface EventItem { id: number; name: string; date: string; loc: string; quota: number }
export interface DemoState { p: Participant[]; event: EventItem; log: { t: string; x: string }[]; last?: number }

const FN = ['Andi','Budi','Citra','Dewi','Eko','Fajar','Gita','Hadi','Indah','Joko','Kartika','Lukman','Maya','Nanda','Oki','Putri','Rina','Sari','Tono','Wulan']
const LN = ['Pratama','Santoso','Wijaya','Lestari','Saputra','Kusuma','Hidayat','Nugroho','Permata','Rahman','Setiawan','Utami','Wibowo','Aryani']

export const code = (p: Participant) => 'SRT-' + String(p.id).padStart(4, '0')
export const now = () => new Date().toTimeString().slice(0, 5)
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function stats(p: Participant[]) {
  const total = p.length, inn = p.filter(x => x.in).length
  return { total, inn, out: total - inn, pct: total ? Math.round((inn / total) * 100) : 0 }
}

// Seed deterministik: 250 peserta, 180 sudah check-in (72%)
export function seed(): DemoState {
  let s = 42
  const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296
  const p: Participant[] = []
  for (let i = 1; i <= 250; i++) {
    p.push({
      id: i,
      name: i === 1 ? 'Andi Pratama' : FN[Math.floor(r() * FN.length)] + ' ' + LN[Math.floor(r() * LN.length)],
      email: 'peserta' + i + '@example.com',
      cat: i === 1 ? 'VIP' : CATS[Math.floor(r() * 4)],
      in: false, t: null,
    })
  }
  const idx = p.map((_, i) => i).slice(1)
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
  idx.slice(0, 180).forEach(i => { p[i].in = true; p[i].t = '0' + (8 + (i % 2)) + ':' + String(i % 60).padStart(2, '0') })
  return {
    p, log: [],
    event: { id: 1, name: 'Tech Innovation Summit 2026', date: '2026-12-05', loc: 'Jakarta Convention Hall', quota: 300 },
  }
}
