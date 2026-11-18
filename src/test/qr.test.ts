import { it, expect } from 'vitest'
import qrcode from 'qrcode-generator'
import jsQR from 'jsqr'

it('QR tiket dapat dibaca oleh decoder yang sama dengan scanner kamera', () => {
  for (const text of ['SRT-0001', 'SRT-0251', 'SRT-0250']) {
    const q = qrcode(0, 'M'); q.addData(text); q.make()
    const n = q.getModuleCount(), s = 8, qz = 4, W = (n + qz * 2) * s, px = new Uint8ClampedArray(W * W * 4).fill(255)
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c))
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const i = (((r + qz) * s + y) * W + (c + qz) * s + x) * 4; px[i] = px[i + 1] = px[i + 2] = 0 }
    expect(jsQR(px, W, W)?.data).toBe(text)
  }
})
