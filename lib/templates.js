// Segment-specific outreach email templates.
//
// Each entry returns { subject, preheader, lead, bullets[], cta } given the
// recipient's contact info. buildEmail() wraps that in the branded HTML/text
// shell and appends the CAN-SPAM footer from lib/compliance.js.
//
// Personalization tokens available on `c` (contact): firstName, company, city.
// All are optional — copy degrades gracefully when a field is missing.

const { businessInfo, complianceFooterHtml, complianceFooterText, escapeHtml } = require('./compliance');
const { getSegment } = require('./segments');

// Friendly greeting that works whether or not we know the contact's name.
function greeting(c) {
  return c.firstName ? `Hi ${c.firstName},` : 'Hi there,';
}

// "your community", "your properties at <Company>", etc.
function orgPhrase(c, fallback) {
  if (c.company) return c.company;
  return fallback;
}

const TEMPLATES = {
  hoa: (c) => ({
    subject: c.company
      ? `Junk & bulk-item removal for ${c.company}`
      : 'A reliable junk removal partner for your HOA',
    preheader: 'Same-day common-area cleanouts, illegal dumping, and abandoned-item pickups.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}, a licensed and insured junk removal crew ` +
      `serving the Metro Atlanta area. We work with HOAs and community associations to keep ` +
      `common areas clean without tying up your maintenance staff.`,
    bullets: [
      'Illegal dumping and abandoned items hauled away — usually same or next day',
      'Bulk-trash and post-event cleanouts for clubhouses, pools, and amenity areas',
      'Abandoned furniture and appliances removed from common areas and breezeways',
      'Predictable, upfront pricing and a single point of contact for the board',
    ],
    cta: 'Want a standing partner rate for the community?',
  }),

  apartment: (c) => ({
    subject: c.company
      ? `Faster unit turns for ${c.company}`
      : 'Cut your apartment turnover time with on-call junk removal',
    preheader: 'Move-out cleanouts, eviction set-outs, and bulk trash — on your schedule.',
    lead:
      `${greeting(c)} I run ${businessInfo().name}, and we help apartment and multifamily ` +
      `communities turn units faster. When a resident leaves junk behind, we clear it out so ` +
      `your team can get the unit rent-ready instead of hauling mattresses to the dumpster.`,
    bullets: [
      'Move-out and eviction cleanouts — furniture, appliances, and trash gone fast',
      'Overflowing dumpster and bulk-item pickups before they pile up',
      'Recurring or on-call service that fits your turn schedule',
      'Licensed, insured, and easy to schedule with one phone call',
    ],
    cta: `Can I send over a per-unit cleanout rate for ${orgPhrase(c, 'your community')}?`,
  }),

  realtor: (c) => ({
    subject: c.firstName
      ? `${c.firstName}, get your listings show-ready faster`
      : 'Get your listings show-ready faster',
    preheader: 'Pre-listing and post-closing cleanouts so your deals close on time.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}. We help agents get listings ` +
      `show-ready and close on time by clearing out everything the seller leaves behind — ` +
      `so a cluttered garage or a full basement never holds up a closing.`,
    bullets: [
      'Pre-listing cleanouts so homes photograph and show their best',
      'Post-closing and estate cleanouts handled before the keys change hands',
      'Fast turnaround — often same or next day when a deadline is tight',
      'A dependable vendor you can hand off to and not think about again',
    ],
    cta: 'Want me to be your go-to for cleanouts on tough listings?',
  }),

  property_manager: (c) => ({
    subject: c.company
      ? `On-call junk removal for ${c.company}'s properties`
      : 'A dependable junk removal vendor for your portfolio',
    preheader: 'One vendor for cleanouts across your whole portfolio.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}. We give property managers one reliable ` +
      `crew for cleanouts across every property you manage — residential or commercial — so you're ` +
      `not chasing down a different hauler every time something needs to go.`,
    bullets: [
      'Tenant move-out, eviction, and abandoned-property cleanouts',
      'Common-area, basement, and storage-room clear-outs',
      'Single point of contact and consistent pricing across your portfolio',
      'Licensed, insured, and responsive when you need a fast turnaround',
    ],
    cta: 'Open to setting up a preferred-vendor rate?',
  }),

  contractor: (c) => ({
    subject: c.company
      ? `Jobsite debris haul-off for ${c.company}`
      : 'Keep your jobsites clear with on-call debris removal',
    preheader: 'Construction debris and renovation waste hauled so your crew keeps building.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}. We haul off construction and renovation ` +
      `debris so your crew can keep building instead of making dump runs — drywall, lumber, ` +
      `flooring, old fixtures, and demo waste, gone when you need the site clear.`,
    bullets: [
      'Demo and renovation debris removed on your timeline',
      'Old cabinets, fixtures, flooring, and appliances hauled in one trip',
      'On-call or scheduled service that keeps the jobsite clear',
      'Licensed and insured — no dump runs or disposal fees for your crew',
    ],
    cta: 'Want a per-job or recurring haul-off rate for your sites?',
  }),

  estate: (c) => ({
    subject: c.company
      ? `Post-sale cleanouts for ${c.company}`
      : 'Whole-home cleanouts after the estate sale',
    preheader: 'We clear whatever doesn\'t sell so the home is broom-clean and ready.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}. We partner with estate sale and senior ` +
      `move companies to handle the part nobody wants — clearing out everything that doesn't ` +
      `sell so the home is broom-clean and ready for closing or handoff.`,
    bullets: [
      'Whole-home cleanouts after the sale ends — furniture, boxes, and leftovers',
      'Gentle, respectful service for families during a hard time',
      'Donation drop-offs and eco-friendly disposal whenever possible',
      'Fast scheduling so you can close out the job and move on',
    ],
    cta: 'Can I be your cleanout partner on your next sale?',
  }),

  office: (c) => ({
    subject: c.company
      ? `Office & equipment cleanouts for ${c.company}`
      : 'Clear out old furniture and equipment without the hassle',
    preheader: 'Furniture, equipment, and renovation waste removed with minimal disruption.',
    lead:
      `${greeting(c)} I'm with ${businessInfo().name}. We help offices, retail stores, and ` +
      `restaurants clear out old furniture, fixtures, and equipment with minimal disruption — ` +
      `during a move, a remodel, or just a long-overdue cleanout.`,
    bullets: [
      'Office furniture, cubicles, and electronics removed and recycled',
      'Retail fixtures and restaurant equipment hauled away',
      'After-hours and weekend service to avoid disrupting business',
      'Upfront pricing and an insured crew you can trust on-site',
    ],
    cta: 'Want a quote for an upcoming move or cleanout?',
  }),
};

// Branded HTML shell matching the site palette (navy / gold / red).
function renderHtml(c, parts) {
  const b = businessInfo();
  const bullets = parts.bullets
    .map(
      (item) =>
        `<tr><td style="padding:7px 0;vertical-align:top;width:26px;color:#D4202C;font-weight:bold;">✓</td>` +
        `<td style="padding:7px 0;color:#333;font-size:15px;line-height:1.5;">${escapeHtml(item)}</td></tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(parts.preheader || '')}</span>
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#102444;padding:22px 28px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;color:#ffffff;letter-spacing:0.5px;text-transform:uppercase;">
        Tomahawk <span style="color:#F6C035;">Junk Removal</span> LLC
      </span>
    </div>
    <div style="height:4px;background:#F6C035;"></div>

    <div style="padding:30px 28px 8px;">
      <p style="margin:0 0 18px;color:#222;font-size:15px;line-height:1.65;">${escapeHtml(parts.lead)}</p>
      <table style="width:100%;border-collapse:collapse;margin:4px 0 22px;">${bullets}</table>
      <p style="margin:0 0 22px;color:#222;font-size:15px;line-height:1.6;">${escapeHtml(parts.cta)}
        Just reply to this email or call <a href="tel:+14047717677" style="color:#D4202C;font-weight:bold;text-decoration:none;">${escapeHtml(b.phone)}</a> and we'll set it up.</p>
      <a href="tel:+14047717677" style="display:inline-block;background:#D4202C;color:#ffffff;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;letter-spacing:0.5px;text-transform:uppercase;padding:13px 30px;border-radius:4px;text-decoration:none;">
        Call ${escapeHtml(b.phone)}
      </a>
      <p style="margin:22px 0 0;color:#222;font-size:15px;">Thanks,<br/>The Tomahawk Junk Removal Team</p>
    </div>

    <div style="padding:0 28px 8px;">${complianceFooterHtml(c.email)}</div>
  </div>
</body>
</html>`;
}

function renderText(c, parts) {
  const b = businessInfo();
  const lines = [
    parts.lead,
    '',
    ...parts.bullets.map((item) => `  - ${item}`),
    '',
    `${parts.cta} Just reply to this email or call ${b.phone} and we'll set it up.`,
    '',
    'Thanks,',
    'The Tomahawk Junk Removal Team',
    complianceFooterText(c.email),
  ];
  return lines.join('\n');
}

// Build a complete, ready-to-send email for a contact.
// Returns { subject, html, text } or throws if the segment is unknown.
function buildEmail(contact) {
  const seg = getSegment(contact.segment);
  if (!seg) {
    throw new Error(`Unknown segment "${contact.segment}" for ${contact.email}`);
  }
  const parts = TEMPLATES[seg.key](contact);
  return {
    subject: parts.subject,
    html: renderHtml(contact, parts),
    text: renderText(contact, parts),
  };
}

module.exports = { buildEmail, TEMPLATES };
