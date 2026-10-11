import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { BUDGETS, CONTACT, SERVICES } from '../data/projects'
import { useSeo } from '../hooks/hooks'

const SVC = [...SERVICES.map((s) => s.id), 'Not sure yet']
const EMPTY = { name: '', email: '', phone: '', service: '', date: '', budget: '', details: '', website: '' }

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address, like name@example.com.'
  if (v.phone && !/^[+\d][\d\s()\-]{5,}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number or leave this empty.'
  if (!SVC.includes(v.service)) e.service = 'Choose the service you need.'
  if (v.details.trim().length < 10) e.details = 'Tell us a little more about the project (at least 10 characters).'
  return e
}

function Field({ k, label, req, err, hint, children }) {
  return (
    <div className={`field${err[k] ? ' has-err' : ''}`}>
      <label htmlFor={`f-${k}`}>
        {label}
        {req ? <span aria-hidden="true"> *</span> : <span className="opt"> (optional)</span>}
      </label>
      {children}
      {hint && <small id={`h-${k}`}>{hint}</small>}
      {err[k] && <small className="err" id={`e-${k}`} role="alert">{err[k]}</small>}
    </div>
  )
}

/* ── SVG icons ───────────────────────────────────────────────── */
function MailIcon() {
  return <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.51 10.82 19.79 19.79 0 01.46 2.18 2 2 0 012.44.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.01v-.07z"/></svg>
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" style={{ strokeWidth: 0 }}>
      <path d="M16 2C8.27 2 2 8.27 2 16c0 2.47.66 4.78 1.82 6.77L2 30l7.4-1.79A14 14 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.44 11.44 0 01-5.84-1.6l-.42-.25-4.39 1.06 1.1-4.27-.28-.44A11.46 11.46 0 014.5 16C4.5 9.65 9.65 4.5 16 4.5S27.5 9.65 27.5 16 22.35 27.5 16 27.5zm6.27-8.59c-.35-.17-2.04-1-2.36-1.12-.31-.11-.54-.17-.77.17s-.88 1.12-1.08 1.35-.4.26-.74.09c-.35-.17-1.47-.54-2.8-1.72a10.5 10.5 0 01-1.94-2.4c-.2-.35-.02-.53.15-.7.16-.16.35-.4.52-.61.17-.2.23-.35.35-.58.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.18 1.15-1.18 2.81s1.21 3.26 1.38 3.49c.17.23 2.37 3.62 5.75 5.08.8.35 1.43.56 1.92.71.81.26 1.54.22 2.12.13.65-.1 2.04-.83 2.33-1.64.29-.81.29-1.5.2-1.64-.08-.15-.3-.23-.65-.4z" fill="currentColor"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ strokeWidth: 0 }}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" fill="currentColor"/>
      <circle cx="4" cy="4" r="2" fill="currentColor"/>
    </svg>
  )
}

export default function Contact() {
  useSeo('Contact', 'Start a project with Konjo Production. Send an inquiry, chat on WhatsApp, or call the studio.')
  const [sp] = useSearchParams()
  const location = useLocation()
  const { hash, key } = location
  const pre = sp.get('service')
  const [v, setV] = useState({ ...EMPTY, service: SVC.includes(pre) ? pre : '' })
  const [err, setErr] = useState({})
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')
  const form = useRef(null)

  // Synchronize preselected service when query param changes
  useEffect(() => {
    if (pre && SVC.includes(pre)) {
      setV((s) => ({ ...s, service: pre }))
    }
  }, [pre])

  // Smooth scroll to inquiry form with header offset & focus first field
  const scrollToInquiry = useCallback(() => {
    const el = document.getElementById('inquiry')
    if (!el) return
    const header = document.querySelector('.site-head')
    const headerHeight = header ? header.offsetHeight : 72
    const rect = el.getBoundingClientRect()
    const targetY = window.scrollY + rect.top - headerHeight - 20
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })

    // Focus first input field without causing an extra scroll jump
    setTimeout(() => {
      const firstInput = form.current?.querySelector('input[name="name"]')
      if (firstInput) {
        firstInput.focus({ preventScroll: true })
      }
    }, prefersReducedMotion ? 40 : 350)
  }, [])

  // Handle route navigation: #inquiry scrolls to form, regular /contact opens at top
  useEffect(() => {
    if (hash === '#inquiry') {
      const timer = setTimeout(() => {
        scrollToInquiry()
      }, 40)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [hash, key, scrollToInquiry])

  const on = (k) => (e) => {
    setV(s => ({ ...s, [k]: e.target.value }))
    if (err[k]) setErr(s => ({ ...s, [k]: undefined }))
  }
  const order = ['name', 'email', 'phone', 'service', 'details']

  async function submit(e) {
    e.preventDefault()
    if (status === 'submitting') return
    const er = validate(v)
    setErr(er)
    const first = order.find(k => er[k])
    if (first) { setStatus('idle'); form.current?.querySelector(`[name="${first}"]`)?.focus(); return }
    setStatus('submitting'); setMsg('')
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 20000)
    try {
      const r = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
        signal: ctl.signal,
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) { setStatus('success'); setV({ ...EMPTY }); return }
      if (r.status === 422 && j.errors) { setErr(j.errors); setStatus('idle'); return }
      setMsg(
        r.status === 429 ? 'Too many attempts. Please wait a few minutes, or use WhatsApp or email below.'
        : r.status === 503 ? 'The inquiry form is not available right now. Please use WhatsApp or email below.'
        : 'We could not send your inquiry. Your details are saved here — try again, or use WhatsApp or email below.'
      )
      setStatus('failure')
    } catch {
      setMsg('We could not reach the server. Check your connection and try again, or use WhatsApp or email below.')
      setStatus('failure')
    } finally { clearTimeout(t) }
  }

  const aria = (k) => ({
    id: `f-${k}`, name: k, value: v[k], onChange: on(k),
    'aria-invalid': !!err[k],
    'aria-describedby': err[k] ? `e-${k}` : undefined,
  })

  return (
    <div className="contact-page">

      {/* ── LEFT ────────────────────────────────────── */}
      <div className="contact-intro">
        <span className="eyebrow">Contact</span>
        <h1 className="h1">Start a<br /><em>project.</em></h1>
        <p className="lede">
          Tell us what you are planning. We reply by email, usually within one business day.
        </p>

        <div className="contact-methods">
          {/* WhatsApp */}
          <a className="contact-method cm-wa" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
            <span className="cm-icon"><WhatsAppIcon /></span>
            <span className="cm-text">
              <span className="cm-label">WhatsApp</span>
              <span className="cm-value">Chat with the studio</span>
            </span>
          </a>

          {/* Email */}
          <a className="contact-method" href={`mailto:${CONTACT.email}`}>
            <span className="cm-icon"><MailIcon /></span>
            <span className="cm-text">
              <span className="cm-label">Email</span>
              <span className="cm-value">{CONTACT.email}</span>
            </span>
          </a>

          {/* Primary phone */}
          <a className="contact-method" href={`tel:${CONTACT.phone}`}>
            <span className="cm-icon"><PhoneIcon /></span>
            <span className="cm-text">
              <span className="cm-label">Phone</span>
              <span className="cm-value">{CONTACT.phoneLabel}</span>
            </span>
          </a>

          {/* Secondary phone */}
          <a className="contact-method" href={`tel:${CONTACT.phone2}`}>
            <span className="cm-icon"><PhoneIcon /></span>
            <span className="cm-text">
              <span className="cm-label">Secondary phone</span>
              <span className="cm-value">{CONTACT.phone2Label}</span>
            </span>
          </a>

          {/* LinkedIn */}
          <a className="contact-method cm-li" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            <span className="cm-icon"><LinkedInIcon /></span>
            <span className="cm-text">
              <span className="cm-label">LinkedIn</span>
              <span className="cm-value">Yonatan Tariku<span className="sr"> (opens in new tab)</span></span>
            </span>
          </a>
        </div>
      </div>

      {/* ── RIGHT — FORM ─────────────────────────────── */}
      {status === 'success' ? (
        <div className="form-panel panel ok" role="status" id="inquiry">
          <h2 className="h2">Inquiry <em>sent.</em></h2>
          <p className="lede" style={{ marginTop: 16, color: 'var(--dim)' }}>
            Thank you. Your inquiry has been accepted for delivery and we will reply by email.
          </p>
          <button className="btn" style={{ marginTop: 24 }} onClick={() => setStatus('idle')}>
            Send another inquiry
          </button>
        </div>
      ) : (
        <div className="form-panel" id="inquiry">
          <h2 className="h3">Inquiry form</h2>
          <form ref={form} onSubmit={submit} noValidate aria-describedby="form-status-msg">
            {/* Honeypot */}
            <div className="hp" aria-hidden="true">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={on('website')} />
              </label>
            </div>

            <Field err={err} k="name" label="Full name" req>
              <input {...aria('name')} type="text" autoComplete="name" required />
            </Field>

            <div className="row2">
              <Field err={err} k="email" label="Email" req>
                <input {...aria('email')} type="email" inputMode="email" autoComplete="email" required />
              </Field>
              <Field err={err} k="phone" label="Phone">
                <input {...aria('phone')} type="tel" inputMode="tel" autoComplete="tel" />
              </Field>
            </div>

            <Field err={err} k="service" label="Service needed" req>
              <select {...aria('service')} required>
                <option value="">Choose a service</option>
                {SVC.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <div className="row2">
              <Field err={err} k="date" label="Project or event date">
                <input {...aria('date')} type="date" />
              </Field>
              <Field err={err} k="budget" label="Estimated budget">
                <select {...aria('budget')}>
                  <option value="">Choose a range</option>
                  {BUDGETS.map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>

            <Field err={err} k="details" label="Project details" req>
              <textarea {...aria('details')} rows="5" required />
            </Field>

            <div id="form-status-msg" aria-live="polite">
              {status === 'failure' && <p className="fail" role="alert">{msg}</p>}
            </div>

            <button
              className="btn solid submit"
              type="submit"
              disabled={status === 'submitting'}
            >
              <span>{status === 'submitting' ? 'Sending…' : 'Send inquiry →'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
