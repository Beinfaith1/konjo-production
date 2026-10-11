import Img from './Img'
import { stationItems } from '../data/projects'
export default function Explorer2D({ cat, active, onSelect }) {
  const items = stationItems(cat)
  return (
    <div className="x2d" key={cat} role="list" aria-label="Photographs">
      {items.map((it, i) => (
        <button key={it.photo.id + it.photo.slug} role="listitem" className={`x2d-item ${i === active ? 'on' : ''}`} onClick={() => onSelect(i)} aria-pressed={i === active}
          style={{ aspectRatio: it.photo.w / it.photo.h, flexGrow: it.photo.w / it.photo.h }}>
          <Img photo={it.photo} size="m" sizes="(max-width: 900px) 90vw, 33vw" />
          <span className="x2d-t">{it.project.title}</span>
        </button>))}
    </div>
  )
}
