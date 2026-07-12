const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Paleta strony (portfolio-v2) */
const BG = '#f6f1e8';
const CARD = '#fbf8f2';
const INK = '#1c1813';
const ACCENT = '#C26A32';
const LINE = '#ddd5c6';
const SOFT = '#6b6459';

const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";

const T = {
  pl: {
    subject: (n) => `Portfolio: wiadomość od ${n}`,
    eyebrow: 'PORTFOLIO — NOWA WIADOMOŚĆ',
    heading: 'Nowa wiadomość',
    from: 'Od',
    email: 'E-mail',
    sent: 'Wysłano',
    langRow: 'Język',
    langName: 'Polski',
    hint: 'Nadawca korzystał z polskiej wersji strony — odpisz po polsku.',
    reply: 'Odpowiedz',
    foot: 'Wiadomość z formularza kontaktowego na amitiel.cv',
    locale: 'pl-PL',
    /* autoodpowiedz do nadawcy */
    ar_subject: 'Dziękuję za wiadomość — Amitiel Angelisme',
    ar_eyebrow: 'AMITIEL ANGELISME',
    ar_heading: 'Dziękuję',
    ar_lead: (n) => `Cześć ${n}, Twoja wiadomość do mnie dotarła.`,
    ar_body: 'Odezwę się najszybciej, jak się da — zwykle w ciągu 1–2 dni roboczych. Ten e-mail jest wysyłany automatycznie, ale możesz na niego spokojnie odpowiedzieć.',
    ar_copy: 'Treść Twojej wiadomości',
    ar_cta: 'Zobacz portfolio',
    ar_foot: 'Amitiel Angelisme · amitiel.cv',
  },
  en: {
    subject: (n) => `Portfolio: message from ${n}`,
    eyebrow: 'PORTFOLIO — NEW MESSAGE',
    heading: 'New message',
    from: 'From',
    email: 'E-mail',
    sent: 'Sent',
    langRow: 'Language',
    langName: 'English',
    hint: 'The sender used the English version of the site — reply in English.',
    reply: 'Reply',
    foot: 'Message from the contact form at amitiel.cv',
    locale: 'en-GB',
    /* autoodpowiedz do nadawcy */
    ar_subject: 'Thank you for your message — Amitiel Angelisme',
    ar_eyebrow: 'AMITIEL ANGELISME',
    ar_heading: 'Thank you',
    ar_lead: (n) => `Hi ${n}, your message has reached me.`,
    ar_body: 'I’ll get back to you as soon as I can — usually within 1–2 working days. This e-mail was sent automatically, but you can simply reply to it.',
    ar_copy: 'Your message',
    ar_cta: 'View portfolio',
    ar_foot: 'Amitiel Angelisme · amitiel.cv',
  },
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(payload));
}

function metaRow(t, label, value) {
  return `<tr>
    <td style="padding:0 0 10px;font:400 11px/1.4 ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${SOFT};width:96px;vertical-align:top">${label}</td>
    <td style="padding:0 0 10px;font:400 15px/1.5 ${SANS};color:${INK};vertical-align:top">${value}</td>
  </tr>`;
}

function buildHtml({ lang, name, email, message, sentAt }) {
  const t = T[lang];
  const badge = lang.toUpperCase();
  const stamp = new Intl.DateTimeFormat(t.locale, {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Warsaw',
  }).format(sentAt);

  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(t.heading)}</title></head>
<body style="margin:0;padding:0;background:${BG};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(name)}: ${escapeHtml(message).slice(0, 120)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px">
<tr><td align="center">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${CARD};border:1px solid ${LINE};border-radius:14px;overflow:hidden">

    <!-- pasek akcentu -->
    <tr><td style="height:6px;background:${ACCENT};line-height:6px;font-size:0">&nbsp;</td></tr>

    <tr><td style="padding:34px 36px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font:400 11px/1.4 ${MONO};letter-spacing:.18em;text-transform:uppercase;color:${ACCENT}">${t.eyebrow}</td>
        <td align="right" style="font:700 11px/1 ${MONO};letter-spacing:.1em;color:${SOFT};border:1px solid ${LINE};border-radius:99px;padding:5px 10px;width:1%;white-space:nowrap">${badge}</td>
      </tr></table>

      <h1 style="margin:16px 0 0;font:700 34px/1.05 ${SANS};letter-spacing:-.02em;text-transform:uppercase;color:${INK}">${escapeHtml(t.heading)}<span style="color:${ACCENT}">.</span></h1>
    </td></tr>

    <tr><td style="padding:24px 36px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${metaRow(T[lang], t.from, escapeHtml(name))}
        ${metaRow(T[lang], t.email, `<a href="mailto:${escapeHtml(email)}" style="color:${ACCENT};text-decoration:none">${escapeHtml(email)}</a>`)}
        ${metaRow(T[lang], t.langRow, `${escapeHtml(t.langName)}`)}
        ${metaRow(T[lang], t.sent, escapeHtml(stamp))}
      </table>
    </td></tr>

    <!-- wiadomosc -->
    <tr><td style="padding:22px 36px 0">
      <div style="background:${BG};border-left:4px solid ${ACCENT};border-radius:0 10px 10px 0;padding:20px 22px;font:400 16px/1.65 ${SANS};color:${INK};white-space:normal">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
    </td></tr>

    <!-- podpowiedz jezykowa -->
    <tr><td style="padding:18px 36px 0">
      <div style="font:400 13px/1.5 ${SANS};color:${SOFT}">${escapeHtml(t.hint)}</div>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:24px 36px 34px">
      <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent('Re: ' + t.subject(name))}"
         style="display:inline-block;background:${ACCENT};color:${BG};text-decoration:none;border-radius:8px;padding:13px 26px;font:700 13px/1 ${SANS};letter-spacing:.06em;text-transform:uppercase">${escapeHtml(t.reply)}</a>
    </td></tr>

    <tr><td style="border-top:1px solid ${LINE};padding:18px 36px;font:400 11px/1.5 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${SOFT}">${escapeHtml(t.foot)}</td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

function buildAutoReplyHtml({ lang, name, message }) {
  const t = T[lang];
  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(t.ar_heading)}</title></head>
<body style="margin:0;padding:0;background:${BG};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(t.ar_body).slice(0, 110)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${CARD};border:1px solid ${LINE};border-radius:14px;overflow:hidden">

    <tr><td style="height:6px;background:${ACCENT};line-height:6px;font-size:0">&nbsp;</td></tr>

    <tr><td style="padding:34px 36px 0">
      <div style="font:400 11px/1.4 ${MONO};letter-spacing:.18em;text-transform:uppercase;color:${ACCENT}">${t.ar_eyebrow}</div>
      <h1 style="margin:16px 0 0;font:700 34px/1.05 ${SANS};letter-spacing:-.02em;text-transform:uppercase;color:${INK}">${escapeHtml(t.ar_heading)}<span style="color:${ACCENT}">.</span></h1>
    </td></tr>

    <tr><td style="padding:20px 36px 0;font:400 17px/1.6 ${SANS};color:${INK}">${escapeHtml(t.ar_lead(name))}</td></tr>
    <tr><td style="padding:12px 36px 0;font:400 15px/1.65 ${SANS};color:${SOFT}">${escapeHtml(t.ar_body)}</td></tr>

    <tr><td style="padding:26px 36px 0">
      <div style="font:400 11px/1.4 ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${SOFT};margin-bottom:10px">${escapeHtml(t.ar_copy)}</div>
      <div style="background:${BG};border-left:4px solid ${ACCENT};border-radius:0 10px 10px 0;padding:18px 20px;font:400 15px/1.65 ${SANS};color:${INK}">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
    </td></tr>

    <tr><td style="padding:26px 36px 34px">
      <a href="https://amitiel.cv/portfolio/" style="display:inline-block;background:${ACCENT};color:${BG};text-decoration:none;border-radius:8px;padding:13px 26px;font:700 13px/1 ${SANS};letter-spacing:.06em;text-transform:uppercase">${escapeHtml(t.ar_cta)}</a>
    </td></tr>

    <tr><td style="border-top:1px solid ${LINE};padding:18px 36px;font:400 11px/1.5 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${SOFT}">${escapeHtml(t.ar_foot)}</td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function buildAutoReplyText({ lang, name, message }) {
  const t = T[lang];
  return [t.ar_lead(name), '', t.ar_body, '', `${t.ar_copy}:`, message, '', t.ar_foot].join('\n');
}

function buildText({ lang, name, email, message }) {
  const t = T[lang];
  return [
    t.eyebrow,
    '',
    `${t.from}: ${name}`,
    `${t.email}: ${email}`,
    `${t.langRow}: ${t.langName}`,
    '',
    message,
    '',
    t.hint,
    t.foot,
  ].join('\n');
}

module.exports = async function contact(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[api/contact] RESEND_API_KEY is missing');
    return json(res, 503, { ok: false, error: 'Email service is not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON' });
  }

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 5000);
  const website = String(body.website || '').trim();
  const lang = body.lang === 'en' ? 'en' : 'pl';

  // A filled hidden field means a bot submitted the form. Return success without sending.
  if (website) return json(res, 200, { ok: true });
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return json(res, 400, { ok: false, error: 'Invalid form data' });
  }

  const recipient = process.env.CONTACT_TO || 'armitiel@gmail.com';
  const sender = process.env.CONTACT_FROM || 'Portfolio Amitiel <onboarding@resend.dev>';
  const payload = { lang, name, email, message, sentAt: new Date() };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: T[lang].subject(name),
        html: buildHtml(payload),
        text: buildText(payload),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[api/contact] Resend rejected request', { status: response.status, message: result.message });
      return json(res, 502, { ok: false, error: 'Email delivery failed' });
    }

    console.log('[api/contact] message accepted', { id: result.id, lang });

    /* Autoodpowiedz do nadawcy - w jezyku, w ktorym napisal.
       Wymaga zweryfikowanej domeny. Blad NIE psuje wysylki glownej. */
    if (/@amitiel\.cv>?\s*$/i.test(sender)) {
      try {
        const ar = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: sender,
            to: [email],
            reply_to: recipient,
            subject: T[lang].ar_subject,
            html: buildAutoReplyHtml(payload),
            text: buildAutoReplyText(payload),
          }),
        });
        if (!ar.ok) {
          const arErr = await ar.json().catch(() => ({}));
          console.error('[api/contact] auto-reply rejected', { status: ar.status, message: arErr.message });
        } else {
          console.log('[api/contact] auto-reply sent', { lang });
        }
      } catch (arError) {
        console.error('[api/contact] auto-reply failed', { error: String(arError) });
      }
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('[api/contact] request failed', { error: String(error) });
    return json(res, 500, { ok: false, error: 'Email delivery failed' });
  }
};
