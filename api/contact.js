const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // A filled hidden field means a bot submitted the form. Return success without sending.
  if (website) return json(res, 200, { ok: true });
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return json(res, 400, { ok: false, error: 'Invalid form data' });
  }

  const recipient = process.env.CONTACT_TO || 'armitiel@gmail.com';
  const sender = process.env.CONTACT_FROM || 'Portfolio Amitiel <onboarding@resend.dev>';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

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
        subject: `Portfolio: wiadomość od ${name}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#1c1813">
          <h1 style="font-size:24px">Nowa wiadomość z portfolio</h1>
          <p><strong>Od:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <div style="margin-top:24px;padding:20px;background:#f6f1e8;border-left:4px solid #c96318;line-height:1.6">${safeMessage}</div>
        </div>`,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[api/contact] Resend rejected request', { status: response.status, message: result.message });
      return json(res, 502, { ok: false, error: 'Email delivery failed' });
    }

    console.log('[api/contact] message accepted', { id: result.id });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('[api/contact] request failed', { error: String(error) });
    return json(res, 500, { ok: false, error: 'Email delivery failed' });
  }
};
