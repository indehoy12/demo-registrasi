import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

const open = (path = '/') => { window.history.pushState({}, '', path); return render(<App />) }
const stat = (l: string) => screen.getByText(l).parentElement!.querySelector('b')!.textContent
const link = (n: string | RegExp) => screen.getAllByRole('link', { name: n })[0]
let spies: ReturnType<typeof vi.spyOn>[] = []
beforeEach(() => { sessionStorage.clear(); spies = (['alert', 'confirm', 'prompt'] as const).map(k => vi.spyOn(window, k).mockImplementation(() => null as never)) })
afterEach(() => { spies.forEach(s => expect(s).not.toHaveBeenCalled()) }) // tidak boleh ada alert/confirm/prompt bawaan browser
const close = async (u: ReturnType<typeof userEvent.setup>) => u.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Tutup' }))

describe('Halaman & route', () => {
  it('welcome sesuai PRD', () => {
    open('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Event Registration & QR Check-in' })).toBeInTheDocument()
    expect(screen.getByText(/Coba bagaimana sistem pendaftaran peserta/)).toBeInTheDocument()
    expect(screen.getByText(/Seluruh data yang ditampilkan merupakan data contoh/)).toBeInTheDocument()
    expect(screen.getByText('Anda sedang menggunakan Demo Sumber Rejeki Tech. Data hanya untuk simulasi.')).toBeInTheDocument()
    expect(screen.getByText(/Dikembangkan oleh/)).toBeInTheDocument()
    ;['Jelajahi Dashboard', 'Coba Registrasi Peserta', 'Coba QR Check-in'].forEach(n => expect(screen.getByRole('link', { name: n })).toBeInTheDocument())
    const w = screen.getByRole('link', { name: /Website Utama/ })
    expect(w).toHaveAttribute('target', '_blank'); expect(w).toHaveAttribute('rel', 'noopener noreferrer')
  })
  it.each([['/overview', 'Dashboard'], ['/event', 'Event'], ['/participants', 'Participants'], ['/register', 'Halaman Acara'], ['/scan', 'QR Check-in'], ['/reports', 'Reports'], ['/about', 'About Demo']])('route %s dapat dibuka langsung', (p, h) => {
    open(p); expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
  })
  it('route tidak dikenal tidak error', () => { open('/xyz'); expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument() })
  it('dashboard: angka awal sesuai PRD', () => {
    open('/overview')
    expect([stat('Total peserta'), stat('Sudah check-in'), stat('Belum hadir'), stat('Persentase kehadiran')]).toEqual(['250', '180', '70', '72%'])
  })
})

describe('Registrasi', () => {
  it('validasi nama dan email', async () => {
    const u = userEvent.setup(); open('/register')
    await u.click(screen.getByRole('button', { name: 'Daftar' }))
    await u.clear(screen.getByPlaceholderText('Contoh: Budi Santoso')); await u.clear(screen.getByPlaceholderText('nama@example.com')); await u.type(screen.getByPlaceholderText('nama@example.com'), 'abc')
    await u.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Nama minimal 3 karakter.')).toBeInTheDocument()
    expect(screen.getByText(/Format email tidak valid/)).toBeInTheDocument()
    expect(screen.queryByText(/Pendaftaran Berhasil/)).toBeNull()
  })
  it('watermark logo tampil di halaman', () => { open('/overview'); expect(document.querySelector('svg.wmp image')).toHaveAttribute('href', '/watermark.png') })
  it('alur lengkap: daftar → tiket QR → scan → dashboard konsisten', async () => {
    const u = userEvent.setup(); open('/register')
    await u.click(screen.getByRole('button', { name: 'Daftar' })); await u.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(await screen.findByRole('heading', { name: /Pendaftaran Berhasil/ })).toBeInTheDocument()
    expect(screen.getByText(/SRT-0251/)).toBeInTheDocument()
    expect(document.querySelectorAll('.ticket svg rect').length).toBeGreaterThan(100)
    expect(document.querySelector('.ticket.wm svg.wmi')).toBeTruthy(); expect(within(document.querySelector('.ticket') as HTMLElement).getByText('DEMO')).toBeInTheDocument()
    await u.click(screen.getByRole('link', { name: 'Coba Scan Tiket Ini' }))
    expect(screen.getByText('Tiket Anda (baru didaftarkan)')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Valid' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Check-in berhasil. Selamat datang, Rina Wulandari.')
    await close(u); await u.click(link('Overview'))
    expect([stat('Total peserta'), stat('Sudah check-in'), stat('Belum hadir')]).toEqual(['251', '181', '70'])
    expect(screen.getByText(/Check-in: Rina Wulandari/)).toBeInTheDocument(); expect(screen.getByText(/Registrasi baru: Rina Wulandari/)).toBeInTheDocument()
    expect(JSON.parse(sessionStorage.getItem('srt-demo-v2')!).p).toHaveLength(251)
  })
  it('hanya satu acara: tidak ada fitur tambah acara maupun pilihan acara', async () => {
    const u = userEvent.setup(); const r = open('/event')
    expect(screen.queryByText(/Buat Acara|Tambah Acara/)).toBeNull(); expect(screen.getByText(/hanya untuk satu acara/)).toBeInTheDocument()
    r.unmount(); open('/register'); expect(screen.queryByRole('combobox')).toBeNull()
    await u.click(screen.getByRole('button', { name: 'Daftar' })); expect(screen.getAllByRole('combobox')).toHaveLength(1)
  })
})

describe('QR scanner', () => {
  it('valid / sudah digunakan / tidak valid + pesan sesuai PRD', async () => {
    const u = userEvent.setup(); open('/scan')
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Valid' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Check-in berhasil. Selamat datang, Andi Pratama.'); await close(u)
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Sudah Digunakan' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Tiket ini sudah digunakan untuk check-in.'); await close(u)
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Tidak Valid' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('QR Code tidak dikenali atau tidak berlaku untuk acara ini.'); await close(u)
    await u.click(link('Overview')); expect(stat('Sudah check-in')).toBe('181')
  })
  it('check-in manual lalu check-in ganda ditolak', async () => {
    const u = userEvent.setup(); open('/scan')
    await u.type(screen.getByPlaceholderText('Cari nama peserta…'), 'Andi Pratama')
    await u.click(screen.getAllByRole('button', { name: 'Check-in' })[0])
    expect(await screen.findByRole('dialog')).toHaveTextContent('Selamat datang, Andi Pratama'); await close(u)
    await u.click(screen.getAllByRole('button', { name: 'Check-in' })[0])
    expect(await screen.findByRole('dialog')).toHaveTextContent('Check-in Ganda Ditolak'); await close(u)
  })
  it('kamera tidak tersedia → modal, bukan error', async () => {
    const u = userEvent.setup(); open('/scan')
    await u.click(screen.getByRole('button', { name: 'Aktifkan Kamera' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Kamera Tidak Tersedia')
  })
})

describe('Data, laporan, reset', () => {
  it('participants: search, filter, pagination, tambah, edit', async () => {
    const u = userEvent.setup(); open('/participants')
    expect(screen.getByText('250 peserta')).toBeInTheDocument(); expect(screen.getByText('1 / 25')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Berikutnya' })); expect(screen.getByText('2 / 25')).toBeInTheDocument()
    await u.selectOptions(screen.getAllByRole('combobox')[1], 'Hadir'); expect(screen.getByText('180 peserta')).toBeInTheDocument()
    await u.selectOptions(screen.getAllByRole('combobox')[1], 'Semua')
    await u.type(screen.getByPlaceholderText('Nama atau email…'), 'peserta250@example.com'); expect(screen.getByText('1 peserta')).toBeInTheDocument()
    await u.clear(screen.getByPlaceholderText('Nama atau email…'))
    await u.click(screen.getByRole('button', { name: /Tambah Peserta/ }))
    let d = screen.getByRole('dialog'); await u.type(within(d).getByRole('textbox'), 'Peserta Baru'); await u.click(within(d).getByRole('button', { name: 'Simpan' }))
    expect(screen.getByText('251 peserta')).toBeInTheDocument()
    await u.click(screen.getAllByRole('button', { name: 'Detail' })[0]); await u.click(screen.getByRole('button', { name: 'Simulasi Edit' }))
    d = screen.getByRole('dialog'); await u.clear(within(d).getByRole('textbox')); await u.type(within(d).getByRole('textbox'), 'Andi Diubah'); await u.click(within(d).getByRole('button', { name: 'Simpan' }))
    expect(screen.getByText('Andi Diubah')).toBeInTheDocument()
  })
  it('edit acara tampil di halaman registrasi', async () => {
    const u = userEvent.setup(); open('/event')
    await u.click(screen.getByRole('button', { name: /Edit Informasi Acara/ }))
    const d = screen.getByRole('dialog'); await u.clear(within(d).getAllByRole('textbox')[0]); await u.type(within(d).getAllByRole('textbox')[0], 'Acara Ganti Nama')
    await u.click(within(d).getByRole('button', { name: 'Simpan' })); await u.click(link('Registration'))
    expect(screen.getByRole('heading', { level: 1, name: 'Acara Ganti Nama' })).toBeInTheDocument()
  })
  it('reports: filter kategori + preview berwatermark', async () => {
    const u = userEvent.setup(); open('/reports')
    await u.selectOptions(screen.getAllByRole('combobox')[0], 'VIP'); await u.click(screen.getByRole('button', { name: 'Preview Laporan' }))
    const d = await screen.findByRole('dialog'); expect(d).toHaveTextContent('Preview Laporan (Demo)'); expect(d).toHaveClass('wm')
    expect(screen.getByRole('button', { name: /Ekspor/ })).toBeDisabled()
  })
  it('reset demo dengan konfirmasi modal mengembalikan data awal', async () => {
    const u = userEvent.setup(); open('/scan')
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Valid' })); await close(u)
    await u.click(screen.getByRole('button', { name: 'Reset Demo' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Reset Demo?')
    await u.click(screen.getByRole('button', { name: 'Ya, Reset' })); await u.click(link('Overview'))
    expect([stat('Total peserta'), stat('Sudah check-in')]).toEqual(['250', '180'])
  })
  it('data sesi tersimpan di sessionStorage dan dipulihkan', async () => {
    const u = userEvent.setup(); const r = open('/scan')
    await u.click(screen.getByRole('button', { name: 'Simulasikan QR Valid' })); await close(u); r.unmount()
    open('/overview'); expect(stat('Sudah check-in')).toBe('181')
  })
})
