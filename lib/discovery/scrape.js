// Website email scraper — pulls a public contact email from a business's own
// website. Google Places gives us the website; this finds an address on it.
//
// Deliberately conservative: it reads the homepage plus a couple of likely
// contact/about pages, extracts addresses, filters out junk (asset filenames,
// tracking/vendor emails), and prefers role-based inboxes on the site's own
// domain. The HTTP client is injectable for testing.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Vendor / placeholder / tracking domains that show up in page source but are
// never the business's real contact address.
const JUNK_DOMAINS = [
  'example.com', 'example.org', 'domain.com', 'email.com', 'yourdomain.com',
  'company.com', 'yourcompany.com', 'mycompany.com', 'mydomain.com', 'sentry-next.wixpress.com',
  'sentry.io', 'wix.com', 'wixpress.com', 'parastorage.com',
  'godaddy.com', 'squarespace.com', 'schema.org', 'w3.org', 'sentry.wixpress.com',
  'googleapis.com', 'gstatic.com', 'cloudflare.com', 'jquery.com', 'fontawesome.com',
];

// Placeholder local-parts from template/demo copy (e.g. "you@company.com",
// "yourname@...") — never a real contact, even on a live domain.
const PLACEHOLDER_LOCALPARTS = [
  'you', 'your', 'youremail', 'yourname', 'yourcompany', 'example', 'firstname', 'lastname',
];

// Local-parts that indicate a real human/role contact, ranked highest.
const ROLE_LOCALPARTS = [
  'info', 'office', 'contact', 'hello', 'admin', 'sales', 'leasing',
  'management', 'manager', 'team', 'support', 'frontdesk', 'reception',
];

// Asset extensions that sneak into the regex (e.g. logo@2x.png).
const ASSET_HINTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js', '@2x', '@3x'];

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isJunk(email) {
  const e = email.toLowerCase();
  if (ASSET_HINTS.some((a) => e.includes(a))) return true;
  const domain = e.split('@')[1] || '';
  if (JUNK_DOMAINS.includes(domain)) return true;
  const local = e.split('@')[0] || '';
  if (PLACEHOLDER_LOCALPARTS.includes(local)) return true;
  // Long hex local-parts are almost always tracking pixels / message-ids.
  if (/^[0-9a-f]{16,}$/.test(local)) return true;
  return false;
}

// Pull, de-dupe, and filter candidate emails out of raw HTML.
function extractEmails(html) {
  const found = new Set();
  // mailto: links are the most reliable signal — grab them first.
  const mailtoRe = /mailto:([^"'?>\s]+)/gi;
  let m;
  while ((m = mailtoRe.exec(html)) !== null) {
    const e = decodeURIComponent(m[1]).trim().toLowerCase();
    if (EMAIL_RE.test(e)) found.add(e);
    EMAIL_RE.lastIndex = 0;
  }
  for (const raw of html.match(EMAIL_RE) || []) found.add(raw.trim().toLowerCase());
  return [...found].filter((e) => !isJunk(e));
}

// Score a candidate so we can pick the best one for a given site domain.
function scoreEmail(email, siteHost) {
  const [local, domain] = email.split('@');
  let score = 0;
  if (siteHost && domain === siteHost) score += 5;        // same domain as the site
  else if (siteHost && domain.endsWith('.' + siteHost)) score += 4;
  if (ROLE_LOCALPARTS.includes(local)) score += 3;        // info@, office@, ...
  const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  if (freeProviders.includes(domain)) score -= 1;          // valid but less "official"
  if (local.length > 30) score -= 1;                       // probably noise
  return score;
}

function pickBest(emails, siteHost) {
  if (!emails.length) return '';
  return [...emails].sort((a, b) => scoreEmail(b, siteHost) - scoreEmail(a, siteHost))[0];
}

// Find same-domain contact/about links worth following.
function contactLinks(html, baseUrl) {
  const host = hostOf(baseUrl);
  const links = new Set();
  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1];
    if (!/contact|about|team|connect|reach/i.test(href)) continue;
    let abs;
    try {
      abs = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    if (hostOf(abs) === host) links.add(abs.split('#')[0]);
  }
  return [...links].slice(0, 3);
}

async function fetchText(url, fetchImpl, timeoutMs) {
  const res = await fetchImpl(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TomahawkOutreachBot/1.0; +https://tomahawkjunkremoval.com)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
  if (!res.ok) return '';
  const type = res.headers.get('content-type') || '';
  if (!type.includes('html') && !type.includes('text')) return '';
  return res.text();
}

// Scrape a business website for the best contact email.
// Returns { email, all } — email is '' if nothing usable was found.
async function findEmailOnSite(website, opts = {}) {
  const { fetchImpl = globalThis.fetch, timeoutMs = 8000, maxPages = 2 } = opts;
  if (!website) return { email: '', all: [] };
  const siteHost = hostOf(website);
  const all = new Set();

  let home = '';
  try {
    home = await fetchText(website, fetchImpl, timeoutMs);
  } catch {
    return { email: '', all: [] };
  }
  for (const e of extractEmails(home)) all.add(e);

  // Follow a few contact/about pages if the homepage didn't yield much.
  const links = contactLinks(home, website).slice(0, maxPages - 1);
  for (const link of links) {
    try {
      const html = await fetchText(link, fetchImpl, timeoutMs);
      for (const e of extractEmails(html)) all.add(e);
    } catch {
      /* ignore a single bad page */
    }
  }

  const list = [...all];
  return { email: pickBest(list, siteHost), all: list };
}

module.exports = {
  extractEmails,
  scoreEmail,
  pickBest,
  contactLinks,
  findEmailOnSite,
  isJunk,
  hostOf,
};
