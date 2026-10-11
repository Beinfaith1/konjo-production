import { useEffect, useState } from 'react'
export function useMedia(q) {
  const [m, setM] = useState(() => (typeof matchMedia !== 'undefined' ? matchMedia(q).matches : false))
  useEffect(() => { const mq = matchMedia(q); const h = () => setM(mq.matches); h(); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h) }, [q])
  return m
}
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
export function useSeo(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Konjo Production` : 'Konjo Production — Beauty in every frame'
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m) }
    m.content = description
  }, [title, description])
}
export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}
export function lowPower() {
  const n = navigator
  return (n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || n.connection?.saveData === true
}
