const { Redis } = require('@upstash/redis');

let redis = null;
function getRedis() {
  if (redis) return redis;
  // Uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  redis = Redis.fromEnv();
  return redis;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.json({ error: 'Method Not Allowed' });
  }

  try {
    // Optional: basic bot mitigation (won't block normal users)
    const ua = String(req.headers['user-agent'] || '').toLowerCase();
    const isLikelyBot =
      ua.includes('bot') || ua.includes('spider') || ua.includes('crawler') || ua.includes('headless');

    const key = 'cv:visits';
    const r = getRedis();
    const count = isLikelyBot ? await r.get(key) : await r.incr(key);

    return res.json({ count: Number(count || 0) });
  } catch (e) {
    // If Redis is not configured yet, fail gracefully
    return res.json({ count: null, error: 'Counter backend not configured' });
  }
};

