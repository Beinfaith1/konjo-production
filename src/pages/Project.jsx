import { Link, useParams } from 'react-router-dom'
import Img from '../components/Img'
import { useViewer } from '../components/Viewer'
import { catLabel, films, getProject, projects } from '../data/projects'
import { useSeo } from '../hooks/hooks'
import NotFound from './NotFound'

export default function Project() {
  const { slug } = useParams(), p = getProject(slug), open = useViewer()
  useSeo(p ? p.title : 'Not found', p ? `${p.title}: ${p.count} photographs by Konjo Production. ${p.desc}` : 'Project not found.')
  if (!p) return <NotFound />
  const next = projects[(projects.indexOf(p) + 1) % projects.length], rel = films.filter((f) => f.category === p.category)
  return (
    <article>
      <header className="pad proj-head">
        <Link to="/work" className="back">← All work</Link>
        <p className="eyebrow">{catLabel(p.category)} · Photography</p>
        <h1 className="h1">{p.title}</h1>
        <p className="lede">{p.desc}</p>
        <div className="cta"><button className="btn solid" onClick={(e) => open(p, p.leadPhoto.i)}>Open gallery ({p.count})</button></div>
      </header>
      <button className="proj-lead" onClick={() => open(p, p.leadPhoto.i)} aria-label={`Open ${p.title} gallery at the lead photograph`}>
        <Img photo={p.leadPhoto} size="l" sizes="100vw" eager />
      </button>
      <section className="pad" aria-label={`${p.title} gallery`}>
        <p className="eyebrow">Complete gallery · {p.count} photographs</p>
        <ul className="masonry">{p.photos.map((ph) => (
          <li key={ph.id}><button onClick={() => open(p, ph.i)} aria-label={`Open photograph ${ph.i + 1} of ${p.count}`}><Img photo={ph} size="m" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /></button></li>))}</ul>
      </section>
      <section className="pad more">
        <div><p className="eyebrow">{catLabel(p.category)} films</p><h2 className="h2">More from this category</h2>
          <p className="note">These reels are listed by category; they are not linked to the photographs above.</p>
          <div className="acts">{rel.map((f) => <a key={f.id} className="btn" href={f.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${f.title} on Instagram (opens in new tab)`}>Watch {f.title} ↗</a>)}</div></div>
        <Link to={`/work/${next.slug}`} className="next-proj"><span className="eyebrow">Next project</span><strong>{next.title} →</strong></Link>
      </section>
    </article>
  )
}
