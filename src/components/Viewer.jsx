import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Img from './Img'
import { catLabel, photoUrl } from '../data/projects'

const Ctx = createContext(() => {})
export const useViewer = () => useContext(Ctx)

export function ViewerProvider({ children }) {
  const [st, setSt] = useState(null)
  const open = useCallback((project, index = 0) => setSt({ project, index, opener: document.activeElement }), [])
  return (
    <Ctx.Provider value={open}>
      {children}
      {st && <Viewer key={st.project.slug} {...st} onClose={() => setSt(null)} />}
    </Ctx.Provider>
  )
}

function Viewer({ project, index, opener, onClose }) {
  const ref = useRef(null)
  const [i, setI] = useState(index)
  const [loaded, setLoaded] = useState(false)
  const n = project.photos.length
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n])
  const photo = project.photos[i]

  useEffect(() => {
    const d = ref.current
    if (!d.open) d.showModal()
    document.body.classList.add('viewer-open')
    return () => { document.body.classList.remove('viewer-open'); if (opener && opener.isConnected) opener.focus() }
  }, [opener])
  useEffect(() => { setLoaded(false); [i - 1, i + 1].forEach((k) => { const p = project.photos[(k + n) % n]; new Image().src = photoUrl(p, 'l') }) }, [i, n, project])
  useEffect(() => { ref.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' }) }, [i])

  const key = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
    else if (e.key === 'Home') { e.preventDefault(); setI(0) }
    else if (e.key === 'End') { e.preventDefault(); setI(n - 1) }
  }
  const sx = useRef(null)
  return (
    <dialog ref={ref} className="viewer" aria-labelledby="vw-title" onClose={onClose} onKeyDown={key}>
      <div className="vw-head">
        <div><p className="eyebrow">{catLabel(project.category)} · Photography</p><h2 id="vw-title">{project.title}</h2></div>
        <p className="vw-count" aria-live="polite">{i + 1} / {n}</p>
        <button className="btn" onClick={() => ref.current.close()}>Close ✕</button>
      </div>
      <div className="vw-stage" onPointerDown={(e) => { sx.current = e.clientX }}
        onPointerUp={(e) => { if (sx.current !== null && Math.abs(e.clientX - sx.current) > 50) go(e.clientX < sx.current ? 1 : -1); sx.current = null }}>
        <button className="vw-nav prev" onClick={() => go(-1)} aria-label="Previous photograph">←</button>
        {!loaded && <span className="vw-spin" role="status" aria-label="Loading photograph" />}
        <img key={photo.id} className={`vw-img ${loaded ? 'is-loaded' : ''}`} ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true) }}
          src={photoUrl(photo, 'l')} alt={photo.alt} onLoad={() => setLoaded(true)} draggable="false" />
        <button className="vw-nav next" onClick={() => go(1)} aria-label="Next photograph">→</button>
      </div>
      <div className="vw-thumbs" role="group" aria-label="Photograph thumbnails">
        {project.photos.map((p, k) => (
          <button key={p.id} aria-current={k === i} aria-label={`Photograph ${k + 1} of ${n}`} onClick={() => setI(k)}><Img photo={p} size="t" sizes="90px" /></button>
        ))}
      </div>
    </dialog>
  )
}
