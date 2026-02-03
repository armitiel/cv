const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

let redis = null;
function getRedis() {
  if (redis) return redis;
  // Uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  redis = Redis.fromEnv();
  return redis;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = String(cookieHeader).split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function getQuery(req) {
  // Vercel Node runtime usually provides req.query.
  if (req && typeof req.query === 'object' && req.query) return req.query;
  try {
    const url = new URL(req.url, 'http://localhost');
    const q = {};
    for (const [k, v] of url.searchParams.entries()) q[k] = v;
    return q;
  } catch {
    return {};
  }
}

function makeCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(String(value))}`];
  parts.push(`Path=${opts.path || '/'}`);
  if (opts.maxAge != null) parts.push(`Max-Age=${Number(opts.maxAge)}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure !== false) parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite || 'Lax'}`);
  return parts.join('; ');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.json({ error: 'Method Not Allowed' });
  }

  try {
    const query = getQuery(req);
    const cookies = parseCookies(req.headers.cookie);

    // Optional: basic bot mitigation (won't block normal users)
    const ua = String(req.headers['user-agent'] || '').toLowerCase();
    const isLikelyBot =
      ua.includes('bot') || ua.includes('spider') || ua.includes('crawler') || ua.includes('headless');

    // Opt-out (owner/dev): call /api/visits?optout=1 once in your browser.
    // We set a cookie so subsequent visits from that browser won't be counted.
    const wantsOptOut = String(query.optout || query.nocount || '') === '1';
    const isOptedOut = wantsOptOut || cookies.cv_nocount === '1';

    // Uniqueness: count at most once per visitor per time window (default 24h).
    // This prevents refreshes from incrementing the counter.
    const ttlSeconds = Number(process.env.CV_VISIT_TTL_SECONDS || 60 * 60 * 24);

    const counterKey = 'cv:visits';
    const r = getRedis();

    // Ensure visitor id cookie exists (stable per browser).
    let vid = cookies.cv_vid;
    const setCookies = [];
    if (!vid) {
      vid = crypto.randomBytes(16).toString('hex');
      // keep for 1 year
      setCookies.push(makeCookie('cv_vid', vid, { maxAge: 60 * 60 * 24 * 365, httpOnly: true }));
    }
    if (wantsOptOut) {
      setCookies.push(makeCookie('cv_nocount', '1', { maxAge: 60 * 60 * 24 * 365, httpOnly: false }));
    }
    if (setCookies.length) {
      res.setHeader('Set-Cookie', setCookies);
    }

    let count;
    const shouldCount = !isLikelyBot && !isOptedOut;
    if (!shouldCount) {
      count = await r.get(counterKey);
    } else {
      const seenKey = `cv:visits:seen:${vid}`;
      // SET seenKey NX EX ttlSeconds
      const firstInWindow = await r.set(seenKey, 1, { nx: true, ex: ttlSeconds });
      if (firstInWindow) {
        count = await r.incr(counterKey);
      } else {
        count = await r.get(counterKey);
      }
    }

    return res.json({ count: Number(count || 0) });
  } catch (e) {
    // If Redis is not configured yet, fail gracefully
    return res.json({ count: null, error: 'Counter backend not configured' });
  }
};

