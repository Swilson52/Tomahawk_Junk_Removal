// Unsubscribe endpoint — required for CAN-SPAM compliance.
//
// Recipients reach this via the link in every outreach email's footer (and the
// List-Unsubscribe header).
//
// IMPORTANT — why a GET does NOT opt anyone out:
// Corporate spam filters and link-security scanners fetch (GET) every URL in an
// email to inspect it. If we unsubscribed on GET, those bots would silently opt
// out recipients who never clicked. So:
//   • GET  -> show a confirmation page with a button (no change made).
//   • POST -> actually unsubscribe. This covers both the button on that page and
//             Gmail/RFC-8058 one-click unsubscribe (which sends a POST).
//
// Persistence: writes to data/suppression.json when the filesystem is writable,
// forwards the opt-out to the GitHub Actions pipeline (dispatchUnsubscribe), and
// emails the owner as a backup — so the opt-out is never lost.

import { Resend } from 'resend';
import { addSuppression, isSuppressed } from '../../lib/contacts';
import { verifyUnsubscribe, businessInfo } from '../../lib/compliance';
import { dispatchUnsubscribe } from '../../lib/github-dispatch';

export default async function handler(req, res) {
  const email = String(req.query.email || req.body?.email || '').trim().toLowerCase();
  const token = String(req.query.t || req.body?.t || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!email) {
    return res.status(400).send(shell('Missing email address',
      '<p>No email address was provided, so there is nothing to unsubscribe.</p>'));
  }
  if (!verifyUnsubscribe(email, token)) {
    return res.status(400).send(shell('Invalid link',
      '<p>This unsubscribe link is invalid or expired. Please reply to the email and we will remove you right away.</p>'));
  }

  // GET (or any non-POST): a person opened the link OR a scanner prefetched it.
  // Do NOT change anything — ask for an explicit confirmation click.
  if (req.method !== 'POST') {
    return res.status(200).send(confirmPage(email, token));
  }

  // POST: an explicit opt-out (the confirm button, or one-click unsubscribe).
  let recorded = false;
  let alreadyOut = false;
  try {
    alreadyOut = isSuppressed(email);
    recorded = addSuppression(email, { source: 'confirmed' });
  } catch (err) {
    console.error('Could not write suppression file:', err.message);
  }

  await Promise.allSettled([dispatchUnsubscribe(email), notifyOwner(email)]);

  const msg = alreadyOut && !recorded
    ? `${escapeHtml(email)} is already unsubscribed. You won't receive further outreach from us.`
    : `${escapeHtml(email)} has been removed. You won't receive further outreach from us.`;
  return res.status(200).send(shell("You're unsubscribed", `<p>${msg}</p>`));
}

async function notifyOwner(email) {
  const b = businessInfo();
  const to = process.env.QUOTE_RECIPIENT_EMAIL || b.email;
  const from = process.env.OUTREACH_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from || !to) return; // not configured — skip quietly
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from,
    to,
    subject: `Unsubscribe request: ${email}`,
    text:
      `${email} confirmed unsubscribe from outreach email.\n\n` +
      `They've been added to the suppression list and won't be emailed again.`,
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Confirmation page shown on GET. The button POSTs back to this same endpoint,
// so a scanner that only GETs the URL never triggers an opt-out.
function confirmPage(email, token) {
  return shell('Unsubscribe', `
    <p>Click below to stop receiving outreach emails from us at <strong>${escapeHtml(email)}</strong>.</p>
    <form method="POST" action="/api/unsubscribe" style="margin:18px 0;">
      <input type="hidden" name="email" value="${escapeHtml(email)}" />
      <input type="hidden" name="t" value="${escapeHtml(token)}" />
      <button type="submit" class="btn">Confirm unsubscribe</button>
    </form>
    <p style="color:#8a8a8a;font-size:13px;">Didn't mean to open this? Just close the page — nothing happens unless you click the button.</p>`);
}

function shell(title, bodyHtml) {
  const b = businessInfo();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)} · ${escapeHtml(b.name)}</title>
<style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;color:#0A1322;}
  .wrap{max-width:520px;margin:0 auto;background:#fff;}
  .bar{background:#102444;padding:22px 28px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.5px;}
  .bar span{color:#F6C035;}
  .rule{height:4px;background:#F6C035;}
  .body{padding:34px 28px;}
  h1{font-size:22px;color:#102444;margin:0 0 14px;}
  p{font-size:15px;line-height:1.6;color:#333;margin:0 0 14px;}
  a{color:#D4202C;font-weight:bold;text-decoration:none;}
  .btn{display:inline-block;background:#D4202C;color:#fff;font-size:15px;font-weight:bold;border:none;
    border-bottom:3px solid #8c0f0f;border-radius:5px;padding:12px 22px;cursor:pointer;}
  .btn:hover{background:#b41d27;}
  .foot{padding:0 28px 28px;color:#8a8a8a;font-size:12px;}
</style></head><body>
  <div class="wrap">
    <div class="bar">Tomahawk <span>Junk Removal</span> LLC</div>
    <div class="rule"></div>
    <div class="body">
      <h1>${escapeHtml(title)}</h1>
      ${bodyHtml}
      <p>Questions? Call <a href="tel:+14047717677">${escapeHtml(b.phone)}</a> or email <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a>.</p>
    </div>
    <div class="foot">${escapeHtml(b.name)}${b.address ? ' · ' + escapeHtml(b.address) : ''}</div>
  </div>
</body></html>`;
}
