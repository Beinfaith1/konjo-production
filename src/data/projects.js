import manifest from './manifest.json'

export const CONTACT = {
  email: 'konjoproduction@gmail.com',
  phone: '+251938937743', phoneLabel: '+251 93 893 7743',
  phone2: '+251713730443', phone2Label: '+251 71 373 0443',
  linkedin: 'https://www.linkedin.com/in/yonatan-tariku-42bb58264',
  whatsapp: 'https://wa.me/251938937743?text=Hi%20Konjo%20Production%2C%20I%27d%20like%20to%20discuss%20a%20project.',
}
export const CATS = [
  { id: 'events', label: 'Events' },
  { id: 'technology', label: 'Technology' },
  { id: 'weddings', label: 'Weddings' },
]
export const catLabel = (id) => CATS.find((c) => c.id === id)?.label ?? id
export const photoUrl = (p, s = 'm') => `/photos/${p.slug}/${p.id}-${s}.webp`
export const srcSet = (p) => `${photoUrl(p, 't')} 520w, ${photoUrl(p, 'm')} 1000w, ${photoUrl(p, 'l')} 1600w`

// Photo sets are mapped to projects from the uploaded folders: serg → Wedding Portraits, vending_machine → Launch Ceremony,
// solomon → Tech Festival, dagmawi_babi → Tech Meetup, yonas_moh → Campus Tech Event. Descriptions only state what the photographs show.
const defs = [
  { slug: 'wedding-portraits', title: 'Wedding Portraits', category: 'weddings', lead: '24',
    desc: 'Portraits of a bride in a white-draped setting, a group with bridesmaids in pink, the couple together, and a celebration with guests clapping.' },
  { slug: 'launch-ceremony', title: 'Launch Ceremony', category: 'events', lead: '03',
    desc: 'A ribbon-cutting ceremony outdoors, guests beside a lit display machine, a team group photo, a celebration cake and attendees seated indoors.' },
  { slug: 'tech-festival', title: 'Tech Festival', category: 'technology', lead: '01',
    desc: 'A technology festival in a large hall: a panel on stage with balloons, a full audience, speakers at the microphone and group photographs in front of the event banner.' },
  { slug: 'tech-meetup', title: 'Tech Meetup', category: 'technology', lead: '01',
    desc: 'A technology meetup in a branded venue: speakers at the microphone, a seated conversation on stage, an attentive audience and trophies on display.' },
  { slug: 'campus-tech-event', title: 'Campus Tech Event', category: 'technology', lead: '09',
    desc: 'A campus technology event: a packed hall, speakers with microphones in front of the event banner, and attendees gathered around the stage.' },
]
export const projects = defs.map((d) => {
  const photos = manifest[d.slug].map((p, i, a) => ({ ...p, slug: d.slug, i, alt: `${d.title}, photograph ${i + 1} of ${a.length}` }))
  return { ...d, photos, count: photos.length, leadPhoto: photos.find((p) => p.id === d.lead) || photos[0] }
})
export const getProject = (slug) => projects.find((p) => p.slug === slug)
const pick = (slug, id) => { const pr = getProject(slug); return { project: pr, photo: pr.photos.find((p) => p.id === id) || pr.leadPhoto } }

// Photographs used in the home composition and the Studio Explorer, per category.
export const stationItems = (cat) => ({
  events: [pick('launch-ceremony', '03'), pick('launch-ceremony', '05'), pick('launch-ceremony', '06')],
  technology: [pick('tech-festival', '01'), pick('tech-meetup', '01'), pick('campus-tech-event', '09')],
  weddings: [pick('wedding-portraits', '24'), pick('wedding-portraits', '09'), pick('wedding-portraits', '13')],
}[cat])
export const heroItems = (cat) => ({
  events: ['03', '05', '06', '02', '01'].map((id) => pick('launch-ceremony', id)),
  technology: [pick('tech-festival', '01'), pick('tech-meetup', '01'), pick('campus-tech-event', '09'), pick('tech-festival', '04'), pick('tech-meetup', '03')],
  weddings: ['24', '09', '13', '19', '04'].map((id) => pick('wedding-portraits', id)),
}[cat])

export const films = [
  { id: 'event-1', category: 'events', title: 'Event Film 01', url: 'https://www.instagram.com/reel/DcBeo9ZurzL/?rpxt=MXY4MHFna25hbzNiZQ==' },
  { id: 'event-2', category: 'events', title: 'Event Film 02', url: 'https://www.instagram.com/reel/DUIkUBmDLtz/?exln=bHZzMDQ4bTRsb250' },
  { id: 'tech-1', category: 'technology', title: 'Technology Event Film 01', url: 'https://www.instagram.com/reel/DYhb0KpMGHh/?cplk=MXkyMGVidnFrcHp2eQ==' },
  { id: 'tech-2', category: 'technology', title: 'Technology Event Film 02', url: 'https://www.instagram.com/reel/DUal4WMDTaL/?psln=ZzBhOTE1bnE3MnB5' },
  { id: 'wedding-1', category: 'weddings', title: 'Wedding Film', url: 'https://www.instagram.com/reel/DcYTrCrReab/?psln=MW41cnI1d2V1eWJwdQ==' },
]
export const embedUrl = (f) => `https://www.instagram.com/reel/${f.url.match(/reel\/([^/?]+)/)[1]}/embed`

export const SERVICES = [
  { id: 'Video Production', text: 'Filming for events, ceremonies and stories, planned around what the day needs to show.', films: true },
  { id: 'Photography', text: 'Event, ceremony and portrait photography delivered as a complete, organised gallery.', slugs: ['launch-ceremony', 'tech-festival', 'wedding-portraits'] },
  { id: 'Editing', text: 'Cinematic edits that give footage structure, rhythm and a clear finish.', films: true },
  { id: 'Motion Graphics', text: 'Dynamic motion graphics and titles that move with the story.', films: true },
]
export const PROCESS = [
  { id: 'Brief', text: 'We start with what you are making, who it is for, the date and what you need delivered.' },
  { id: 'Plan', text: 'We agree the approach, the schedule and the shots or moments that matter most.' },
  { id: 'Capture', text: 'We film and photograph on the day, focused on the story rather than the equipment.' },
  { id: 'Edit', text: 'Selects, cuts, colour and graphics are shaped into the finished film or gallery.' },
  { id: 'Deliver', text: 'You receive the final files, organised and ready to share.' },
]
export const BUDGETS = ['Not sure yet', 'Under 10,000 ETB', '10,000 – 30,000 ETB', '30,000 – 100,000 ETB', '100,000+ ETB']
