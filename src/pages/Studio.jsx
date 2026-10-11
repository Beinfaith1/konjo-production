import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Explorer2D from '../components/Explorer2D'
import ErrorBoundary from '../components/ErrorBoundary'
import { useViewer } from '../components/Viewer'
import { CATS, catLabel, stationItems } from '../data/projects'
import { lowPower, useMedia, useReducedMotion, useSeo, webglOK } from '../hooks/hooks'
const Scene = lazy(() => import('../three/StudioScene'))

export default function Studio() {
  useSeo('The Studio', 'Explore Konjo Production’s photography in a 3D studio: move between Events, Technology and Weddings and open each collection.')
  const [cat, setCat] = useState('events'), [active, setActive] = useState(0), [force2d, setForce2d] = useState(false)
  const reduced = useReducedMotion(), small = useMedia('(max-width: 820px)')
  const [capable] = useState(() => webglOK() && !lowPower())
  const open = useViewer()
  const mode3d = capable && !reduced && !small && !force2d
  useEffect(() => setActive(0), [cat])
  const items = stationItems(cat), cur = items[active]
  const fallback = <Explorer2D cat={cat} active={active} onSelect={setActive} />
  const reason = !capable ? 'Showing the simple explorer because 3D is unavailable on this device.' : reduced ? 'Showing the simple explorer because reduced motion is on.' : small ? 'Showing the simple explorer on small screens.' : ''
  return (
    <section className="studio">
      <header className="studio-head"><div><p className="eyebrow">The Studio</p><h1 className="h1">Studio <em>Explorer.</em></h1></div></header>
      <div className="studio-cats" role="group" aria-label="Choose a category">
        {CATS.map((c) => <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
      </div>
      <div className={`stage ${mode3d ? 'is3d' : ''}`}>
        {mode3d ? (
          <ErrorBoundary fallback={fallback}>
            <Suspense fallback={<p className="stage-load" role="status">Lighting the studio…</p>}>
              <Scene cat={cat} active={active} onSelect={setActive} />
            </Suspense>
          </ErrorBoundary>
        ) : fallback}
        {mode3d && <span className="vf" aria-hidden="true" />}
      </div>
      <div className="studio-info" aria-live="polite">
        <div><p className="eyebrow">{catLabel(cat)} · {active + 1} of {items.length}</p><h2 className="h2">{cur.project.title}</h2><p className="note">{cur.project.desc}</p></div>
        <div className="acts">
          <Link className="btn solid" to={`/work/${cur.project.slug}`}>Open collection ({cur.project.count})</Link>
          <button className="btn" onClick={() => open(cur.project, cur.photo.i)}>View this photograph</button>
        </div>
      </div>
      <ul className="studio-pick" aria-label={`${catLabel(cat)} photographs`}>
        {items.map((it, i) => <li key={i}><button aria-pressed={active === i} onClick={() => setActive(i)}>{it.project.title}{items.filter((x) => x.project === it.project).length > 1 ? ` · ${i + 1}` : ''}</button></li>)}
      </ul>
      <p className="note studio-note">
        {mode3d ? <>Choose a category to move the camera. <button className="link" onClick={() => setForce2d(true)}>Use the simple explorer</button></>
          : <>{reason} {capable && !reduced && !small && <button className="link" onClick={() => setForce2d(false)}>Switch to 3D</button>}</>}
      </p>
    </section>
  )
}
