import { useState } from 'react'
import { Link } from 'react-router-dom'
import Img from '../components/Img'
import { PROCESS, SERVICES, getProject } from '../data/projects'
import { useSeo } from '../hooks/hooks'

const SVC_ICONS = {
  'Video Production': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="15" height="12" rx="1"/>
      <path d="M17 9l5-3v12l-5-3V9z"/>
    </svg>
  ),
  'Photography': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  'Editing': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h10M4 18h6"/>
      <path d="M15 14l2 2 4-4"/>
    </svg>
  ),
  'Motion Graphics': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
}

const SVC_DETAIL = {
  'Video Production': {
    deliverables: ['Full event coverage', 'Cinematic edit with colour grade', 'Highlight reel', 'Raw footage archive'],
    note: 'Events, product launches, and ceremonies. We plan around what the day needs to show and deliver a finished film.',
  },
  'Photography': {
    deliverables: ['Fully edited gallery', 'Web and print resolutions', 'Organised by moment', 'Fast turnaround'],
    note: 'Event, ceremony and portrait photography. Delivered as a complete, curated gallery.',
  },
  'Editing': {
    deliverables: ['Assembly and fine cut', 'Colour grading', 'Audio mix and cleanup', 'Multiple export formats'],
    note: 'Bring us your footage. We give it structure, rhythm, colour, and a clear finish.',
  },
  'Motion Graphics': {
    deliverables: ['Titles and lower thirds', 'Animated logos', 'Transition packages', 'Custom typeface animation'],
    note: 'Dynamic motion graphics and animated titles that move with the story, not against it.',
  },
}

export default function Services() {
  useSeo('Services', 'Video production, photography, editing and motion graphics from Konjo Production, with a clear five-step production process.')
  const [active, setActive] = useState(0)
  const [step, setStep] = useState(0)

  const onStepKey = (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (d) {
      e.preventDefault()
      const n = (step + d + PROCESS.length) % PROCESS.length
      setStep(n)
      document.getElementById(`step-${n}`)?.focus()
    }
  }

  const current = SERVICES[active]
  const detail = SVC_DETAIL[current.id]

  return (
    <>
      {/* ── PAGE HEAD ── */}
      <div className="svc-page-head">
        <div className="svc-page-head-inner">
          <span className="eyebrow">Services</span>
          <h1 className="h1">What we <em>make.</em></h1>
          <p className="lede" style={{ marginTop: 16 }}>
            Four disciplines, offered as standalone services or as part of a complete production package.
          </p>
        </div>
      </div>

      {/* ── SERVICE EXPLORER ── */}
      <section
        style={{
          background: 'var(--ivory)',
          padding: 'clamp(40px,5vw,72px) var(--px)',
          borderTop: '1px solid var(--line-l)',
        }}
        aria-label="Service details"
      >
        <div style={{ maxWidth: 'var(--w)', margin: '0 auto' }}>
          <div className="svc-explorer-grid">

            {/* Service selector */}
            <div role="tablist" aria-label="Services" className="svc-tablist">
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  id={`svc-tab-${i}`}
                  role="tab"
                  aria-selected={active === i}
                  aria-controls="svc-panel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`svc-tab-btn${active === i ? ' is-active' : ''}`}
                  onKeyDown={(e) => {
                    const d = { ArrowDown: 1, ArrowUp: -1 }[e.key]
                    if (d) { e.preventDefault(); const n = (i + d + SERVICES.length) % SERVICES.length; setActive(n); document.getElementById(`svc-tab-${n}`)?.focus() }
                  }}
                >
                  <span className="svc-tab-icon">
                    {SVC_ICONS[s.id]}
                  </span>
                  <span className="svc-tab-text">{s.id}</span>
                  {active === i && <span className="svc-tab-arrow" aria-hidden="true">→</span>}
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div
              id="svc-panel"
              role="tabpanel"
              aria-labelledby={`svc-tab-${active}`}
              className="svc-detail-panel"
            >
              <span style={{ font: '600 11px var(--d)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--acc)', display: 'block', marginBottom: 14 }}>
                0{active + 1} — {current.id}
              </span>
              <h2 className="h2" style={{ fontSize: 'clamp(26px,3.5vw,42px)' }}>{current.id}</h2>
              <p className="lede" style={{ marginTop: 16 }}>{detail.note}</p>

              <div className="svc-deliv-grid">
                {detail.deliverables.map(d => (
                  <div key={d} className="svc-deliv-item">
                    <span style={{ color: 'var(--acc)', flexShrink: 0, marginTop: 2 }} aria-hidden="true">✓</span>
                    <span style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.4 }}>{d}</span>
                  </div>
                ))}
              </div>

              {current.slugs ? (
                <div style={{ marginTop: 28 }}>
                  <p style={{ font: '600 11px var(--d)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ghost)', marginBottom: 14 }}>
                    Related work
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {current.slugs.map(sl => {
                      const p = getProject(sl)
                      return (
                        <Link key={sl} to={`/work/${sl}`} className="svc-ph" style={{ maxWidth: 160 }}>
                          <Img photo={p.leadPhoto} size="m" sizes="180px" />
                          <span>{p.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="svc-films-note" style={{ marginTop: 28 }}>
                  <p className="note">This work appears in our film portfolio, hosted on Instagram.</p>
                  <Link className="btn" to="/work" style={{ marginTop: 12 }}><span>Browse the films →</span></Link>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <Link
                  className="btn solid"
                  to={`/contact?service=${encodeURIComponent(current.id)}#inquiry`}
                >
                  <span>Inquire about {current.id.toLowerCase()}</span>
                </Link>
                <Link className="btn" to="/work">
                  <span>See all work</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process" aria-labelledby="proc-h">
        <div className="process-inner">
          <span className="eyebrow">How we work</span>
          <h2 id="proc-h" className="h2">From brief <em>to delivery.</em></h2>

          <div className="steps" role="tablist" aria-label="Production process" onKeyDown={onStepKey}>
            {PROCESS.map((p, i) => (
              <button
                key={p.id}
                id={`step-${i}`}
                role="tab"
                aria-selected={step === i}
                aria-controls="step-panel"
                tabIndex={step === i ? 0 : -1}
                data-done={i < step}
                onClick={() => setStep(i)}
              >
                <span>0{i + 1}</span>
                {p.id}
              </button>
            ))}
            <i className="steps-bar" style={{ '--p': step / (PROCESS.length - 1) }} aria-hidden="true" />
          </div>

          <div id="step-panel" role="tabpanel" aria-labelledby={`step-${step}`} className="step-panel">
            <h3>{PROCESS[step].id}</h3>
            <p className="lede">{PROCESS[step].text}</p>
            <div className="acts">
              {step < PROCESS.length - 1
                ? <button className="btn" onClick={() => setStep(step + 1)}><span>Next: {PROCESS[step + 1].id} →</span></button>
                : <Link className="btn solid" to="/contact#inquiry"><span>Start with a brief</span></Link>
              }
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
