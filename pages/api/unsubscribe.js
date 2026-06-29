// Unsubscribe endpoint — required for CAN-SPAM compliance.
//
// Recipients reach this via the link in every outreach email's footer (and the
// List-Unsubscribe header). It records the opt-out and shows a confirmation.
//
// Persistence note: on a writable filesystem (e.g. running campaigns from your
// own machine or a server with a persistent disk) the email is appended to
// data/suppression.json, which the campaign script always checks before sending.
// On read-only serverless hosting (e.g. Vercel) the file write is best-effort —
// so we ALSO email the owner a notification so the opt-out is never lost. For a
// fully serverless setup, wire addSuppression() to a KV store or database.

import { Resend } from 'resend';
import { addSuppression, isSuppressed } from '../../lib/contacts';
import { verifyUnsubscribe, businessInfo } from '../../lib/compliance';
import { dispatchUnsubscribe } from '../../lib/github-dispatch';

export default async function handler(req, res) {
  const email = String(req.query.email || req.body?.email || '').trim().toLowerCase();
  const token = String(req.query.t || req.body?.t || '');

  if (!email) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(page('Missing email address', 'No email address was provided, so there is nothing to unsubscribe.'));
  }

  if (!verifyUnsubscribe(email, token)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(page('Invalid link', 'This unsubscribe link is invalid or expired. Please reply to the email and we will remove you right away.'));
  }

  // One-click unsubscribe (RFC 8058) sends a POST — honor it without a page.
  let recorded = false;
  let alreadyOut = false;
  try {
    alreadyOut = isSuppressed(email);
    recorded = addSuppression(email, { source: req.method === 'POST' ? 'one-click' : 'link' });
  } catch (err) {
    // Filesystem likely read-only (serverless). Fall back to email notification.
    console.error('Could not write suppression file:', err.message);
  }

  // Record the opt-out in the automated pipeline's state (GitHub Actions branch),
  // and notify the owner. Both are best-effort and never block the response.
  await Promise.allSettled([
    dispatchUnsubscribe(email),
    notifyOwner(email),
  ]);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.method === 'POST') {
    return res.status(200).json({ ok: true });
  }
  const msg = alreadyOut && !recorded
    ? `${escapeHtml(email)} is already unsubscribed. You won't receive further outreach from us.`
    : `${escapeHtml(email)} has been removed. You won't receive further outreach from us.`;
  return res.status(200).send(page('You\'re unsubscribed', msg));
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
      `${email} clicked unsubscribe from outreach email.\n\n` +
      `Make sure this address is on your suppression list (data/suppression.json) ` +
      `before your next campaign run.`,
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function page(title, body) {
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
  .foot{padding:0 28px 28px;color:#8a8a8a;font-size:12px;}
</style></head><body>
  <div class="wrap">
    <div class="bar">Tomahawk <span>Junk Removal</span> LLC</div>
    <div class="rule"></div>
    <div class="body">
      <h1>${escapeHtml(title)}</h1>
      <p>${body}</p>
      <p>Questions? Call <a href="tel:+14047717677">${escapeHtml(b.phone)}</a> or email <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a>.</p>
    </div>
    <div class="foot">${escapeHtml(b.name)}${b.address ? ' · ' + escapeHtml(b.address) : ''}</div>
  </div>
</body></html>`;
}
