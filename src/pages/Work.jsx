import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Img from '../components/Img'
import { CATS, catLabel, films, projects, embedUrl } from '../data/projects'
import { useSeo } from '../hooks/hooks'

/* ── Category-specific graphic treatment for film thumbnails ──── */
const CAT_STYLE = {
  events:     'film-thumb-events',
  technology: 'film-thumb-technology',
  weddings:   'film-thumb-weddings',
}

const CAT_LABEL = {
  events:     'Events',
  technology: 'Technology',
  weddings:   'Weddings & Ceremonies',
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 3l12 7-12 7V3z" />
    </svg>
  )
}

/* ── Film card ────────────────────────────────────────────────── */
export function FilmCard({ film, featured = false }) {
  const [player, setPlayer] = useState(false)

  return (
    <article className={`film-card${featured ? ' featured' : ''}`}>
      <div className={`film-thumb ${CAT_STYLE[film.category] || 'film-thumb-events'}`}>
        <div className="film-thumb-grid" aria-hidden="true" />
        <div className="film-thumb-vignette" aria-hidden="true" />
        <span className="film-cat">{CAT_LABEL[film.category] || catLabel(film.category)}</span>

        {player ? (
          <div className="film-embed-wrap">
            <iframe
              title={`${film.title} — Instagram player`}
              src={embedUrl(film)}
              loading="lazy"
              allowFullScreen
            />
            <button
              className="film-embed-close"
              onClick={() => setPlayer(false)}
              aria-label="Close player"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div className="film-thumb-icon" aria-hidden="true">
              <PlayIcon />
            </div>
            <div className="film-thumb-title">
              <strong>{film.title}</strong>
            </div>
          </>
        )}
      </div>
      <div className="film-actions on-dark" style={{ background: 'var(--dark2)', borderTop: '1px solid rgba(244,240,232,.07)' }}>
        <a
          className="btn solid"
          href={film.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${film.title} on Instagram (opens in new tab)`}
        >
          <span>Watch on Instagram ↗</span>
        </a>
        {!player && (
          <button className="btn" onClick={() => setPlayer(true)}>
            <span>Load player</span>
          </button>
        )}
      </div>
      {player && (
        <p className="note" style={{ padding: '8px 16px 12px', background: 'var(--dark2)', color: 'rgba(244,240,232,.35)' }}>
          If the player does not load, use "Watch on Instagram" above.
        </p>
      )}
    </article>
  )
}

/* ── Work page ────────────────────────────────────────────────── */
export default function Work() {
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('cat') || 'all'
  const rawView = sp.get('view')
  const view = rawView === 'photography' ? 'photography' : 'films'

  const setParam = (k, v) => {
    const n = new URLSearchParams(sp)
    if (v === 'all') n.delete(k)
    else n.set(k, v)
    setSp(n, { replace: true })
  }

  useSeo('Work', 'Selected films and photography by Konjo Production — events, technology and weddings.')

  const visibleProjects = projects.filter(p => cat === 'all' || p.category === cat)
  const visibleFilms    = films.filter(f => cat === 'all' || f.category === cat)

  return (
    <>
      <div className="work-head">
        <div className="work-head-inner">
          <span className="eyebrow">Portfolio</span>
          <h1 className="h1">The <em>work.</em></h1>
        </div>
      </div>

      <div className="work-toolbar" role="toolbar" aria-label="Filter work">
        {/* View toggle */}
        <div className="seg-group seg" role="group" aria-label="Medium">
          <span className="seg-label">Medium</span>
          {[
            ['films', 'Films'],
            ['photography', 'Photography'],
          ].map(([v, label]) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setParam('view', v)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category toggle */}
        <div className="seg-group seg" role="group" aria-label="Category">
          <span className="seg-label">Category</span>
          {[{ id: 'all', label: 'All' }, ...CATS].map(c => (
            <button
              key={c.id}
              aria-pressed={cat === c.id}
              onClick={() => setParam('cat', c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="work-status" role="status" aria-live="polite">
          {view === 'films'
            ? `${visibleFilms.length} film${visibleFilms.length !== 1 ? 's' : ''}`
            : `${visibleProjects.length} project${visibleProjects.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {view === 'films' ? (
        <div className="work-films">
          <div className="work-films-inner">
            <p className="work-films-note">
              All films are hosted on Instagram. Each link opens in a new tab. You can also load the embedded player directly below each card — use the direct link as a reliable fallback.
            </p>
            {visibleFilms.length === 0 ? (
              <p className="lede">No films in this category yet.</p>
            ) : (
              <div className="films-work-grid">
                {visibleFilms.map(f => <FilmCard key={f.id} film={f} />)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="work-photos">
          <div className="work-photos-inner">
            {visibleProjects.length === 0 ? (
              <p className="lede">No projects in this category.</p>
            ) : (
              <div className="editorial">
                {visibleProjects.map((p, i) => (
                  <Link key={p.slug} to={`/work/${p.slug}`} className={`card c${i % 5}`}>
                    <div className="card-img" style={{ aspectRatio: `${p.leadPhoto.w}/${p.leadPhoto.h}` }}>
                      <Img
                        photo={p.leadPhoto}
                        size="m"
                        sizes="(max-width:900px) 100vw, 60vw"
                        eager={i === 0}
                      />
                      <div className="card-over">
                        <p>{p.desc}</p>
                        <span className="btn"><span>View collection →</span></span>
                      </div>
                    </div>
                    <div className="card-meta">
                      <h2>{p.title}</h2>
                      <p>{catLabel(p.category)} · {p.count} photographs</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
