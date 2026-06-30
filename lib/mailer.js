// Campaign sending engine — wraps Resend with batching, rate limiting,
// suppression/dedupe checks, dry-run support, and a sent log.
//
// Resend is lazy-loaded only when actually sending (dryRun: false), so dry runs
// and rendering work without node_modules installed or an API key set.

const {
  loadSuppression,
  isSuppressed,
  loadSentLog,
  alreadySent,
  recordSends,
} = require('./contacts');
const { buildEmail } = require('./templates');
const { businessInfo, unsubscribeUrl } = require('./compliance');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Build the list of contacts we would actually email, with a reason for any we
// drop. Pure / no side effects — useful for dry runs and previews.
function planCampaign(contacts, { force = false } = {}) {
  const suppression = loadSuppression();
  const sentMap = loadSentLog();
  const toSend = [];
  const skipped = [];
  for (const c of contacts) {
    if (isSuppressed(c.email, suppression)) {
      skipped.push({ email: c.email, reason: 'unsubscribed' });
      continue;
    }
    if (!force && alreadySent(c.email, c.segment, sentMap)) {
      skipped.push({ email: c.email, reason: 'already sent this segment' });
      continue;
    }
    toSend.push(c);
  }
  return { toSend, skipped };
}

// Send a campaign.
//
// opts:
//   contacts   array of { email, firstName, company, city, segment }
//   dryRun     when true, render + log but never call Resend (default true)
//   limit      cap the number of sends this run (0 = no cap)
//   delayMs    pause between sends to respect rate limits (default 600ms)
//   force      ignore the sent-log dedupe (re-send) (default false)
//   onProgress optional callback({ index, total, email, status })
//
// Returns { sent, failed, skipped, results }.
async function sendCampaign(opts) {
  const {
    contacts = [],
    dryRun = true,
    limit = 0,
    delayMs = 600,
    force = false,
    onProgress,
  } = opts;

  const { toSend: planned, skipped } = planCampaign(contacts, { force });
  const toSend = limit > 0 ? planned.slice(0, limit) : planned;

  const b = businessInfo();
  const from = process.env.OUTREACH_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.OUTREACH_REPLY_TO || b.email;
  const bcc = process.env.OUTREACH_BCC || undefined;

  // Validate config up front when sending for real.
  if (!dryRun) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set.');
    if (!from) throw new Error('OUTREACH_FROM_EMAIL (or RESEND_FROM_EMAIL) is not set.');
    if (!b.address) {
      throw new Error(
        'BUSINESS_ADDRESS is not set. A valid physical postal address is required by CAN-SPAM ' +
          'for outreach email. Set it in .env.local before sending live.'
      );
    }
  }

  let resend = null;
  if (!dryRun) {
    const { Resend } = require('resend'); // lazy: only needed for live sends
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  const results = [];
  const recorded = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < toSend.length; i++) {
    const c = toSend[i];
    let email;
    try {
      email = buildEmail(c);
    } catch (err) {
      failed++;
      results.push({ email: c.email, status: 'error', error: err.message });
      if (onProgress) onProgress({ index: i, total: toSend.length, email: c.email, status: 'render-error' });
      continue;
    }

    if (dryRun) {
      sent++;
      results.push({ email: c.email, status: 'dry-run', subject: email.subject });
      if (onProgress) onProgress({ index: i, total: toSend.length, email: c.email, status: 'dry-run' });
      continue;
    }

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: c.email,
        reply_to: replyTo, // Resend SDK expects snake_case; `replyTo` is silently ignored
        ...(bcc ? { bcc } : {}),
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: {
          // One-click unsubscribe metadata improves deliverability and is good practice.
          'List-Unsubscribe': `<${unsubscribeUrl(c.email)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      if (error) {
        failed++;
        results.push({ email: c.email, status: 'error', error: error.message || String(error) });
        if (onProgress) onProgress({ index: i, total: toSend.length, email: c.email, status: 'error' });
      } else {
        sent++;
        recorded.push({ email: c.email, segment: c.segment, id: data?.id });
        results.push({ email: c.email, status: 'sent', id: data?.id, subject: email.subject });
        if (onProgress) onProgress({ index: i, total: toSend.length, email: c.email, status: 'sent' });
      }
    } catch (err) {
      failed++;
      results.push({ email: c.email, status: 'error', error: err.message });
      if (onProgress) onProgress({ index: i, total: toSend.length, email: c.email, status: 'error' });
    }

    if (i < toSend.length - 1 && delayMs > 0) await sleep(delayMs);
  }

  // Persist what we actually sent so future runs don't double-email.
  if (recorded.length) recordSends(recorded);

  return { sent, failed, skipped, results };
}

module.exports = { planCampaign, sendCampaign };
