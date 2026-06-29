// Email verification — protects your sending domain by keeping junk and
// undeliverable addresses out of the queue. Sending to bad addresses produces
// bounces that wreck deliverability, so every discovered email passes through
// here before it can be queued.
//
// Checks performed (no email is ever sent):
//   1. Format — a pragmatic syntax check.
//   2. Domain MX — the domain must publish mail servers (MX, or A as fallback).
// Results are cached per-domain so we only hit DNS once per domain per run.

const dns = require('dns').promises;

const FORMAT_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Disposable / role domains you may not want to email. Extend as needed.
const BLOCKED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
]);

const _mxCache = new Map(); // domain -> boolean (has mail records)

function isValidFormat(email) {
  return typeof email === 'string' && FORMAT_RE.test(email.trim());
}

async function domainHasMail(domain) {
  if (_mxCache.has(domain)) return _mxCache.get(domain);
  let ok = false;
  try {
    const mx = await dns.resolveMx(domain);
    ok = Array.isArray(mx) && mx.length > 0;
  } catch {
    // No MX — some small domains accept mail on the A record. Treat as a weak yes.
    try {
      const a = await dns.resolve(domain);
      ok = Array.isArray(a) && a.length > 0;
    } catch {
      ok = false;
    }
  }
  _mxCache.set(domain, ok);
  return ok;
}

// Verify a single email. Returns { ok, reason }.
async function verifyEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!isValidFormat(e)) return { ok: false, reason: 'bad format' };
  const domain = e.split('@')[1];
  if (BLOCKED_DOMAINS.has(domain)) return { ok: false, reason: 'blocked/disposable domain' };
  const hasMail = await domainHasMail(domain);
  if (!hasMail) return { ok: false, reason: 'domain has no mail server (MX)' };
  return { ok: true, reason: 'ok' };
}

// Verify many with bounded concurrency. Returns a Map of email -> {ok, reason}.
async function verifyMany(emails, { concurrency = 5 } = {}) {
  const unique = [...new Set(emails.map((e) => String(e || '').trim().toLowerCase()))].filter(Boolean);
  const results = new Map();
  let i = 0;
  async function worker() {
    while (i < unique.length) {
      const idx = i++;
      const email = unique[idx];
      results.set(email, await verifyEmail(email));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return results;
}

module.exports = { isValidFormat, verifyEmail, verifyMany, domainHasMail };
