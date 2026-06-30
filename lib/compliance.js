// CAN-SPAM compliance helpers.
//
// Commercial email to businesses that did not opt in is legal in the U.S. ONLY
// if every message: (1) has accurate From/Reply-To info, (2) is not deceptive
// in the subject line, (3) includes a valid physical postal address, and
// (4) offers a working, no-cost way to opt out that is honored within 10 days.
//
// These helpers centralize that so every template stays compliant.

const crypto = require('crypto');

// Pull business identity from env so nothing sensitive is hardcoded.
function businessInfo() {
  return {
    name: process.env.BUSINESS_NAME || 'Tomahawk Junk Removal LLC',
    // REQUIRED by CAN-SPAM: a valid physical postal address (street, PO box, or
    // registered commercial mail receiving agency). Set BUSINESS_ADDRESS.
    address: process.env.BUSINESS_ADDRESS || '',
    phone: process.env.BUSINESS_PHONE || '(404) 771-7677',
    email: process.env.BUSINESS_EMAIL || 'tomahawkjunkremoval@gmail.com',
    siteUrl: (process.env.SITE_URL || 'https://tomahawkjunk.com').replace(/\/$/, ''),
  };
}

// Optionally sign unsubscribe links so they can't be forged to opt out third
// parties. If UNSUBSCRIBE_SECRET is unset, links still work (unsigned) — set it
// in production.
function unsubscribeToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return '';
  return crypto
    .createHmac('sha256', secret)
    .update(String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);
}

function verifyUnsubscribe(email, token) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return true; // unsigned mode: accept any
  const expected = unsubscribeToken(email);
  if (!expected || !token) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(token)));
  } catch {
    return false;
  }
}

function unsubscribeUrl(email) {
  const { siteUrl } = businessInfo();
  const params = new URLSearchParams({ email: String(email).trim().toLowerCase() });
  const token = unsubscribeToken(email);
  if (token) params.set('t', token);
  return `${siteUrl}/api/unsubscribe?${params.toString()}`;
}

function complianceFooterHtml(email) {
  const b = businessInfo();
  const unsub = unsubscribeUrl(email);
  const addressLine = b.address
    ? `${escapeHtml(b.name)} · ${escapeHtml(b.address)}`
    : escapeHtml(b.name);
  return `
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid #e0e0e0;color:#8a8a8a;font-size:12px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 6px;">${addressLine}</p>
      <p style="margin:0 0 6px;">
        You received this email because we believe ${escapeHtml(b.name)} can help your properties.
        If you'd rather not hear from us, <a href="${unsub}" style="color:#8a8a8a;text-decoration:underline;">unsubscribe here</a> and we'll remove you right away.
      </p>
      <p style="margin:0;">${escapeHtml(b.phone)} · <a href="mailto:${escapeHtml(b.email)}" style="color:#8a8a8a;">${escapeHtml(b.email)}</a></p>
    </div>`;
}

function complianceFooterText(email) {
  const b = businessInfo();
  const unsub = unsubscribeUrl(email);
  const lines = [
    '',
    '----',
    b.address ? `${b.name} · ${b.address}` : b.name,
    `You're receiving this because we think ${b.name} can help your properties.`,
    `Unsubscribe: ${unsub}`,
    `${b.phone} · ${b.email}`,
  ];
  return lines.join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  businessInfo,
  unsubscribeToken,
  verifyUnsubscribe,
  unsubscribeUrl,
  complianceFooterHtml,
  complianceFooterText,
  escapeHtml,
};
