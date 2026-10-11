import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Img from '../components/Img'
import { useViewer } from '../components/Viewer'
import { CONTACT, films, getProject, SERVICES } from '../data/projects'
import { useSeo } from '../hooks/hooks'
import { FilmCard } from './Work'
gsap.registerPlugin(ScrollTrigger)

/* ── SVG Lens Diagram ──────────────────────────────────────────── */
/* Stylised photographic cinema lens cross-section rendered in SVG.
   Subtle frame-time-based outer barrel rotation (~60s/rev), coordinated aperture
   blade dilation, restrained scroll response, and desktop pointer perspective. */

function makeBladePath(i, inner) {
  const angle = (i / 9) * Math.PI * 2
  const bladeSpan = (Math.PI * 2 / 9) * 0.78
  const outer = 95
  const ax = 200 + Math.cos(angle) * inner
  const ay = 200 + Math.sin(angle) * inner
  const bx = 200 + Math.cos(angle + bladeSpan) * outer
  const by = 200 + Math.sin(angle + bladeSpan) * outer
  const cx2 = 200 + Math.cos(angle + bladeSpan * 0.5) * outer * 0.88
  const cy2 = 200 + Math.sin(angle + bladeSpan * 0.5) * outer * 0.88
  const ex = 200 + Math.cos(angle + bladeSpan) * inner
  const ey = 200 + Math.sin(angle + bladeSpan) * inner
  return `M${ax.toFixed(2)},${ay.toFixed(2)} Q${cx2.toFixed(2)},${cy2.toFixed(2)} ${bx.toFixed(2)},${by.toFixed(2)} L${ex.toFixed(2)},${ey.toFixed(2)} Z`
}

function LensDiagram({ isDark = true }) {
  const svgRef = useRef(null)
  const barrelRef = useRef(null)
  const bladesGroupRef = useRef(null)
  const bladePathsRef = useRef([])
  const apertureHoleRef = useRef(null)
  const apertureGlowRef = useRef(null)
  const flareRef = useRef(null)

  const isVisibleRef = useRef(true)
  const mouseRef = useRef({ x: 0, y: 0 })
  const curRef = useRef({ tiltX: 0, tiltY: 0, shiftX: 0, shiftY: 0 })
  const scrollRef = useRef(0)
  const timeRef = useRef(0)
  const lastTimeRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    // Respect prefers-reduced-motion: maintain attractive static state
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const svg = svgRef.current
    if (!svg) return

    const rect = () => svg.getBoundingClientRect()

    // Pointer perspective tracking on desktop
    const onMove = (e) => {
      const r = rect()
      if (r.width === 0 || r.height === 0) return
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      // Clamped normalized delta
      mouseRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      }
    }

    // Restrained scroll response
    let scrollRaf
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf)
      scrollRaf = requestAnimationFrame(() => {
        scrollRef.current = window.scrollY
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Only attach pointermove on non-touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (!isTouch) {
      window.addEventListener('pointermove', onMove, { passive: true })
    }

    // Visibility management — pause when tab hidden or offscreen
    const onVisibility = () => {
      if (document.hidden) {
        lastTimeRef.current = null
      } else {
        lastTimeRef.current = performance.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        lastTimeRef.current = performance.now()
      }
    }, { threshold: 0.05 })
    observer.observe(svg)

    // Animation loop: frame-time-based calculation
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = Math.min(100, timestamp - lastTimeRef.current)
      lastTimeRef.current = timestamp

      if (isVisibleRef.current && !document.hidden) {
        timeRef.current += delta

        // 1. Slow outer-ring rotation: ~60s per revolution (6 deg/s) + gentle scroll offset
        const barrelAngle = ((timeRef.current / 60000) * 360 + scrollRef.current * 0.06) % 360
        if (barrelRef.current) {
          barrelRef.current.setAttribute('transform', `rotate(${barrelAngle.toFixed(2)} 200 200)`)
        }

        // 2. Coordinated aperture movement: breathing cycle ~9.5s
        const phase = (timeRef.current * 0.00065) % (Math.PI * 2)
        const scrollContract = Math.min(5, scrollRef.current * 0.015)
        const innerR = 27.5 + 3.2 * Math.sin(phase) - scrollContract
        const irisAngle = (3.5 * Math.sin(phase) + scrollRef.current * 0.02)

        if (apertureHoleRef.current) {
          apertureHoleRef.current.setAttribute('r', innerR.toFixed(2))
        }
        if (apertureGlowRef.current) {
          apertureGlowRef.current.setAttribute('r', (innerR * 1.15).toFixed(2))
        }

        // Update blades
        for (let idx = 0; idx < 9; idx++) {
          const p = bladePathsRef.current[idx]
          if (p) p.setAttribute('d', makeBladePath(idx, innerR))
        }

        // 3. Pointer perspective lerp
        const targetTiltX = -mouseRef.current.y * 6
        const targetTiltY = mouseRef.current.x * 6
        const targetShiftX = mouseRef.current.x * 12
        const targetShiftY = mouseRef.current.y * 10

        curRef.current.tiltX += (targetTiltX - curRef.current.tiltX) * 0.05
        curRef.current.tiltY += (targetTiltY - curRef.current.tiltY) * 0.05
        curRef.current.shiftX += (targetShiftX - curRef.current.shiftX) * 0.05
        curRef.current.shiftY += (targetShiftY - curRef.current.shiftY) * 0.05

        if (svgRef.current) {
          svgRef.current.style.transform = `perspective(900px) rotateX(${curRef.current.tiltX.toFixed(2)}deg) rotateY(${curRef.current.tiltY.toFixed(2)}deg)`
        }

        if (bladesGroupRef.current) {
          bladesGroupRef.current.setAttribute(
            'transform',
            `translate(${(curRef.current.shiftX * 0.75).toFixed(2)}, ${(curRef.current.shiftY * 0.75).toFixed(2)}) rotate(${irisAngle.toFixed(2)} 200 200)`
          )
        }

        if (flareRef.current) {
          flareRef.current.setAttribute(
            'transform',
            `translate(${(curRef.current.shiftX * 1.15).toFixed(2)}, ${(curRef.current.shiftY * 1.15).toFixed(2)}) rotate(-38 155 158)`
          )
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(scrollRaf)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', onScroll)
      if (!isTouch) window.removeEventListener('pointermove', onMove)
    }
  }, [])

  const c = isDark ? 'rgba(200,134,64,' : 'rgba(17,16,9,'
  const stroke = (o) => `${c}${o})`
  const fill = (o) => `${c}${o})`

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      className="lens-canvas"
      aria-hidden="true"
      style={{ overflow: 'visible', transition: 'transform 0.1s ease-out' }}
    >
      <defs>
        {/* Bevel gradient for rings */}
        <radialGradient id="ringGrad" cx="40%" cy="38%">
          <stop offset="0%" stopColor={stroke(.35)} />
          <stop offset="100%" stopColor={stroke(.04)} />
        </radialGradient>
        {/* Aperture inner glow */}
        <radialGradient id="glowGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor={fill(.14)} />
          <stop offset="100%" stopColor={fill(.0)} />
        </radialGradient>
        {/* Blade gradient */}
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stroke(.22)} />
          <stop offset="100%" stopColor={stroke(.04)} />
        </linearGradient>
        <clipPath id="outerClip">
          <circle cx="200" cy="200" r="182" />
        </clipPath>
      </defs>

      {/* ── Fixed outer chassis ── */}
      <g clipPath="url(#outerClip)">
        {/* Housing rim */}
        <circle cx="200" cy="200" r="182" fill="none" stroke={stroke(.14)} strokeWidth="2" />
        <circle cx="200" cy="200" r="178" fill="none" stroke={stroke(.22)} strokeWidth="1" />

        {/* Concentric stationary chassis rings */}
        <circle cx="200" cy="200" r="165" fill="none" stroke={stroke(.10)} strokeWidth="1.5" />
        <circle cx="200" cy="200" r="112" fill="none" stroke={stroke(.15)} strokeWidth="1" />

        {/* ── ROTATING BARREL: ticks + engraved cinema markings (~60s / revolution) ── */}
        <g ref={barrelRef}>
          {/* Concentric barrel rings */}
          <circle cx="200" cy="200" r="148" fill="none" stroke={stroke(.11)} strokeWidth="1" />
          <circle cx="200" cy="200" r="130" fill="none" stroke={stroke(.14)} strokeWidth="1" strokeDasharray="4 2" />

          {/* 36 tick marks on outer barrel rim */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i / 36) * Math.PI * 2
            const isMajor = i % 3 === 0
            const r1 = isMajor ? 168 : 173
            const r2 = 178
            return (
              <line key={i}
                x1={200 + Math.cos(a) * r1} y1={200 + Math.sin(a) * r1}
                x2={200 + Math.cos(a) * r2} y2={200 + Math.sin(a) * r2}
                stroke={stroke(isMajor ? .36 : .14)}
                strokeWidth={isMajor ? 1.5 : .8}
              />
            )
          })}

          {/* 24 focus ring inner tick marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2
            return (
              <line key={`f-${i}`}
                x1={200 + Math.cos(a) * 105} y1={200 + Math.sin(a) * 105}
                x2={200 + Math.cos(a) * 110} y2={200 + Math.sin(a) * 110}
                stroke={stroke(.22)}
                strokeWidth={i % 4 === 0 ? 1.2 : .6}
              />
            )
          })}

          {/* Engraved cinema markings on the rotating barrel */}
          <text x="200" y="34" fill={stroke(.35)} fontSize="7.5" fontFamily="var(--d)" fontWeight="600" letterSpacing="0.16em" textAnchor="middle">50mm T1.5</text>
          <text x="366" y="202" fill={stroke(.26)} fontSize="6.5" fontFamily="var(--d)" fontWeight="500" letterSpacing="0.14em" textAnchor="middle" transform="rotate(90 366 202)">KONJO CINE</text>
          <text x="200" y="370" fill={stroke(.30)} fontSize="6.5" fontFamily="var(--d)" fontWeight="500" letterSpacing="0.14em" textAnchor="middle" transform="rotate(180 200 370)">MADE IN ETHIOPIA</text>
          <text x="34" y="202" fill={stroke(.26)} fontSize="6.5" fontFamily="var(--d)" fontWeight="500" letterSpacing="0.14em" textAnchor="middle" transform="rotate(270 34 202)">№ 024-CINE</text>

          {/* Restrained aperture scale numbers on the barrel */}
          {[
            { num: '1.5', a: -75 },
            { num: '2.0', a: -50 },
            { num: '2.8', a: -25 },
            { num: '4.0', a: 0 },
            { num: '5.6', a: 25 },
            { num: '8',   a: 50 },
            { num: '11',  a: 75 },
          ].map(({ num, a }) => {
            const rad = ((a - 90) * Math.PI) / 180
            const x = 200 + Math.cos(rad) * 121
            const y = 200 + Math.sin(rad) * 121
            return (
              <text key={num} x={x} y={y}
                fill={stroke(.25)}
                fontSize="5.5"
                fontFamily="var(--d)"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${a} ${x} ${y})`}
              >
                {num}
              </text>
            )
          })}
        </g>

        {/* ── APERTURE BLADE GROUP — coordinated blade iris & parallax-reactive ── */}
        <g ref={bladesGroupRef}>
          {/* 9 mechanical blades */}
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              ref={(el) => { bladePathsRef.current[i] = el }}
              d={makeBladePath(i, 27.5)}
              fill={fill(.15)}
              stroke={stroke(.30)}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          ))}

          {/* Aperture opening + inner glow */}
          <circle ref={apertureGlowRef} cx="200" cy="200" r="28" fill="url(#glowGrad)" />
          <circle ref={apertureHoleRef} cx="200" cy="200" r="27.5" fill="none" stroke={stroke(.48)} strokeWidth="1.5" />
          <circle cx="200" cy="200" r="20" fill="none" stroke={stroke(.18)} strokeWidth=".8" />

          {/* Central lens element — optics & highlight dot */}
          <circle cx="200" cy="200" r="10" fill={fill(.08)} />
          <circle cx="197" cy="197" r="3" fill={fill(.38)} />
        </g>

        {/* Physical light flare specular highlight — independent ambient angle */}
        <ellipse
          ref={flareRef}
          cx="155" cy="158" rx="18" ry="10"
          fill={stroke(.14)}
          transform="rotate(-38 155 158)"
          opacity=".65"
        />
      </g>
    </svg>
  )
}

/* ── Service icons ─────────────────────────────────────────────── */
const SVC_ICONS = {
  'Video Production': (
    <svg viewBox="0 0 24 24"><rect x="2" y="6" width="15" height="12" rx="1"/><path d="M17 9l5-3v12l-5-3V9z"/></svg>
  ),
  'Photography': (
    <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  'Editing': (
    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  'Motion Graphics': (
    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
}

/* ── Photo mosaic ──────────────────────────────────────────────── */
function PhotoMosaic() {
  const open = useViewer()
  const tm = getProject('tech-meetup')
  const tf = getProject('tech-festival')
  const lc = getProject('launch-ceremony')
  const cp = getProject('campus-tech-event')

  // Curated from tech/events — NOT wedding portraits on home
  const grid = [
    { proj: tm,  id: '07', span: 'm4' },
    { proj: tf,  id: '04', span: 'm5' },
    { proj: lc,  id: '05', span: 'm3' },
    { proj: cp,  id: '09', span: 'm5' },
    { proj: tm,  id: '03', span: 'm4' },
    { proj: tf,  id: '01', span: 'm3' },
    { proj: lc,  id: '03', span: 'm8' },
    { proj: cp,  id: '02', span: 'm4' },
  ].map(({ proj, id, span }) => {
    const photo = proj.photos.find(p => p.id === id) || proj.leadPhoto
    return { proj, photo, span }
  })

  return (
    <section className="mosaic" aria-label="Photography selection">
      <div className="mosaic-inner">
        <div className="mosaic-head">
          <div>
            <span className="eyebrow">Photography</span>
            <h2 className="h3">Moments made permanent.</h2>
          </div>
          <Link className="text-link" to="/work?view=photography">View all photography →</Link>
        </div>
        <div className="mosaic-grid">
          {grid.map(({ proj, photo, span }, i) => (
            <button
              key={i}
              className={`mosaic-item ${span}`}
              onClick={() => open(proj, photo.i)}
              aria-label={`Open ${proj.title} gallery`}
            >
              <Img
                photo={photo}
                size="m"
                sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"
                eager={i < 3}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── About strip ───────────────────────────────────────────────── */
function AboutStrip() {
  // Use a tech/event photo to represent the studio, not a wedding portrait
  const proj = getProject('tech-meetup')
  const photo = proj.photos.find(p => p.id === '07') || proj.leadPhoto
  return (
    <section className="about-strip on-dark">
      <div className="about-strip-inner">
        <div>
          <span className="eyebrow">The Studio</span>
          <div className="about-konjo">Konjo<em>= beauty</em></div>
          <p className="lede">
            "Konjo" means beauty in Amharic — the starting point for every frame the studio makes. Through cinematic video production, photography, editing, and motion graphics, Konjo Production tells stories that carry meaning.
          </p>
          <p className="lede" style={{ marginTop: 16 }}>
            Founded by <strong style={{ color: 'var(--ivory)' }}>Yonatan Tariku</strong>, the studio works across technology events, product launches, and weddings.
          </p>
          <div className="acts">
            <Link className="btn solid" to="/about"><span>About the studio</span></Link>
            <Link className="btn" to="/work"><span>See the work</span></Link>
          </div>
        </div>
        <div className="about-visual">
          <div className="about-photo">
            <Img photo={photo} size="l" sizes="(max-width:900px) 100vw, 50vw" />
          </div>
          <div className="about-badge">Tech Meetup · Photography</div>
        </div>
      </div>
    </section>
  )
}

/* ── Scroll entrance ───────────────────────────────────────────── */
function useScrollEntrance(ref) {
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = ref.current?.querySelectorAll('.will-rise')
    if (!els?.length) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [ref])
}

/* ── HOME PAGE ─────────────────────────────────────────────────── */
export default function Home() {
  useSeo('', 'Konjo Production — video production, photography, editing and motion graphics. Stories that move people.')
  const heroRef = useRef(null)
  const bodyRef = useRef(null)

  // Hero entrance
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-eyebrow',  { opacity: 0, x: -16, duration: 0.55 }, 0.25)
        .from('.h-line',        { yPercent: 105, duration: 0.85, stagger: 0.1, ease: 'power4.out' }, 0.35)
        .from('.hero-sub',      { opacity: 0, y: 14, duration: 0.6 }, 0.7)
        .from('.hero-cta .btn', { opacity: 0, y: 10, duration: 0.45, stagger: 0.1 }, 0.85)
        .from('.lens-wrap',     { opacity: 0, scale: .94, duration: 0.9, ease: 'power2.out' }, 0.2)
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useScrollEntrance(bodyRef)

  // Show 3 films on home: one from each category
  const homeFilms = [
    films.find(f => f.category === 'events'),
    films.find(f => f.category === 'technology'),
    films.find(f => f.category === 'weddings'),
  ].filter(Boolean)

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef} aria-labelledby="hero-h">
        {/* Gradient overlay */}
        <div className="hero-vignette" />

        {/* Left column — text */}
        <div className="hero-left">
          <p className="hero-eyebrow">Konjo Production</p>
          <h1 id="hero-h" className="hero-h">
            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '.06em' }}>
              <span className="h-line" style={{ display: 'block' }}>Stories that</span>
            </span>
            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '.06em' }}>
              <span className="h-line" style={{ display: 'block' }}><em>move people.</em></span>
            </span>
          </h1>
          <p className="hero-sub">
            Video production, photography, editing and motion graphics — crafted with a cinematic eye for events, technology and ceremonies.
          </p>
          <div className="hero-cta on-dark">
            <Link className="btn solid" to="/work"><span>Explore our work</span></Link>
            <Link className="btn" to="/contact#inquiry"><span>Start a project</span></Link>
          </div>
        </div>

        {/* Right column — lens diagram */}
        <div className="hero-right">
          <div className="lens-wrap">
            <LensDiagram isDark />
            <p className="lens-label">Konjo Production · Est. 2024</p>
          </div>
        </div>
      </section>

      <div ref={bodyRef}>

        {/* ── SELECTED FILMS ─────────────────────────────────── */}
        <section className="films-band on-dark">
          <div className="films-inner">
            <div className="films-head">
              <div>
                <span className="eyebrow">Selected films</span>
                <h2 className="h2">The work, in motion.</h2>
              </div>
              <Link className="btn on-dark" to="/work"><span>All films →</span></Link>
            </div>
            <div className="films-grid">
              {homeFilms.map(f => <FilmCard key={f.id} film={f} />)}
            </div>
          </div>
        </section>

        {/* ── SERVICES ───────────────────────────────────────── */}
        <section className="svc-overview will-rise">
          <div className="svc-inner">
            <div className="svc-head">
              <span className="eyebrow">What we make</span>
              <h2 className="h2">Four disciplines, <em>one vision.</em></h2>
            </div>
            <div className="svc-grid">
              {SERVICES.map((s, i) => (
                <Link
                  key={s.id}
                  className="svc-cell"
                  to="/services"
                  aria-label={`${s.id} — learn more`}
                >
                  <span className="svc-num">0{i + 1}</span>
                  <span className="svc-icon">{SVC_ICONS[s.id]}</span>
                  <h3>{s.id}</h3>
                  <p>{s.text}</p>
                  <span className="svc-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── PHOTO MOSAIC ───────────────────────────────────── */}
        <PhotoMosaic />

        {/* ── ABOUT STRIP ────────────────────────────────────── */}
        <AboutStrip />

        {/* ── CTA BAND ───────────────────────────────────────── */}
        <section className="cta-band will-rise">
          <div className="cta-band-inner">
            <h2 className="h2">
              Ready to start a <em>project?</em>
            </h2>
            <div className="cta-band-actions">
              <Link className="btn solid" to="/contact#inquiry"><span>Send an inquiry</span></Link>
              <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                <span>Chat on WhatsApp<span className="sr"> (opens in new tab)</span></span>
              </a>
              <a className="text-link" href={`tel:${CONTACT.phone}`} style={{ marginTop: 6 }}>
                or call {CONTACT.phoneLabel}
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
