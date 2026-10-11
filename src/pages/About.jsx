import { Link } from 'react-router-dom'
import Img from '../components/Img'
import { getProject } from '../data/projects'
import { useSeo } from '../hooks/hooks'

export default function About() {
  useSeo('About', 'Konjo means beauty in Amharic. Konjo Production is a video production, photography and editing studio founded by Yonatan Tariku.')

  const tm = getProject('tech-meetup')
  const lc = getProject('launch-ceremony')

  // Pick specific strong frames for body section
  const midPhoto    = tm.photos.find(p => p.id === '07') || tm.leadPhoto
  const rightPhoto  = lc.photos.find(p => p.id === '05') || lc.leadPhoto

  return (
    <>
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-intro">
          <span className="eyebrow">About the studio</span>
          <h1 className="h1">
            <span style={{ display: 'block', lineHeight: .95 }}>Konjo</span>
            <em style={{ display: 'block', fontSize: '.38em', letterSpacing: 0, marginTop: 8, color: 'var(--acc)' }}>means beauty</em>
          </h1>
          <p className="lede" style={{ marginTop: 20 }}>
            "Konjo" is the Amharic word for beautiful. It is the starting point for every frame the studio makes — not decorative beauty, but the kind found in a story told exactly right.
          </p>
          <p className="lede" style={{ marginTop: 16 }}>
            Konjo Production is a video production, photography, and editing studio founded by <strong>Yonatan Tariku</strong>. The studio works across technology events, product launches, and weddings, delivering cinematic films, curated photo galleries, and motion graphics.
          </p>
          <div className="acts" style={{ marginTop: 28 }}>
            <Link className="btn solid" to="/contact#inquiry"><span>Start a project</span></Link>
            <Link className="btn" to="/work"><span>See the work</span></Link>
          </div>
        </div>
        <figure className="about-founder-fig">
          <div className="about-founder-frame">
            <img
              src="/yonatan-tariku.png"
              alt="Yonatan Tariku operating a camera mounted on a gimbal."
              className="about-founder-img"
              width="600"
              height="600"
              loading="eager"
            />
          </div>
          <figcaption>Yonatan Tariku, Founder &amp; CEO, on a shoot.</figcaption>
        </figure>
      </section>

      {/* ── BODY ── */}
      <section
        style={{
          background: 'var(--ivory)',
          borderTop: '1px solid var(--line-l)',
          padding: 'clamp(48px,6vw,88px) var(--px)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--w)', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '.9fr 1.1fr .7fr',
            gap: 'clamp(18px,4vw,56px)',
            alignItems: 'center',
          }}
        >
          <figure>
            <Img photo={midPhoto} size="m" sizes="(max-width:900px) 100vw, 35vw" />
            <figcaption>Tech Meetup</figcaption>
          </figure>

          <div>
            <p className="big-q" style={{ font: '700 clamp(22px,3vw,40px)/1.1 var(--d)', letterSpacing: '-.03em' }}>
              A studio built around <em>visual storytelling.</em>
            </p>
            <p className="lede" style={{ marginTop: 20, color: 'var(--dim)' }}>
              Every project begins with the story — what it needs to say, who it is for, and what needs to be seen. The equipment, the edit, and the graphics all serve that starting point.
            </p>
            <p className="lede" style={{ marginTop: 14, color: 'var(--dim)' }}>
              Services include cinematic video production, event and portrait photography, post-production editing, and motion graphics. Konjo Production works with clients across Addis Ababa and beyond.
            </p>
            <div className="acts" style={{ marginTop: 24 }}>
              <Link className="btn solid" to="/services"><span>Our services</span></Link>
            </div>
          </div>

          <figure style={{ alignSelf: 'end' }}>
            <Img photo={rightPhoto} size="m" sizes="(max-width:900px) 100vw, 28vw" />
            <figcaption>Launch Ceremony</figcaption>
          </figure>
        </div>
      </section>
    </>
  )
}
