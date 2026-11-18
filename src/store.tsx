import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { seed, now, type DemoState } from './data'
import { Modal, Big } from './ui'

const KEY = 'srt-demo-v2'
export interface Note { ok: boolean; title: string; msg: string; retry?: () => void }
interface Ctx { s: DemoState; update: (fn: (d: DemoState) => void) => void; reset: () => void; notify: (n: Note) => void }
const C = createContext<Ctx>(null!)
export const useDemo = () => useContext(C)

export const addLog = (d: DemoState, x: string) => { d.log.unshift({ t: now(), x }); d.log = d.log.slice(0, 8) }

function load(): DemoState {
  try { const v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (v && Array.isArray(v.p) && v.event) return v } catch { /* abaikan */ }
  return seed()
}

export function Provider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<DemoState>(load), [note, setNote] = useState<Note | null>(null)
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(s)) } catch { /* abaikan */ } }, [s])
  const update = useCallback((fn: (d: DemoState) => void) => setS(prev => { const n = structuredClone(prev); fn(n); return n }), [])
  const reset = useCallback(() => setS(seed()), [])
  const close = useCallback(() => setNote(null), [])
  return <C.Provider value={{ s, update, reset, notify: setNote }}>
    {children}
    {note && <Modal onClose={close}><div className="res">
      <Big ok={note.ok} /><h3 style={{ fontSize: 20 }}>{note.title}</h3><p>{note.msg}</p>
      <div className="row center" style={{ marginTop: 16 }}>
        {note.retry && <button className="btn" onClick={() => { const r = note.retry!; close(); r() }}>Scan Lagi</button>}
        <button className={'btn' + (note.retry ? ' alt' : '')} onClick={close}>Tutup</button>
      </div></div></Modal>}
  </C.Provider>
}
