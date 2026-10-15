// Wspólne odpowiedzi z briefu projektowego.
//   POST /api/brief                          zapis odpowiedzi jednej osoby
//   GET  /api/brief?brief=redesign-wordpress lista odpowiedzi do strony /brief/odpowiedzi/
//
// Dane trzymamy w tym samym Upstash Redis co licznik odwiedzin (UPSTASH_REDIS_REST_URL + TOKEN).
// Adres e-mail NIE jest zapisywany: służy tylko do rozpoznania tej samej osoby (skrót SHA-256),
// więc ponowne wysłanie briefu zastępuje jej poprzednią odpowiedź zamiast dodawać nową.

const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const BRIEFS = new Set(['redesign-wordpress']);
const LIMIT = { imie: 80, email: 200, sciezka: 160, sekcja: 120, pytanie: 300, odpowiedz: 3000, pozycje: 40, wpisy: 300 };
const RATE = { oknoSekund: 600, maks: 6 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let redis = null;
function getRedis() {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

const listKey = (brief) => `brief:${brief}:odpowiedzi`;
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function readBody(req) {
  let body;
  try { body = req.body; } catch { return null; }
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return null; }
  }
  return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
}

function readQuery(req) {
  if (req && req.query && typeof req.query === 'object') return req.query;
  try {
    return Object.fromEntries(new URL(req.url, 'http://localhost').searchParams.entries());
  } catch {
    return {};
  }
}

function send(res, status, data) {
  res.statusCode = status;
  return res.json(data);
}

function parseEntry(raw) {
  try {
    const e = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!e || typeof e !== 'object' || !e.imie) return null;
    return {
      imie: String(e.imie),
      sciezka: String(e.sciezka || ''),
      potwierdzenie: !!e.potwierdzenie,
      data: String(e.data || ''),
      odpowiedzi: Array.isArray(e.odpowiedzi) ? e.odpowiedzi : []
    };
  } catch {
    return null;
  }
}

async function list(req, res) {
  const brief = clean(readQuery(req).brief || 'redesign-wordpress', 60);
  if (!BRIEFS.has(brief)) return send(res, 404, { ok: false, blad: 'Nie ma takiego briefu.' });
  const all = (await getRedis().hgetall(listKey(brief))) || {};
  const odpowiedzi = Object.values(all)
    .map(parseEntry)
    .filter(Boolean)
    .sort((a, b) => a.data.localeCompare(b.data));
  return send(res, 200, { ok: true, brief, odpowiedzi });
}

async function save(req, res) {
  if (Number(req.headers['content-length'] || 0) > 64000) {
    return send(res, 413, { ok: false, blad: 'Odpowiedzi są zbyt długie.' });
  }
  const body = readBody(req);
  if (!body) return send(res, 400, { ok: false, blad: 'Nieprawidłowe dane.' });

  // pole-pułapka na boty: udajemy sukces i nic nie zapisujemy
  if (body.www) return send(res, 200, { ok: true });

  const brief = clean(body.brief, 60);
  const imie = clean(body.imie, LIMIT.imie);
  const email = clean(body.email, LIMIT.email).toLowerCase();
  if (!BRIEFS.has(brief)) return send(res, 400, { ok: false, blad: 'Nie ma takiego briefu.' });
  if (!imie) return send(res, 400, { ok: false, blad: 'Brakuje imienia.' });
  if (!EMAIL_RE.test(email)) return send(res, 400, { ok: false, blad: 'Nieprawidłowy adres e-mail.' });

  const odpowiedzi = (Array.isArray(body.odpowiedzi) ? body.odpowiedzi : [])
    .slice(0, LIMIT.pozycje)
    .map((o) => ({
      sekcja: clean(o && o.sekcja, LIMIT.sekcja),
      pytanie: clean(o && o.pytanie, LIMIT.pytanie),
      odpowiedz: clean(o && o.odpowiedz, LIMIT.odpowiedz)
    }))
    .filter((o) => o.pytanie);

  const r = getRedis();

  // prosty limit: kilka zapisów na 10 minut z jednego adresu IP
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim();
  if (ip) {
    const rateKey = `brief:limit:${sha(ip).slice(0, 32)}`;
    const hits = await r.incr(rateKey);
    if (hits === 1) await r.expire(rateKey, RATE.oknoSekund);
    if (hits > RATE.maks) return send(res, 429, { ok: false, blad: 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.' });
  }

  const key = listKey(brief);
  const field = sha(`${brief}:${email}`);
  if (!(await r.hexists(key, field)) && (await r.hlen(key)) >= LIMIT.wpisy) {
    return send(res, 507, { ok: false, blad: 'Lista odpowiedzi jest pełna.' });
  }

  const wpis = {
    imie,
    sciezka: clean(body.sciezka, LIMIT.sciezka),
    potwierdzenie: body.potwierdzenie === true,
    data: new Date().toISOString(),
    odpowiedzi
  };
  await r.hset(key, { [field]: JSON.stringify(wpis) });
  return send(res, 201, { ok: true });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    if (req.method === 'GET') return await list(req, res);
    if (req.method === 'POST') return await save(req, res);
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { ok: false, blad: 'Metoda niedozwolona.' });
  } catch (e) {
    return send(res, 503, { ok: false, blad: 'Wspólne odpowiedzi są chwilowo niedostępne.' });
  }
};
