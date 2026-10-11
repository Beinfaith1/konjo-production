// Vercel serverless function: POST /api/inquiry
// Validates server-side, then asks Resend to deliver the email. Success is returned ONLY if Resend accepts the message.
const SERVICES = ['Video Production', 'Photography', 'Editing', 'Motion Graphics', 'Not sure yet'];
const BUDGETS = ['Not sure yet', 'Under 10,000 ETB', '10,000 – 30,000 ETB', '30,000 – 100,000 ETB', '100,000+ ETB'];
const hits = new Map(); // best-effort per-instance limiter: 5 requests / 10 min / IP
const LIMIT = 5, WINDOW = 10 * 60 * 1000;
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) return res.status(429).json({ error: 'rate_limited' });
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'invalid_body' });
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots only; nothing is sent

  const d = {
    name: clean(b.name, 120), email: clean(b.email, 200), phone: clean(b.phone, 40), service: clean(b.service, 40),
    date: clean(b.date, 60), budget: clean(b.budget, 40), details: clean(b.details, 4000),
  };
  const errors = {};
  if (d.name.length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(d.email)) errors.email = 'Enter a valid email address.';
  if (d.phone && !/^[+\d][\d\s()\-]{5,}$/.test(d.phone)) errors.phone = 'Enter a valid phone number or leave it empty.';
  if (!SERVICES.includes(d.service)) errors.service = 'Choose a service.';
  if (d.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.date = 'Enter a valid date.';
  if (d.budget && !BUDGETS.includes(d.budget)) errors.budget = 'Choose a budget option.';
  if (d.details.length < 10) errors.details = 'Tell us a little more (at least 10 characters).';
  if (Object.keys(errors).length) return res.status(422).json({ error: 'validation', errors });

  const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM, to = process.env.INQUIRY_TO || 'konjoproduction@gmail.com';
  if (!key || !from) return res.status(503).json({ error: 'not_configured' });

  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone || '—'], ['Service', d.service], ['Project / event date', d.date || '—'], ['Estimated budget', d.budget || '—'], ['Details', d.details]];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows.map(([k, v]) => `<tr><td style="vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: `New inquiry: ${d.service} — ${d.name}`, text, html }),
    });
    if (!r.ok) { console.error('Resend rejected', r.status, await r.text().catch(() => '')); return res.status(502).json({ error: 'provider_rejected' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Resend request failed', e); return res.status(502).json({ error: 'provider_unreachable' });
  }
}
