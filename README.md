# Demo Event Registration & QR Check-in — Sumber Rejeki Tech

Demo publik interaktif (PRD-01B). React + TypeScript + Vite + Tailwind CSS. Tanpa login, tanpa backend, data dummy per sesi (`sessionStorage`).

## Menjalankan
```bash
npm install
npm run dev      # pengembangan
npm run build    # build produksi -> dist/
```

## Deploy tercepat (tanpa npm)
Pakai `demo-registration-siap-upload.zip`: ekstrak, lalu drag folder hasilnya ke https://app.netlify.com/drop. Fallback route (`_redirects`) dan header sudah ikut di dalamnya.

## Deploy ke Netlify dari Git
1. Push proyek ke GitHub, lalu "Add new site → Import from Git" di Netlify.
2. Build command `npm run build`, publish directory `dist` (sudah di `netlify.toml`, termasuk fallback SPA).
3. Domain: tambahkan `demo-registration.sumberrejekitech.web.id` di Domain settings, lalu buat CNAME di DNS ke alamat `*.netlify.app` situs Anda. HTTPS otomatis.
4. Di website utama, isi `demoUrl` dengan URL demo; tombol "Lihat Demo" harus `target="_blank" rel="noopener noreferrer"`.

## Tema warna
Warna tema mengambil dari logo: navy `#011f59` (utama) dan oranye `#fd7a00` (aksen). Ubah di variabel `:root` pada `src/index.css`. Footer "Dikembangkan oleh Sumber Rejeki Tech" ada di `src/App.tsx`.

## Pengujian
```bash
npm test         # 22 pengujian otomatis (alur pendaftaran, scan, check-in ganda, reset, filter, laporan, QR terbaca decoder)
npm run build    # type-check + build produksi
```
Sebelum rilis, tetap coba manual di HP asli (kamera butuh HTTPS) dan beberapa ukuran layar.

## Watermark
Watermark berupa pola logo berulang secara diagonal, memakai `public/watermark.png` (latar transparan). Ganti file itu untuk mengubah watermark di halaman, tiket QR, dan preview laporan.

## Catatan
- Link konsultasi ada di `src/ui.tsx` (`CONSULT_URL`). Ganti dengan link WhatsApp resmi bila ada.
- Kamera scanner butuh HTTPS (otomatis di Netlify).
- Semua kode dan data dikirim ke browser, jadi anggap publik. Jangan menaruh kredensial apa pun.
