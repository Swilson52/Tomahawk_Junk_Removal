// Lead discovery orchestrator.
//
// For each configured target (a search query + the segment it maps to):
//   1. Find businesses via Google Places.
//   2. Scrape each business website for a contact email.
//   3. Verify the email (format + MX) so only deliverable addresses survive.
//   4. Skip anything we already have, already emailed, or that unsubscribed.
//
// Returns { leads, stats }. Leads are in the same shape the campaign sender
// consumes: { email, firstName, company, city, segment }.

const { searchBusinesses } = require('./places');
const { findEmailOnSite } = require('./scrape');
const { verifyEmail } = require('./verify');
const { isValidSegment } = require('../segments');
const { normalizeEmail } = require('../contacts');

// A small delay keeps us polite to the sites we scrape and under API limits.
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// opts:
//   targets      [{ query, segment }]  (required)
//   known        Set of emails to skip (existing contacts + sent + suppressed)
//   perQuery     max businesses to pull per query (default 20)
//   delayMs      pause between site scrapes (default 800)
//   onProgress   optional callback({ phase, query, business, email, status })
//   deps         { searchBusinesses, findEmailOnSite, verifyEmail } for testing
async function discoverLeads(opts = {}) {
  const {
    targets = [],
    known = new Set(),
    perQuery = 20,
    delayMs = 800,
    onProgress = () => {},
    deps = {},
  } = opts;

  const search = deps.searchBusinesses || searchBusinesses;
  const scrape = deps.findEmailOnSite || findEmailOnSite;
  const verify = deps.verifyEmail || verifyEmail;

  const seen = new Set([...known].map(normalizeEmail));
  const leads = [];
  const stats = {
    queries: 0,
    businesses: 0,
    noWebsite: 0,
    noEmail: 0,
    failedVerify: 0,
    duplicate: 0,
    added: 0,
  };

  for (const target of targets) {
    if (!target.query || !isValidSegment(target.segment)) {
      onProgress({ phase: 'skip-target', query: target.query, status: 'invalid target' });
      continue;
    }
    stats.queries++;
    onProgress({ phase: 'search', query: target.query, status: 'searching' });

    let businesses = [];
    try {
      businesses = await search(target.query, { maxResults: perQuery });
    } catch (err) {
      onProgress({ phase: 'search', query: target.query, status: `error: ${err.message}` });
      continue;
    }

    for (const biz of businesses) {
      stats.businesses++;
      if (!biz.website) {
        stats.noWebsite++;
        onProgress({ phase: 'scrape', business: biz.name, status: 'no website' });
        continue;
      }

      let found = { email: '' };
      try {
        found = await scrape(biz.website);
      } catch {
        /* treat as no email */
      }
      if (!found.email) {
        stats.noEmail++;
        onProgress({ phase: 'scrape', business: biz.name, status: 'no email found' });
        if (delayMs) await sleep(delayMs);
        continue;
      }

      const email = normalizeEmail(found.email);
      if (seen.has(email)) {
        stats.duplicate++;
        onProgress({ phase: 'dedupe', business: biz.name, email, status: 'already known' });
        if (delayMs) await sleep(delayMs);
        continue;
      }

      const result = await verify(email);
      if (!result.ok) {
        stats.failedVerify++;
        onProgress({ phase: 'verify', business: biz.name, email, status: result.reason });
        if (delayMs) await sleep(delayMs);
        continue;
      }

      seen.add(email);
      leads.push({
        email,
        firstName: '', // Places rarely exposes a contact name; left blank by design.
        company: biz.name || '',
        city: biz.city || '',
        segment: target.segment,
        source: 'discovery',
        website: biz.website || '',
        phone: biz.phone || '',
      });
      stats.added++;
      onProgress({ phase: 'add', business: biz.name, email, status: 'queued' });
      if (delayMs) await sleep(delayMs);
    }
  }

  return { leads, stats };
}

module.exports = { discoverLeads };
