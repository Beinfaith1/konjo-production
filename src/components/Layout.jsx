import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { CONTACT } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

const NAV = [
  ['/', 'Work'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]

// Pages whose initial scroll position covers a dark background (About is ivory)
const DARK_HERO_PATHS = ['/', '/work']

function WhatsAppSVG() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2C8.27 2 2 8.27 2 16c0 2.47.66 4.78 1.82 6.77L2 30l7.4-1.79A14 14 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.44 11.44 0 01-5.84-1.6l-.42-.25-4.39 1.06 1.1-4.27-.28-.44A11.46 11.46 0 014.5 16C4.5 9.65 9.65 4.5 16 4.5S27.5 9.65 27.5 16 22.35 27.5 16 27.5zm6.27-8.59c-.35-.17-2.04-1-2.36-1.12-.31-.11-.54-.17-.77.17s-.88 1.12-1.08 1.35-.4.26-.74.09c-.35-.17-1.47-.54-2.8-1.72a10.5 10.5 0 01-1.94-2.4c-.2-.35-.02-.53.15-.7.16-.16.35-.4.52-.61.17-.2.23-.35.35-.58.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.18 1.15-1.18 2.81s1.21 3.26 1.38 3.49c.17.23 2.37 3.62 5.75 5.08.8.35 1.43.56 1.92.71.81.26 1.54.22 2.12.13.65-.1 2.04-.83 2.33-1.64.29-.81.29-1.5.2-1.64-.08-.15-.3-.23-.65-.4z"/>
    </svg>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const main = useRef(null)
  const contactPage = pathname === '/contact'
  const isDarkHero = DARK_HERO_PATHS.some(p => pathname === p || (pathname.startsWith(p + '/') && p !== '/'))

  // Close menu on route change
  useEffect(() => setMenu(false), [pathname])

  // Scroll lock
  useEffect(() => {
    document.body.classList.toggle('menu-open', menu)
    return () => document.body.classList.remove('menu-open')
  }, [menu])

  // Esc to close
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  // Scroll detection — throttled via RAF
  useEffect(() => {
    let raf
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 20))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [pathname])

  // Sync dark-hero body class synchronously to prevent flashing
  useLayoutEffect(() => {
    document.body.classList.toggle('dark-hero', isDarkHero && !scrolled)
    return () => document.body.classList.remove('dark-hero')
  }, [isDarkHero, scrolled])

  // Helper to smoothly scroll to inquiry form when on contact page
  const triggerInquiryScroll = () => {
    if (pathname === '/contact') {
      const el = document.getElementById('inquiry')
      if (el) {
        const header = document.querySelector('.site-head')
        const headerHeight = header ? header.offsetHeight : (window.innerWidth <= 900 ? 62 : 72)
        const targetY = window.scrollY + el.getBoundingClientRect().top - headerHeight - 20
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: Math.max(0, targetY), behavior: prefersReducedMotion ? 'auto' : 'smooth' })
        setTimeout(() => {
          el.querySelector('input[name="name"]')?.focus({ preventScroll: true })
        }, prefersReducedMotion ? 40 : 350)
      }
    }
  }

  // Handle brand logo click returning to landing page
  const handleLogoClick = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
      ScrollTrigger.refresh()
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
      ScrollTrigger.refresh()
    }
  }

  // Route transition — page fade/rise, no header involvement
  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = main.current
    if (!el) return
    const anim = gsap.fromTo(el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform,opacity' }
    )
    return () => anim.kill()
  }, [pathname])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      {/* ── HEADER ── */}
      <header className={`site-head${scrolled ? ' scrolled' : ''}${isDarkHero && !scrolled ? ' is-dark-hero' : ''}`}>
        <Link to="/" className="brand" aria-label="Konjo Production — Home" onClick={handleLogoClick}>
          {/* logo-dark.png = crisp dark mark (for ivory light header) */}
          <img className="brand-logo logo-dark" src="/logo-dark.png" alt="Konjo Production" width="44" height="52" />
          {/* logo.png = ivory mark (for dark hero backgrounds) */}
          <img className="brand-logo logo-light" src="/logo.png" alt="Konjo Production" width="44" height="52" />
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          <ul>
            {NAV.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'}>{label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/contact#inquiry"
          className="nav-cta"
          aria-label="Start a project"
          onClick={triggerInquiryScroll}
        >
          <span>Start a project</span>
        </Link>

        <button
          className="menu-btn"
          aria-expanded={menu}
          aria-controls="mobile-nav"
          aria-label={menu ? 'Close menu' : 'Open menu'}
          onClick={() => setMenu(!menu)}
        >
          {menu ? 'Close' : 'Menu'}
        </button>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav
        id="mobile-nav"
        className="mnav"
        hidden={!menu}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button className="mnav-close btn" onClick={() => setMenu(false)}>
          <span>Close</span>
        </button>
        <ul>
          {[['/', 'Home'], ...NAV].map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} onClick={() => setMenu(false)}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mnav-foot">
          <a className="btn solid" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp<span className="sr"> (opens in new tab)</span>
          </a>
          <Link
            className="btn"
            to="/contact#inquiry"
            onClick={() => {
              setMenu(false)
              triggerInquiryScroll()
            }}
          >
            Inquire
          </Link>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="site-foot">
        <div className="foot-inner">
          <div>
            <Link to="/" className="foot-brand" aria-label="Konjo Production — Home" onClick={handleLogoClick}>
              <img className="brand-logo logo-light" src="/logo.png" alt="Konjo Production" width="120" height="120" />
            </Link>
            <p className="foot-tagline">Beauty in every frame.</p>
          </div>
          <nav className="foot-nav" aria-label="Footer navigation">
            <Link to="/">Work</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneLabel}</a>
          </nav>
        </div>
        <div className="foot-meta">
          <span>© {new Date().getFullYear()} Konjo Production</span>
          <span className="foot-credit">Developed by Yonatan</span>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      {!contactPage && (
        <a
          className="fab"
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in new tab)"
        >
          <WhatsAppSVG />
        </a>
      )}

      {/* ── MOBILE BOTTOM BAR ── */}
      {!contactPage && (
        <div className="mbar" role="group" aria-label="Quick contact">
          <a href={`tel:${CONTACT.phone}`}>Call</a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <Link to="/contact#inquiry" onClick={triggerInquiryScroll}>Inquire</Link>
        </div>
      )}
    </>
  )
}
